import React, { useState } from "react";
import { Save } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const RECIPE_DATA = {
  polSambola: {
    name: "Pol Sambola",
    ingredients: [
      { name: "Scraped Coconut", normPerPatient: 0.05, unit: "Kg" },
      { name: "Onion", normPerPatient: 0.01, unit: "Kg" },
      { name: "Chili Powder", normPerPatient: 0.005, unit: "Kg" },
      { name: "Lime", normPerPatient: 0.25, unit: "Fruit" },
      { name: "Salt", normPerPatient: 0.002, unit: "Kg" },
    ],
  },
  soup: {
    name: "Soup / Kanda",
    ingredients: [
      { name: "Rice", normPerPatient: 0.02, unit: "Kg" },
      { name: "Garlic", normPerPatient: 0.002, unit: "Kg" },
      { name: "Ginger", normPerPatient: 0.001, unit: "Kg" },
      { name: "Salt", normPerPatient: 0.002, unit: "Kg" },
    ],
  },
};

const RECIPE_CONVERSION = [
  { dietType: "Normal Diet", factor: 1.0 },
  { dietType: "Diabetic Diet", factor: 1.0 },
  { dietType: "Liquid Diet", factor: 0.5 },
  { dietType: "Renal Diet", factor: 0.8 },
  { dietType: "Staff Meal", factor: 1.25 },
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

// ─── Main Component ──────────────────────────────────────────────────────────

const AdminRecipes = () => {
  const { toast, toasts } = useToast();
  const [selected, setSelected] = useState("polSambola");
  
  const recipe = RECIPE_DATA[selected];

  const handleSave = () => {
    toast({ 
      title: "Recipe Saved", 
      description: `Formula and conversion factors for ${recipe.name} updated successfully.` 
    });
  };

  // Reusable custom select styling
  const selectBg = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recipe Formula Editor</h1>
        <p className="text-sm text-gray-500 mt-1">Configure baseline ingredient norms per patient for special preparations.</p>
      </div>

      {/* Recipe Selector */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Recipe to Edit</label>
        <select 
          value={selected} 
          onChange={(e) => setSelected(e.target.value)}
          className="w-full md:w-72 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 appearance-none cursor-pointer transition-colors hover:border-gray-400"
          style={selectBg}
        >
          <option value="polSambola">Pol Sambola</option>
          <option value="soup">Soup / Kanda</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ingredients Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-fit">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">{recipe.name} — Ingredients</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Ingredient</th>
                  <th className="px-5 py-3 font-semibold text-right">Norm Per Patient</th>
                  <th className="px-5 py-3 font-semibold w-24">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100" key={selected}> {/* key ensures inputs reset on recipe change */}
                {recipe.ingredients.map((ing, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{ing.name}</td>
                    <td className="px-5 py-3">
                      <input 
                        type="number" 
                        step="0.001" 
                        min={0} 
                        defaultValue={ing.normPerPatient} 
                        className="w-24 h-9 px-3 ml-auto block text-right text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                      />
                    </td>
                    <td className="px-5 py-3 text-gray-500">{ing.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conversion Factors Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-fit">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">Diet Conversion Factors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Diet Type</th>
                  <th className="px-5 py-3 font-semibold text-right w-36">Multiplier Factor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {RECIPE_CONVERSION.map((r) => (
                  <tr key={r.dietType} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-700">{r.dietType}</td>
                    <td className="px-5 py-3">
                      <input 
                        type="number" 
                        step="0.01" 
                        min={0} 
                        defaultValue={r.factor} 
                        className="w-24 h-9 px-3 ml-auto block text-right text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Action Area */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave} 
          className="inline-flex items-center justify-center px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Save className="h-5 w-5 mr-2" /> Save Changes
        </button>
      </div>

    </div>
  );
};

export default AdminRecipes;