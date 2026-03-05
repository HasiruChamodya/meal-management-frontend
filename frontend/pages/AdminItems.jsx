import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const ITEM_CATEGORIES = [
  { id: 1, name: "Rice / Bread / Noodles" },
  { id: 2, name: "Meat / Fish / Egg" },
  { id: 3, name: "Vegetables" },
  { id: 4, name: "Extra Items" }
];

const MOCK_ADMIN_ITEMS = [
  { id: 101, nameEn: "Rice Nadu", nameSi: "හාල් - තැම්බු නාඩු", unit: "Kg", defaultPrice: 220, categoryId: 1, category: "Rice / Bread / Noodles", isProtein: false, vegCategory: null, isExtra: false, calcType: "norm_weight" },
  { id: 201, nameEn: "Chicken", nameSi: "කුකුල් මස්", unit: "Kg", defaultPrice: 1100, categoryId: 2, category: "Meat / Fish / Egg", isProtein: true, vegCategory: null, isExtra: false, calcType: "norm_weight" },
  { id: 301, nameEn: "Carrot", nameSi: "කැරට්", unit: "Kg", defaultPrice: 200, categoryId: 3, category: "Vegetables", isProtein: false, vegCategory: "other", isExtra: false, calcType: "norm_weight" },
  { id: 401, nameEn: "Milk", nameSi: "කිරි", unit: "1L", defaultPrice: 400, categoryId: 4, category: "Extra Items", isProtein: false, vegCategory: null, isExtra: true, calcType: "raw_sum" }
];

const UNITS = ["Kg", "g", "One", "1 loaf", "Cup", "Bottle", "Pk", "100g", "400g", "1L", "180ml", "375ml", "Pcs", "Fruit", "Pkt"];
const DIET_CYCLE_OPTIONS = ["Vegetable", "Egg", "Meat", "Dried Fish", "Fish"];
const VEG_CAT_OPTIONS = [
  { value: "palaa", label: "Palaa / Leaves" },
  { value: "gedi", label: "Gedi / Vegetable Fruits" },
  { value: "piti", label: "Piti / Starchy" },
  { value: "other", label: "Other" },
];

const emptyItem = (categoryId) => ({
  nameEn: "", nameSi: "", unit: "Kg", defaultPrice: 0,
  categoryId: categoryId || 1,
  category: ITEM_CATEGORIES.find((c) => c.id === (categoryId || 1))?.name || "",
  isProtein: false, vegCategory: null, isExtra: false, calcType: "norm_weight",
});

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

