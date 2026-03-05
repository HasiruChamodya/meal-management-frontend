import React, { useState } from "react";
import { CalendarDays, Leaf, Drumstick, Save, X } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const DIET_CYCLES = [
  { id: "c1", nameSi: "එළවළු", nameEn: "Vegetable" },
  { id: "c2", nameSi: "මාළු", nameEn: "Fish" },
  { id: "c3", nameSi: "බිත්තර", nameEn: "Egg" },
  { id: "c4", nameSi: "සෝයා", nameEn: "Soya" },
  { id: "c5", nameSi: "පරිප්පු", nameEn: "Dhal" },
];

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

// ─── Main Component ──────────────────────────────────────────────────────────

const AdminDailyCycle = () => {
  const { toast, toasts } = useToast();
  
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [patientCycle, setPatientCycle] = useState("Vegetable");
  const [staffCycle, setStaffCycle] = useState("Chicken");
  const [saved, setSaved] = useState(true);

  const handleSave = () => {
    setSaved(true);
    toast({ 
      title: "Cycle Selection Saved", 
      description: `Diet cycles set for ${new Date(date).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" })}` 
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Meal Cycle</h1>
        <p className="text-sm text-gray-500 mt-1">Set the hospital-wide diet cycle for patients and staff.</p>
      </div>

      {/* Current active cycles */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-blue-800 mb-3">Today's Active Cycles</p>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
            <Leaf className="h-4 w-4" /> Patient: {patientCycle}
          </span>
          <span className="inline-flex items-center gap-2 bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
            <Drumstick className="h-4 w-4" /> Staff: {staffCycle}
          </span>
        </div>
      </div>

      {/* Cycle selection form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Set Diet Cycles</h2>
        </div>
        
        <div className="p-6 space-y-6">
          
          {/* Date Picker */}
          <div className="space-y-2 max-w-xs">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" /> Target Date
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => { 
                setDate(e.target.value); 
                setSaved(false); 
              }} 
              className="w-full px-4 py-2.5 h-12 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Patient Diet Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" /> Patient Diet Cycle
              </label>
              <select 
                value={patientCycle} 
                onChange={(e) => { 
                  setPatientCycle(e.target.value); 
                  setSaved(false); 
                }}
                className="w-full px-4 py-2.5 h-12 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
              >
                {DIET_CYCLES.map((c) => (
                  <option key={c.id} value={c.nameEn}>{c.nameSi} / {c.nameEn}</option>
                ))}
                <option value="Chicken">කුකුල් මස් / Chicken</option>
              </select>
            </div>

            {/* Staff Diet Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Drumstick className="h-4 w-4 text-orange-600" /> Staff Diet Cycle
              </label>
              <select 
                value={staffCycle} 
                onChange={(e) => { 
                  setStaffCycle(e.target.value); 
                  setSaved(false); 
                }}
                className="w-full px-4 py-2.5 h-12 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
              >
                {DIET_CYCLES.map((c) => (
                  <option key={c.id} value={c.nameEn}>{c.nameSi} / {c.nameEn}</option>
                ))}
                <option value="Chicken">කුකුල් මස් / Chicken</option>
              </select>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex justify-end pt-6 mt-4 border-t border-gray-100">
            <button 
              onClick={handleSave} 
              disabled={saved} 
              className="inline-flex items-center justify-center px-8 py-3 h-12 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="h-5 w-5 mr-2" /> 
              {saved ? "Saved" : "Save Cycle Selection"}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdminDailyCycle;