const pool = require("../config/db");

const mapItemRow = (row) => ({
  id: row.id,
  nameEn: row.name_en,
  nameSi: row.name_si,
  unit: row.unit,
  defaultPrice: Number(row.default_price),
  categoryId: row.category_id,
  isProtein: row.is_protein,
  dietCycle: row.diet_cycle,
  isVegetable: row.is_vegetable,
  vegCategory: row.veg_category,
  isExtra: row.is_extra,
  calcType: row.calc_type,
  active: row.active,
  createdAt: row.created_at,
});

exports.getItems = async () => {
  const result = await pool.query(`
    SELECT *
    FROM items
    WHERE active = TRUE
    ORDER BY id DESC
  `);

  return result.rows.map(mapItemRow);
};

exports.createItem = async (item) => {
  const query = `
    INSERT INTO items
    (
      name_en,
      name_si,
      unit,
      default_price,
      category_id,
      is_protein,
      diet_cycle,
      is_vegetable,
      veg_category,
      is_extra,
      calc_type
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *
  `;

  const values = [
    item.nameEn,
    item.nameSi,
    item.unit,
    item.defaultPrice,
    item.categoryId,
    item.isProtein,
    item.dietCycle,
    item.isVegetable,
    item.vegCategory,
    item.isExtra,
    item.calcType,
  ];

  const result = await pool.query(query, values);
  return mapItemRow(result.rows[0]);
};

exports.updateItem = async (id, item) => {
  const query = `
    UPDATE items
    SET
      name_en = $1,
      name_si = $2,
      unit = $3,
      default_price = $4,
      category_id = $5,
      is_protein = $6,
      diet_cycle = $7,
      is_vegetable = $8,
      veg_category = $9,
      is_extra = $10,
      calc_type = $11
    WHERE id = $12
    RETURNING *
  `;

  const values = [
    item.nameEn,
    item.nameSi,
    item.unit,
    item.defaultPrice,
    item.categoryId,
    item.isProtein,
    item.dietCycle,
    item.isVegetable,
    item.vegCategory,
    item.isExtra,
    item.calcType,
    id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0] ? mapItemRow(result.rows[0]) : null;
};

exports.deleteItem = async (id) => {
  const result = await pool.query(
    `UPDATE items SET active = FALSE WHERE id = $1 RETURNING *`,
    [id]
  );

  return result.rows[0] ? mapItemRow(result.rows[0]) : null;
};