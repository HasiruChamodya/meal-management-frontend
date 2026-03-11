const express = require("express");
const router = express.Router();

const itemsController = require("../controllers/itemsController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, itemsController.getItems);
router.post("/", requireAuth, itemsController.createItem);
router.put("/:id", requireAuth, itemsController.updateItem);
router.delete("/:id", requireAuth, itemsController.deleteItem);

module.exports = router;