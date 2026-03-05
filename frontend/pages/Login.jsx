import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const ROLE_LABELS = {
  ward: "Ward Staff (Nurse)",
  kitchen: "Kitchen Staff",
  clerk: "Subject Clerk",
  admin: "Hospital Admin",
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

const Login = () => {
  const [role, setRole] = useState("ward");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();
  const { toast, toasts } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock login logic
    toast({
      title: "Welcome to MealFlow",
      description: `Signed in successfully as ${ROLE_LABELS[role]}`,
    });
    
    // Slight delay to show the toast before redirecting
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      
      <ToastContainer toasts={toasts} />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="text-center pb-2 pt-10 px-8">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-5 shadow-inner">
            <Utensils className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">MealFlow</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">District General Hospital, Gampaha</p>
        </div>

        {/* Form Content */}
        <div className="pt-6 pb-10 px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Select */}
            <div className="space-y-1.5">
              <label htmlFor="role" className="block text-sm font-bold text-gray-700">Sign in as</label>
              <select 
                id="role"
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
              >
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-bold text-gray-700">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full h-12 mt-4 text-base font-bold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all"
            >
              Sign In
            </button>
            
          </form>

          <p className="text-xs font-semibold text-gray-400 text-center mt-8 bg-gray-50 py-3 rounded-lg border border-gray-100">
            Demo mode — select a role and click Sign In
          </p>
          
        </div>
      </div>
    </div>
  );
};

export default Login;