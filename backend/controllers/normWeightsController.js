// controllers/normWeightsController.js
const pool = require("../config/db");
const { writeAudit } = require("../utils/audit");

exports.getNormWeights = async (req, res) => {
  const diet = req.query.diet;
  if (!diet) return res.status(400).json({ message: "diet query param is required" });

  const r = await pool.query(
    `SELECT id, ingredient_id, diet, meal, grams
     FROM norm_weights
     WHERE diet=$1
     ORDER BY ingredient_id ASC, meal ASC`,
    [diet]
  );

  res.json({ norms: r.rows });
};

exports.saveNormWeights = async (req, res) => {
  const { norms = [] } = req.body;
  if (!Array.isArray(norms)) return res.status(400).json({ message: "norms must be an array" });

  // simplest: wipe + insert for that diet (safe for admin edit screens)
  const diet = norms[0]?.diet;
  if (!diet) return res.status(400).json({ message: "norms must include diet" });

  await pool.query("BEGIN");
  try {
    await pool.query(`DELETE FROM norm_weights WHERE diet=$1`, [diet]);

    for (const n of norms) {
      if (!n.ingredient_id || !n.meal || n.grams === undefined || n.grams === null) continue;
      await pool.query(
        `INSERT INTO norm_weights (ingredient_id, diet, meal, grams)
         VALUES ($1,$2,$3,$4)`,
        [n.ingredient_id, n.diet, n.meal, Number(n.grams) || 0]
      );
    }

    await pool.query("COMMIT");

    await writeAudit({
      req,
      action: "NORM_WEIGHTS_SAVE",
      entity: "NORM_WEIGHTS",
      entity_id: diet,
      actor_user_id: req.user?.id,
      actor_email: req.user?.email,
      actor_role: req.user?.role,
      details: { diet, count: norms.length },
    });

    res.json({ message: "Saved", diet, count: norms.length });
  } catch (e) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: "Save failed", error: e.message });
  }
};