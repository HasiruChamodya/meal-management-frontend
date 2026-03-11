const pool = require("../config/db");

const mapRecipeRow = (row) => ({
  id: row.id,
  recipeKey: row.recipe_key,
  name: row.name,
  active: row.active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapIngredientRow = (row) => ({
  id: row.id,
  recipeId: row.recipe_id,
  itemId: row.item_id,
  itemNameEn: row.name_en,
  itemNameSi: row.name_si,
  normPerPatient: Number(row.norm_per_patient),
  unit: row.unit,
});

exports.getRecipes = async () => {
  const result = await pool.query(`
    SELECT id, recipe_key, name, active, created_at, updated_at
    FROM recipes
    WHERE active = TRUE
    ORDER BY name ASC
  `);
  return result.rows.map(mapRecipeRow);
};

exports.getRecipeById = async (id) => {
  const result = await pool.query(`
    SELECT id, recipe_key, name, active, created_at, updated_at
    FROM recipes
    WHERE id = $1
    LIMIT 1
  `, [id]);

  return result.rows[0] ? mapRecipeRow(result.rows[0]) : null;
};

exports.createRecipe = async ({ recipeKey, name }) => {
  const result = await pool.query(`
    INSERT INTO recipes (recipe_key, name)
    VALUES ($1, $2)
    RETURNING id, recipe_key, name, active, created_at, updated_at
  `, [recipeKey, name]);

  return mapRecipeRow(result.rows[0]);
};

exports.updateRecipe = async (id, { recipeKey, name }) => {
  const result = await pool.query(`
    UPDATE recipes
    SET recipe_key = $1,
        name = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, recipe_key, name, active, created_at, updated_at
  `, [recipeKey, name, id]);

  return result.rows[0] ? mapRecipeRow(result.rows[0]) : null;
};

exports.getRecipeIngredients = async (recipeId) => {
  const result = await pool.query(`
    SELECT
      ri.id,
      ri.recipe_id,
      ri.item_id,
      ri.norm_per_patient,
      ri.unit,
      i.name_en,
      i.name_si
    FROM recipe_ingredients ri
    INNER JOIN items i ON i.id = ri.item_id
    WHERE ri.recipe_id = $1
    ORDER BY i.name_en ASC
  `, [recipeId]);

  return result.rows.map(mapIngredientRow);
};

exports.addRecipeIngredient = async ({ recipeId, itemId, normPerPatient, unit }) => {
  const result = await pool.query(`
    INSERT INTO recipe_ingredients (recipe_id, item_id, norm_per_patient, unit)
    VALUES ($1, $2, $3, $4)
    RETURNING id, recipe_id, item_id, norm_per_patient, unit
  `, [recipeId, itemId, normPerPatient, unit]);

  const row = result.rows[0];

  const joined = await pool.query(`
    SELECT
      ri.id,
      ri.recipe_id,
      ri.item_id,
      ri.norm_per_patient,
      ri.unit,
      i.name_en,
      i.name_si
    FROM recipe_ingredients ri
    INNER JOIN items i ON i.id = ri.item_id
    WHERE ri.id = $1
  `, [row.id]);

  return mapIngredientRow(joined.rows[0]);
};

exports.updateRecipeIngredient = async (id, { normPerPatient, unit }) => {
  const result = await pool.query(`
    UPDATE recipe_ingredients
    SET norm_per_patient = $1,
        unit = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, recipe_id, item_id, norm_per_patient, unit
  `, [normPerPatient, unit, id]);

  if (!result.rows[0]) return null;

  const joined = await pool.query(`
    SELECT
      ri.id,
      ri.recipe_id,
      ri.item_id,
      ri.norm_per_patient,
      ri.unit,
      i.name_en,
      i.name_si
    FROM recipe_ingredients ri
    INNER JOIN items i ON i.id = ri.item_id
    WHERE ri.id = $1
  `, [id]);

  return mapIngredientRow(joined.rows[0]);
};

exports.deleteRecipeIngredient = async (id) => {
  const result = await pool.query(`
    DELETE FROM recipe_ingredients
    WHERE id = $1
    RETURNING *
  `, [id]);

  return result.rows[0] || null;
};

exports.getAvailableItems = async () => {
  const result = await pool.query(`
    SELECT id, name_en, name_si, unit, category_id
    FROM items
    WHERE active = TRUE
    ORDER BY name_en ASC
  `);

  return result.rows.map((row) => ({
    id: row.id,
    nameEn: row.name_en,
    nameSi: row.name_si,
    unit: row.unit,
    categoryId: row.category_id,
  }));
};