const AdminItems = () => {
  const { toast, toasts } = useToast();
  const [selectedCat, setSelectedCat] = useState(null);
  const [items, setItems] = useState([...MOCK_ADMIN_ITEMS]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState(emptyItem(null));
  
  const [isProteinOn, setIsProteinOn] = useState(false);
  const [isVegOn, setIsVegOn] = useState(false);
  const [isExtraOn, setIsExtraOn] = useState(false);
  const [dietCycle, setDietCycle] = useState("Vegetable");

  const filtered = selectedCat ? items.filter((i) => i.categoryId === selectedCat) : items;

  const openDialog = (catId) => {
    const cat = catId || selectedCat;
    setNewItem(emptyItem(cat));
    setIsProteinOn(false);
    setIsVegOn(false);
    setIsExtraOn(false);
    setDietCycle("Vegetable");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!newItem.nameEn?.trim() || !newItem.nameSi?.trim()) return;
    const cat = ITEM_CATEGORIES.find((c) => c.id === newItem.categoryId);
    const item = {
      id: items.length + 1000, // mock ID generation
      nameEn: newItem.nameEn,
      nameSi: newItem.nameSi,
      unit: newItem.unit || "Kg",
      defaultPrice: newItem.defaultPrice || 0,
      categoryId: newItem.categoryId || 1,
      category: cat?.name || "",
      isProtein: isProteinOn,
      vegCategory: isVegOn ? (newItem.vegCategory || "other") : null,
      isExtra: isExtraOn,
      calcType: isExtraOn ? (newItem.calcType || "raw_sum") : "norm_weight",
    };
    
    setItems((prev) => [...prev, item]);
    setDialogOpen(false);
    toast({ title: "Item added successfully", description: `${item.nameSi} / ${item.nameEn} added to ${cat?.name}` });
  };

  // Select styling to be reused
  const selectStyle = "w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 appearance-none cursor-pointer";
  const selectBg = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Item & Category Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hospital inventory items, pricing, and diet categories.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Category Sidebar */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm md:w-64 shrink-0 flex flex-col overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-700">Categories</h2>
          </div>
          <div className="p-2 space-y-1">
            <button 
              onClick={() => setSelectedCat(null)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${!selectedCat ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
            >
              All Items <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full border border-gray-200/50">{items.length}</span>
            </button>
            
            {ITEM_CATEGORIES.map((c) => {
              const count = items.filter((i) => i.categoryId === c.id).length;
              const isActive = selectedCat === c.id;
              return (
                <button 
                  key={c.id} 
                  onClick={() => setSelectedCat(c.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <span className="truncate pr-2">{c.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${isActive ? "bg-white/50 border-blue-200/50" : "bg-white border-gray-200/50"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Items Table Section */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-700">
              {selectedCat ? ITEM_CATEGORIES.find(c => c.id === selectedCat)?.name : "All Items"}
            </h2>
            <button 
              onClick={() => openDialog()} 
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add New Item
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center w-12">#</th>
                  <th className="px-4 py-3 font-semibold">Item (EN)</th>
                  <th className="px-4 py-3 font-semibold">Item (SI)</th>
                  <th className="px-4 py-3 font-semibold w-24">Unit</th>
                  <th className="px-4 py-3 font-semibold text-right w-28">Price</th>
                  <th className="px-4 py-3 font-semibold w-24 text-center">Protein</th>
                  <th className="px-4 py-3 font-semibold hidden xl:table-cell">Veg Cat.</th>
                  <th className="px-4 py-3 font-semibold">Calc Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-center">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.nameEn}</td>
                    <td className="px-4 py-3 text-gray-500">{item.nameSi}</td>
                    <td className="px-4 py-3 text-gray-600">{item.unit}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">Rs. {item.defaultPrice}</td>
                    <td className="px-4 py-3 text-center">
                      {item.isProtein && <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">Yes</span>}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {item.vegCategory && <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200">{item.vegCategory}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 border border-gray-200">
                        {item.calcType === "norm_weight" ? "Norm Weight" : "Raw Sum"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                      No items found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Add New Item</h3>
          <button onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <select 
              value={String(newItem.categoryId)} 
              onChange={(e) => {
                const val = Number(e.target.value);
                setNewItem((p) => ({ ...p, categoryId: val, category: ITEM_CATEGORIES.find((c) => c.id === val)?.name || "" }));
              }}
              className={selectStyle} style={selectBg}
            >
              {ITEM_CATEGORIES.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Item Name (English) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={newItem.nameEn || ""} 
                onChange={(e) => setNewItem((p) => ({ ...p, nameEn: e.target.value }))} 
                className="w-full px-4 py-2 h-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" 
                placeholder="e.g. Rice Nadu" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Item Name (Sinhala) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={newItem.nameSi || ""} 
                onChange={(e) => setNewItem((p) => ({ ...p, nameSi: e.target.value }))} 
                className="w-full px-4 py-2 h-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" 
                placeholder="e.g. හාල්" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Unit</label>
              <select 
                value={newItem.unit || "Kg"} 
                onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                className={selectStyle} style={selectBg}
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Default Price (Rs.)</label>
              <input 
                type="number" 
                min={0} 
                step="0.01" 
                value={newItem.defaultPrice || ""} 
                onChange={(e) => setNewItem((p) => ({ ...p, defaultPrice: parseFloat(e.target.value) || 0 }))} 
                className="w-full px-4 py-2 h-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
              />
            </div>
          </div>

          {/* Conditional Toggles */}
          <div className="space-y-4 border-t border-gray-100 pt-4 mt-2">
            
            {/* Protein Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 cursor-pointer" onClick={() => setIsProteinOn(!isProteinOn)}>Is Protein Item</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isProteinOn} onChange={(e) => setIsProteinOn(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {isProteinOn && (
                <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Diet Cycle</label>
                  <select value={dietCycle} onChange={(e) => setDietCycle(e.target.value)} className={`h-9 py-1 ${selectStyle}`} style={selectBg}>
                    {DIET_CYCLE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Vegetable Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 cursor-pointer" onClick={() => setIsVegOn(!isVegOn)}>Is Vegetable</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isVegOn} onChange={(e) => setIsVegOn(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {isVegOn && (
                <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vegetable Category</label>
                  <select value={newItem.vegCategory || "other"} onChange={(e) => setNewItem((p) => ({ ...p, vegCategory: e.target.value }))} className={`h-9 py-1 ${selectStyle}`} style={selectBg}>
                    {VEG_CAT_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Extra Item Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 cursor-pointer" onClick={() => setIsExtraOn(!isExtraOn)}>Is Extra Item</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isExtraOn} onChange={(e) => setIsExtraOn(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {isExtraOn && (
                <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Calculation Type</label>
                  <select value={newItem.calcType || "raw_sum"} onChange={(e) => setNewItem((p) => ({ ...p, calcType: e.target.value }))} className={`h-9 py-1 ${selectStyle}`} style={selectBg}>
                    <option value="raw_sum">Raw Sum</option>
                    <option value="norm_weight">Norm Weight</option>
                  </select>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl shrink-0">
          <button 
            onClick={() => setDialogOpen(false)}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={!newItem.nameEn?.trim() || !newItem.nameSi?.trim()}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Item
          </button>
        </div>
      </Dialog>
      
      {/* Optional Custom Scrollbar style for the modal */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #d1d5db; }
      `}</style>
    </div>
  );
};

export default AdminItems;