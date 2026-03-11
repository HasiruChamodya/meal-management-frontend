const express = require("express");
const router = express.Router();
const dietTypeController = require("../controllers/dietTypeController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, dietTypeController.getDietTypes);
router.post("/", requireAuth, dietTypeController.createDietType);
router.put("/:id", requireAuth, dietTypeController.updateDietType);
router.patch("/:id/status", requireAuth, dietTypeController.toggleDietTypeStatus);

module.exports = router;