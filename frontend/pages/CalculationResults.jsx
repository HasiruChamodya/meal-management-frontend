import React, { useState } from "react";
import { Search, Plus, X } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const TAB_LABELS = {
  rice: "Rice & Staples",
  protein: "Protein",
  vegetables: "Vegetables",
  condiments: "Condiments",
  extras: "Extras & Specials",
};

const CALC_RESULTS = {
  rice: [
    { id: 1, nameEn: "Rice Nadu", nameSi: "හාල් - තැම්බු නාඩු", breakfast: 15, lunch: 20.5, dinner: 18, grandTotal: 53.5, unit: "Kg", breakdown: [{ dietType: "Normal Diet", count: 120, normG: 150, subtotalG: 18000 }, { dietType: "Diabetic Diet", count: 30, normG: 100, subtotalG: 3000 }] },
    { id: 2, nameEn: "Bread", nameSi: "පාන් 450G", breakfast: 45, lunch: null, dinner: 40, grandTotal: 85, unit: "Loaves", breakdown: [{ dietType: "Normal Diet", count: 90, normG: 225, subtotalG: 20250 }] },
  ],
  protein: [
    { id: 3, nameEn: "Chicken", nameSi: "කුකුල් මස්", breakfast: null, lunch: 18.5, dinner: null, grandTotal: 18.5, unit: "Kg", breakdown: [{ dietType: "Normal Diet", count: 150, normG: 100, subtotalG: 15000 }, { dietType: "Staff Meal", count: 35, normG: 100, subtotalG: 3500 }] },
    { id: 4, nameEn: "Eggs", nameSi: "බිත්තර", breakfast: 120, lunch: null, dinner: 30, grandTotal: 150, unit: "Pcs", breakdown: [{ dietType: "Normal Diet", count: 120, normG: 50, subtotalG: 6000 }] },
  ],
  condiments: [
    { id: 5, nameEn: "Salt", nameSi: "ලුණු", breakfast: 0.5, lunch: 1.2, dinner: 0.8, grandTotal: 2.5, unit: "Kg", breakdown: [{ dietType: "All", count: 250, normG: 10, subtotalG: 2500 }] },
  ],
  extras: [
    { id: 6, nameEn: "Milk Powder", nameSi: "කිරිපිටි", breakfast: 2.5, lunch: null, dinner: null, grandTotal: 2.5, unit: "Kg", breakdown: [{ dietType: "Liquid Diet", count: 15, normG: 50, subtotalG: 750 }] },
  ]
};

const VEG_CATEGORIES = [
  { 
    id: "v_palaa", name: "Palaa / Leaves", requiredKg: 12.5, 
    options: [{ nameEn: "Mukunuwenna", nameSi: "මුකුණුවැන්න" }, { nameEn: "Gotukola", nameSi: "ගොටුකොළ" }] 
  },
  { 
    id: "v_gedi", name: "Gedi / Vegetable Fruits", requiredKg: 28.0, 
    options: [{ nameEn: "Pumpkin", nameSi: "වට්ටක්කා" }, { nameEn: "Beans", nameSi: "බෝංචි" }, { nameEn: "Brinjal", nameSi: "වම්බටු" }] 
  },
  { 
    id: "v_piti", name: "Piti / Starchy", requiredKg: 15.0, 
    options: [{ nameEn: "Potato", nameSi: "අල" }, { nameEn: "Sweet Potato", nameSi: "බතල" }] 
  }
];

const MOCK_VEG_ALLOCATIONS = {
  v_palaa: [{ vegetable: "Mukunuwenna", quantityKg: 8.5 }],
  v_gedi: [{ vegetable: "Pumpkin", quantityKg: 20 }, { vegetable: "Beans", quantityKg: 8 }],
  v_piti: [],
};

// ─── Dialog Component ─────────────────────────────────────────────────────────

