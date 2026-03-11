const express = require("express");
const router = express.Router();

const dietPlansController = require("../controllers/dietPlansController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

// Require login for all diet plan routes
router.use(requireAuth);

// Optional: restrict only HospitalAdmin
// router.use(requireRole("HospitalAdmin"));

router.get("/", dietPlansController.getAll);
router.post("/", dietPlansController.create);
router.put("/:id", dietPlansController.update);
router.patch("/:id/toggle", dietPlansController.toggle);
router.delete("/:id", dietPlansController.remove);

module.exports = router;