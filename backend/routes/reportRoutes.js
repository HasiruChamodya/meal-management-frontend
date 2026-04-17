const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/accountant", requireAuth, reportController.getAccountantReports);

module.exports = router;