import React, { useState } from "react";
import { Camera, CheckCircle2, AlertTriangle } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_RECEIVING = [
  { id: 101, nameEn: "Rice Nadu", nameSi: "හාල් - තැම්බු නාඩු", unit: "Kg", ordered: 45.5, received: 45.5, quality: "good", notes: "" },
  { id: 103, nameEn: "Bread (loaves)", nameSi: "පාන් 450G", unit: "Pcs", ordered: 60, received: 58, quality: "good", notes: "2 loaves missing" },
  { id: 201, nameEn: "Chicken", nameSi: "කුකුල් මස්", unit: "Kg", ordered: 25.0, received: 25.0, quality: "poor", notes: "Thawed slightly during transit" },
  { id: 301, nameEn: "Carrot", nameSi: "කැරට්", unit: "Kg", ordered: 15.0, received: 16.5, quality: "good", notes: "Supplier sent extra" },
  { id: 401, nameEn: "Milk", nameSi: "කිරි", unit: "1L", ordered: 20, received: 20, quality: "spoiled", notes: "5 cartons bloated, rejected." },
];

const QUALITY_OPTIONS = [
  { value: "good", label: "✅ Good Quality" },
  { value: "poor", label: "⚠️ Poor Quality" },
  { value: "spoiled", label: "🔴 Spoiled / Rejected" },
  { value: "partial", label: "🟡 Partially Damaged" },
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
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className="bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div className="font-bold text-sm">{t.title}</div>
          {t.description && <div className="text-gray-300 text-xs mt-1">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const DeliveryReceiving = () => {
  const { toast, toasts } = useToast();
  const [items, setItems] = useState([...MOCK_RECEIVING]);
  const [overallNotes, setOverallNotes] = useState("");

  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const getRowClass = (item) => {
    if (item.received === 0 && item.ordered > 0) return "bg-red-50/50";
    if (item.received < item.ordered) return "bg-red-50/30";
    if (item.received > item.ordered) return "bg-amber-50/40";
    if (item.quality !== "good") return item.quality === "spoiled" ? "bg-red-50/50" : "bg-amber-50/40";
    return "bg-white hover:bg-gray-50/50";
  };

  const getDiscrepancy = (item) => {
    if (item.received === 0 && item.ordered > 0) return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">Missing</span>;
    if (item.received < item.ordered) return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">Short</span>;
    if (item.received > item.ordered) return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">Excess</span>;
    return null;
  };

  const qtyIssues = items.filter((i) => i.received !== i.ordered).length;
  const qualityIssues = items.filter((i) => i.quality !== "good").length;
  const okCount = items.filter((i) => i.received === i.ordered && i.quality === "good").length;
  const hasIssues = qtyIssues > 0 || qualityIssues > 0;

  // Custom Select Style
  const selectBg = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-32">
      
      <ToastContainer toasts={toasts} />

      {/* Header Banner */}
      <div className="bg-blue-700 rounded-2xl p-6 text-center shadow-lg border-b-4 border-blue-900">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm uppercase">
          Delivery Receiving
        </h1>
        <p className="text-lg text-blue-100 font-semibold mt-1">2026-03-02 <span className="mx-2 opacity-50">|</span> Order #000369</p>
        <span className="inline-flex items-center px-4 py-1 mt-4 rounded-full text-sm font-bold bg-amber-400 text-amber-900 shadow-sm uppercase tracking-wider">
          In Progress
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider min-w-[180px]">Item</th>
                <th className="px-5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Ordered</th>
                <th className="px-5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right w-32">Received</th>
                <th className="px-5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider w-48">Quality</th>
                <th className="px-5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Notes</th>
                <th className="px-5 py-4 w-16"></th>
                <th className="px-5 py-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className={`transition-colors ${getRowClass(item)}`}>
                  
                  {/* Item Name */}
                  <td className="px-5 py-4">
                    <p className="text-base font-bold text-gray-900">{item.nameEn}</p>
                    <p className="text-sm font-medium text-gray-500">{item.nameSi}</p>
                  </td>
                  
                  {/* Ordered */}
                  <td className="px-5 py-4 text-right text-lg font-bold text-gray-700">
                    {item.ordered} <span className="text-sm font-medium text-gray-500 ml-1">{item.unit}</span>
                  </td>
                  
                  {/* Received Input */}
                  <td className="px-5 py-4">
                    <input
                      type="number"
                      step="0.01"
                      value={item.received}
                      onChange={(e) => updateItem(item.id, "received", parseFloat(e.target.value) || 0)}
                      className={`w-24 h-12 px-3 text-right text-lg font-black bg-white border rounded-lg focus:outline-none focus:ring-4 transition-shadow ml-auto block [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        item.received !== item.ordered ? "border-red-300 text-red-700 focus:ring-red-500/20 focus:border-red-500" : "border-gray-300 text-blue-700 focus:ring-blue-500/20 focus:border-blue-500"
                      }`}
                    />
                  </td>
                  
                  {/* Quality Select */}
                  <td className="px-5 py-4">
                    <select 
                      value={item.quality} 
                      onChange={(e) => updateItem(item.id, "quality", e.target.value)}
                      className={`w-full h-12 px-3 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-4 transition-shadow text-sm font-semibold appearance-none cursor-pointer ${
                        item.quality !== "good" ? "border-amber-300 text-amber-900 focus:ring-amber-500/20 focus:border-amber-500" : "border-gray-300 text-gray-700 focus:ring-blue-500/20 focus:border-blue-500"
                      }`}
                      style={selectBg}
                    >
                      {QUALITY_OPTIONS.map((q) => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </select>
                  </td>
                  
                  {/* Notes */}
                  <td className="px-5 py-4">
                    <input
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                      className="w-full h-12 px-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-900 transition-shadow"
                      placeholder="Add issue details..."
                    />
                  </td>
                  
                  {/* Photo Button */}
                  <td className="px-3 py-4 text-center">
                    <button 
                      className={`h-12 w-12 rounded-lg border flex items-center justify-center transition-colors focus:outline-none ${
                        item.quality !== "good" ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100" : "bg-gray-50 border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                      }`}
                      title="Attach Photo Evidence"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </td>
                  
                  {/* Discrepancy Badge */}
                  <td className="px-5 py-4 text-center">
                    {getDiscrepancy(item)}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-green-500 rounded-xl p-5 shadow-sm text-center">
          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-black text-green-600">{okCount}<span className="text-xl text-green-600/50">/{items.length}</span></p>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">Items OK</p>
        </div>
        
        <div className={`bg-white border-2 rounded-xl p-5 shadow-sm text-center transition-colors ${qtyIssues > 0 ? "border-red-500" : "border-gray-200"}`}>
          <p className={`text-4xl font-black mb-1 ${qtyIssues > 0 ? "text-red-600" : "text-gray-300"}`}>{qtyIssues}</p>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Qty Issues</p>
        </div>
        
        <div className={`bg-white border-2 rounded-xl p-5 shadow-sm text-center transition-colors ${qualityIssues > 0 ? "border-amber-500" : "border-gray-200"}`}>
          <p className={`text-4xl font-black mb-1 ${qualityIssues > 0 ? "text-amber-500" : "text-gray-300"}`}>{qualityIssues}</p>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Quality Issues</p>
        </div>
      </div>

      {/* Overall Notes */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-700">Overall Delivery Notes</h2>
        </div>
        <div className="p-4">
          <textarea 
            value={overallNotes} 
            onChange={(e) => setOverallNotes(e.target.value)} 
            placeholder="General delivery comments, driver behavior, truck temperature, etc..." 
            className="w-full min-h-[100px] p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-900 resize-y transition-shadow" 
          />
        </div>
      </div>

      {/* Action Bar (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 flex justify-end gap-3 px-4 md:px-8">
        {hasIssues ? (
          <button 
            className="w-full md:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-black text-amber-900 bg-amber-400 rounded-xl hover:bg-amber-500 shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-amber-500/30"
            onClick={() => toast({ title: "Delivery Confirmed with Issues", description: `${qtyIssues + qualityIssues} issues recorded and reported.` })}
          >
            <AlertTriangle className="mr-3 h-6 w-6" /> 
            Confirm & Submit Issue Report
            <span className="ml-3 px-2.5 py-0.5 bg-amber-900 text-amber-100 rounded text-sm">
              {qtyIssues + qualityIssues} issues
            </span>
          </button>
        ) : (
          <button 
            className="w-full md:w-auto inline-flex items-center justify-center px-10 py-4 text-base font-black text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-green-500/30"
            onClick={() => toast({ title: "Delivery Confirmed", description: "All items received in good condition." })}
          >
            <CheckCircle2 className="mr-3 h-6 w-6" /> 
            Confirm Delivery — All Good
          </button>
        )}
      </div>

    </div>
  );
};

export default DeliveryReceiving;