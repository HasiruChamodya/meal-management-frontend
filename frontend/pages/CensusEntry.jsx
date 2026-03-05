import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  AlertTriangle, CalendarDays, Check, ChevronDown, ChevronRight,
  ChevronsUpDown, HelpCircle, Plus, Send, X, Search
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const today = new Date().toISOString().split("T")[0];

const WARDS = [
  { id: "w1", code: "MW-01", name: "Medical Ward 01", capacity: 40 },
  { id: "w2", code: "SW-01", name: "Surgical Ward 01", capacity: 35 },
  { id: "w3", code: "PW-01", name: "Pediatric Ward 01", capacity: 20 },
  { id: "w4", code: "MAT-01", name: "Maternity Ward 01", capacity: 30 },
  { id: "w5", code: "ICU-01", name: "Intensive Care Unit", capacity: 10 },
];

const DIET_FIELDS = [
  { key: "normal", label: "Normal Diet", tooltip: "Standard hospital diet" },
  { key: "diabetic", label: "Diabetic Diet", tooltip: "Low sugar, controlled carbs" },
  { key: "cardiac", label: "Cardiac Diet", tooltip: "Low sodium, low fat" },
  { key: "renal", label: "Renal Diet", tooltip: "Low potassium, low phosphorus" },
  { key: "liquid", label: "Liquid Diet", tooltip: "Clear or full liquids only" },
];

const EXTRA_ITEMS = [
  { name: "Milk", unit: "L" },
  { name: "Eggs", unit: "Pcs" },
  { name: "Biscuits", unit: "g" },
  { name: "Bananas", unit: "Fruit" },
];

const MOCK_SUBMISSIONS = [
  {
    wardId: "w1", date: today, status: "submitted", totalPatients: 38,
    diets: { normal: 25, diabetic: 10, cardiac: 3, renal: 0, liquid: 0 },
    special: { soupKanda: 5, polSambola: 10 },
    extras: { Milk: 2, Eggs: 15, Biscuits: 500, Bananas: 20 },
    customExtras: []
  },
  {
    wardId: "w2", date: today, status: "draft", totalPatients: 15,
    diets: { normal: 10, diabetic: 5, cardiac: 0, renal: 0, liquid: 0 },
    special: { soupKanda: 0, polSambola: 5 },
    extras: { Milk: 1, Eggs: 5, Biscuits: 200, Bananas: 10 },
    customExtras: []
  }
];

const getWardCapacity = (w) => w?.capacity || 0;
const getWardCapacityLabel = (w) => `${getWardCapacity(w)} beds`;

const statusConfig = {
  not_started: { label: "Not Submitted", className: "bg-gray-100 text-gray-500 border-gray-200" },
  draft: { label: "Draft", className: "bg-amber-100 text-amber-700 border-amber-200" },
  submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700 border-blue-200" },
  locked: { label: "Locked", className: "bg-red-100 text-red-700 border-red-200" },
};

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
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="font-bold text-sm">{t.title}</div>
          {t.description && <div className="text-gray-300 text-xs mt-1">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Tooltip Component ────────────────────────────────────────────────────────

function Tooltip({ children, content }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex items-center" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
        </span>
      )}
    </span>
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
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

// ─── Number Input Component ──────────────────────────────────────────────────

