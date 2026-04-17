const pool = require("../config/db");

const mapDietTypeRow = (row) => ({
  id: row.id,
  code: row.code,
  nameEn: row.name_en,
  nameSi: row.name_si,
  ageRange: row.age_range,
  type: row.type,
  displayOrder: row.display_order,
  active: row.active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

exports.getAllDietTypes = async () => {
  const result = await pool.query(`
    SELECT *
    FROM diet_types
    ORDER BY active DESC, display_order ASC, id ASC
  `);

  return result.rows.map(mapDietTypeRow);
};

exports.getDietTypeById = async (id) => {
  const result = await pool.query(`SELECT * FROM diet_types WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] ? mapDietTypeRow(result.rows[0]) : null;
};

exports.createDietType = async ({ code, nameEn, nameSi, ageRange, type, displayOrder }) => {
  const result = await pool.query(
    `
    INSERT INTO diet_types (code, name_en, name_si, age_range, type, display_order, active)
    VALUES ($1,$2,$3,$4,$5,$6,TRUE)
    RETURNING *
    `,
    [code, nameEn, nameSi, ageRange, type, displayOrder]
  );
  return mapDietTypeRow(result.rows[0]);
};

exports.updateDietType = async (id, { code, nameEn, nameSi, ageRange, type, displayOrder }) => {
  const result = await pool.query(
    `
    UPDATE diet_types
    SET code = $1, name_en = $2, name_si = $3, age_range = $4, type = $5, display_order = $6, updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *
    `,
    [code, nameEn, nameSi, ageRange, type, displayOrder, id]
  );
  return result.rows[0] ? mapDietTypeRow(result.rows[0]) : null;
};

// Restored Status Toggle
exports.updateDietTypeStatus = async (id, active) => {
  const result = await pool.query(
    `
    UPDATE diet_types
    SET active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
    `,
    [active, id]
  );
  return result.rows[0] ? mapDietTypeRow(result.rows[0]) : null;
};