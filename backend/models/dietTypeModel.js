const pool = require("../config/db");

const mapDietTypeRow = (row) => ({
  id: row.id,
  code: row.code,
  nameEn: row.name_en,
  nameSi: row.name_si,
  ageRange: row.age_range,
  type: row.type,
  displayOrder: row.display_order,
  active: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getAllDietTypes = async () => {
  const query = `
    SELECT * FROM diet_types
    ORDER BY display_order ASC, code ASC
  `;
  const result = await pool.query(query);
  return result.rows.map(mapDietTypeRow);
};

const getDietTypeById = async (id) => {
  const query = `
    SELECT * FROM diet_types WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] ? mapDietTypeRow(result.rows[0]) : null;
};

const createDietType = async (data) => {
  const query = `
    INSERT INTO diet_types (
      code, name_en, name_si, age_range, type, display_order, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [
    data.code,
    data.nameEn,
    data.nameSi || "",
    data.ageRange || "All",
    data.type || "Patient",
    data.displayOrder || 1,
    data.active !== undefined ? data.active : true,
  ];
  const result = await pool.query(query, values);
  return mapDietTypeRow(result.rows[0]);
};

const updateDietType = async (id, data) => {
  const query = `
    UPDATE diet_types
    SET
      code = $1,
      name_en = $2,
      name_si = $3,
      age_range = $4,
      type = $5,
      display_order = $6,
      is_active = $7,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *
  `;
  const values = [
    data.code,
    data.nameEn,
    data.nameSi || "",
    data.ageRange || "All",
    data.type || "Patient",
    data.displayOrder || 1,
    data.active !== undefined ? data.active : true,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0] ? mapDietTypeRow(result.rows[0]) : null;
};

const toggleDietTypeStatus = async (id, isActive) => {
  const query = `
    UPDATE diet_types
    SET
      is_active = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [isActive, id]);
  return result.rows[0] ? mapDietTypeRow(result.rows[0]) : null;
};

module.exports = {
  getAllDietTypes,
  getDietTypeById,
  createDietType,
  updateDietType,
  toggleDietTypeStatus,
};