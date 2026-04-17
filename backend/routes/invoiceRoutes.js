const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { requireAuth } = require("../middleware/authMiddleware");

// 1. Get a list of approved POs waiting for delivery
router.get("/pending", requireAuth, invoiceController.getPendingDeliveries);

// 2. NEW: Get the issue reports (MUST be before any /:id routes to prevent naming clashes!)
router.get("/issues", requireAuth, invoiceController.getIssueReports);

// 3. Get the specific items of a PO to build the checklist
router.get("/po/:poId", requireAuth, invoiceController.getPoForReceiving);

// 4. Submit the final checked-off delivery
router.post("/receive", requireAuth, invoiceController.receiveDelivery);

module.exports = router;