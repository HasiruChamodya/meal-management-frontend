const auditModel = require("../models/auditModel");

const writeAudit = async ({
  req = null,
  action,
  entity,
  entity_id = null,
  old_value = null,
  new_value = null,
  details = null,
  severity = "info",
  status_code = null,
  success = true,

  // optional manual actor override
  actor_user_id = null,
  actor_user_name = null,
  actor_user_role = null,
}) => {
  try {
    let user_id = actor_user_id || null;
    let user_name = actor_user_name || "System";
    let user_role = actor_user_role || null;

    // fallback to authenticated request user
    if (!actor_user_name && req?.user) {
      user_id = req.user.id || null;
      user_name =
        req.user.name ||
        req.user.full_name ||
        req.user.email ||
        "Authenticated User";

      user_role = req.user.role || null;
    }

    const mergedDetails = {
      ...(details && typeof details === "object" ? details : { message: details }),
      request_id: req?.request_id || null,
      method: req?.method || null,
      path: req?.originalUrl || null,
      duration_ms: req?._duration_ms || null,
      role: user_role,
    };

    return await auditModel.createAuditLog({
      user_id,
      user_name,
      user_role, // very important
      action,
      entity,
      entity_id,
      old_value:
        old_value && typeof old_value === "object"
          ? JSON.stringify(old_value)
          : old_value,
      new_value:
        new_value && typeof new_value === "object"
          ? JSON.stringify(new_value)
          : new_value,
      details: JSON.stringify(mergedDetails),
      severity,
      status_code: status_code || req?._status_code || null,
      success,
    });
  } catch (err) {
    console.error("[AUDIT_WRITE_FAILED]", err.message);
  }
};

module.exports = { writeAudit };