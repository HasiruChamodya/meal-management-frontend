const express = require("express");
const router = express.Router();
const censusController = require("../controllers/censusController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/statuses", requireAuth, censusController.getWardStatuses);
router.get("/ward/:wardId", requireAuth, censusController.getWardCensus);
router.get("/my-submissions", requireAuth, censusController.getMySubmissions);

router.post("/draft", requireAuth, censusController.saveWardCensusDraft);
router.post("/submit", requireAuth, censusController.submitWardCensus);

router.get("/staff", requireAuth, censusController.getStaffMeals);
router.post("/staff/submit", requireAuth, censusController.submitStaffMeals);

module.exports = router;