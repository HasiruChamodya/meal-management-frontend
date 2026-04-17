const reportModel = require("../models/reportModel");

exports.getAccountantReports = async (req, res) => {
  try {
    
    const timeframe = req.query.timeframe || '6m'; 
    
    const data = await reportModel.getAccountantDashboardData(timeframe);
    res.json(data);
  } catch (error) {
    console.error("GET ACCOUNTANT REPORTS ERROR:", error);
    res.status(500).json({ message: "Failed to generate financial reports." });
  }
};