import React from "react";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-200">
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-50 rounded-full shadow-inner border border-red-100">
            <ShieldAlert className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        {/* Text Content */}
        <h1 className="mb-3 text-3xl font-black text-gray-900 tracking-tight">Access Denied</h1>
        <p className="mb-8 text-base text-gray-500 font-medium leading-relaxed">
          You don't have permission to view this page. Please contact your hospital administrator if you believe this is an error.
        </p>
        
        {/* Action Button */}
        <button 
          onClick={() => navigate("/dashboard")} 
          className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/30 w-full"
        >
          Return to Dashboard
        </button>
        
      </div>
    </div>
  );
};

export default Unauthorized;