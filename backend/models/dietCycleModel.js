const pool = require("../config/db");

const mapDietCycleRow = (row) => ({
  id: row.id,
  code: row.code,
  nameEn: row.name_en,
  nameSi: row.name_si,
  active: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getAllDietCycles = async () => {
  const query = `
    SELECT * FROM diet_cycles
    ORDER BY code ASC
  `;
  const result = await pool.query(query);
  return result.rows.map(mapDietCycleRow);
};

const getDietCycleById = async (id) => {
  const query = `
    SELECT * FROM diet_cycles WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] ? mapDietCycleRow(result.rows[0]) : null;
};

const createDietCycle = async (data) => {
  const query = `
    INSERT INTO diet_cycles (
      code, name_en, name_si, is_active
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [
    data.code,
    data.nameEn,
    data.nameSi || "",
    data.active !== undefined ? data.active : true,
  ];
  const result = await pool.query(query, values);
  return mapDietCycleRow(result.rows[0]);
};

const updateDietCycle = async (id, data) => {
  const query = `
    UPDATE diet_cycles
    SET
      code = $1,
      name_en = $2,
      name_si = $3,
      is_active = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
  `;
  const values = [
    data.code,
    data.nameEn,
    data.nameSi || "",
    data.active !== undefined ? data.active : true,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0] ? mapDietCycleRow(result.rows[0]) : null;
};

const toggleDietCycleStatus = async (id, isActive) => {
  const query = `
    UPDATE diet_cycles
    SET
      is_active = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [isActive, id]);
  return result.rows[0] ? mapDietCycleRow(result.rows[0]) : null;
};

module.exports = {
  getAllDietCycles,
  getDietCycleById,
  createDietCycle,
  updateDietCycle,
  toggleDietCycleStatus,
};  