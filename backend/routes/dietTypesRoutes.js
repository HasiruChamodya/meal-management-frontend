const express = require("express");
const router = express.Router();
const dietTypesController = require("../controllers/dietTypesController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, dietTypesController.getDietTypes);
router.post("/", requireAuth, dietTypesController.createDietType);
router.put("/:id", requireAuth, dietTypesController.updateDietType);
router.patch("/:id/status", requireAuth, dietTypesController.toggleDietTypeStatus);

module.exports = router;