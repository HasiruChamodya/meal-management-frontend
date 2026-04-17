// routes/hospitalAdminRoutes.js
const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const wards = require("../controllers/wardsController");
const diet = require("../controllers/dietConfigController");
const cats = require("../controllers/categoriesController");

// Ward routes
router.get("/wards", wards.getWards);
router.post("/wards", wards.createWard);
router.put("/wards/:id", wards.updateWard);

// Diet config
router.get("/diet-config", diet.getDietConfig);
router.post("/diet-config", diet.saveDietConfig);

// Categories
router.get("/categories", cats.getCategories);
router.post("/categories", cats.createCategory);
router.put("/categories/:id", cats.updateCategory);
router.delete("/categories/:id", cats.deleteCategory);

module.exports = router;