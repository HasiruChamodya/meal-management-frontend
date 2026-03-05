import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-200">
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-50 rounded-full shadow-inner border border-blue-100">
            <FileQuestion className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        
        {/* Text Content */}
        <h1 className="mb-2 text-5xl font-black text-gray-900 tracking-tight">404</h1>
        <p className="mb-8 text-base text-gray-500 font-medium leading-relaxed">
          Oops! We couldn't find the page you were looking for at <br />
          <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-800 font-mono text-sm rounded border border-gray-200 truncate max-w-full">
            {location.pathname}
          </span>
        </p>
        
        {/* Action Button */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/30 w-full"
        >
          Return to Dashboard
        </Link>
        
      </div>
    </div>
  );
};

export default NotFound;