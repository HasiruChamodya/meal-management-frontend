const express = require("express");
const router = express.Router();
const calculationController = require("../controllers/calculationController");
const { requireAuth } = require("../middleware/authMiddleware");

// Run the calculation engine (Subject Clerk)
router.post("/run", requireAuth, calculationController.runCalculation);

// Get calculation results for frontend tabs (Subject Clerk, Accountant)
router.get("/results", requireAuth, calculationController.getResults);

// Get cook sheet data — no prices (Kitchen Staff)
router.get("/cook-sheet", requireAuth, calculationController.getCookSheet);

// Get detailed breakdown for a specific item (Subject Clerk)
router.get("/breakdown/:itemId", requireAuth, calculationController.getItemBreakdown);

// Get historical calculation data for the past 7 days
router.get("/history", requireAuth, calculationController.getHistory);

module.exports = router;