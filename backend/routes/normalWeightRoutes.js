const express = require("express");
const router = express.Router();

const normWeightController = require("../controllers/normWeightController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, normWeightController.getWeights);
router.put("/:itemId", requireAuth, normWeightController.saveWeights);

module.exports = router;