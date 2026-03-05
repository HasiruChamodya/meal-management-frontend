import React, { useState, useEffect } from "react";
import { Download, RefreshCw, Loader2, X, Database } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_BACKUPS = [
  { id: "bk-001", date: "2026-03-05 02:00:00", size: "145.2 MB", type: "auto", status: "completed" },
  { id: "bk-002", date: "2026-03-04 02:00:00", size: "144.8 MB", type: "auto", status: "completed" },
  { id: "bk-003", date: "2026-03-03 14:30:22", size: "144.5 MB", type: "manual", status: "completed" },
  { id: "bk-004", date: "2026-03-03 02:00:00", size: "0 MB", type: "auto", status: "failed" },
  { id: "bk-005", date: "2026-03-02 02:00:00", size: "142.1 MB", type: "auto", status: "completed" },
];

const STATUS_STYLE = {
  completed: "bg-green-100 text-green-700 border-green-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  failed: "bg-red-100 text-red-700 border-red-200",
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const Backups = () => {
  const { toast, toasts } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [backing, setBacking] = useState(false);

  const triggerBackup = () => {
    setShowConfirm(false);
    setBacking(true);
    // Simulate a backup process taking 3 seconds
    setTimeout(() => { 
      setBacking(false); 
      toast({ title: "Backup Complete", description: "Manual backup created and saved successfully." }); 
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Database Backups</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, download, and trigger manual system snapshots.</p>
        </div>
        <button 
          onClick={() => setShowConfirm(true)} 
          disabled={backing}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
        >
          {backing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Backing up...</>
          ) : (
            <><RefreshCw className="h-4 w-4 mr-2" /> Manual Backup</>
          )}
        </button>
      </div>

      {/* Progress Card */}
      {backing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-bold text-blue-800 flex items-center gap-2">
              <Database className="h-4 w-4" /> Creating secure backup...
            </p>
            <span className="text-xs font-semibold text-blue-600 animate-pulse">Please wait</span>
          </div>
          {/* Animated Progress Bar */}
          <div className="w-full bg-blue-200/50 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: "100%", transition: "width 3s ease-in-out" }}
            ></div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Size</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold w-32">Status</th>
                <th className="px-6 py-4 font-semibold w-16 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_BACKUPS.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs text-gray-600 font-medium">
                    {b.date}
                  </td>
                  <td className="px-6 py-3.5 text-gray-700 font-medium">
                    {b.size}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                      {b.type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_STYLE[b.status]}`}>
                      {b.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {b.status === "completed" ? (
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none"
                        title="Download Backup"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="w-8 h-8 inline-block"></div> // Spacer to keep columns aligned
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-400 text-center">
        Backups are retained for 30 days. Older backups are automatically pruned from the server.
      </p>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Trigger Manual Backup?</h3>
          <button 
            onClick={() => setShowConfirm(false)} 
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            This will create a full snapshot of the PostgreSQL database and save it to the secure volume. This operation may take a few minutes depending on the current database size.
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={() => setShowConfirm(false)}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={triggerBackup}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center"
          >
            <Database className="h-4 w-4 mr-2" /> Start Backup
          </button>
        </div>
      </Dialog>

    </div>
  );
};

export default Backups;