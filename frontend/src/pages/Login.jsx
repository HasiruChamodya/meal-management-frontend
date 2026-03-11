import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ── SVG Icon Components ──────────────────────────────────────────────────────

const IconUser = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconLock = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const IconEye = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconShield = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconArrow = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconCheck = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconAlert = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatItem({ value, label, border }) {
  return (
    <div className={`${border ? "border-l border-white/10 pl-6" : ""} pr-6`}>
      <div
        className="text-[#74c69d] font-bold text-2xl mb-1"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {value}
      </div>
      <div className="text-white/40 text-[11px] uppercase tracking-widest leading-snug">
        {label}
      </div>
    </div>
  );
}

// ── Main Login Component ─────────────────────────────────────────────────────

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success


  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 2)
      e.password = "Minimum 6 characters required.";
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setStatus("loading");

      const res = await axios.post(
        "http://localhost:5050/api/auth/login",
        form,
      );

      const { token, user } = res.data;

// Always store in sessionStorage
sessionStorage.setItem("token", token);


// If remember is ON, also store in localStorage (optional)
if (remember) {
  localStorage.setItem("token", token);
  
} else {
  // keep localStorage clean
  localStorage.removeItem("token");
  
}

      setStatus("success");

      // Redirect based on role
      if (user.role === "DIET_CLERK") {
        navigate("/diet-dashboard");
      } else if (user.role === "ACCOUNTANT") {
        navigate("/accountant-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setStatus("idle");
      setErrors({
        general: err.response?.data?.message || "Login failed",
      });
    }
  };

  // ── Field helper ──
  const fieldClass = (field) =>
    `w-full pl-12 pr-4 py-[14px] text-[15.5px] bg-white rounded-xl border-[1.5px] outline-none
     transition-all duration-200 placeholder:text-[#b0c4b8] text-[#1a2e22]
     ${
       errors[field]
         ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
         : "border-[#ccddd4] focus:border-[#3a8f68] focus:ring-2 focus:ring-[#3a8f68]/[0.14]"
     }`;

  return (
    <div className="min-h-screen flex bg-[#f1f6f3]">
      {/* ────────────── LEFT PANEL ────────────── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #1a4030 0%, #2d6a4e 58%, #3c8f68 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/[0.06] pointer-events-none" />
        <div className="absolute top-20 -right-12 w-52 h-52 rounded-full border border-white/[0.04] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border border-white/[0.05] pointer-events-none" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Top content */}
        <div className="relative z-10 p-14">
          {/* Wordmark */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <span
              className="text-white text-[19px] font-semibold tracking-wide"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Meal Managemt System
            </span>
          </div>

          <h1
            className="text-white font-bold leading-[1.18] mb-6"
            style={{ fontFamily: "'Georgia', serif", fontSize: "2.6rem" }}
          >
            Patient Nutrition,
            <br />
            Precisely
            <br />
            Managed.
          </h1>

          <p className="text-white/55 text-[15.5px] leading-relaxed max-w-[290px]">
            A unified platform for ward nurses, dietitians, and kitchen teams to
            coordinate every patient meal with accuracy and care.
          </p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 px-14 pb-14">
          <div className="border-t border-white/10 pt-9 flex">
            {/* <StatItem value="98%" label="On-time Delivery" border={false} />
            <StatItem value="340+" label="Beds Supported" border />
            <StatItem value="4.9" label="Staff Rating" border /> */}
          </div>
        </div>
      </div>

      {/* ────────────── RIGHT PANEL ────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg bg-[#2d6a4e] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <span
              className="text-[#1a4030] text-lg font-semibold"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              MealCare
            </span>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <p className="text-[#3a8f68] text-[11.5px] font-semibold tracking-[2px] uppercase mb-3">
              Staff Portal
            </p>
            <h2
              className="text-[#1a2e22] font-bold mb-2"
              style={{ fontFamily: "'Georgia', serif", fontSize: "2rem" }}
            >
              Welcome back
            </h2>
            <p className="text-[#617a6b] text-[15px] leading-relaxed">
              Sign in to access the meal management dashboard.
            </p>
          </div>

          {/* General error banner */}
          {errors.general && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 mb-6">
              <span className="text-red-400 mt-0.5 flex-shrink-0">
                <IconAlert />
              </span>
              <p className="text-red-700 text-sm leading-snug">
                {errors.general}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#243d2c] tracking-wide mb-2">
                Email
              </label>
              <div className="relative">
                <span
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200
        ${errors.email ? "text-red-400" : form.email ? "text-[#3a8f68]" : "text-[#9ab4a2]"}`}
                >
                  <IconUser />
                </span>

                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="e.g. test@hospital.com"
                  autoComplete="username"
                  className={fieldClass("email")}
                />
              </div>

              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 pl-0.5">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-[13px] font-semibold text-[#243d2c] tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <span
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200
                  ${errors.password ? "text-red-400" : form.password ? "text-[#3a8f68]" : "text-[#9ab4a2]"}`}
                >
                  <IconLock />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`${fieldClass("password")} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ab4a2] hover:text-[#3a8f68] transition-colors duration-200 p-0.5"
                >
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 pl-0.5">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setRemember((v) => !v)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer
                    ${
                      remember
                        ? "bg-[#2d6a4e] border-[#2d6a4e]"
                        : "bg-white border-[#ccddd4] hover:border-[#3a8f68]"
                    }`}
                >
                  {remember && <IconCheck className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[14.5px] text-[#4e6a59]">
                  Keep me signed in
                </span>
              </label>

              <button
                type="button"
                className="text-[14.5px] font-semibold text-[#3a8f68] hover:text-[#1a4030] transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className={`
                w-full py-[15px] rounded-xl text-white font-semibold text-[16px] tracking-wide
                flex items-center justify-center gap-2.5 transition-all duration-200
                ${
                  status === "success"
                    ? "bg-[#40916c] cursor-default"
                    : status === "loading"
                      ? "opacity-75 cursor-wait"
                      : "hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_10px_30px_rgba(27,64,48,0.3)]"
                }
              `}
              style={{
                background:
                  status === "success"
                    ? "#40916c"
                    : "linear-gradient(135deg, #2d6a4e 0%, #1a4030 100%)",
                boxShadow:
                  status !== "success"
                    ? "0 4px 20px rgba(27,64,48,0.28)"
                    : "none",
              }}
            >
              {status === "loading" && (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {status === "success" && <IconCheck />}
              {status === "loading" ? (
                "Signing in…"
              ) : status === "success" ? (
                "Welcome back!"
              ) : (
                <>
                  <span>Sign In</span>
                  <IconArrow />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-7 border-t border-[#d4e8da] flex items-center justify-center gap-2 text-[13.5px] text-[#7a9487]">
            <IconShield />
            <span>
              Need access?{" "}
              <a
                href="#"
                className="font-semibold text-[#3a8f68] hover:text-[#1a4030] transition-colors duration-200"
              >
                Contact IT Support
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
