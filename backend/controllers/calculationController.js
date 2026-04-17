const calculationModel = require("../models/calculationModel");
const { writeAudit } = require("../utils/audit");
const { getBaseUnit, toDisplayUnit, roundDisplay } = require("../utils/uom");
const pool = require("../config/db");

exports.runCalculation = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: "date is required" });

    const result = await calculationModel.runCalculation(date, req.user?.id);

    await writeAudit({
      req, action: "RUN_CALCULATION", entity: "calculation_runs",
      entity_id: String(result.calcRunId),
      new_value: { date, patientCycle: result.patientCycle, staffCycle: result.staffCycle,
        totalItems: result.grandTotals.length, totalRecipes: result.recipeResults.length },
      details: { message: `Calculation completed for ${date}` },
      severity: "info", status_code: 200, success: true,
    });

    res.status(200).json({
      message: "Calculation completed successfully",
      calcRunId: result.calcRunId, date: result.date,
      patientCycle: result.patientCycle, staffCycle: result.staffCycle,
      aggregated: result.aggregated,
    });
  } catch (error) {
    console.error("RUN CALCULATION ERROR:", error);
    await writeAudit({
      req, action: "RUN_CALCULATION", entity: "calculation_runs",
      details: { error: error.message, date: req.body?.date },
      severity: "error", status_code: 500, success: false,
    });
    res.status(500).json({ message: error.message || "Calculation failed" });
  }
};

exports.getResults = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date is required" });

    const results = await calculationModel.getCalculationResults(date);
    if (!results) return res.status(404).json({ message: "No calculation results found for this date" });

    // Fetch all categories from database for dynamic tab grouping
    const catResult = await pool.query(`SELECT id, name FROM categories ORDER BY id ASC`);
    const categories = catResult.rows;

    const grouped = groupResultsForFrontend(results, categories);

    res.status(200).json({
      run: results.run,
      tabs: grouped.tabs,
      categories: grouped.categories,
      vegSummaries: results.vegSummaries,
      recipeResults: results.recipeResults,
      poLineItems: results.poLineItems,
    });
  } catch (error) {
    console.error("GET CALC RESULTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch calculation results" });
  }
};

exports.getCookSheet = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date is required" });

    const results = await calculationModel.getCalculationResults(date);
    if (!results) return res.status(404).json({ message: "No calculation results found for this date" });

    const cookSheet = {
      date: results.run.date,
      patientCycle: results.run.patientCycle,
      staffCycle: results.run.staffCycle,
      patientTotals: results.run.patientTotals,
      staff: {
        breakfast: results.run.staffBreakfast,
        lunch: results.run.staffLunch,
        dinner: results.run.staffDinner,
      },
      dietInstructions: buildDietInstructions(results.lineItems),
      proteinAllocation: buildProteinAllocation(results.lineItems),
      recipes: results.recipeResults,
      kanda: results.run.kandaCount > 0
        ? { count: results.run.kandaCount, redRiceG: results.run.kandaCount * 30 }
        : null,
      extras: results.run.extrasTotals,
      customExtras: results.run.customExtrasTotals,
    };

    res.status(200).json({ cookSheet });
  } catch (error) {
    console.error("GET COOK SHEET ERROR:", error);
    res.status(500).json({ message: "Failed to fetch cook sheet" });
  }
};

exports.getItemBreakdown = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { date } = req.query;
    if (!date || !itemId) return res.status(400).json({ message: "date and itemId are required" });

    const results = await calculationModel.getCalculationResults(date);
    if (!results) return res.status(404).json({ message: "No calculation results found" });

    const itemLines = results.lineItems.filter((li) => li.itemId === Number(itemId));
    if (itemLines.length === 0) return res.status(404).json({ message: "Item not found in calculation" });

    const breakdown = {};
    for (const li of itemLines) {
      for (const [code, data] of Object.entries(li.breakdown)) {
        if (!breakdown[code]) {
          breakdown[code] = { dietType: data.nameEn || code, code, meals: {}, totalG: 0 };
        }
        breakdown[code].meals[li.meal] = { count: data.count, normG: data.normG, subtotalG: data.totalG };
        breakdown[code].totalG += data.totalG;
      }
    }

    res.status(200).json({
      itemId: Number(itemId),
      nameEn: itemLines[0].nameEn, nameSi: itemLines[0].nameSi, unit: itemLines[0].unit,
      meals: itemLines.map((li) => ({ meal: li.meal, displayValue: li.displayValue, displayUnit: li.displayUnit })),
      breakdown: Object.values(breakdown),
    });
  } catch (error) {
    console.error("GET BREAKDOWN ERROR:", error);
    res.status(500).json({ message: "Failed to fetch item breakdown" });
  }
};

// ──────────────────────────────────────────────────
// Helper: Group results into frontend tab structure
// ──────────────────────────────────────────────────

// Special tab key for raw-sum extras that don't correspond to a DB category
const EXTRAS_TAB_KEY = 'extras';

