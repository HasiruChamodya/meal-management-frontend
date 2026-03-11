const itemsModel = require("../models/itemsModel");
const { writeAudit } = require("../utils/audit");

/* GET ITEMS */
exports.getItems = async (req, res) => {
  try {
    const items = await itemsModel.getItems();
    res.json({ items });
  } catch (err) {
    console.error("GET ITEMS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
};

/* CREATE ITEM */
exports.createItem = async (req, res) => {
  try {
    const item = await itemsModel.createItem(req.body);

    await writeAudit({
      req,
      action: "CREATE_ITEM",
      entity: "items",
      entity_id: String(item.id),
      new_value: item,
      details: { message: "Item created successfully" },
      severity: "info",
      status_code: 201,
      success: true,
    });

    res.status(201).json({
      message: "Item created successfully",
      item
    });

  } catch (err) {
    console.error("CREATE ITEM ERROR:", err);

    await writeAudit({
      req,
      action: "CREATE_ITEM",
      entity: "items",
      details: { error: err.message },
      severity: "error",
      status_code: 500,
      success: false,
    });

    res.status(500).json({ message: "Failed to create item" });
  }
};

/* UPDATE ITEM */
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;

    const oldItem = await itemsModel.getItemById(id);
    if (!oldItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const updatedItem = await itemsModel.updateItem(id, req.body);

    // Determine if this was specifically a price change to flag it in the audit
    const isPriceChange = oldItem.defaultPrice !== updatedItem.defaultPrice;
    const actionName = isPriceChange ? "UPDATE_ITEM_PRICE" : "UPDATE_ITEM";

    await writeAudit({
      req,
      action: actionName,
      entity: "items",
      entity_id: String(id),
      old_value: oldItem,
      new_value: updatedItem,
      details: { 
        message: "Item updated successfully",
        priceChanged: isPriceChange 
      },
      severity: isPriceChange ? "warning" : "info", // Elevate severity for price changes
      status_code: 200,
      success: true,
    });

    res.json({
      message: "Item updated successfully",
      item: updatedItem
    });

  } catch (err) {
    console.error("UPDATE ITEM ERROR:", err);

    await writeAudit({
      req,
      action: "UPDATE_ITEM",
      entity: "items",
      entity_id: String(req.params?.id),
      details: { error: err.message },
      severity: "error",
      status_code: 500,
      success: false,
    });

    res.status(500).json({ message: "Failed to update item" });
  }
};

/* DELETE ITEM (Soft Delete) */
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const oldItem = await itemsModel.getItemById(id);
    if (!oldItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const deletedItem = await itemsModel.deleteItem(id);

    await writeAudit({
      req,
      action: "DELETE_ITEM",
      entity: "items",
      entity_id: String(id),
      old_value: { active: true },
      new_value: { active: false },
      details: { message: "Item soft deleted" },
      severity: "warning",
      status_code: 200,
      success: true,
    });

    res.json({
      message: "Item removed successfully"
    });

  } catch (err) {
    console.error("DELETE ITEM ERROR:", err);

    await writeAudit({
      req,
      action: "DELETE_ITEM",
      entity: "items",
      entity_id: String(req.params?.id),
      details: { error: err.message },
      severity: "error",
      status_code: 500,
      success: false,
    });

    res.status(500).json({ message: "Failed to delete item" });
  }
};