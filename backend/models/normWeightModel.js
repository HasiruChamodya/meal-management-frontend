const pool = require("../config/db");

const mapWeightRow = (r) => ({
  itemId: r.item_id,
  dietTypeId: r.diet_type_id,
  meal: r.meal,
  weight: Number(r.weight)
});

exports.getAllWeights = async () => {
  const result = await pool.query(`SELECT * FROM norm_weights`);
  return result.rows.map(mapWeightRow);
};

exports.upsertWeights = async (itemId, weightsData) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const query = `
      INSERT INTO norm_weights (item_id, diet_type_id, meal, weight)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (item_id, diet_type_id, meal) DO UPDATE SET
        weight = EXCLUDED.weight,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const updatedRows = [];

    for (const data of weightsData) {
      // Skip if dietTypeId is missing somehow
      if (!data.dietTypeId) continue; 
      
      const values = [
        itemId,
        data.dietTypeId,
        data.meal,
        data.weight || 0
      ];
      const res = await client.query(query, values);
      updatedRows.push(mapWeightRow(res.rows[0]));
    }

    await client.query('COMMIT');
    return updatedRows;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};