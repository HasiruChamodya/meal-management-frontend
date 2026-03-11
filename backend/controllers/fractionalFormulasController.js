// controllers/fractionalFormulasController.js
const pool = require("../config/db");
const { writeAudit } = require("../utils/audit");

exports.getFormulas = async (req, res) => {
  const r = await pool.query(
    `SELECT id, ingredient, fractions
     FROM fractional_formulas
     ORDER BY id DESC`
  );
  res.json({ formulas: r.rows });
};

exports.createFormula = async (req, res) => {
  const { ingredient, fractions = {} } = req.body;
  if (!ingredient?.trim()) return res.status(400).json({ message: "ingredient is required" });

  const r = await pool.query(
    `INSERT INTO fractional_formulas (ingredient, fractions)
     VALUES ($1, $2::jsonb)
     RETURNING id, ingredient, fractions`,
    [ingredient.trim(), JSON.stringify(fractions)]
  );

  await writeAudit({
    req,
    action: "FRACTIONAL_CREATE",
    entity: "FRACTIONAL_FORMULA",
    entity_id: r.rows[0].id,
    actor_user_id: req.user?.id,
    actor_email: req.user?.email,
    actor_role: req.user?.role,
    details: r.rows[0],
  });

  res.status(201).json({ formula: r.rows[0] });
};

exports.updateFormula = async (req, res) => {
  const id = req.params.id;
  const { ingredient, fractions = {} } = req.body;
  if (!ingredient?.trim()) return res.status(400).json({ message: "ingredient is required" });

  const r = await pool.query(
    `UPDATE fractional_formulas
     SET ingredient=$1, fractions=$2::jsonb
     WHERE id=$3
     RETURNING id, ingredient, fractions`,
    [ingredient.trim(), JSON.stringify(fractions), id]
  );

  if (r.rowCount === 0) return res.status(404).json({ message: "Formula not found" });

  await writeAudit({
    req,
    action: "FRACTIONAL_UPDATE",
    entity: "FRACTIONAL_FORMULA",
    entity_id: id,
    actor_user_id: req.user?.id,
    actor_email: req.user?.email,
    actor_role: req.user?.role,
    details: r.rows[0],
  });

  res.json({ formula: r.rows[0] });
};