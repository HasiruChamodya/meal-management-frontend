import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Check, AlertTriangle, ArrowDown, ArrowUp, X } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PENDING = [
  {
    id: "po-101",
    billNo: "PO-2026-03-05-A",
    date: "2026-03-05",
    status: "pending_approval",
    categories: [
      {
        id: 1,
        name: "Rice / Bread / Noodles",
        items: [
          { id: 101, nameSi: "හාල් - තැම්බු නාඩු", nameEn: "Rice Nadu", unit: "Kg", breakfast: true, lunch: true, dinner: true, totalUnits: 45.5, unitPrice: 220, defaultPrice: 220 },
          { id: 103, nameSi: "පාන් 450G", nameEn: "Bread (loaves)", unit: "Pcs", breakfast: true, lunch: false, dinner: true, totalUnits: 60, unitPrice: 90, defaultPrice: 85 }, // price changed
        ]
      },
      {
        id: 2,
        name: "Meat / Fish / Egg",
        items: [
          { id: 201, nameSi: "කුකුල් මස්", nameEn: "Chicken", unit: "Kg", breakfast: false, lunch: true, dinner: false, totalUnits: 25.0, unitPrice: 1100, defaultPrice: 1100 },
          { id: 202, nameSi: "බිත්තර", nameEn: "Eggs", unit: "Pcs", breakfast: true, lunch: false, dinner: false, totalUnits: 150, unitPrice: 46, defaultPrice: 46 },
        ]
      }
    ]
  }
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
          className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl min-w-[280px] max-w-sm pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div className="font-semibold text-sm">{t.title}</div>
          {t.description && <div className="text-gray-300 text-xs mt-1">{t.description}</div>}
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
      >
        {children}
      </div>
    </div>
  );
}

// ─── Tooltip Component ────────────────────────────────────────────────────────