function Dialog({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const CalculationResults = () => {
  const [activeTab, setActiveTab] = useState("rice");
  const [breakdownItem, setBreakdownItem] = useState(null);
  const [vegAllocations, setVegAllocations] = useState(JSON.parse(JSON.stringify(MOCK_VEG_ALLOCATIONS)));

  const addVeg = (catId) => {
    setVegAllocations((prev) => ({
      ...prev,
      [catId]: [...(prev[catId] || []), { vegetable: "", quantityKg: 0 }],
    }));
  };

  const removeVeg = (catId, idx) => {
    setVegAllocations((prev) => ({
      ...prev,
      [catId]: prev[catId].filter((_, i) => i !== idx),
    }));
  };

  const updateVeg = (catId, idx, field, value) => {
    setVegAllocations((prev) => ({
      ...prev,
      [catId]: prev[catId].map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    }));
  };

  // Reusable custom select background styling
  const selectBg = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` };

  const renderTable = (items = []) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
          <tr>
            <th className="px-5 py-3 font-semibold w-12 text-center">#</th>
            <th className="px-5 py-3 font-semibold">Item (EN)</th>
            <th className="px-5 py-3 font-semibold hidden md:table-cell">Item (SI)</th>
            <th className="px-5 py-3 font-semibold text-right">Breakfast</th>
            <th className="px-5 py-3 font-semibold text-right">Lunch</th>
            <th className="px-5 py-3 font-semibold text-right">Dinner</th>
            <th className="px-5 py-3 font-bold text-gray-900 text-right">Grand Total</th>
            <th className="px-5 py-3 font-semibold w-16 text-center">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3.5 text-gray-400 text-center">{idx + 1}</td>
              <td className="px-5 py-3.5 font-bold text-gray-900">{item.nameEn}</td>
              <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{item.nameSi}</td>
              <td className="px-5 py-3.5 text-right text-gray-600">{item.breakfast != null ? `${item.breakfast} ${item.unit}` : "—"}</td>
              <td className="px-5 py-3.5 text-right text-gray-600">{item.lunch != null ? `${item.lunch} ${item.unit}` : "—"}</td>
              <td className="px-5 py-3.5 text-right text-gray-600">{item.dinner != null ? `${item.dinner} ${item.unit}` : "—"}</td>
              <td className="px-5 py-3.5 text-right font-black text-blue-700 bg-blue-50/30">{item.grandTotal} {item.unit}</td>
              <td className="px-5 py-3.5 text-center">
                <button 
                  onClick={() => setBreakdownItem(item)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none"
                  title="View Calculation Breakdown"
                >
                  <Search className="h-4 w-4 mx-auto" />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="8" className="px-5 py-12 text-center text-gray-500">No data available for this category.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderVegetables = () => (
    <div className="space-y-6 p-4 md:p-6">
      {VEG_CATEGORIES.map((cat) => {
        const allocs = vegAllocations[cat.id] || [];
        const allocated = allocs.reduce((s, a) => s + (Number(a.quantityKg) || 0), 0);
        const pct = Math.min((allocated / cat.requiredKg) * 100, 100);
        
        let progressColor = "bg-blue-500";
        let textColor = "text-blue-700";
        if (allocated > cat.requiredKg) {
          progressColor = "bg-red-500";
          textColor = "text-red-700";
        } else if (pct >= 80 && pct <= 100) {
          progressColor = "bg-amber-500";
          textColor = "text-amber-700";
        } else if (pct === 100) {
          progressColor = "bg-green-500";
          textColor = "text-green-700";
        }

        return (
          <div key={cat.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-gray-900">{cat.name}</h3>
              <span className={`text-sm font-bold ${textColor}`}>
                Allocated: {allocated.toFixed(2)} / {cat.requiredKg} Kg
              </span>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Custom Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ease-out ${progressColor}`} 
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
              
              {/* Allocation Rows */}
              <div className="space-y-3">
                {allocs.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <select 
                      value={a.vegetable} 
                      onChange={(e) => updateVeg(cat.id, idx, "vegetable", e.target.value)}
                      className="flex-1 h-11 px-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900 appearance-none cursor-pointer"
                      style={selectBg}
                    >
                      <option value="" disabled>Select vegetable...</option>
                      {cat.options.map((o) => (
                        <option key={o.nameEn} value={o.nameEn}>{o.nameSi} / {o.nameEn}</option>
                      ))}
                    </select>
                    
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={a.quantityKg || ""}
                        onChange={(e) => updateVeg(cat.id, idx, "quantityKg", parseFloat(e.target.value) || 0)}
                        className="w-28 h-11 px-3 pr-8 text-right bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">Kg</span>
                    </div>
                    
                    <button 
                      onClick={() => removeVeg(cat.id, idx)} 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                      title="Remove row"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => addVeg(cat.id)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <Plus className="h-4 w-4 mr-2 text-gray-500" /> Add Vegetable
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Calculation Results</h1>
          <p className="text-sm text-gray-500 mt-1">Generated provisions for 2026-03-02 based on ward census.</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
          Calculated
        </span>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Tab List */}
        <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50 hide-scrollbar">
          {Object.entries(TAB_LABELS).map(([key, label]) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`whitespace-nowrap px-6 py-4 text-sm font-bold transition-all focus:outline-none border-b-2 ${
                  isActive 
                    ? "border-blue-600 text-blue-700 bg-white" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "vegetables" ? renderVegetables() : renderTable(CALC_RESULTS[activeTab])}
        </div>
      </div>

      {/* Breakdown Details Dialog */}
      <Dialog open={!!breakdownItem} onClose={() => setBreakdownItem(null)}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">
            {breakdownItem?.nameEn} <span className="text-gray-500 text-sm font-medium ml-2">— Math Breakdown</span>
          </h3>
          <button onClick={() => setBreakdownItem(null)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-0 overflow-y-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-200 text-gray-500 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-semibold">Diet Type</th>
                <th className="px-6 py-3 font-semibold text-right">Patient Count</th>
                <th className="px-6 py-3 font-semibold text-right">Norm (g)</th>
                <th className="px-6 py-3 font-semibold text-right">Subtotal (g)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(breakdownItem?.breakdown || []).map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-800">{r.dietType}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{r.count}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{r.normG}</td>
                  <td className="px-6 py-3 text-right font-bold text-gray-900">{r.subtotalG.toLocaleString()}</td>
                </tr>
              ))}
              {(!breakdownItem?.breakdown || breakdownItem.breakdown.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No detailed breakdown available for this item.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-blue-50 border-t border-blue-100 text-center font-bold text-blue-800 shrink-0">
          Total = {(breakdownItem?.breakdown || []).reduce((s, r) => s + r.subtotalG, 0).toLocaleString()} g 
          <span className="mx-2 text-blue-300">|</span> 
          <span className="text-xl">{(breakdownItem?.grandTotal || 0)} {breakdownItem?.unit}</span>
        </div>
      </Dialog>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CalculationResults;