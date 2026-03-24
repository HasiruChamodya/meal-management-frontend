const normWeightModel = require("../models/normWeightModel");
const { writeAudit } = require("../utils/audit");

// GET /api/norm-weights
exports.getWeights = async (req, res) => {
  try {
    const weights = await normWeightModel.getAllWeights();
    res.json({ weights });
  } catch (error) {
    console.error("GET NORM WEIGHTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch norm weights" });
  }
};

// PUT /api/norm-weights/:itemId
exports.saveWeights = async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const { weights } = req.body; 

    if (!itemId || !Array.isArray(weights)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const updatedWeights = await normWeightModel.upsertWeights(itemId, weights);

    await writeAudit({
      req,
      action: "UPDATE_NORM_WEIGHTS",
      entity: "norm_weights",
      entity_id: String(itemId),
      details: { message: `Updated norm weights for item ${itemId}` },
      severity: "info",
      status_code: 200,
      success: true,
    });

    res.status(200).json({
      message: "Norm weights saved successfully",
      updatedWeights
    });

  } catch (error) {
    console.error("SAVE NORM WEIGHTS ERROR:", error);

    await writeAudit({
      req,
      action: "UPDATE_NORM_WEIGHTS",
      entity: "norm_weights",
      entity_id: String(req.params.itemId),
      details: { error: error.message },
      severity: "error",
      status_code: 500,
      success: false,
    });

    res.status(500).json({ message: "Failed to save norm weights" });
  }
};