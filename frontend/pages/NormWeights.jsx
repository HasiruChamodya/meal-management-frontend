import React, { useState } from "react";
import { Save, Upload, Download } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const DIET_COLS = ["normal", "diabetic", "hpd", "s1", "s2", "s3", "s4", "s5", "staff"];
const DIET_LABELS = { 
  normal: "Normal", diabetic: "Diabetic", hpd: "HPD", 
  s1: "S1 (6-12y)", s2: "S2 (2-6y)", s3: "S3 (1-2y)", 
  s4: "S4 (6m-1y)", s5: "S5", staff: "Staff" 
};
const MEALS = ["breakfast", "lunch", "dinner"];

const MOCK_ADMIN_ITEMS = [
  { id: "101", nameEn: "Rice Nadu", nameSi: "හාල් - තැම්බු නාඩු", unit: "Kg" },
  { id: "201", nameEn: "Chicken", nameSi: "කුකුල් මස්", unit: "Kg" },
  { id: "301", nameEn: "Carrot", nameSi: "කැරට්", unit: "Kg" },
  { id: "401", nameEn: "Bread (loaves)", nameSi: "පාන් 450G", unit: "Pcs" },
];

const MOCK_NORM_WEIGHTS = [
  { itemId: 101, meal: "breakfast", normal: 150, diabetic: 100, hpd: 200, s1: 100, s2: 75, s3: 50, s4: 30, s5: 150, staff: 150 },
  { itemId: 101, meal: "lunch", normal: 200, diabetic: 150, hpd: 250, s1: 150, s2: 100, s3: 75, s4: 50, s5: 200, staff: 200 },
  { itemId: 101, meal: "dinner", normal: 150, diabetic: 100, hpd: 200, s1: 100, s2: 75, s3: 50, s4: 30, s5: 150, staff: 150 },
  { itemId: 201, meal: "lunch", normal: 100, diabetic: 100, hpd: 150, s1: 50, s2: 50, s3: 30, s4: 0, s5: 100, staff: 100 },
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

const NormWeights = () => {
  const { toast, toasts } = useToast();
  const [selectedItem, setSelectedItem] = useState("101");
  const [weights, setWeights] = useState([...MOCK_NORM_WEIGHTS]);
  const [changed, setChanged] = useState(new Set());

  const item = MOCK_ADMIN_ITEMS.find((i) => String(i.id) === selectedItem);

  const getWeight = (meal, diet) => {
    const w = weights.find((n) => String(n.itemId) === selectedItem && n.meal === meal);
    return w ? w[diet] || 0 : 0;
  };

  const updateWeight = (meal, diet, value) => {
    if (value < 0) return;
    const key = `${selectedItem}-${meal}-${diet}`;
    setChanged((p) => new Set(p).add(key));
    
    setWeights((prev) => {
      const idx = prev.findIndex((n) => String(n.itemId) === selectedItem && n.meal === meal);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [diet]: value };
        return updated;
      }
      const newRow = { itemId: Number(selectedItem), meal, normal: 0, diabetic: 0, hpd: 0, s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, staff: 0 };
      newRow[diet] = value;
      return [...prev, newRow];
    });
  };

  const handleSave = () => {
    setChanged(new Set()); 
    toast({ title: "Weights Saved", description: "Norm weight matrix has been updated." }); 
  };

  // Reusable styling for the select box
  const selectBg = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.75rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Norm Weight Matrix Editor</h1>
          <p className="text-sm text-gray-500 mt-1">Configure baseline ingredient allocations per patient diet type.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">
            <Upload className="h-4 w-4 mr-2" /> Import CSV
          </button>
          <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {/* Item Selector */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <div className="max-w-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">Select Item to Edit</label>
          <select 
            value={selectedItem} 
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 appearance-none cursor-pointer"
            style={selectBg}
          >
            {MOCK_ADMIN_ITEMS.map((i) => (
              <option key={i.id} value={String(i.id)}>
                {i.nameSi} / {i.nameEn} ({i.unit})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matrix Table */}
      {item && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              {item.nameSi} / {item.nameEn}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 shadow-sm ml-2">
                Norm Weights (grams)
              </span>
            </h2>
          </div>
          
          <div className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 font-bold text-gray-500 uppercase tracking-wider bg-gray-50 sticky left-0 z-10 w-32 border-r border-gray-200">Meal</th>
                  {DIET_COLS.map((d) => (
                    <th key={d} className="px-3 py-3.5 font-bold text-gray-500 uppercase tracking-wider text-center w-28">
                      {DIET_LABELS[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MEALS.map((meal) => (
                  <tr key={meal} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900 capitalize bg-gray-50 sticky left-0 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      {meal}
                    </td>
                    {DIET_COLS.map((diet) => {
                      const key = `${selectedItem}-${meal}-${diet}`;
                      const isChanged = changed.has(key);
                      return (
                        <td key={diet} className={`px-2 py-3 transition-colors ${isChanged ? "bg-amber-50/50" : ""}`}>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            value={getWeight(meal, diet) || ""}
                            onChange={(e) => updateWeight(meal, diet, parseFloat(e.target.value) || 0)}
                            className={`w-full h-10 px-2 text-right text-base font-semibold bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none mx-auto block max-w-[90px] ${
                              isChanged ? "border-amber-300 text-amber-900" : "border-gray-200 text-gray-800"
                            }`}
                            placeholder="0"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Action Footer */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handleSave}
              className={`inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                changed.size > 0 
                  ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" 
                  : "bg-gray-400 cursor-not-allowed opacity-80"
              }`}
              disabled={changed.size === 0}
            >
              <Save className="h-4 w-4 mr-2" /> {changed.size > 0 ? "Save Changes" : "Saved"}
            </button>
          </div>
          
        </div>
      )}
      
    </div>
  );
};

export default NormWeights;