const NumField = ({ value, onChange, onEnter, inputRef, min = 0, className = "", disabled = false }) => {
  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter?.();
    }
  };
  return (
    <input
      ref={inputRef}
      type="number"
      inputMode="numeric"
      min={min}
      value={value || ""}
      disabled={disabled}
      onChange={(e) => {
        const v = parseInt(e.target.value, 10);
        onChange(isNaN(v) ? 0 : Math.max(min, v));
      }}
      onKeyDown={handleKey}
      className={`h-11 px-2 text-center border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
    />
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const CensusEntryPage = () => {
  const { toast, toasts } = useToast();
  const [activeTab, setActiveTab] = useState("patients");

  // Ward state
  const [wardId, setWardId] = useState("");
  const [wardSearchOpen, setWardSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const ward = useMemo(() => WARDS.find((w) => w.id === wardId), [wardId]);
  const capacity = ward ? getWardCapacity(ward) : 0;

  // Filter wards for custom dropdown
  const filteredWards = useMemo(() => {
    if (!searchQuery) return WARDS;
    const q = searchQuery.toLowerCase();
    return WARDS.filter(w => w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q));
  }, [searchQuery]);

  // Submission tracker
  const wardStatuses = useMemo(() => {
    return WARDS.map((w) => {
      const sub = MOCK_SUBMISSIONS.find((s) => s.wardId === w.id && s.date === today);
      return { ward: w, status: sub?.status || "not_started", totalPatients: sub?.totalPatients || 0 };
    });
  }, [wardId]); // Re-compute when wardId changes to reflect immediate updates (mocking)

  const submittedCount = wardStatuses.filter((w) => w.status === "submitted" || w.status === "locked").length;
  const submissionPct = Math.round((submittedCount / WARDS.length) * 100) || 0;

  // Form states
  const [diets, setDiets] = useState(() => Object.fromEntries(DIET_FIELDS.map((f) => [f.key, 0])));
  const [special, setSpecial] = useState({ soupKanda: 0, polSambola: 0 });
  const [extras, setExtras] = useState(() => Object.fromEntries(EXTRA_ITEMS.map((i) => [i.name, 0])));
  const [customExtras, setCustomExtras] = useState([]);

  // Staff meals
  const [staffMeals, setStaffMeals] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [staffSubmitted, setStaffSubmitted] = useState(false);

  // Status & UI
  const [status, setStatus] = useState("not_started");
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: 0, unit: "Pcs" });

  // Refs for keyboard nav
  const inputRefs = useRef([]);
  const focusNext = (idx) => {
    const next = inputRefs.current[idx + 1];
    next?.focus();
  };
  const registerRef = (idx) => (el) => {
    inputRefs.current[idx] = el;
  };

  // Load ward data
  const handleWardChange = useCallback((id) => {
    setWardId(id);
    setWardSearchOpen(false);
    setSearchQuery("");
    
    const entry = MOCK_SUBMISSIONS.find((s) => s.wardId === id && s.date === today);
    if (entry) {
      setDiets({ ...Object.fromEntries(DIET_FIELDS.map((f) => [f.key, 0])), ...entry.diets });
      setSpecial(entry.special || { soupKanda: 0, polSambola: 0 });
      setExtras({ ...Object.fromEntries(EXTRA_ITEMS.map((i) => [i.name, 0])), ...entry.extras });
      setCustomExtras(entry.customExtras || []);
      setStatus(entry.status);
    } else {
      setDiets(Object.fromEntries(DIET_FIELDS.map((f) => [f.key, 0])));
      setSpecial({ soupKanda: 0, polSambola: 0 });
      setExtras(Object.fromEntries(EXTRA_ITEMS.map((i) => [i.name, 0])));
      setCustomExtras([]);
      setStatus("not_started");
    }
  }, []);

  // Totals & logic
  const totalPatients = useMemo(() => Object.values(diets).reduce((s, v) => s + v, 0), [diets]);
  const capacityPercent = capacity > 0 ? Math.min((totalPatients / capacity) * 100, 120) : 0;
  const overCapacity = totalPatients > capacity && capacity > 0;
  const progressColor = overCapacity ? "bg-red-500" : capacityPercent >= 80 ? "bg-amber-500" : "bg-blue-600";
  const isReadOnly = status === "submitted" || status === "locked";

  // Handlers
  const handleSubmit = () => {
    setConfirmOpen(false);
    setStatus("submitted");
    toast({ title: "Census submitted", description: `${ward?.name} data submitted successfully.` });
    
    // Auto-advance to next unsubmitted ward
    const nextWard = WARDS.find((w) => {
      const sub = MOCK_SUBMISSIONS.find((s) => s.wardId === w.id && s.date === today);
      return w.id !== wardId && (!sub || sub.status === "not_started");
    });
    
    if (nextWard) {
      setTimeout(() => handleWardChange(nextWard.id), 800);
    }
  };

  const handleAddCustomItem = () => {
    if (!newItem.name.trim()) return;
    setCustomExtras((prev) => [...prev, { ...newItem, name: newItem.name.trim() }]);
    setNewItem({ name: "", quantity: 0, unit: "Pcs" });
    setAddItemOpen(false);
  };

  const handleSubmitStaff = () => {
    setStaffSubmitted(true);
    toast({ title: "Staff meals submitted", description: "Staff meal counts saved for today." });
  };

  let refIdx = 0; // counter for keyboard nav

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-28 md:pb-6">
      
      <ToastContainer toasts={toasts} />
      
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Census Entry</h1>

      {/* ── Tracker ────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">{submittedCount} / {WARDS.length} wards submitted</span>
          <span className="text-sm font-bold text-blue-600">{submissionPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${submissionPct}%` }}></div>
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {wardStatuses.map((ws) => {
            const isSubmitted = ws.status === "submitted" || ws.status === "locked";
            const isActive = ws.ward.id === wardId;
            return (
              <button
                key={ws.ward.id}
                onClick={() => handleWardChange(ws.ward.id)}
                className={`rounded-lg p-2 text-center text-xs border transition-all cursor-pointer ${
                  isActive ? "ring-2 ring-blue-600 ring-offset-1 border-blue-600" : ""
                } ${
                  isSubmitted 
                    ? "bg-blue-50 border-blue-200 text-blue-700" 
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <p className="font-bold truncate">{ws.ward.code}</p>
                {isSubmitted && <p className="text-[10px] mt-0.5">{ws.totalPatients}p</p>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            onClick={() => setActiveTab("patients")}
            className={`flex-1 py-4 text-sm font-bold transition-colors focus:outline-none border-b-2 ${activeTab === "patients" ? "border-blue-600 text-blue-700 bg-white" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Patient Census
          </button>
          <button 
            onClick={() => setActiveTab("staff")}
            className={`flex-1 py-4 text-sm font-bold transition-colors focus:outline-none border-b-2 ${activeTab === "staff" ? "border-blue-600 text-blue-700 bg-white" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Staff Meals
          </button>
        </div>

        {/* ── Tab 1: Patient Census ─────────────────────────────────────────── */}
        {activeTab === "patients" && (
          <div className="p-4 md:p-6 space-y-6 bg-gray-50/30">
            
            {/* Ward Selector */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1 space-y-1.5 relative">
                  <label className="text-sm font-semibold text-gray-700">Select Ward</label>
                  
                  {/* Custom Combo Box */}
                  <div className="relative">
                    <button 
                      onClick={() => setWardSearchOpen(!wardSearchOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 h-12 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-left text-gray-900"
                    >
                      {ward ? <span className="font-semibold">{ward.name} <span className="text-gray-500 font-normal ml-1">({ward.code})</span></span> : <span className="text-gray-400">Search or select a ward...</span>}
                      <ChevronsUpDown className="h-4 w-4 text-gray-400 shrink-0" />
                    </button>
                    
                    {wardSearchOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                        <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                          <Search className="h-4 w-4 text-gray-400 ml-1 shrink-0" />
                          <input 
                            type="text" 
                            placeholder="Type to search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent focus:outline-none text-sm text-gray-900 h-8"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredWards.length === 0 ? (
                            <div className="p-4 text-sm text-center text-gray-500">No ward found.</div>
                          ) : (
                            filteredWards.map((w) => (
                              <div 
                                key={w.id} 
                                onClick={() => handleWardChange(w.id)}
                                className={`flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${wardId === w.id ? "bg-blue-50/50" : ""}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Check className={`h-4 w-4 text-blue-600 ${wardId === w.id ? "opacity-100" : "opacity-0"}`} />
                                  <span className="font-medium text-gray-900">{w.name}</span>
                                  <span className="text-gray-500">({w.code})</span>
                                </div>
                                <span className="text-xs text-gray-400">{getWardCapacityLabel(w)}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Backdrop for closing dropdown */}
                  {wardSearchOpen && <div className="fixed inset-0 z-40" onClick={() => setWardSearchOpen(false)}></div>}
                </div>

                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-2 h-12 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 shadow-sm">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    {new Date().toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                  {ward && (
                    <div className={`inline-flex items-center px-3 py-2 h-12 rounded-lg border text-sm font-bold shadow-sm ${statusConfig[status].className}`}>
                      {statusConfig[status].label}
                    </div>
                  )}
                </div>
              </div>
              {ward && (
                <p className="text-sm font-medium text-gray-500 mt-2">
                  Capacity: {getWardCapacityLabel(ward)}
                </p>
              )}
            </div>

            {!ward ? (
              <div className="bg-white border border-gray-200 border-dashed rounded-xl p-16 text-center shadow-sm">
                <p className="text-gray-500 font-medium">Select a ward above to begin entering census data.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Patient Counts */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-base font-bold text-gray-900">Patient Counts</h2>
                  </div>
                  <div className="p-5 space-y-5">
                    
                    {overCapacity && (
                      <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        Patient count exceeds ward capacity of {capacity}!
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
                      {DIET_FIELDS.map((field) => {
                        const idx = refIdx++;
                        return (
                          <div key={field.key} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-semibold text-gray-700">{field.label}</label>
                              {field.tooltip && (
                                <Tooltip content={field.tooltip}>
                                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                </Tooltip>
                              )}
                            </div>
                            <NumField
                              value={diets[field.key] || 0}
                              disabled={isReadOnly}
                              onChange={(v) => !isReadOnly && setDiets((d) => ({ ...d, [field.key]: v }))}
                              onEnter={() => focusNext(idx)}
                              inputRef={registerRef(idx)}
                              className="w-24"
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-5 border-t border-gray-100 space-y-2.5 mt-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Total Patients</span>
                        <span className={`text-xl font-black ${overCapacity ? "text-red-600" : "text-blue-600"}`}>
                          {totalPatients} / {capacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-2.5 rounded-full transition-all duration-500 ease-out ${progressColor}`} style={{ width: `${Math.min(capacityPercent, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-base font-bold text-gray-900">Special Requests</h2>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-6">
                    {[
                      { key: "soupKanda", label: "Soup / Kanda" },
                      { key: "polSambola", label: "Pol Sambola" },
                    ].map((item) => {
                      const idx = refIdx++;
                      return (
                        <div key={item.key} className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">{item.label}</label>
                          <NumField
                            value={special[item.key] || 0}
                            disabled={isReadOnly}
                            onChange={(v) => !isReadOnly && setSpecial((s) => ({ ...s, [item.key]: v }))}
                            onEnter={() => focusNext(idx)}
                            inputRef={registerRef(idx)}
                            className="w-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Extra Items (Collapsible) */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <button 
                    onClick={() => setExtrasOpen(!extrasOpen)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50/50 hover:bg-gray-50 transition-colors focus:outline-none"
                  >
                    <h2 className="text-base font-bold text-gray-900">Extra Items</h2>
                    {extrasOpen ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                  </button>
                  
                  {extrasOpen && (
                    <div className="p-5 border-t border-gray-100">
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-[1fr_100px_60px] gap-3 bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item</span>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Qty</span>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Unit</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {EXTRA_ITEMS.map((item) => {
                            const idx = refIdx++;
                            return (
                              <div key={item.name} className="grid grid-cols-[1fr_100px_60px] gap-3 px-4 py-2.5 items-center hover:bg-gray-50/50 transition-colors">
                                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                <NumField
                                  value={extras[item.name] || 0}
                                  disabled={isReadOnly}
                                  onChange={(v) => !isReadOnly && setExtras((e) => ({ ...e, [item.name]: v }))}
                                  onEnter={() => focusNext(idx)}
                                  inputRef={registerRef(idx)}
                                  className="w-full h-9"
                                />
                                <span className="text-xs font-medium text-gray-500 text-center bg-gray-100 py-1 rounded">{item.unit}</span>
                              </div>
                            );
                          })}
                          
                          {customExtras.map((item, i) => (
                            <div key={`custom-${i}`} className="grid grid-cols-[1fr_100px_60px] gap-3 px-4 py-2.5 items-center bg-blue-50/30">
                              <span className="text-sm font-medium text-gray-900">{item.name}</span>
                              <NumField
                                value={item.quantity}
                                disabled={isReadOnly}
                                onChange={(v) => !isReadOnly && setCustomExtras((prev) => prev.map((ce, j) => (j === i ? { ...ce, quantity: v } : ce)))}
                                className="w-full h-9 bg-white"
                              />
                              <span className="text-xs font-medium text-gray-500 text-center bg-white border py-1 rounded">{item.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {!isReadOnly && (
                        <button 
                          onClick={() => setAddItemOpen(true)}
                          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors focus:outline-none"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Custom Item
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Sticky Submit Bar */}
                {!isReadOnly && (
                  <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 md:static md:bg-transparent md:border-0 md:p-0 md:pt-2 flex justify-end shadow-[0_-4px_15px_rgba(0,0,0,0.05)] md:shadow-none">
                    <button 
                      onClick={() => setConfirmOpen(true)}
                      disabled={overCapacity || totalPatients === 0}
                      className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Send className="h-5 w-5 mr-2" /> Submit Ward Data
                    </button>
                  </div>
                )}

                {isReadOnly && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-blue-800">
                    <Check className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">This ward's census has been submitted and is locked for today.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Staff Meals ────────────────────────────────────────────── */}
        {activeTab === "staff" && (
          <div className="p-4 md:p-6 bg-gray-50/30">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Staff Meal Counts for Today</h2>
              <p className="text-sm text-gray-500 mb-8">Enter total hospital staff meal requirements (aggregate counts, not per-ward).</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                {["breakfast", "lunch", "dinner"].map((meal) => (
                  <div key={meal} className="space-y-3">
                    <label className="block text-center text-sm font-bold text-gray-700 uppercase tracking-widest">{meal}</label>
                    <input
                      type="number"
                      min={0}
                      value={staffMeals[meal] || ""}
                      onChange={(e) => !staffSubmitted && setStaffMeals((s) => ({ ...s, [meal]: parseInt(e.target.value, 10) || 0 }))}
                      disabled={staffSubmitted}
                      className="w-full h-16 text-3xl font-black text-center text-blue-900 bg-blue-50/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white disabled:opacity-70 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-8 bg-indigo-50 border border-indigo-100 p-3 rounded-lg w-fit">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Current Staff Cycle:</span>
                <span className="text-sm font-bold text-indigo-900">Chicken</span>
              </div>

              {staffSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-800">
                  <Check className="h-5 w-5 shrink-0 text-green-600" />
                  <p className="text-sm font-bold">Staff meals successfully submitted at {new Date().toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" })}.</p>
                </div>
              ) : (
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button 
                    onClick={handleSubmitStaff}
                    disabled={staffMeals.breakfast + staffMeals.lunch + staffMeals.dinner === 0}
                    className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Send className="h-5 w-5 mr-2" /> Submit Staff Meals
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Dialogs ────────────────────────────────────────────────────────── */}

      {/* Confirm Ward Submission */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900">Submit Census Data?</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-base leading-relaxed">
            Once submitted, the data for <span className="font-bold text-gray-900">{ward?.name}</span> will be locked for today and sent to the kitchen system. Do you wish to continue?
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
          <button onClick={() => setConfirmOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">Yes, Submit</button>
        </div>
      </Dialog>

      {/* Add Custom Item */}
      <Dialog open={addItemOpen} onClose={() => setAddItemOpen(false)}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Add Custom Extra Item</h3>
          <button onClick={() => setAddItemOpen(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Item Name</label>
            <input 
              type="text" 
              value={newItem.name} 
              onChange={(e) => setNewItem((n) => ({ ...n, name: e.target.value }))} 
              placeholder="e.g., Apple Juice"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Quantity</label>
              <input 
                type="number" 
                min={0}
                value={newItem.quantity || ""} 
                onChange={(e) => setNewItem((n) => ({ ...n, quantity: parseInt(e.target.value, 10) || 0 }))} 
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Unit</label>
              <select 
                value={newItem.unit} 
                onChange={(e) => setNewItem((n) => ({ ...n, unit: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900 appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
              >
                {["Pcs", "g", "kg", "ml", "L", "Fruit"].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
          <button onClick={() => setAddItemOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button 
            onClick={handleAddCustomItem} 
            disabled={!newItem.name.trim()}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Item
          </button>
        </div>
      </Dialog>

    </div>
  );
};

export default CensusEntryPage;