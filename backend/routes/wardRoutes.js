const express = require("express");
const router = express.Router();
const wardController = require("../controllers/wardController");
const { requireAuth } = require("../middleware/authMiddleware");

// Retrieve all wards
router.get("/", requireAuth, wardController.getWards);

// Create a new ward
router.post("/", requireAuth, wardController.createWard);

// Update an existing ward
router.put("/:id", requireAuth, wardController.updateWard);

// Toggle ward active/inactive status
router.patch("/:id/status", requireAuth, wardController.toggleWardStatus);

module.exports = router;