// controllers/categoriesController.js
const pool = require("../config/db");
const { writeAudit } = require("../utils/audit");

exports.getCategories = async (req, res) => {
  const r = await pool.query(`SELECT id, name FROM categories ORDER BY id ASC`);
  res.json({ categories: r.rows });
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "name is required" });

  const r = await pool.query(
    `INSERT INTO categories (name) VALUES ($1) RETURNING id, name`,
    [name.trim()]
  );

  await writeAudit({
    req,
    action: "CATEGORY_CREATE",
    entity: "CATEGORY",
    entity_id: r.rows[0].id,
    actor_user_id: req.user?.id,
    actor_email: req.user?.email,
    actor_role: req.user?.role,
    details: r.rows[0],
  });

  res.status(201).json({ category: r.rows[0] });
};

exports.updateCategory = async (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "name is required" });

  const r = await pool.query(
    `UPDATE categories SET name=$1 WHERE id=$2 RETURNING id, name`,
    [name.trim(), id]
  );

  if (r.rowCount === 0) return res.status(404).json({ message: "Category not found" });

  await writeAudit({
    req,
    action: "CATEGORY_UPDATE",
    entity: "CATEGORY",
    entity_id: id,
    actor_user_id: req.user?.id,
    actor_email: req.user?.email,
    actor_role: req.user?.role,
    details: r.rows[0],
  });

  res.json({ category: r.rows[0] });
};