function Tooltip({ children, content }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
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

// ─── Main Component ──────────────────────────────────────────────────────────

const ApprovalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, toasts } = useToast();
  
  // Use mock data fallback if ID not found (for testing without a router wrapper)
  const po = MOCK_PENDING.find((p) => p.id === id) || MOCK_PENDING[0];

  const [revisions, setRevisions] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!po) return <div className="text-center py-20 text-gray-500 font-medium">Purchase Order not found.</div>;

  const getRevised = (item) => revisions[item.id] || { qty: item.totalUnits, price: item.unitPrice };

  const originalTotal = po.categories.reduce((s, c) => s + c.items.reduce((a, i) => a + i.totalUnits * i.unitPrice, 0), 0);
  const revisedTotal = po.categories.reduce((s, c) => s + c.items.reduce((a, i) => {
    const r = getRevised(i);
    return a + r.qty * r.price;
  }, 0), 0);
  
  const diff = revisedTotal - originalTotal;

  const updateRevision = (itemId, field, value) => {
    setRevisions((prev) => {
      const existing = prev[itemId] || (() => {
        for (const c of po.categories) { 
          const it = c.items.find((i) => i.id === itemId); 
          if (it) return { qty: it.totalUnits, price: it.unitPrice }; 
        }
        return { qty: 0, price: 0 };
      })();
      return { ...prev, [itemId]: { ...existing, [field]: value } };
    });
  };

  const handleApprove = () => {
    setShowApproveDialog(false); 
    toast({ title: "PO Approved", description: `Purchase order ${po.billNo} has been approved.` }); 
    setTimeout(() => navigate("/approvals"), 1500);
  };

  const handleReject = () => {
    setShowRejectDialog(false); 
    toast({ title: "PO Rejected", description: "Returned to Subject Clerk for correction." }); 
    setTimeout(() => navigate("/approvals"), 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-32">
      
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Reviewing Order</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{po.billNo}</h1>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm w-fit">
          Pending Approval
        </span>
      </div>

      {/* Comparison summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Original Total</p>
          <p className="text-2xl font-black text-gray-900">Rs. {originalTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
        
        <div className={`bg-white rounded-xl border shadow-sm p-5 text-center transition-colors ${diff < 0 ? "border-green-300 bg-green-50/50" : diff > 0 ? "border-red-300 bg-red-50/50" : "border-gray-200"}`}>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Your Revisions</p>
          <p className={`text-2xl font-black ${diff < 0 ? "text-green-700" : diff > 0 ? "text-red-700" : "text-gray-900"}`}>
            Rs. {revisedTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Difference</p>
          <div className={`flex items-center justify-center gap-1.5 text-2xl font-black ${diff < 0 ? "text-green-600" : diff > 0 ? "text-red-600" : "text-gray-400"}`}>
            {diff !== 0 && (diff < 0 ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />)}
            {diff === 0 ? "No Change" : `Rs. ${Math.abs(diff).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          </div>
        </div>

      </div>

      {/* Categories loop */}
      <div className="space-y-4">
        {po.categories.map((cat) => {
          const isOpen = openSections[cat.id] ?? true;
          
          return (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all">
              
              {/* Accordion Header */}
              <button 
                onClick={() => setOpenSections((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50/50 hover:bg-gray-50 transition-colors focus:outline-none border-b border-gray-100"
              >
                <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  <span className="text-gray-400 mr-2">{cat.id}.</span>{cat.name}
                </h2>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="overflow-x-auto p-0">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white border-b border-gray-200 text-gray-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold text-center w-12">#</th>
                        <th className="px-5 py-3 font-semibold">Item</th>
                        <th className="px-3 py-3 font-semibold text-center w-10">B</th>
                        <th className="px-3 py-3 font-semibold text-center w-10">L</th>
                        <th className="px-3 py-3 font-semibold text-center w-10">D</th>
                        <th className="px-5 py-3 font-semibold text-right text-gray-400">Calc Qty</th>
                        <th className="px-5 py-3 font-semibold text-right text-gray-400">Price</th>
                        <th className="px-5 py-3 font-semibold text-right bg-blue-50/50 w-32 border-l border-gray-100">Rev. Qty</th>
                        <th className="px-5 py-3 font-semibold text-right bg-blue-50/50 w-36">Rev. Price</th>
                        <th className="px-5 py-3 font-semibold text-right bg-blue-50/50 w-32">Rev. Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cat.items.map((item, idx) => {
                        const priceChangedFromDefault = item.unitPrice !== item.defaultPrice;
                        const rev = getRevised(item);
                        const qtyChanged = rev.qty !== item.totalUnits;
                        const priceRevised = rev.price !== item.unitPrice;
                        
                        return (
                          <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${priceChangedFromDefault ? "bg-amber-50/30" : ""}`}>
                            
                            <td className="px-5 py-3 text-gray-400 text-center">{idx + 1}</td>
                            
                            <td className="px-5 py-3">
                              <div className="flex items-center">
                                <span className="font-bold text-gray-900">{item.nameSi}</span>
                                <span className="text-gray-500 ml-2">/ {item.nameEn}</span>
                                {priceChangedFromDefault && (
                                  <Tooltip content={`Default Price: Rs.${item.defaultPrice}`}>
                                    <AlertTriangle className="h-4 w-4 text-amber-500 ml-2 cursor-help" />
                                  </Tooltip>
                                )}
                              </div>
                            </td>

                            {/* Meals */}
                            <td className="px-3 py-3 text-center">{item.breakfast && <Check className="h-4 w-4 text-green-600 mx-auto" />}</td>
                            <td className="px-3 py-3 text-center">{item.lunch && <Check className="h-4 w-4 text-green-600 mx-auto" />}</td>
                            <td className="px-3 py-3 text-center">{item.dinner && <Check className="h-4 w-4 text-green-600 mx-auto" />}</td>

                            {/* Original */}
                            <td className="px-5 py-3 text-right text-gray-500 font-medium">{item.totalUnits} {item.unit}</td>
                            <td className="px-5 py-3 text-right text-gray-500 font-medium">Rs. {item.unitPrice}</td>

                            {/* Revisions */}
                            <td className={`px-5 py-2 text-right border-l border-gray-100 ${qtyChanged ? "bg-orange-50/50" : "bg-blue-50/20"}`}>
                              <input 
                                type="number" 
                                step="0.01" 
                                value={rev.qty} 
                                onChange={(e) => updateRevision(item.id, "qty", parseFloat(e.target.value) || 0)} 
                                className={`w-20 h-8 px-2 text-right text-sm font-bold bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${qtyChanged ? "border-orange-300 text-orange-700" : "border-gray-200 text-gray-900"}`}
                              />
                            </td>
                            <td className={`px-5 py-2 text-right ${priceRevised ? "bg-orange-50/50" : "bg-blue-50/20"}`}>
                              <input 
                                type="number" 
                                step="0.01" 
                                value={rev.price} 
                                onChange={(e) => updateRevision(item.id, "price", parseFloat(e.target.value) || 0)} 
                                className={`w-24 h-8 px-2 text-right text-sm font-bold bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${priceRevised ? "border-orange-300 text-orange-700" : "border-gray-200 text-gray-900"}`}
                              />
                            </td>
                            <td className="px-5 py-3 text-right font-black text-gray-900 bg-blue-50/20">
                              Rs. {(rev.qty * rev.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Bar (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 flex justify-end gap-3 px-4 md:px-8">
        <button 
          onClick={() => setShowRejectDialog(true)}
          className="px-6 py-3 text-sm font-bold text-red-600 bg-white border-2 border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        >
          Reject & Return
        </button>
        <button 
          onClick={() => setShowApproveDialog(true)}
          className="px-8 py-3 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all"
        >
          Approve Purchase Order
        </button>
      </div>

      {/* ── Approve Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={showApproveDialog} onClose={() => setShowApproveDialog(false)}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-green-50/50">
          <h3 className="text-lg font-bold text-gray-900">Approve Purchase Order?</h3>
          <button onClick={() => setShowApproveDialog(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            You are about to approve <span className="font-bold text-gray-900">{po.billNo}</span> for a total of <span className="font-bold text-green-700">Rs. {revisedTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>.
          </p>
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3 text-sm text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <p>This action is legally timestamped to your user account and will generate the official procurement documents.</p>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
          <button onClick={() => setShowApproveDialog(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleApprove} className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm transition-colors">Confirm & Approve</button>
        </div>
      </Dialog>

      {/* ── Reject Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-red-50/50">
          <h3 className="text-lg font-bold text-gray-900">Reject Purchase Order?</h3>
          <button onClick={() => setShowRejectDialog(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm">
            Please provide a reason for rejecting <span className="font-bold text-gray-900">{po.billNo}</span>. This will be sent back to the Subject Clerk.
          </p>
          <textarea 
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Type your reason here..."
            className="w-full h-32 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900 resize-none"
          />
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
          <button onClick={() => setShowRejectDialog(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleReject} disabled={!rejectReason.trim()} className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Reject Order</button>
        </div>
      </Dialog>

    </div>
  );
};

export default ApprovalDetail;