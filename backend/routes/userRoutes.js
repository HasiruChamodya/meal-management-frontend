const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, userController.getUsers);
router.post("/", requireAuth, userController.createUser);
router.put("/:id", requireAuth, userController.updateUser);
router.patch("/:id/status", requireAuth, userController.toggleUserStatus);
router.patch("/:id/reset-password", requireAuth, userController.resetPassword);

module.exports = router;