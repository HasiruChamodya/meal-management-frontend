const dietTypeModel = require("../models/dietTypeModel");
const { writeAudit } = require("../utils/audit");

// GET /api/diet-types
exports.getDietTypes = async (req, res) => {
  try {
    const types = await dietTypeModel.getAllDietTypes();

    await writeAudit({
      req,
      action: "GET_DIET_TYPES",
      entity: "diet_types",
      details: { count: types.length },
      severity: "info",
      status_code: 200,
      success: true,
    });

    res.status(200).json({ types });
  } catch (error) {
    console.error("GET DIET TYPES ERROR:", error);

    await writeAudit({
      req,
      action: "GET_DIET_TYPES",
      entity: "diet_types",
      details: { error: error.message },
      severity: "warning",
      status_code: 500,
      success: false,
    });

    res.status(500).json({ message: "Failed to fetch diet types" });
  }
};

// POST /api/diet-types
exports.createDietType = async (req, res) => {
  try {
    const { code, nameEn, nameSi, ageRange, type, displayOrder, active } = req.body;

    if (!code || !nameEn) {
      await writeAudit({
        req,
        action: "CREATE_DIET_TYPE",
        entity: "diet_types",
        details: { error: "Code and English Name are required" },
        severity: "warning",
        status_code: 400,
        success: false,
      });

      return res.status(400).json({ message: "Code and English Name are required" });
    }

    const newType = await dietTypeModel.createDietType({
      code, nameEn, nameSi, ageRange, type, displayOrder, active
    });

    await writeAudit({
      req,
      action: "CREATE_DIET_TYPE",
      entity: "diet_types",
      entity_id: String(newType.id),
      new_value: newType,
      details: { message: "Diet type created successfully" },
      severity: "info",
      status_code: 201,
      success: true,
    });

    res.status(201).json({
      message: "Diet type created successfully",
      type: newType,
    });
  } catch (error) {
    console.error("CREATE DIET TYPE ERROR:", error);

    await writeAudit({
      req,
      action: "CREATE_DIET_TYPE",
      entity: "diet_types",
      details: { error: error.message, code: req.body?.code || null },
      severity: "error",
      status_code: error.code === "23505" ? 409 : 500,
      success: false,
    });

    if (error.code === "23505") {
      return res.status(409).json({ message: "Diet type code already exists" });
    }

    res.status(500).json({ message: "Failed to create diet type" });
  }
};

// PUT /api/diet-types/:id
exports.updateDietType = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, nameEn, nameSi, ageRange, type, displayOrder, active } = req.body;

    if (!code || !nameEn) {
      return res.status(400).json({ message: "Code and English Name are required" });
    }

    const oldType = await dietTypeModel.getDietTypeById(id);

    if (!oldType) {
      return res.status(404).json({ message: "Diet type not found" });
    }

    const updatedType = await dietTypeModel.updateDietType(id, {
      code, nameEn, nameSi, ageRange, type, displayOrder, active
    });

    await writeAudit({
      req,
      action: "UPDATE_DIET_TYPE",
      entity: "diet_types",
      entity_id: String(id),
      old_value: oldType,
      new_value: updatedType,
      details: { message: "Diet type updated successfully" },
      severity: "info",
      status_code: 200,
      success: true,
    });

    res.status(200).json({
      message: "Diet type updated successfully",
      type: updatedType,
    });
  } catch (error) {
    console.error("UPDATE DIET TYPE ERROR:", error);

    await writeAudit({
      req,
      action: "UPDATE_DIET_TYPE",
      entity: "diet_types",
      entity_id: String(req.params?.id),
      details: { error: error.message },
      severity: "error",
      status_code: error.code === "23505" ? 409 : 500,
      success: false,
    });

    if (error.code === "23505") {
      return res.status(409).json({ message: "Diet type code already exists" });
    }

    res.status(500).json({ message: "Failed to update diet type" });
  }
};

// PATCH /api/diet-types/:id/status
exports.toggleDietTypeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: "Active status must be a boolean" });
    }

    const oldType = await dietTypeModel.getDietTypeById(id);

    if (!oldType) {
      return res.status(404).json({ message: "Diet type not found" });
    }

    const updatedType = await dietTypeModel.toggleDietTypeStatus(id, active);

    await writeAudit({
      req,
      action: "CHANGE_DIET_TYPE_STATUS",
      entity: "diet_types",
      entity_id: String(id),
      old_value: { active: oldType.active },
      new_value: { active: updatedType.active },
      details: { message: `Diet type status changed to ${active ? 'Active' : 'Inactive'}` },
      severity: "info",
      status_code: 200,
      success: true,
    });

    res.status(200).json({
      message: "Diet type status updated successfully",
      type: updatedType,
    });
  } catch (error) {
    console.error("TOGGLE DIET TYPE STATUS ERROR:", error);

    await writeAudit({
      req,
      action: "CHANGE_DIET_TYPE_STATUS",
      entity: "diet_types",
      entity_id: String(req.params?.id),
      details: { error: error.message },
      severity: "error",
      status_code: 500,
      success: false,
    });

    res.status(500).json({ message: "Failed to update diet type status" });
  }
};