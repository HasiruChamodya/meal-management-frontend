import React, { useState } from "react";
import { Save, Clock, Lock, Shield, AlertTriangle } from "lucide-react";

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

// ─── Inline Switch Component ─────────────────────────────────────────────────

const CustomSwitch = ({ id, defaultChecked = false, label }) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700 cursor-pointer select-none" onClick={() => setChecked(!checked)}>
          {label}
        </label>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const SystemSettings = () => {
  const { toast, toasts } = useToast();

  const handleSave = () => {
    toast({ 
      title: "Settings Saved", 
      description: "System configuration has been successfully updated." 
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-24">
      
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage global security, timeouts, and maintenance configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Session Timeout */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" /> Session Timeout
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Timeout Duration (minutes)</label>
              <input 
                type="number" 
                defaultValue={15} 
                min={1}
                className="w-32 h-10 px-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900" 
              />
            </div>
            <p className="text-xs font-medium text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              Users will be securely logged out after this period of inactivity.
            </p>
          </div>
        </div>

        {/* Password Policy */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-600" /> Password Policy
            </h2>
          </div>
          <div className="p-5 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Minimum Length</label>
              <input 
                type="number" 
                defaultValue={8} 
                min={6}
                className="w-32 h-10 px-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900" 
              />
            </div>
            <div className="pt-1">
              <CustomSwitch id="complexity" defaultChecked={true} label="Require uppercase, number, and special character" />
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" /> Two-Factor Authentication
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <CustomSwitch id="2fa-admin" defaultChecked={true} label="Require 2FA for System Admins" />
            <div className="h-px bg-gray-100 w-full my-2"></div>
            <CustomSwitch id="2fa-accountant" defaultChecked={true} label="Require 2FA for Accountants" />
            <div className="h-px bg-gray-100 w-full my-2"></div>
            <CustomSwitch id="2fa-all" defaultChecked={false} label="Require 2FA for all users" />
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Maintenance Mode
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <CustomSwitch id="maintenance" defaultChecked={false} label="Enable Maintenance Mode" />
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-3 mt-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-800 leading-relaxed">
                When enabled, the system will be put into read-only mode for non-admin users. No data modifications will be allowed until disabled.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/30"
        >
          <Save className="h-5 w-5 mr-2" /> Save Settings
        </button>
      </div>

    </div>
  );
};

export default SystemSettings;