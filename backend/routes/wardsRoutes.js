const express = require("express");
const router = express.Router();
const wardsController = require("../controllers/wardsController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, wardsController.getWards);
router.post("/", requireAuth, wardsController.createWard);
router.put("/:id", requireAuth, wardsController.updateWard);
router.patch("/:id/status", requireAuth, wardsController.toggleWardStatus);

module.exports = router;