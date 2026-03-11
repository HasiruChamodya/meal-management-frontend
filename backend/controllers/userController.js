const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const { writeAudit } = require("../utils/audit");

// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();

    await writeAudit({
      req,
      action: "GET_USERS",
      entity: "users",
      details: { count: users.length },
      severity: "info",
      status_code: 200,
      success: true,
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    await writeAudit({
      req,
      action: "GET_USERS",
      entity: "users",
      details: { error: error.message },
      severity: "security",
      status_code: 500,
      success: false,
    });

    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, role, password = "Temp@123" } = req.body;

    if (!name || !email || !role) {
      await writeAudit({
        req,
        action: "CREATE_USER",
        entity: "users",
        details: { error: "name, email and role are required" },
        severity: "security",
        status_code: 400,
        success: false,
      });

      return res.status(400).json({
        message: "name, email and role are required",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
      name,
      email,
      role,
      passwordHash,
    });

    await writeAudit({
      req,
      action: "CREATE_USER",
      entity: "users",
      entity_id: String(newUser.id),
      new_value: newUser,
      details: { message: "User created successfully" },
      severity: "info",
      status_code: 201,
      success: true,
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    await writeAudit({
      req,
      action: "CREATE_USER",
      entity: "users",
      details: { error: error.message, email: req.body?.email || null },
      severity: "security",
      status_code: error.code === "23505" ? 409 : 500,
      success: false,
    });

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({ message: "Failed to create user" });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      await writeAudit({
        req,
        action: "UPDATE_USER",
        entity: "users",
        entity_id: String(id),
        details: { error: "name, email and role are required" },
        severity: "security",
        status_code: 400,
        success: false,
      });

      return res.status(400).json({
        message: "name, email and role are required",
      });
    }

    const oldUser = await userModel.getUserById(id);

    if (!oldUser) {
      await writeAudit({
        req,
        action: "UPDATE_USER",
        entity: "users",
        entity_id: String(id),
        details: { error: "User not found" },
        severity: "security",
        status_code: 404,
        success: false,
      });

      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await userModel.updateUser(id, {
      name,
      email,
      role,
    });

    await writeAudit({
      req,
      action: "UPDATE_USER",
      entity: "users",
      entity_id: String(id),
      old_value: oldUser,
      new_value: updatedUser,
      details: { message: "User updated successfully" },
      severity: "info",
      status_code: 200,
      success: true,
    });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    await writeAudit({
      req,
      action: "UPDATE_USER",
      entity: "users",
      entity_id: String(req.params?.id),
      details: { error: error.message },
      severity: "security",
      status_code: error.code === "23505" ? 409 : 500,
      success: false,
    });

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({ message: "Failed to update user" });
  }
};

// PATCH /api/users/:id/status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "deactivated"].includes(status)) {
      await writeAudit({
        req,
        action: "CHANGE_USER_STATUS",
        entity: "users",
        entity_id: String(id),
        details: { error: "Invalid status value", received: status },
        severity: "security",
        status_code: 400,
        success: false,
      });

      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const oldUser = await userModel.getUserById(id);

    if (!oldUser) {
      await writeAudit({
        req,
        action: "CHANGE_USER_STATUS",
        entity: "users",
        entity_id: String(id),
        details: { error: "User not found" },
        severity: "security",
        status_code: 404,
        success: false,
      });

      return res.status(404).json({ message: "User not found" });
    }

    const isActive = status === "active";
    const updatedUser = await userModel.updateUserStatus(id, isActive);

    await writeAudit({
      req,
      action: "CHANGE_USER_STATUS",
      entity: "users",
      entity_id: String(id),
      old_value: { status: oldUser.status },
      new_value: { status: updatedUser.status },
      details: { message: "User status updated successfully" },
      severity: "security",
      status_code: 200,
      success: true,
    });

    res.status(200).json({
      message: "User status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("TOGGLE USER STATUS ERROR:", error);

    await writeAudit({
      req,
      action: "CHANGE_USER_STATUS",
      entity: "users",
      entity_id: String(req.params?.id),
      details: { error: error.message },
      severity: "security",
      status_code: 500,
      success: false,
    });

    res.status(500).json({ message: "Failed to update user status" });
  }
};

// PATCH /api/users/:id/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const oldUser = await userModel.getUserById(id);

    if (!oldUser) {
      await writeAudit({
        req,
        action: "RESET_PASSWORD",
        entity: "users",
        entity_id: String(id),
        details: { error: "User not found" },
        severity: "security",
        status_code: 404,
        success: false,
      });

      return res.status(404).json({ message: "User not found" });
    }

    const newPassword = "Temp@123";
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await userModel.resetUserPassword(id, passwordHash);

    await writeAudit({
      req,
      action: "RESET_PASSWORD",
      entity: "users",
      entity_id: String(id),
      details: {
        message: "Password reset successfully",
        reset_for: oldUser.email,
      },
      severity: "security",
      status_code: 200,
      success: true,
    });

    res.status(200).json({
      message: `Password reset successfully. Temporary password: ${newPassword}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    await writeAudit({
      req,
      action: "RESET_PASSWORD",
      entity: "users",
      entity_id: String(req.params?.id),
      details: { error: error.message },
      severity: "security",
      status_code: 500,
      success: false,
    });

    res.status(500).json({ message: "Failed to reset password" });
  }
};