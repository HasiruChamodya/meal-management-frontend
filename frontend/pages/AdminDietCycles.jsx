import React, { useState, useEffect } from "react";
import { Plus, Edit2, X } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_DIET_CYCLES = [
  { id: "c1", code: "VEG", nameEn: "Vegetable", nameSi: "එළවළු", active: true },
  { id: "c2", code: "FSH", nameEn: "Fish", nameSi: "මාළු", active: true },
  { id: "c3", code: "EGG", nameEn: "Egg", nameSi: "බිත්තර", active: true },
  { id: "c4", code: "SOY", nameEn: "Soya", nameSi: "සෝයා", active: true },
  { id: "c5", code: "DHL", nameEn: "Dhal", nameSi: "පරිප්පු", active: false },
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const AdminDietCycles = () => {
  const { toast, toasts } = useToast();
  const [cycles, setCycles] = useState([...MOCK_DIET_CYCLES]);
  
  // Notice the TS syntax is removed here, just standard JS state
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const save = () => {
    if (!edit || !edit.code.trim() || !edit.nameEn.trim()) {
      toast({ title: "Validation Error", description: "Code and English Name are required." });
      return;
    }

    if (isNew) { 
      setCycles((p) => [...p, edit]); 
      toast({ title: "Diet Cycle Added", description: `${edit.nameEn} has been added successfully.` }); 
    } else { 
      setCycles((p) => p.map((c) => (c.id === edit.id ? edit : c))); 
      toast({ title: "Diet Cycle Updated", description: `${edit.nameEn} has been updated.` }); 
    }
    setEdit(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Diet Cycle Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the available dietary cycles for patients.</p>
        </div>
        <button 
          onClick={() => { 
            setIsNew(true); 
            setEdit({ id: String(Date.now()), code: "", nameEn: "", nameSi: "", active: true }); 
          }}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Cycle
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold w-24">Code</th>
                <th className="px-6 py-4 font-semibold">Name (EN)</th>
                <th className="px-6 py-4 font-semibold">Name (SI)</th>
                <th className="px-6 py-4 font-semibold w-32">Status</th>
                <th className="px-6 py-4 font-semibold w-16 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cycles.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-gray-900">{c.code}</td>
                  <td className="px-6 py-3 text-gray-700">{c.nameEn}</td>
                  <td className="px-6 py-3 text-gray-500">{c.nameSi}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.active 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button 
                      onClick={() => { setIsNew(false); setEdit(c); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none"
                      title="Edit Cycle"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {cycles.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No diet cycles found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={!!edit} onClose={() => setEdit(null)}>
        {/* Dialog Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {isNew ? "Add Diet Cycle" : "Edit Diet Cycle"}
          </h3>
          <button 
            onClick={() => setEdit(null)} 
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dialog Body */}
        {edit && (
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Cycle Code</label>
              <input 
                type="text" 
                placeholder="e.g. VEG"
                value={edit.code} 
                onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} 
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Name (English)</label>
              <input 
                type="text" 
                placeholder="e.g. Vegetable"
                value={edit.nameEn} 
                onChange={(e) => setEdit({ ...edit, nameEn: e.target.value })} 
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Name (Sinhala)</label>
              <input 
                type="text" 
                placeholder="e.g. එළවළු"
                value={edit.nameSi} 
                onChange={(e) => setEdit({ ...edit, nameSi: e.target.value })} 
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={edit.active}
                  onChange={(e) => setEdit({ ...edit, active: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Set as Active Cycle</span>
              </label>
            </div>
          </div>
        )}

        {/* Dialog Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={() => setEdit(null)}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={save}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Save Cycle
          </button>
        </div>
      </Dialog>

    </div>
  );
};

export default AdminDietCycles;