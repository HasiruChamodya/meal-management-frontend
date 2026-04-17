import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, Activity, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

// Custom Tooltip for Currency formatting
const CurrencyTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
        <p className="font-bold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-semibold">
             Rs. {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const FinancialReports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("6m"); // Default to 6 Months
  
  const [reportData, setReportData] = useState({
    categorySpend: [],
    spendingTrend: []
  });

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        // Pass the timeframe filter to the API
        const res = await fetch(`${API_BASE}/reports/accountant?timeframe=${timeframe}`, { 
          headers: getAuthHeaders() 
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Failed to load reports");
        
        const colors = ["#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#64748b"];
        const formattedCategorySpend = data.categorySpend.map((item, i) => ({
           ...item,
           color: colors[i % colors.length]
        }));

        setReportData({
          categorySpend: formattedCategorySpend,
          spendingTrend: data.spendingTrend || []
        });
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [timeframe, toast]); // Re-run whenever timeframe changes!

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-primary/5 p-6 rounded-xl border border-primary/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
            <TrendingUp className="h-8 w-8" />
            Accountant Financial Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Track finalized purchase order expenditures over time.</p>
        </div>
        
        {/* The Filter Dropdown */}
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px] bg-background font-semibold shadow-sm">
            <SelectValue placeholder="Select Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Today</SelectItem>
            <SelectItem value="1w">Last 7 Days</SelectItem>
            <SelectItem value="1m">Last 1 Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Crunching financial data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Budget/Spend by Category (Donut Chart) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Expenditure by Category
              </CardTitle>
              <CardDescription>Total spending breakdown for selected timeframe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full flex items-center">
                {reportData.categorySpend.length === 0 ? (
                  <div className="w-full text-center text-muted-foreground">No received purchase orders found.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.categorySpend}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {reportData.categorySpend.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '13px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Total Invoice Spending Trend (Area Chart) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Actual Expenditure Trend
              </CardTitle>
              <CardDescription>Total value of finalized purchase orders over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                 {reportData.spendingTrend.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No spending data found for this period.</div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData.spendingTrend} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                    <Tooltip content={<CurrencyTooltip />} />
                    <Area 
                      type="monotone" 
                      name="Total Billed" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                      strokeWidth={3} 
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
};

export default FinancialReports;