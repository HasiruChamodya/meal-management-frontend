process.env.TZ = "Asia/Colombo";
const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const auditRoutes = require("./routes/auditRoutes");
const hospitalAdminRoutes = require("./routes/hospitalAdminRoutes");
const wardsRoutes = require("./routes/wardsRoutes");
const { auditRequestMiddleware } = require("./middleware/auditRequestMiddleware");
const dietPlansRoutes = require("./routes/dietPlansRoutes");
const censusRoutes = require("./routes/censusRoutes");
const calculationRoutes = require("./routes/calculationRoutes");
const dailyCycleRoutes = require("./routes/dailyCycleRoutes");
const normWeightRoutes = require("./routes/normalWeightRoutes");
const recipesRoutes = require("./routes/recipesRoutes");
const dietCycleRoutes = require("./routes/dietCycleRoutes");
const dietTypeRoutes = require("./routes/dietTypesRoutes");
const poRoutes = require("./routes/poRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const itemsRoutes = require("./routes/itemsRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

/* ✅ CORS (do NOT use app.options("*") / "/*" on your setup) */
app.use(
  cors({
    origin: ["http://localhost:8080", "https://hospital-mng-sys.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id", "x-correlation-id"],
  })
);



app.use(express.json());
app.use(auditRequestMiddleware);



// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit", auditRoutes);

//-------------------------------------------------------------------------
app.use("/api/wards", wardsRoutes);
app.use("/api/diet-plans", dietPlansRoutes);
app.use("/api/census", censusRoutes);
app.use("/api/calculations", calculationRoutes);
app.use("/api/daily-cycle", dailyCycleRoutes);
app.use("/api/diet-cycles", dietCycleRoutes);
app.use("/api/norm-weights", normWeightRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/diet-types", dietTypeRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/orders", poRoutes);
app.use("/api/invoices",invoiceRoutes);
app.use("/api/reports",reportRoutes);

//-------------------------------------------------------------------------
app.use("/api", hospitalAdminRoutes);


// quick health check
app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/db-check", async (req, res) => {
  const r = await pool.query("SELECT current_database() as db, current_user as user;");
  res.json(r.rows[0]);
});

// global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));