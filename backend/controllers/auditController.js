const auditModel = require("../models/auditModel");

exports.getAuditLogs = async (req, res) => {
  try {
    const { action = "all" } = req.query;
    const logs = await auditModel.getAllAuditLogs(action);
    res.status(200).json({ logs });
  } catch (error) {
    console.error("GET AUDIT LOGS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

exports.getAuditActions = async (req, res) => {
  try {
    const actions = await auditModel.getAuditActions();
    res.status(200).json({ actions: actions.map((a) => a.action) });
  } catch (error) {
    console.error("GET AUDIT ACTIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch audit actions" });
  }
};