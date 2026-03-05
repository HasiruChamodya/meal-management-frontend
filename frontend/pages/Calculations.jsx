import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, Square, Calculator, Loader2, Leaf, Drumstick } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_WARD_STATUSES = [
  { wardId: "w1", wardName: "Medical Ward 01", code: "MW-01", status: "submitted", patientCount: 42 },
  { wardId: "w2", wardName: "Surgical Ward 01", code: "SW-01", status: "submitted", patientCount: 35 },
  { wardId: "w3", wardName: "Pediatric Ward 01", code: "PW-01", status: "draft", patientCount: 18 },
  { wardId: "w4", wardName: "Maternity Ward 01", code: "MAT-01", status: "pending", patientCount: 0 },
  { wardId: "w5", wardName: "Intensive Care Unit", code: "ICU-01", status: "submitted", patientCount: 8 },
];

const MOCK_AGGREGATED = {
  normal: 85,
  diabetic: 12,
  s1: 3,
  s2: 1,
  s3: 0,
  s4: 0,
  s5: 2,
  hpd: 0,
  staffB: 24,
  staffL: 30,
  staffD: 18,
  totalPatients: 103,
  totalStaff: 72,
};

// ─── Simple Inline Toast Hook & Component ────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = ({ title, description }) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, title, description }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  return { toast, toasts };
}

function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className="bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div className="font-semibold text-sm">{t.title}</div>
          {t.description && <div className="text-gray-300 text-xs mt-1">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const Calculations = () => {
  const navigate = useNavigate();
  const { toast, toasts } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);

  const submitted = MOCK_WARD_STATUSES.filter((w) => w.status === "submitted").length;
  const total = MOCK_WARD_STATUSES.length;
  const allSubmitted = submitted === total;
  const pct = Math.round((submitted / total) * 100);
  const agg = MOCK_AGGREGATED;

  const handleRunCalc = () => {
    setIsCalculating(true);
    setTimeout(() => {
      toast({ title: "Calculation Complete", description: "Ingredient requirements have been successfully calculated." });
      // Short delay before navigating to let the user see the toast
      setTimeout(() => navigate("/calculations/results"), 1500);
    }, 1500);
  };

  const statusIcon = (status) => {
    if (status === "submitted") return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === "draft") return <Clock className="h-5 w-5 text-amber-500" />;
    return <Square className="h-5 w-5 text-gray-300" />;
  };

  const statCards = [
    { label: "Normal", value: agg.normal },
    { label: "Diabetic", value: agg.diabetic },
    { label: "S1", value: agg.s1 },
    { label: "S2", value: agg.s2 },
    { label: "S3", value: agg.s3 },
    { label: "S4", value: agg.s4 },
    { label: "S5", value: agg.s5 },
    { label: "HPD", value: agg.hpd },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ward Submissions & Calculation</h1>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
          <span>2026-03-02</span>
        </div>
      </div>

      {/* Read-only cycle badges */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Patient Cycle:</span>
          <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            <Leaf className="h-3.5 w-3.5" /> Vegetable
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Staff Cycle:</span>
          <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            <Drumstick className="h-3.5 w-3.5" /> Chicken
          </span>
        </div>
        <p className="text-xs text-gray-400 italic ml-auto">Set by Hospital Admin</p>
      </div>

      {/* Submission progress */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-700">Submission Progress</h2>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>{submitted} / {total} wards submitted</span>
            <span className="font-bold text-blue-600">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ward grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {MOCK_WARD_STATUSES.map((w) => {
          let cardClasses = "border-gray-200 bg-white";
          if (w.status === "submitted") cardClasses = "border-green-200 bg-green-50/30";
          if (w.status === "draft") cardClasses = "border-amber-200 bg-amber-50/30";
          
          return (
            <div key={w.wardId} className={`border rounded-xl shadow-sm p-4 transition-colors ${cardClasses}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-bold text-gray-900 truncate" title={w.wardName}>
                    {w.wardName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{w.code}</p>
                </div>
                <div className="shrink-0 mt-0.5">
                  {statusIcon(w.status)}
                </div>
              </div>
              {w.status === "submitted" && (
                <p className="text-xs font-semibold text-green-700 mt-2 bg-green-100 px-2 py-1 rounded w-fit">
                  {w.patientCount} patients
                </p>
              )}
              {w.status === "draft" && (
                <p className="text-xs font-semibold text-amber-700 mt-2 bg-amber-100 px-2 py-1 rounded w-fit">
                  Draft saved
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Aggregated totals */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-700">Aggregated Totals</h2>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {statCards.map((s) => (
              <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Staff B</p>
              <p className="text-lg font-bold text-gray-900">{agg.staffB}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Staff L</p>
              <p className="text-lg font-bold text-gray-900">{agg.staffL}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Staff D</p>
              <p className="text-lg font-bold text-gray-900">{agg.staffD}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center sm:col-span-1 col-span-3">
              <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1">Total Patients</p>
              <p className="text-xl font-black text-blue-800">{agg.totalPatients}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center sm:col-span-1 col-span-3">
              <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1">Total Staff</p>
              <p className="text-xl font-black text-indigo-800">{agg.totalStaff}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Run Calculation Action */}
      <div className="flex justify-center pt-4 pb-12 relative group">
        <span className="inline-block" tabIndex={0}>
          <button
            className={`inline-flex items-center justify-center h-14 px-10 text-base font-bold text-white rounded-xl shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 ${
              !allSubmitted || isCalculating 
                ? "bg-gray-400 cursor-not-allowed opacity-80" 
                : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-xl"
            }`}
            disabled={!allSubmitted || isCalculating}
            onClick={handleRunCalc}
          >
            {isCalculating ? (
              <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Calculating Requirements...</>
            ) : (
              <><Calculator className="mr-3 h-6 w-6" /> Run Master Calculation</>
            )}
          </button>
        </span>
        
        {/* Simple CSS Tooltip for disabled state */}
        {!allSubmitted && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div className="bg-gray-900 text-white text-xs font-medium py-2 px-3 rounded shadow-lg whitespace-nowrap">
              All wards must be submitted before running calculation
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Calculations;