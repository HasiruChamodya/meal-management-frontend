import React from "react";
import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const PlaceholderPage = () => {
  const location = useLocation();
  
  // Clean up the URL path to make it a readable title
  // e.g., "/admin/system-settings" -> "Admin / System Settings"
  const pageName = location.pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => 
      segment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    )
    .join(" / ") || "Dashboard";

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{pageName}</h1>
      </div>
      
      {/* Construction Card */}
      <div className="bg-white border-2 border-gray-200 border-dashed rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center transition-all hover:bg-gray-50/50">
        
        <div className="bg-blue-50 p-5 rounded-full mb-6 border border-blue-100 shadow-inner">
          <Construction className="h-10 w-10 text-blue-600" />
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          Under Construction
        </h2>
        
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          The <span className="font-semibold text-gray-700">{pageName}</span> module is currently under active development and will be released in an upcoming update.
        </p>
        
      </div>
      
    </div>
  );
};

export default PlaceholderPage;