// routes/poRoutes.js
const express = require("express");
const router = express.Router();
const poController = require("../controllers/poController");
const { requireAuth } = require("../middleware/authMiddleware");

// ─── Queries ───
router.get("/",          requireAuth, poController.getOrders);          // GET /api/orders?status=pending
router.get("/pending",   requireAuth, poController.getPendingOrders);   // GET /api/orders/pending
router.get("/by-date",   requireAuth, poController.getOrderByDate);     // GET /api/orders/by-date?date=2026-03-22
router.get("/:id",       requireAuth, poController.getOrderById);       // GET /api/orders/123

// ─── Subject Clerk actions ───
router.post("/",         requireAuth, poController.createOrder);        // POST /api/orders
router.put("/:id",       requireAuth, poController.updateOrder);        // PUT  /api/orders/123
router.post("/:id/submit", requireAuth, poController.submitOrder);      // POST /api/orders/123/submit
router.post("/:id/revise", requireAuth, poController.reviseOrder);      // POST /api/orders/123/revise

// ─── Accountant actions ───
router.post("/:id/approve", requireAuth, poController.approveOrder);    // POST /api/orders/123/approve
router.post("/:id/reject",  requireAuth, poController.rejectOrder);     // POST /api/orders/123/reject

//  EMAIL ROUTE 
router.post("/:id/email",   requireAuth, poController.emailPurchaseOrder); // POST /api/orders/123/email

// 
router.get("/:id/pdf", requireAuth, poController.downloadPurchaseOrderPDF); // GET /api/orders/123/pdf

module.exports = router;