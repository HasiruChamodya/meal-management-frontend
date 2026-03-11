const express = require("express");
const router = express.Router();
const recipesController = require("../controllers/recipesController");
const { requireAuth } = require("../middleware/authMiddleware");

// recipe master
router.get("/", requireAuth, recipesController.getRecipes);
router.post("/", requireAuth, recipesController.createRecipe);
router.put("/:id", requireAuth, recipesController.updateRecipe);

// item list from items table
router.get("/items/list", requireAuth, recipesController.getAvailableItems);

// recipe ingredients
router.get("/:recipeId/ingredients", requireAuth, recipesController.getRecipeIngredients);
router.post("/:recipeId/ingredients", requireAuth, recipesController.addRecipeIngredient);
router.put("/ingredients/:id", requireAuth, recipesController.updateRecipeIngredient);
router.delete("/ingredients/:id", requireAuth, recipesController.deleteRecipeIngredient);

module.exports = router;