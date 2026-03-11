const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { writeAudit } = require("../utils/audit");

const ALLOWED_ROLES = new Set([
  "SYSTEM_ADMIN",
  "HOSPITAL_ADMIN",
  "DIET_CLERK",
  "SUBJECT_CLERK",
  "ACCOUNTANT",
  "KITCHEN",
]);

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        message: "full_name, email, password, role are required",
      });
    }

    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      await writeAudit({
        req,
        action: "REGISTER_FAILED_EMAIL_EXISTS",
        entity: "users",
        details: { email, full_name, role },
        severity: "security",
        status_code: 409,
        success: false,
      });

      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.createUser({
      name: full_name,
      email,
      role,
      passwordHash,
    });

    await writeAudit({
      req,
      action: "REGISTER_SUCCESS",
      entity: "users",
      entity_id: String(newUser.id),
      new_value: newUser,
      details: { full_name: newUser.name, email: newUser.email, role: newUser.role },
      severity: "info",
      status_code: 201,
      success: true,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    console.error("DETAIL:", error.detail);
    console.error("CODE:", error.code);

    await writeAudit({
      req,
      action: "REGISTER_ERROR",
      entity: "users",
      details: {
        email: req.body?.email || null,
        role: req.body?.role || null,
        message: error.message,
        code: error.code,
      },
      severity: "security",
      status_code: 500,
      success: false,
    });

    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
      detail: error.detail,
      code: error.code,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      await writeAudit({
        req,
        action: "LOGIN_FAILED",
        entity: "users",
        details: { email, reason: "user_not_found" },
        severity: "security",
        status_code: 401,
        success: false,
      });

      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status !== "active") {
      await writeAudit({
        req,
        action: "LOGIN_BLOCKED",
        entity: "users",
        entity_id: String(user.id),
        details: {
          email: user.email,
          role: user.role,
          reason: "deactivated",
        },
        severity: "security",
        status_code: 403,
        success: false,
      });

      return res.status(403).json({ message: "Account is deactivated" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      await writeAudit({
        req,
        action: "LOGIN_FAILED",
        entity: "users",
        entity_id: String(user.id),
        details: {
          email: user.email,
          role: user.role,
          reason: "wrong_password",
        },
        severity: "security",
        status_code: 401,
        success: false,
      });

      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await writeAudit({
      req,
      action: "LOGIN_SUCCESS",
      entity: "users",
      entity_id: String(user.id),
      details: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      severity: "info",
      status_code: 200,
      success: true,
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    console.error("DETAIL:", error.detail);
    console.error("CODE:", error.code);

    await writeAudit({
      req,
      action: "LOGIN_ERROR",
      entity: "users",
      details: {
        email: req.body?.email || null,
        message: error.message,
        code: error.code,
      },
      severity: "security",
      status_code: 500,
      success: false,
    });

    return res.status(500).json({
      message: "Login failed",
      error: error.message,
      detail: error.detail,
      code: error.code,
    });
  }
};