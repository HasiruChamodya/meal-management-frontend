import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Users, ClipboardList, Utensils, 
  Settings, FileText, CheckCircle, Calculator 
} from "lucide-react";

// ─── Mock Data & Hooks ───────────────────────────────────────────────────────

// Mocking the auth hook that would normally come from your context
const useAuth = () => {
  return {
    user: { 
      name: "Dr. Sandun Perera", 
      role: "admin" // Try changing this to 'clerk', 'kitchen', or 'ward' to see different dashboards!
    }
  };
};

const ROLE_LABELS = {
  admin: "Hospital Administrator",
  clerk: "Subject Clerk",
  kitchen: "Kitchen Staff",
  ward: "Ward Staff"
};

const DASHBOARD_CARDS = {
  admin: [
    { title: "Ward Management", description: "Configure hospital wards and capacities", icon: ClipboardList, colorClass: "text-blue-600 bg-blue-50", url: "/admin/wards" },
    { title: "Diet Types", description: "Manage available patient diet types", icon: Utensils, colorClass: "text-green-600 bg-green-50", url: "/admin/diets" },
    { title: "Price Management", description: "Update baseline ingredient prices", icon: FileText, colorClass: "text-amber-600 bg-amber-50", url: "/admin/prices" },
    { title: "System Settings", description: "Configure system-wide parameters", icon: Settings, colorClass: "text-gray-600 bg-gray-100", url: "/admin/settings" },
  ],
  clerk: [
    { title: "Pending Approvals", description: "Review and approve purchase orders", icon: CheckCircle, colorClass: "text-indigo-600 bg-indigo-50", url: "/approvals" },
    { title: "Calculations", description: "Run daily ingredient requirement math", icon: Calculator, colorClass: "text-blue-600 bg-blue-50", url: "/calculations" },
  ],
  kitchen: [
    { title: "Daily Cook Sheet", description: "View today's preparation quantities", icon: Utensils, colorClass: "text-orange-600 bg-orange-50", url: "/kitchen/cook-sheet" },
  ],
  ward: [
    { title: "Census Entry", description: "Submit daily patient meal requirements", icon: Users, colorClass: "text-blue-600 bg-blue-50", url: "/census" },
  ]
};

// ─── Main Component ──────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const cards = DASHBOARD_CARDS[user.role] || [];
  
  // Greeting logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center min-h-[120px]">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Good {greeting}, {firstName} 👋
        </h1>
        <p className="text-sm md:text-base text-gray-500 font-medium mt-1.5">
          {ROLE_LABELS[user.role]} Dashboard
        </p>
      </div>

      {/* Dynamic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          
          return (
            <Link key={card.url} to={card.url} className="group outline-none">
              <div className="h-full bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col focus:ring-4 focus:ring-blue-500/20">
                
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${card.colorClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="bg-gray-50 p-2 rounded-full opacity-0 group-hover:opacity-100 group-hover:bg-blue-50 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="px-5 pb-5 mt-auto">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {card.description}
                  </p>
                </div>

              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State Fallback */}
      {cards.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No dashboard widgets configured for your role.</p>
        </div>
      )}

    </div>
  );
};

export default Dashboard;