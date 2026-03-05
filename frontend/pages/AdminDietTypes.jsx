import React, { useState, useEffect } from "react";
import { Plus, Edit2, X } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_DIET_TYPES = [
  { id: "t1", code: "ND", nameEn: "Normal Diet", nameSi: "සාමාන්‍ය", ageRange: "All", type: "Patient", displayOrder: 1, active: true },
  { id: "t2", code: "DD", nameEn: "Diabetic Diet", nameSi: "දියවැඩියා", ageRange: "Adult", type: "Patient", displayOrder: 2, active: true },
  { id: "t3", code: "LD", nameEn: "Liquid Diet", nameSi: "දියර", ageRange: "All", type: "Patient", displayOrder: 3, active: true },
  { id: "t4", code: "SM", nameEn: "Staff Meal", nameSi: "කාර්ය මණ්ඩල", ageRange: "Adult", type: "Staff", displayOrder: 4, active: true },
  { id: "t5", code: "RD", nameEn: "Renal Diet", nameSi: "වකුගඩු", ageRange: "Adult", type: "Patient", displayOrder: 5, active: false },
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

const AdminDietTypes = () => {
  const { toast, toasts } = useToast();
  const [types, setTypes] = useState([...MOCK_DIET_TYPES]);
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => { 
    setIsNew(true); 
    setEdit({ 
      id: String(Date.now()), 
      code: "", 
      nameEn: "", 
      nameSi: "", 
      ageRange: "All", 
      type: "Patient", 
      displayOrder: types.length + 1, 
      active: true 
    }); 
  };

  const save = () => {
    if (!edit || !edit.code.trim() || !edit.nameEn.trim()) {
      toast({ title: "Validation Error", description: "Code and English Name are required." });
      return;
    }

    if (isNew) { 
      setTypes((p) => [...p, edit]); 
      toast({ title: "Diet Type Added", description: `${edit.nameEn} successfully added.` }); 
    } else { 
      setTypes((p) => p.map((t) => (t.id === edit.id ? edit : t))); 
      toast({ title: "Diet Type Updated", description: `${edit.nameEn} successfully updated.` }); 
    }
    setEdit(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Diet Type Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure and organize the baseline diet types available in the hospital.</p>
        </div>
        <button 
          onClick={openNew}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Diet Type
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold w-20">Code</th>
                <th className="px-6 py-4 font-semibold">Name (EN)</th>
                <th className="px-6 py-4 font-semibold">Name (SI)</th>
                <th className="px-6 py-4 font-semibold">Age Range</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold text-center w-20">Order</th>
                <th className="px-6 py-4 font-semibold w-28">Status</th>
                <th className="px-6 py-4 font-semibold w-16 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {types.sort((a, b) => a.displayOrder - b.displayOrder).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 font-bold text-gray-900">{t.code}</td>
                  <td className="px-6 py-3 text-gray-800 font-medium">{t.nameEn}</td>
                  <td className="px-6 py-3 text-gray-500">{t.nameSi}</td>
                  <td className="px-6 py-3 text-gray-600">{t.ageRange}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-semibold tracking-wide uppercase">
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center font-medium text-gray-600">{t.displayOrder}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      t.active 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                      {t.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button 
                      onClick={() => { setIsNew(false); setEdit(t); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none"
                      title="Edit Diet Type"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {types.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No diet types found. Add one to get started.
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
            {isNew ? "Add Diet Type" : "Edit Diet Type"}
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
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. ND"
                  value={edit.code} 
                  onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Type</label>
                <select 
                  value={edit.type} 
                  onChange={(e) => setEdit({ ...edit, type: e.target.value })} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                >
                  <option value="Patient">Patient</option>
                  <option value="Staff">Staff</option>
                  <option value="Special">Special</option>
                </select>
              </div>
              
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Name (English)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Normal Diet"
                  value={edit.nameEn} 
                  onChange={(e) => setEdit({ ...edit, nameEn: e.target.value })} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Name (Sinhala)</label>
                <input 
                  type="text" 
                  placeholder="e.g. සාමාන්‍ය"
                  value={edit.nameSi} 
                  onChange={(e) => setEdit({ ...edit, nameSi: e.target.value })} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Age Range</label>
                <input 
                  type="text" 
                  placeholder="e.g. All, Adult, Child"
                  value={edit.ageRange} 
                  onChange={(e) => setEdit({ ...edit, ageRange: e.target.value })} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Display Order</label>
                <input 
                  type="number" 
                  min={1}
                  value={edit.displayOrder} 
                  onChange={(e) => setEdit({ ...edit, displayOrder: parseInt(e.target.value) || 1 })} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>

            </div>

            <div className="pt-3 flex items-center gap-3 border-t border-gray-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={edit.active}
                  onChange={(e) => setEdit({ ...edit, active: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Active Diet Type</span>
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
            Save Diet Type
          </button>
        </div>
      </Dialog>

    </div>
  );
};

export default AdminDietTypes;