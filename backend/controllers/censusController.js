const censusModel = require("../models/censusModel");
const { writeAudit } = require("../utils/audit");

exports.getWardCensus = async (req, res) => {
  try {
    const { wardId } = req.params;
    const { date } = req.query;

    if (!wardId || !date) {
      return res.status(400).json({ message: "wardId and date are required" });
    }

    const census = await censusModel.getWardCensusByDate(wardId, date);

    res.status(200).json({ census });
  } catch (error) {
    console.error("GET WARD CENSUS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch ward census" });
  }
};

exports.getWardStatuses = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const statuses = await censusModel.getAllWardCensusStatusesByDate(date);
    res.status(200).json({ statuses });
  } catch (error) {
    console.error("GET CENSUS STATUSES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch census statuses" });
  }
};

exports.saveWardCensusDraft = async (req, res) => {
  try {
    const {
      wardId,
      date,
      diets = {},
      special = {},
      extras = {},
      customExtras = [],
    } = req.body;

    if (!wardId || !date) {
      return res.status(400).json({ message: "wardId and date are required" });
    }

    const totalPatients = Object.values(diets).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0
    );

    const census = await censusModel.upsertWardCensus({
      wardId,
      entryDate: date,
      status: "draft",
      totalPatients,
      diets,
      special,
      extras,
      customExtras,
    });

    await writeAudit({
      req,
      action: "SAVE_CENSUS_DRAFT",
      entity: "census_entries",
      entity_id: `${wardId}_${date}`,
      new_value: census,
      details: { wardId, date, totalPatients },
      severity: "info",
      status_code: 200,
      success: true,
    });

    res.status(200).json({
      message: "Census draft saved successfully",
      census,
    });
  } catch (error) {
    console.error("SAVE CENSUS DRAFT ERROR:", error);
    res.status(500).json({ message: "Failed to save census draft" });
  }
};

exports.submitWardCensus = async (req, res) => {
  try {
    const {
      wardId,
      date,
      diets = {},
      special = {},
      extras = {},
      customExtras = [],
    } = req.body;

    if (!wardId || !date) {
      return res.status(400).json({ message: "wardId and date are required" });
    }

    const totalPatients = Object.values(diets).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0
    );

    const census = await censusModel.upsertWardCensus({
      wardId,
      entryDate: date,
      status: "submitted",
      totalPatients,
      diets,
      special,
      extras,
      customExtras,
      submittedBy: req.user?.id || null,
      submittedAt: new Date(),
    });

    await writeAudit({
      req,
      action: "SUBMIT_CENSUS",
      entity: "census_entries",
      entity_id: `${wardId}_${date}`,
      new_value: census,
      details: { wardId, date, totalPatients },
      severity: "info",
      status_code: 200,
      success: true,
    });

    res.status(200).json({
      message: "Ward census submitted successfully",
      census,
    });
  } catch (error) {
    console.error("SUBMIT CENSUS ERROR:", error);
    res.status(500).json({ message: "Failed to submit ward census" });
  }
};

exports.getStaffMeals = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const staffMeals = await censusModel.getStaffMealsByDate(date);
    res.status(200).json({ staffMeals });
  } catch (error) {
    console.error("GET STAFF MEALS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch staff meals" });
  }
};

exports.submitStaffMeals = async (req, res) => {
  try {
    const {
      date,
      breakfast = 0,
      lunch = 0,
      dinner = 0,
      staffCycle = "Chicken",
    } = req.body;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const staffMeals = await censusModel.upsertStaffMeals({
      mealDate: date,
      breakfast,
      lunch,
      dinner,
      staffCycle,
      status: "submitted",
      submittedBy: req.user?.id || null,
      submittedAt: new Date(),
    });

    await writeAudit({
      req,
      action: "SUBMIT_STAFF_MEALS",
      entity: "staff_meals",
      entity_id: date,
      new_value: staffMeals,
      details: { date, breakfast, lunch, dinner },
      severity: "info",
      status_code: 200,
      success: true,
    });

    res.status(200).json({
      message: "Staff meals submitted successfully",
      staffMeals,
    });
  } catch (error) {
    console.error("SUBMIT STAFF MEALS ERROR:", error);
    res.status(500).json({ message: "Failed to submit staff meals" });
  }
};