import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PRICES = [
  { id: 101, nameSi: "හාල් - තැම්බු නාඩු", nameEn: "Rice Nadu", category: "Rice / Bread / Noodles", unit: "Kg", defaultPrice: 220, lastUpdated: "2026-02-15" },
  { id: 103, nameSi: "පාන් 450G",          nameEn: "Bread (loaves)", category: "Rice / Bread / Noodles", unit: "Pcs", defaultPrice: 85, lastUpdated: "2026-02-10" },
  { id: 201, nameSi: "කුකුල් මස්",        nameEn: "Chicken", category: "Meat / Fish / Egg", unit: "Kg", defaultPrice: 1100, lastUpdated: "2026-03-01" },
  { id: 202, nameSi: "බිත්තර",            nameEn: "Eggs", category: "Meat / Fish / Egg", unit: "Pcs", defaultPrice: 46, lastUpdated: "2026-02-28" },
  { id: 301, nameSi: "මුකුණුවැන්න",       nameEn: "Mukunuwenna", category: "Vegetables - Palaa", unit: "Kg", defaultPrice: 180, lastUpdated: "2026-02-20" },
  { id: 403, nameSi: "තක්කාලි",           nameEn: "Tomato", category: "Vegetables - Gedi", unit: "Kg", defaultPrice: 250, lastUpdated: "2026-03-02" },
  { id: 701, nameSi: "කෙසෙල්",            nameEn: "Banana", category: "Fruits", unit: "Pcs", defaultPrice: 25, lastUpdated: "2026-01-15" },
  { id: 801, nameSi: "ළූනු",               nameEn: "Onion", category: "Currystuffs & Condiments", unit: "Kg", defaultPrice: 280, lastUpdated: "2026-02-18" },
  { id: 901, nameSi: "සීනි",               nameEn: "Sugar", category: "Sugar / Milk Products", unit: "Kg", defaultPrice: 195, lastUpdated: "2026-01-10" },
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
          className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl min-w-[280px] max-w-sm pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div className="font-semibold text-sm">{t.title}</div>
          {t.description && <div className="text-gray-300 text-xs mt-1">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const AccountantPriceManagement = () => {
  const { toast, toasts } = useToast();
  const [prices, setPrices] = useState([...MOCK_PRICES]);

  const updatePrice = (id, newPrice) => {
    setPrices((prev) =>
      prev.map((p) =>
        p.id === id 
          ? { ...p, defaultPrice: newPrice, lastUpdated: new Date().toISOString().split("T")[0] } 
          : p
      )
    );
    toast({ 
      title: "Price Updated", 
      description: "Default price has been updated. Change recorded in audit log." 
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Price Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage baseline hospital purchasing prices.</p>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 shadow-sm">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 font-medium">
          Price changes are recorded in the audit log and apply to all future purchase orders automatically.
        </p>
      </div>

      {/* Data Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-500 w-12 text-center">#</th>
                <th className="px-4 py-3 font-semibold text-gray-500">Item (SI)</th>
                <th className="px-4 py-3 font-semibold text-gray-500">Item (EN)</th>
                <th className="px-4 py-3 font-semibold text-gray-500 hidden md:table-cell">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-500">Unit</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-right w-40">Default Price (Rs)</th>
                <th className="px-4 py-3 font-semibold text-gray-500 hidden sm:table-cell text-right">Last Updated</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {prices.map((p, idx) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  
                  {/* Index */}
                  <td className="px-4 py-3 text-gray-400 text-center">{idx + 1}</td>
                  
                  {/* Sinhala Name */}
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nameSi}</td>
                  
                  {/* English Name */}
                  <td className="px-4 py-3 text-gray-600">{p.nameEn}</td>
                  
                  {/* Category */}
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                      {p.category}
                    </span>
                  </td>
                  
                  {/* Unit */}
                  <td className="px-4 py-3 text-gray-500 font-medium">{p.unit}</td>
                  
                  {/* Price Input */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 relative">
                      <span className="text-xs text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">Rs.</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={p.defaultPrice}
                        onChange={(e) => updatePrice(p.id, parseFloat(e.target.value) || 0)}
                        className="w-28 h-9 pl-8 pr-2 text-right text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none group-hover:border-gray-400"
                      />
                    </div>
                  </td>
                  
                  {/* Last Updated */}
                  <td className="px-4 py-3 hidden sm:table-cell text-right text-gray-400 text-xs">
                    {p.lastUpdated}
                  </td>
                  
                </tr>
              ))}
            </tbody>
            
          </table>
        </div>
        
        {/* Footer/Summary (Optional touch for a better UI) */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
          <span>Showing {prices.length} baseline items.</span>
        </div>
      </div>
      
    </div>
  );
};

export default AccountantPriceManagement;