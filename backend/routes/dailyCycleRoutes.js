const express = require("express");
const router = express.Router();
const dailyCycleController = require("../controllers/dailyCycleController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, dailyCycleController.getDailyCycle);
router.post("/", requireAuth, dailyCycleController.setDailyCycle);

module.exports = router;