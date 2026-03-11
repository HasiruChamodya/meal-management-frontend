import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUDGET_VS_ACTUAL, TOP_INGREDIENTS } from "@/lib/module-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DollarSign, TrendingUp, Calendar, Target } from "lucide-react";

const FinancialReports = () => {
  const stats = [
    { label: "Monthly Budget", value: "Rs. 500,000", icon: Target, color: "text-muted-foreground" },
    { label: "Spent This Month", value: "Rs. 187,500", icon: DollarSign, color: "text-primary" },
    { label: "Daily Average", value: "Rs. 8,500", icon: Calendar, color: "text-badge-hospital" },
    { label: "Projected Month End", value: "Rs. 263,500", icon: TrendingUp, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-heading-md font-bold text-foreground">Financial Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-label font-semibold">Budget vs Actual Spend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={BUDGET_VS_ACTUAL}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `Rs. ${v.toLocaleString()}`} />
                <Bar dataKey="budget" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[4,4,0,0]} />
                <Bar dataKey="actual" radius={[4,4,0,0]}>
                  {BUDGET_VS_ACTUAL.map((entry, i) => (
                    <Cell key={i} fill={entry.actual > entry.budget ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-label font-semibold">Top 5 Highest Cost Ingredients</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={TOP_INGREDIENTS} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}K`} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `Rs. ${v.toLocaleString()}`} />
                <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FinancialReports;