const pool = require("../config/db");

const mapWardRow = (row) => ({
  id: row.id,
  code: row.ward_code,
  name: row.ward_name,
  beds: row.bed_count,
  cots: row.cot_count,
  icu: row.icu_count,
  incubators: row.incubator_count,
  active: row.is_active,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const getAllWards = async () => {
  const query = `
    SELECT
      id,
      ward_code,
      ward_name,
      bed_count,
      cot_count,
      icu_count,
      incubator_count,
      is_active,
      created_at,
      updated_at
    FROM wards
    ORDER BY ward_name ASC
  `;
  const result = await pool.query(query);
  return result.rows.map(mapWardRow);
};

const getWardById = async (id) => {
  const query = `
    SELECT
      id,
      ward_code,
      ward_name,
      bed_count,
      cot_count,
      icu_count,
      incubator_count,
      is_active,
      created_at,
      updated_at
    FROM wards
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] ? mapWardRow(result.rows[0]) : null;
};

const createWard = async ({ code, name, beds, cots, icu, incubators }) => {
  const query = `
    INSERT INTO wards (
      ward_code,
      ward_name,
      bed_count,
      cot_count,
      icu_count,
      incubator_count,
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, true)
    RETURNING
      id,
      ward_code,
      ward_name,
      bed_count,
      cot_count,
      icu_count,
      incubator_count,
      is_active,
      created_at,
      updated_at
  `;
  const values = [code, name, beds, cots, icu, incubators];
  const result = await pool.query(query, values);
  return mapWardRow(result.rows[0]);
};

const updateWard = async (id, { code, name, beds, cots, icu, incubators }) => {
  const query = `
    UPDATE wards
    SET
      ward_code = $1,
      ward_name = $2,
      bed_count = $3,
      cot_count = $4,
      icu_count = $5,
      incubator_count = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING
      id,
      ward_code,
      ward_name,
      bed_count,
      cot_count,
      icu_count,
      incubator_count,
      is_active,
      created_at,
      updated_at
  `;
  const values = [code, name, beds, cots, icu, incubators, id];
  const result = await pool.query(query, values);
  return result.rows[0] ? mapWardRow(result.rows[0]) : null;
};

const updateWardStatus = async (id, active) => {
  const query = `
    UPDATE wards
    SET
      is_active = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      ward_code,
      ward_name,
      bed_count,
      cot_count,
      icu_count,
      incubator_count,
      is_active,
      created_at,
      updated_at
  `;
  const result = await pool.query(query, [active, id]);
  return result.rows[0] ? mapWardRow(result.rows[0]) : null;
};

module.exports = {
  getAllWards,
  getWardById,
  createWard,
  updateWard,
  updateWardStatus,
};