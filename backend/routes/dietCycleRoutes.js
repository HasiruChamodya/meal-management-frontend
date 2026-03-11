const express = require("express");
const router = express.Router();
const dietCycleController = require("../controllers/dietCycleController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, dietCycleController.getDietCycles);
router.post("/", requireAuth, dietCycleController.createDietCycle);
router.put("/:id", requireAuth, dietCycleController.updateDietCycle);
router.patch("/:id/status", requireAuth, dietCycleController.toggleDietCycleStatus);

module.exports = router;