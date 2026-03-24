// routes/hospitalAdminRoutes.js
const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const wards = require("../controllers/wardsController");
const diet = require("../controllers/dietConfigController");
const ing = require("../controllers/ingredientsController");
const norms = require("../controllers/normWeightController");
const frac = require("../controllers/fractionalFormulasController");
const cats = require("../controllers/categoriesController");

// everything here: HOSPITAL_ADMIN only
// router.use(requireAuth, requireRole("HOSPITAL_ADMIN"));

router.get("/wards", wards.getWards);
router.post("/wards", wards.createWard);
router.put("/wards/:id", wards.updateWard);

router.get("/diet-config", diet.getDietConfig);
router.post("/diet-config", diet.saveDietConfig);

router.get("/ingredients", ing.getIngredients);
router.post("/ingredients", ing.createIngredient);

router.get("/norm-weights", norms.getNormWeights);
router.post("/norm-weights", norms.saveNormWeights);

router.get("/fractional-formulas", frac.getFormulas);
router.post("/fractional-formulas", frac.createFormula);
router.put("/fractional-formulas/:id", frac.updateFormula);

router.get("/categories", cats.getCategories);
router.post("/categories", cats.createCategory);
router.put("/categories/:id", cats.updateCategory);

module.exports = router;