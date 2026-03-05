import React, { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS = [
  { 
    id: "n1", 
    date: "2026-03-05", 
    type: "quality_report", 
    message: "Low quality vegetables reported by kitchen", 
    from: "Kitchen Supervisor", 
    read: false, 
    details: "The cabbage and carrots delivered this morning were partially spoiled. Supplier 'AgriFresh' has been notified for a replacement." 
  },
  { 
    id: "n2", 
    date: "2026-03-04", 
    type: "delivery", 
    message: "Late delivery alert: Dry rations", 
    from: "Inventory Manager", 
    read: true, 
    details: "The dry rations delivery expected at 8:00 AM arrived at 11:30 AM, slightly delaying inventory logging." 
  },
  { 
    id: "n3", 
    date: "2026-03-03", 
    type: "system", 
    message: "System maintenance scheduled", 
    from: "IT Admin", 
    read: false, 
    details: "The meal management system will be down for 30 minutes tonight at 2:00 AM for database optimization." 
  },
];

// Tailwind classes mapped to specific notification types
const TYPE_STYLE = {
  quality_report: "bg-amber-100 text-amber-800 border-amber-200",
  delivery: "bg-red-100 text-red-800 border-red-200",
  system: "bg-gray-100 text-gray-700 border-gray-200",
};

// ─── Simple Inline Toast Hook & Component ────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = ({ title, description }) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, title, description }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  };
  return { toast, toasts };
}

function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl min-w-[250px] pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300"
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const AdminNotifications = () => {
  const { toast, toasts } = useToast();
  const [notifications, setNotifications] = useState([...MOCK_NOTIFICATIONS]);
  const [selected, setSelected] = useState(null);
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id) => {
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
    toast({ title: "Marked as read" });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          Notifications
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              {unreadCount}
            </span>
          )}
        </h1>
      </div>

      {/* Data Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold text-gray-500 w-32">Date</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 w-40">Type</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500">Message</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 w-48">From</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 text-right w-44">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <tr 
                  key={n.id} 
                  className={`transition-colors group ${
                    !n.read ? "bg-blue-50/40 hover:bg-blue-50/80" : "hover:bg-gray-50"
                  }`}
                >
                  
                  {/* Date */}
                  <td className="px-5 py-3.5 text-gray-500 text-xs font-medium">
                    {n.date}
                  </td>
                  
                  {/* Type Badge */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase border ${TYPE_STYLE[n.type] || TYPE_STYLE.system}`}>
                      {n.type.replace("_", " ")}
                    </span>
                  </td>
                  
                  {/* Message */}
                  <td className={`px-5 py-3.5 truncate max-w-[280px] lg:max-w-md ${!n.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {n.message}
                  </td>
                  
                  {/* From */}
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {n.from}
                  </td>
                  
                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!n.read ? (
                        <button 
                          onClick={() => markRead(n.id)}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors focus:outline-none"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Mark Read
                        </button>
                      ) : (
                        <div className="w-[88px]" /> /* Spacer to keep alignment when 'Mark Read' disappears */
                      )}
                      
                      <button 
                        onClick={() => { 
                          setSelected(n); 
                          if (!n.read) markRead(n.id); 
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        View
                      </button>
                    </div>
                  </td>
                  
                </tr>
              ))}
              
              {notifications.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto text-gray-300 mb-3" />
                    <p>No notifications right now.</p>
                  </td>
                </tr>
              )}
            </tbody>
            
          </table>
        </div>
      </div>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)}>
        {/* Header */}
        <div className="flex justify-between items-start px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 pr-8 leading-snug">
            {selected?.message}
          </h3>
          <button 
            onClick={() => setSelected(null)} 
            className="text-gray-400 hover:text-gray-600 focus:outline-none mt-1 shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div>
              <span className="text-gray-500 block text-xs font-medium mb-0.5">From</span>
              <span className="font-semibold text-gray-800">{selected?.from}</span>
            </div>
            <div className="pl-4 border-l border-gray-200">
              <span className="text-gray-500 block text-xs font-medium mb-0.5">Date</span>
              <span className="font-semibold text-gray-800">{selected?.date}</span>
            </div>
            <div className="pl-4 border-l border-gray-200">
              <span className="text-gray-500 block text-xs font-medium mb-0.5">Category</span>
              <span className="font-semibold text-gray-800 capitalize">{selected?.type?.replace("_", " ")}</span>
            </div>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Details</h4>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-white">
              {selected?.details}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={() => setSelected(null)}
            className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Close
          </button>
        </div>
      </Dialog>
      
    </div>
  );
};

export default AdminNotifications;