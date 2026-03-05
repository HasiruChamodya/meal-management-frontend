import React, { useState } from "react";
import { Download } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_AUDIT_LOGS = [
  {
    id: "log-101",
    timestamp: "2026-03-05 14:32:01",
    user: "Accountant_Silva",
    action: "APPROVE_PO",
    entity: "PurchaseOrder: PO-2026-03-05-A",
    oldValue: "pending_approval",
    newValue: "approved",
    severity: "approval",
    ipAddress: "192.168.1.45"
  },
  {
    id: "log-102",
    timestamp: "2026-03-05 10:15:22",
    user: "Admin_Perera",
    action: "UPDATE_PRICE",
    entity: "Item: Chicken",
    oldValue: "Rs. 1050",
    newValue: "Rs. 1100",
    severity: "price",
    ipAddress: "192.168.1.12"
  },
  {
    id: "log-103",
    timestamp: "2026-03-05 08:05:11",
    user: "Nurse_Ward_01",
    action: "UPDATE_CENSUS",
    entity: "Census: MW-01",
    oldValue: "draft",
    newValue: "submitted",
    severity: "data",
    ipAddress: "192.168.1.102"
  },
  {
    id: "log-104",
    timestamp: "2026-03-04 23:45:00",
    user: "SYSTEM",
    action: "SYSTEM_BACKUP",
    entity: "Database",
    oldValue: "",
    newValue: "Success",
    severity: "info",
    ipAddress: "127.0.0.1"
  },
  {
    id: "log-105",
    timestamp: "2026-03-04 18:20:15",
    user: "Unknown",
    action: "FAILED_LOGIN",
    entity: "Auth",
    oldValue: "",
    newValue: "Invalid Credentials",
    severity: "security",
    ipAddress: "203.0.113.42"
  }
];

const SEVERITY_BG = {
  info: "bg-transparent hover:bg-gray-50/80",
  data: "bg-blue-50/40 hover:bg-blue-50/80",
  price: "bg-amber-50/40 hover:bg-amber-50/80",
  approval: "bg-green-50/40 hover:bg-green-50/80",
  security: "bg-red-50/40 hover:bg-red-50/80",
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
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

// ─── Main Component ──────────────────────────────────────────────────────────

const AuditLogs = () => {
  const { toast, toasts } = useToast();
  const [actionFilter, setActionFilter] = useState("all");
  
  const filtered = actionFilter === "all" 
    ? MOCK_AUDIT_LOGS 
    : MOCK_AUDIT_LOGS.filter((l) => l.action === actionFilter);
    
  const actions = [...new Set(MOCK_AUDIT_LOGS.map((l) => l.action))];

  const handleExport = () => {
    toast({ 
      title: "Export Started", 
      description: "Downloading audit_logs_export.csv" 
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Track all critical actions and changes across the system.</p>
        </div>
        <button 
          onClick={handleExport}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <Download className="h-4 w-4 mr-2 text-gray-500" /> Export CSV
        </button>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Filter by Action
          </label>
          <div className="relative">
            <select 
              value={actionFilter} 
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.75rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
            >
              <option value="all">All Actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Timestamp</th>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Entity</th>
                <th className="px-5 py-3 font-semibold hidden lg:table-cell">Old Value</th>
                <th className="px-5 py-3 font-semibold hidden lg:table-cell">New Value</th>
                <th className="px-5 py-3 font-semibold hidden md:table-cell">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((log) => (
                <tr key={log.id} className={`transition-colors ${SEVERITY_BG[log.severity]}`}>
                  <td className="px-5 py-3.5 text-xs text-gray-500 font-mono tracking-tight">
                    {log.timestamp}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">
                    {log.user}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-900 text-white shadow-sm">
                      {log.action.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">
                    {log.entity}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-gray-500 font-mono max-w-[150px] truncate">
                    {log.oldValue || "—"}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-gray-900 font-bold font-mono max-w-[150px] truncate">
                    {log.newValue || "—"}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-xs text-gray-400 font-mono">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-gray-500">
                    No logs found for the selected action.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          Showing {filtered.length} audit entries.
        </div>
      </div>
      
    </div>
  );
};

export default AuditLogs;