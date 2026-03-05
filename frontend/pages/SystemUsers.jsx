import React, { useState, useEffect } from "react";
import { Plus, Edit2, KeyRound, Shield, ShieldOff, UserX, X } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_SYSTEM_USERS = [
  { id: "1", name: "Dr. Sandun Perera", username: "sandun.p", email: "sandun@hospital.lk", role: "Hospital Admin", status: "active", lastLogin: "2026-03-05 08:30 AM", twoFA: true },
  { id: "2", name: "Kamal Silva", username: "kamal.s", email: "kamal@hospital.lk", role: "Diet Clerk", status: "active", lastLogin: "2026-03-05 09:15 AM", twoFA: false },
  { id: "3", name: "Nimali Fernando", username: "nimali.f", email: "nimali@hospital.lk", role: "Kitchen Staff", status: "deactivated", lastLogin: "2026-02-28 04:00 PM", twoFA: false },
  { id: "4", name: "Ruwan Jayasinghe", username: "ruwan.j", email: "ruwan@hospital.lk", role: "System Admin", status: "locked", lastLogin: "2026-03-01 10:20 AM", twoFA: true },
];

const STATUS_STYLE = {
  active: "bg-green-100 text-green-800 border-green-200",
  deactivated: "bg-gray-100 text-gray-600 border-gray-200",
  locked: "bg-red-100 text-red-800 border-red-200",
};

const ROLES = ["System Admin", "Hospital Admin", "Diet Clerk", "Subject Clerk", "Accountant", "Kitchen Staff", "Ward Staff"];

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
          className="bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div className="font-bold text-sm">{t.title}</div>
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const SystemUsers = () => {
  const { toast, toasts } = useToast();
  const [users, setUsers] = useState([...MOCK_SYSTEM_USERS]);
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => {
    setIsNew(true);
    setEdit({ 
      id: String(Date.now()), 
      name: "", 
      username: "", 
      email: "", 
      role: "Diet Clerk", 
      status: "active", 
      lastLogin: "Never", 
      twoFA: false 
    });
  };

  const save = () => {
    if (!edit) return;
    
    // Basic validation
    if (!edit.name || !edit.username) {
      toast({ title: "Error", description: "Name and Username are required." });
      return;
    }

    if (isNew) { 
      setUsers((p) => [...p, edit]); 
      toast({ title: "User Created", description: `${edit.name} has been added to the system.` }); 
    } else { 
      setUsers((p) => p.map((u) => (u.id === edit.id ? edit : u))); 
      toast({ title: "User Updated", description: `${edit.name}'s profile has been updated.` }); 
    }
    setEdit(null);
  };

  const toggleUserStatus = (user) => {
    const newStatus = user.status === "active" ? "deactivated" : "active";
    setUsers((p) => p.map((x) => x.id === user.id ? { ...x, status: newStatus } : x));
    toast({ title: "Status Changed", description: `${user.name} is now ${newStatus}.` });
  };

  const resetPassword = (user) => {
    toast({ title: "Password Reset", description: `A password reset link has been emailed to ${user.name}.` });
  };

  // Reusable styling for the select box
  const selectBg = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.75rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system access, roles, and security policies.</p>
        </div>
        <button 
          onClick={openNew}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4 mr-2" /> Add User
        </button>
      </div>

      {/* Data Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Name</th>
                <th className="px-5 py-3.5 font-semibold">Username</th>
                <th className="px-5 py-3.5 font-semibold hidden md:table-cell">Email</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold hidden sm:table-cell">Last Login</th>
                <th className="px-5 py-3.5 font-semibold text-center">2FA</th>
                <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-gray-900">{u.name}</td>
                  <td className="px-5 py-4 text-gray-600 font-medium">{u.username}</td>
                  <td className="px-5 py-4 hidden md:table-cell text-gray-500">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_STYLE[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell text-xs text-gray-500 font-mono">
                    {u.lastLogin}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {u.twoFA ? (
                      <Shield className="h-4 w-4 text-green-600 mx-auto" title="2FA Enabled" />
                    ) : (
                      <ShieldOff className="h-4 w-4 text-gray-300 mx-auto" title="2FA Disabled" />
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => { setIsNew(false); setEdit(u); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none"
                        title="Edit User"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => resetPassword(u)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors focus:outline-none"
                        title="Reset Password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(u)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none"
                        title={u.status === "active" ? "Deactivate User" : "Activate User"}
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={!!edit} onClose={() => setEdit(null)}>
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">{isNew ? "Add New User" : "Edit User Profile"}</h3>
          <button onClick={() => setEdit(null)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {edit && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  value={edit.name} 
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Username</label>
                <input 
                  type="text" 
                  value={edit.username} 
                  onChange={(e) => setEdit({ ...edit, username: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input 
                type="email" 
                value={edit.email} 
                onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">System Role</label>
              <select 
                value={edit.role} 
                onChange={(e) => setEdit({ ...edit, role: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900 appearance-none cursor-pointer"
                style={selectBg}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            {isNew && (
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">Force password reset on first login</span>
                </label>
              </div>
            )}
          </div>
        )}
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
          <button 
            onClick={() => setEdit(null)}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={save}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {isNew ? "Create User" : "Save Changes"}
          </button>
        </div>
      </Dialog>
      
    </div>
  );
};

export default SystemUsers;