import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DollarSign, TrendingUp, Calendar, Target } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_BUDGET_VS_ACTUAL = [
  { day: "Mon", budget: 15000, actual: 14200 },
  { day: "Tue", budget: 15000, actual: 16500 }, // Over budget
  { day: "Wed", budget: 15000, actual: 13800 },
  { day: "Thu", budget: 15000, actual: 14900 },
  { day: "Fri", budget: 15000, actual: 17200 }, // Over budget
  { day: "Sat", budget: 12000, actual: 11500 },
  { day: "Sun", budget: 12000, actual: 10800 },
];

const MOCK_TOP_INGREDIENTS = [
  { name: "Chicken", cost: 85000 },
  { name: "Rice Nadu", cost: 42000 },
  { name: "Milk Powder", cost: 28500 },
  { name: "Eggs", cost: 18400 },
  { name: "Dhal", cost: 15200 },
];

// ─── Main Component ──────────────────────────────────────────────────────────

const FinancialReports = () => {
  const stats = [
    { label: "Monthly Budget", value: "Rs. 500,000", icon: Target, colorClass: "text-gray-500" },
    { label: "Spent This Month", value: "Rs. 187,500", icon: DollarSign, colorClass: "text-blue-600" },
    { label: "Daily Average", value: "Rs. 8,500", icon: Calendar, colorClass: "text-indigo-600" },
    { label: "Projected Month End", value: "Rs. 263,500", icon: TrendingUp, colorClass: "text-amber-500" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Track hospital meal expenditures and budget utilization.</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Budget vs Actual Chart */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">Budget vs Actual Spend</h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MOCK_BUDGET_VS_ACTUAL} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${v/1000}k`} />
                <Tooltip 
                  formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Amount"]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="budget" name="Budget" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual Spend" radius={[4, 4, 0, 0]}>
                  {MOCK_BUDGET_VS_ACTUAL.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.actual > entry.budget ? "#EF4444" : "#2563EB"} // Red if over budget, Blue if under
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Ingredients Chart */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">Top 5 Highest Cost Ingredients</h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MOCK_TOP_INGREDIENTS} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Total Cost"]}
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="cost" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col items-center text-center transition-all hover:shadow-md">
            <div className={`p-3 rounded-full bg-gray-50 mb-3 ${s.colorClass.replace('text-', 'bg-').replace('500', '100').replace('600', '100')}`}>
              <s.icon className={`h-6 w-6 ${s.colorClass}`} />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              {s.label}
            </p>
            <p className={`text-xl font-black ${s.colorClass === 'text-gray-500' ? 'text-gray-900' : s.colorClass}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default FinancialReports;