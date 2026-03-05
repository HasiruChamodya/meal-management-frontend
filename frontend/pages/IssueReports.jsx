import React, { useState, useEffect } from "react";
import { X, Eye } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_ISSUE_REPORTS = [
  {
    id: "rep-001",
    date: "2026-03-05",
    orderNo: "PO-000369",
    qtyIssues: 2,
    qualityIssues: 1,
    status: "open",
    items: [
      { name: "Bread (loaves)", issue: "SHORTAGE", details: "2 loaves missing from the delivery." },
      { name: "Milk", issue: "SPOILED", details: "5 cartons arrived bloated and were rejected." },
      { name: "Chicken", issue: "POOR QUALITY", details: "Thawed slightly during transit, recorded for monitoring." }
    ]
  },
  {
    id: "rep-002",
    date: "2026-03-04",
    orderNo: "PO-000368",
    qtyIssues: 1,
    qualityIssues: 0,
    status: "resolved",
    items: [
      { name: "Carrot", issue: "EXCESS", details: "Supplier sent an extra 1.5 Kg. Adjusted in inventory." }
    ]
  },
  {
    id: "rep-003",
    date: "2026-03-02",
    orderNo: "PO-000365",
    qtyIssues: 0,
    qualityIssues: 3,
    status: "escalated",
    items: [
      { name: "Dhal", issue: "CONTAMINATED", details: "Found moisture in the bottom of the sack. Entire batch quarantined." },
      { name: "Red Onion", issue: "ROTTEN", details: "Approximately 15% of the sack is unusable." }
    ]
  }
];

const STATUS_STYLE = {
  open: "bg-amber-100 text-amber-800 border-amber-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  escalated: "bg-red-100 text-red-800 border-red-200",
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]"
      >
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const IssueReports = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-24">
      
      {/* Header Banner */}
      <div className="bg-blue-700 rounded-2xl p-6 md:p-8 text-center shadow-lg border-b-4 border-blue-900">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm uppercase">
          Issue Reports
        </h1>
        <p className="text-blue-100 font-medium mt-2">
          Track and resolve delivery discrepancies and quality concerns.
        </p>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">Qty Issues</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">Quality Issues</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_ISSUE_REPORTS.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/70 transition-colors group">
                  <td className="px-6 py-4 text-base text-gray-600 font-medium">
                    {r.date}
                  </td>
                  <td className="px-6 py-4 text-base font-bold text-gray-900">
                    {r.orderNo}
                  </td>
                  <td className="px-6 py-4 text-center text-lg font-black text-gray-700">
                    {r.qtyIssues > 0 ? <span className="text-red-600">{r.qtyIssues}</span> : "0"}
                  </td>
                  <td className="px-6 py-4 text-center text-lg font-black text-gray-700">
                    {r.qualityIssues > 0 ? <span className="text-amber-500">{r.qualityIssues}</span> : "0"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${STATUS_STYLE[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelected(r)}
                      className="inline-flex items-center px-4 py-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4 mr-2" /> View
                    </button>
                  </td>
                </tr>
              ))}

              {MOCK_ISSUE_REPORTS.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                    No issue reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-xl font-black text-gray-900">
                Issue Report <span className="text-gray-400 font-medium mx-2">|</span> {selected.orderNo}
              </h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar bg-gray-50/30">
              {selected.items.map((it, i) => (
                <div key={i} className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg text-gray-900">{it.name}</p>
                    <span className="inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-widest rounded shadow-sm">
                      {it.issue}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {it.details}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0 rounded-b-2xl">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${STATUS_STYLE[selected.status]}`}>
                Status: {selected.status}
              </span>
              <button 
                onClick={() => setSelected(null)}
                className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Dialog>

      {/* Scrollbar styling for the modal */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #d1d5db; }
      `}</style>
    </div>
  );
};

export default IssueReports;