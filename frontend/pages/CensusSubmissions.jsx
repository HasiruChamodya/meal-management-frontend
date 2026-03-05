import React, { useState, useMemo, useEffect } from "react";
import { CalendarDays, X } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const today = new Date().toISOString().split("T")[0];

const DIET_FIELDS = [
  { key: "normal", label: "Normal Diet" },
  { key: "diabetic", label: "Diabetic Diet" },
  { key: "cardiac", label: "Cardiac Diet" },
  { key: "renal", label: "Renal Diet" },
  { key: "liquid", label: "Liquid Diet" },
];

const EXTRA_ITEMS = [
  { name: "Milk", unit: "L" },
  { name: "Eggs", unit: "Pcs" },
  { name: "Biscuits", unit: "g" },
  { name: "Bananas", unit: "Fruit" },
];

const MOCK_SUBMISSIONS = [
  {
    id: "sub-001",
    wardName: "Medical Ward 01",
    date: today,
    totalPatients: 42,
    staff: { breakfast: 4, lunch: 5, dinner: 3 },
    status: "submitted",
    submittedAt: `${today}T08:15:00Z`,
    diets: { normal: 20, diabetic: 12, cardiac: 5, renal: 2, liquid: 3 },
    extras: { Milk: 2, Eggs: 10, Biscuits: 0, Bananas: 5 },
  },
  {
    id: "sub-002",
    wardName: "Surgical Ward 01",
    date: today,
    totalPatients: 35,
    staff: { breakfast: 3, lunch: 4, dinner: 2 },
    status: "draft",
    submittedAt: null,
    diets: { normal: 25, diabetic: 5, cardiac: 0, renal: 0, liquid: 5 },
    extras: { Milk: 1, Eggs: 0, Biscuits: 200, Bananas: 0 },
  },
  {
    id: "sub-003",
    wardName: "Pediatric Ward 01",
    date: today,
    totalPatients: 18,
    staff: { breakfast: 4, lunch: 4, dinner: 4 },
    status: "locked",
    submittedAt: `${today}T07:45:00Z`,
    diets: { normal: 18, diabetic: 0, cardiac: 0, renal: 0, liquid: 0 },
    extras: { Milk: 5, Eggs: 18, Biscuits: 500, Bananas: 18 },
  }
];

const statusConfig = {
  not_started: { label: "Not Started", className: "bg-gray-100 text-gray-500 border-gray-200" },
  draft: { label: "Draft", className: "bg-amber-100 text-amber-700 border-amber-200" },
  submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700 border-blue-200" },
  locked: { label: "Locked", className: "bg-red-100 text-red-700 border-red-200" },
};

// ─── Dialog Component ─────────────────────────────────────────────────────────

function Dialog({ open, onClose, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const CensusSubmissions = () => {
  const [filterDate, setFilterDate] = useState(today);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const submissions = useMemo(
    () => MOCK_SUBMISSIONS.filter((s) => s.date === filterDate),
    [filterDate],
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">Review your ward census submissions history.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-1.5">
          <label className="text-sm font-semibold text-gray-700 shrink-0">Filter Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-9 px-2 bg-transparent text-sm font-medium text-gray-900 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Ward</th>
                <th className="px-5 py-3 font-semibold text-center w-32">Total Patients</th>
                <th className="px-5 py-3 font-semibold text-center hidden sm:table-cell w-40">Staff (B/L/D)</th>
                <th className="px-5 py-3 font-semibold text-center w-32">Status</th>
                <th className="px-5 py-3 font-semibold text-right hidden sm:table-cell w-40">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    <CalendarDays className="h-8 w-8 mx-auto text-gray-300 mb-3" />
                    <p>No submissions found for this date.</p>
                  </td>
                </tr>
              )}
              {submissions.map((entry) => (
                <tr
                  key={entry.id}
                  className="cursor-pointer hover:bg-blue-50/50 transition-colors group"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <td className="px-5 py-4 font-bold text-gray-900">{entry.wardName}</td>
                  <td className="px-5 py-4 text-center font-medium text-gray-700">{entry.totalPatients}</td>
                  <td className="px-5 py-4 text-center text-gray-600 hidden sm:table-cell">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {entry.staff.breakfast} / {entry.staff.lunch} / {entry.staff.dinner}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusConfig[entry.status].className}`}>
                      {statusConfig[entry.status].label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-gray-500 hidden sm:table-cell font-mono text-xs">
                    {entry.submittedAt
                      ? new Date(entry.submittedAt).toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail View Dialog */}
      <Dialog open={!!selectedEntry} onClose={() => setSelectedEntry(null)}>
        {selectedEntry && (
          <>
            {/* Dialog Header */}
            <div className="flex justify-between items-start px-6 py-5 border-b border-gray-100 bg-gray-50 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  {selectedEntry.wardName}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig[selectedEntry.status].className}`}>
                    {statusConfig[selectedEntry.status].label}
                  </span>
                </h3>
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mt-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(selectedEntry.date).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
                  {selectedEntry.submittedAt && ` • ${new Date(selectedEntry.submittedAt).toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Dialog Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              
              {/* Patient Diets */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b pb-2">Patient Diets</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {DIET_FIELDS.map((f) => (
                    <div key={f.key} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600 font-medium">{f.label}</span>
                      <span className="font-bold text-gray-900">{selectedEntry.diets[f.key] || 0}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3 mt-3 border-t border-gray-200 text-sm font-bold">
                  <span className="uppercase text-gray-700">Total Patients</span>
                  <span className="text-blue-700 text-lg">{selectedEntry.totalPatients}</span>
                </div>
              </div>

              {/* Staff Meals */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b pb-2">Staff Meals</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {["breakfast", "lunch", "dinner"].map((m) => (
                    <div key={m} className="bg-gray-50 border border-gray-100 rounded-lg py-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{m}</p>
                      <p className="text-lg font-black text-gray-900">{selectedEntry.staff[m]}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Items */}
              {Object.entries(selectedEntry.extras).some(([, v]) => v > 0) && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b pb-2">Extra Items</h4>
                  <div className="space-y-2 bg-gray-50 rounded-lg border border-gray-100 p-4">
                    {Object.entries(selectedEntry.extras)
                      .filter(([, v]) => v > 0)
                      .map(([name, qty]) => {
                        const item = EXTRA_ITEMS.find((e) => e.name === name);
                        return (
                          <div key={name} className="flex justify-between text-sm items-center">
                            <span className="font-medium text-gray-700">{name}</span>
                            <span className="font-bold text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm">
                              {qty} {item?.unit || ""}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
              
            </div>
            
            {/* Dialog Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0 rounded-b-xl">
              <button 
                onClick={() => setSelectedEntry(null)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Dialog>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #d1d5db; }
      `}</style>
    </div>
  );
};

export default CensusSubmissions;