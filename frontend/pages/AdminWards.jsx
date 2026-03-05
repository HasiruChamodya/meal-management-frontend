import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, RotateCcw } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_WARDS = [
  { id: "w1", code: "MW-01", name: "Medical Ward 01", beds: 40, cots: 0, icu: 0 },
  { id: "w2", code: "SW-01", name: "Surgical Ward 01", beds: 35, cots: 0, icu: 0 },
  { id: "w3", code: "PW-01", name: "Pediatric Ward 01", beds: 20, cots: 15, icu: 0 },
  { id: "w4", code: "MAT-01", name: "Maternity Ward 01", beds: 30, cots: 30, icu: 0 },
  { id: "w5", code: "ICU-01", name: "Intensive Care Unit", beds: 0, cots: 0, icu: 10 },
];

// ─── Simple Inline Toast Hook & Component ────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = ({ title, description }) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, title, description }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
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
          className="bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto flex justify-between items-start gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div>
            <h4 className="font-bold text-sm">{t.title}</h4>
            {t.description && <p className="text-gray-300 text-xs mt-1">{t.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const AdminWards = () => {
  const { toast, toasts } = useToast();
  
  // Initialize mock wards with active status
  const [wards, setWards] = useState(MOCK_WARDS.map((w) => ({ ...w, active: true })));
  const [editWard, setEditWard] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => {
    setIsNew(true);
    setEditWard({ id: "", code: "", name: "", beds: 0, cots: 0, icu: 0, active: true });
  };

  const save = () => {
    if (!editWard || !editWard.code.trim() || !editWard.name.trim()) {
      toast({ title: "Validation Error", description: "Ward Code and Name are required." });
      return;
    }

    if (isNew) {
      setWards((p) => [...p, { ...editWard, id: editWard.code }]);
      toast({ title: "Ward Added", description: `${editWard.name} has been successfully created.` });
    } else {
      setWards((p) => p.map((w) => (w.id === editWard.id ? editWard : w)));
      toast({ title: "Ward Updated", description: `${editWard.name} has been successfully updated.` });
    }
    setEditWard(null);
  };

  const toggleActive = (id, currentStatus) => {
    setWards((p) => p.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));
    toast({ 
      title: currentStatus ? "Ward Deactivated" : "Ward Activated", 
      description: `The ward status has been updated.` 
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ward Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure hospital wards and their patient capacities.</p>
        </div>
        <button 
          onClick={openNew}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Ward
        </button>
      </div>

      {/* Data Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold w-28">Code</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold text-right w-20">Beds</th>
                <th className="px-6 py-4 font-semibold text-right w-20">Cots</th>
                <th className="px-6 py-4 font-semibold text-right w-20">ICU</th>
                <th className="px-6 py-4 font-semibold text-right w-24 text-gray-900">Total</th>
                <th className="px-6 py-4 font-semibold w-28">Status</th>
                <th className="px-6 py-4 font-semibold w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {wards.map((w) => {
                const total = (w.beds || 0) + (w.cots || 0) + (w.icu || 0);
                
                return (
                  <tr key={w.id} className={`hover:bg-gray-50/50 transition-colors ${!w.active ? "bg-gray-50/30" : ""}`}>
                    <td className={`px-6 py-3 font-bold ${w.active ? "text-gray-900" : "text-gray-400"}`}>{w.code}</td>
                    <td className={`px-6 py-3 font-medium ${w.active ? "text-gray-800" : "text-gray-400"}`}>{w.name}</td>
                    <td className={`px-6 py-3 text-right ${w.active ? "text-gray-600" : "text-gray-400"}`}>{w.beds}</td>
                    <td className={`px-6 py-3 text-right ${w.active ? "text-gray-600" : "text-gray-400"}`}>{w.cots}</td>
                    <td className={`px-6 py-3 text-right ${w.active ? "text-gray-600" : "text-gray-400"}`}>{w.icu}</td>
                    <td className={`px-6 py-3 text-right font-bold ${w.active ? "text-blue-700" : "text-gray-400"}`}>{total}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        w.active 
                          ? "bg-green-100 text-green-700 border border-green-200" 
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}>
                        {w.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setIsNew(false); setEditWard(w); }}
                          className={`p-2 rounded-md transition-colors focus:outline-none ${
                            w.active ? "text-gray-400 hover:text-blue-600 hover:bg-blue-50" : "text-gray-300 hover:text-gray-500"
                          }`}
                          title="Edit Ward"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => toggleActive(w.id, w.active)}
                          className={`p-2 rounded-md transition-colors focus:outline-none ${
                            w.active 
                              ? "text-gray-400 hover:text-red-600 hover:bg-red-50" 
                              : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                          }`}
                          title={w.active ? "Deactivate Ward" : "Reactivate Ward"}
                        >
                          {w.active ? <Trash2 className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {wards.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No wards found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={!!editWard} onClose={() => setEditWard(null)}>
        {/* Dialog Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {isNew ? "Add Ward" : "Edit Ward"}
          </h3>
          <button 
            onClick={() => setEditWard(null)} 
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dialog Body */}
        {editWard && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Ward Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. MW-01"
                  value={editWard.code} 
                  onChange={(e) => setEditWard({ ...editWard, code: e.target.value.toUpperCase() })} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Ward Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Medical Ward 01"
                  value={editWard.name} 
                  onChange={(e) => setEditWard({ ...editWard, name: e.target.value })} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Beds</label>
                <input 
                  type="number" 
                  min={0}
                  value={editWard.beds} 
                  onChange={(e) => setEditWard({ ...editWard, beds: parseInt(e.target.value) || 0 })} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Cots</label>
                <input 
                  type="number" 
                  min={0}
                  value={editWard.cots} 
                  onChange={(e) => setEditWard({ ...editWard, cots: parseInt(e.target.value) || 0 })} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">ICU Beds</label>
                <input 
                  type="number" 
                  min={0}
                  value={editWard.icu} 
                  onChange={(e) => setEditWard({ ...editWard, icu: parseInt(e.target.value) || 0 })} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-medium flex justify-between items-center mt-2 border border-blue-100">
              <span>Total Capacity:</span>
              <span className="text-lg font-bold">{(editWard.beds || 0) + (editWard.cots || 0) + (editWard.icu || 0)}</span>
            </div>
          </div>
        )}

        {/* Dialog Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={() => setEditWard(null)}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={save}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {isNew ? "Add Ward" : "Save Changes"}
          </button>
        </div>
      </Dialog>

    </div>
  );
};

export default AdminWards;