function groupResultsForFrontend(results, categories) {
  const itemMap = {};
  for (const li of results.lineItems) {
    if (!itemMap[li.itemId]) {
      itemMap[li.itemId] = {
        id: li.itemId,
        nameEn: li.nameEn,
        nameSi: li.nameSi,
        unit: li.unit,
        categoryId: li.categoryId,
        categoryName: li.categoryName,
        breakfast: null, lunch: null, dinner: null,
        grandTotal: 0, grandTotalBase: 0, breakdown: [],
      };
    }
    const item = itemMap[li.itemId];
    item[li.meal] = li.displayValue;
    item.grandTotalBase += li.subtotalBase;

    for (const [code, data] of Object.entries(li.breakdown)) {
      item.breakdown.push({
        meal: li.meal, dietType: data.nameEn || code, code,
        count: data.count, normG: data.normG, subtotalG: data.totalG,
      });
    }
  }

  for (const item of Object.values(itemMap)) {
    item.grandTotal = roundDisplay(toDisplayUnit(item.grandTotalBase, item.unit), item.unit);
  }

  // Build tabs object keyed by category ID (string) using database categories
  const tabs = {};
  for (const cat of categories) {
    tabs[String(cat.id)] = [];
  }
  tabs[EXTRAS_TAB_KEY] = [];

  // Group items by category_id from the database — no hardcoded flags
  for (const item of Object.values(itemMap)) {
    const catId = String(item.categoryId);
    if (catId && tabs[catId] !== undefined) {
      tabs[catId].push(item);
    } else {
      tabs[EXTRAS_TAB_KEY].push(item);
    }
  }

  // Add raw-sum extras (census extra items) to the extras tab
  const extrasTotals = results.run.extrasTotals || {};
  for (const [name, qty] of Object.entries(extrasTotals)) {
    if (Number(qty) > 0) {
      tabs[EXTRAS_TAB_KEY].push({
        id: `extra-${name}`, nameEn: name, nameSi: "", unit: "",
        breakfast: null, lunch: null, dinner: null,
        grandTotal: Number(qty), isExtra: true, breakdown: [],
      });
    }
  }

  // Return only populated category tabs, preserving DB order
  const activeCategories = categories
    .filter((cat) => tabs[String(cat.id)]?.length > 0)
    .map((cat) => ({ id: String(cat.id), name: cat.name }));

  if (tabs[EXTRAS_TAB_KEY].length > 0) {
    activeCategories.push({ id: EXTRAS_TAB_KEY, name: 'Extras & Specials' });
  }

  return { tabs, categories: activeCategories };
}

// ──────────────────────────────────────────────────
function buildDietInstructions(lineItems) {
  const instructions = [];

  const riceItems = lineItems.filter((li) => {
    const catId = Number(li.categoryId) || 0;
    return catId === 1 && !li.nameEn?.toLowerCase().includes("bread");
  });
  const breadItems = lineItems.filter((li) => li.nameEn?.toLowerCase().includes("bread"));

  const riceMeals = { breakfast: 0, lunch: 0, dinner: 0 };
  for (const li of riceItems) {
    riceMeals[li.meal] = (riceMeals[li.meal] || 0) + li.displayValue;
  }
  instructions.push({
    type: "Rice (Kg)",
    breakfast: Math.round(riceMeals.breakfast * 100) / 100 || null,
    lunch: Math.round(riceMeals.lunch * 100) / 100 || null,
    dinner: Math.round(riceMeals.dinner * 100) / 100 || null,
  });

  const breadMeals = { breakfast: 0, lunch: 0, dinner: 0 };
  for (const li of breadItems) {
    breadMeals[li.meal] = (breadMeals[li.meal] || 0) + li.displayValue;
  }
  instructions.push({
    type: "Bread (loaves)",
    breakfast: breadMeals.breakfast || null,
    lunch: breadMeals.lunch || null,
    dinner: breadMeals.dinner || null,
  });

  return instructions;
}

// ──────────────────────────────────────────────────
function buildProteinAllocation(lineItems) {
  const proteinItems = lineItems.filter((li) => !!li.isProtein);
  const allocation = {};

  for (const li of proteinItems) {
    if (!allocation[li.itemId]) {
      allocation[li.itemId] = { nameEn: li.nameEn, nameSi: li.nameSi, unit: li.unit, children: 0, patients: 0, staff: 0 };
    }
    const a = allocation[li.itemId];
    const bd = li.breakdown || {};
    for (const [code, data] of Object.entries(bd)) {
      const totalKg = data.totalG / 1000;
      if (code === "STAFF") a.staff += totalKg;
      else if (["S1", "S2", "S3", "S4", "S5"].includes(code)) a.children += totalKg;
      else a.patients += totalKg;
    }
  }

  return Object.values(allocation).map((a) => ({
    ...a,
    children: Math.round(a.children * 100) / 100,
    patients: Math.round(a.patients * 100) / 100,
    staff: Math.round(a.staff * 100) / 100,
  }));
}


exports.getCookSheet = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date is required" });

    const results = await calculationModel.getCalculationResults(date);
    if (!results) return res.status(404).json({ message: "No calculation results found for this date" });

    const cookSheet = {
      date: results.run.date,
      patientCycle: results.run.patientCycle,
      staffCycle: results.run.staffCycle,
      patientTotals: results.run.patientTotals, // <-- This brings the counts back!
      staff: {
        breakfast: results.run.staffBreakfast,
        lunch: results.run.staffLunch,
        dinner: results.run.staffDinner,
      },
      dietInstructions: buildDietInstructions(results.lineItems),
      proteinAllocation: buildProteinAllocation(results.lineItems),
      recipes: results.recipeResults,
      kanda: results.run.kandaCount > 0
        ? { count: results.run.kandaCount, redRiceG: results.run.kandaCount * 30 }
        : null,
      extras: results.run.extrasTotals,
      customExtras: results.run.customExtrasTotals,
    };

    res.status(200).json({ cookSheet });
  } catch (error) {
    console.error("GET COOK SHEET ERROR:", error);
    res.status(500).json({ message: "Failed to fetch cook sheet" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await calculationModel.getDailyHistory();
    res.status(200).json({ history });
  } catch (error) {
    console.error("GET HISTORY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch daily history" });
  }
};