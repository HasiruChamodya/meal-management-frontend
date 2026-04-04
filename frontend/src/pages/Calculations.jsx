import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, Square, Calculator, Loader2, Leaf, Drumstick } from "lucide-react";
import { getTodaySL } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// 👇 Upgraded to use rich theme colors
const statusConfig = {
  not_started: { label: "Not Started", className: "bg-muted text-muted-foreground" },
  draft: { label: "Draft", className: "bg-warning-bg text-warning" },
  submitted: { label: "Submitted", className: "bg-success text-success-foreground" },
  locked: { label: "Locked", className: "bg-destructive/10 text-destructive" },
};

const today = getTodaySL();

const Calculations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isCalculating, setIsCalculating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasExistingCalc, setHasExistingCalc] = useState(false);

  const [wards, setWards] = useState([]);
  const [wardStatuses, setWardStatuses] = useState([]);
  const [staffMeals, setStaffMeals] = useState(null);
  const [dailyCycle, setDailyCycle] = useState({ patientCycle: "Vegetable", staffCycle: "Chicken" });
  const [dietTypes, setDietTypes] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [wardsRes, statusesRes, staffRes, cycleRes, dietTypesRes] = await Promise.all([
          fetch(`${API_BASE}/wards`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/census/statuses?date=${today}`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/census/staff?date=${today}`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/daily-cycle?date=${today}`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/diet-types`, { headers: getAuthHeaders() }),
        ]);

        try {
          const calcCheckRes = await fetch(`${API_BASE}/calculations/results?date=${today}`, { headers: getAuthHeaders() });
          setHasExistingCalc(calcCheckRes.ok);
        } catch { setHasExistingCalc(false); }

        const wardsData = await wardsRes.json();
        const statusesData = await statusesRes.json();
        const staffData = await staffRes.json();
        const cycleData = await cycleRes.json();
        const dietTypesData = await dietTypesRes.json();

        const activeWards = (wardsData.wards || []).filter((w) => w.active);
        setWards(activeWards);
        
        setDietTypes((dietTypesData.dietTypes || []).filter((d) => d.active && d.type !== "Staff"));

        const statuses = statusesData.statuses || [];
        const merged = activeWards.map((w) => {
          const census = statuses.find((s) => String(s.wardId) === String(w.id));
          return {
            wardId: w.id,
            wardName: w.ward_name || w.wardName || w.name,
            code: w.ward_code || w.wardCode || w.code,
            status: census?.status || "not_started",
            patientCount: census?.totalPatients || 0,
          };
        });
        setWardStatuses(merged);

        if (staffData.staffMeals) setStaffMeals(staffData.staffMeals);
        if (cycleData.cycle) setDailyCycle(cycleData.cycle);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to load calculation data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [toast]);

  const submitted = wardStatuses.filter(
    (w) => w.status === "submitted" || w.status === "locked"
  ).length;
  const total = wardStatuses.length;
  const allSubmitted = total > 0 && submitted === total;
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;

  const [aggregated, setAggregated] = useState(null);

  useEffect(() => {
    const fetchAggregated = async () => {
      if (submitted === 0) return;

      try {
        const res = await fetch(`${API_BASE}/census/my-submissions?date=${today}`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        const submissions = data.submissions || [];

        const totals = {};
        dietTypes.forEach((dt) => {
          totals[dt.code || dt.id] = 0;
        });

        for (const sub of submissions) {
          const diets = sub.diets || {};
          for (const [key, value] of Object.entries(diets)) {
            if (totals[key] !== undefined) {
              totals[key] += Number(value) || 0;
            } else {
              totals[key] = Number(value) || 0;
            }
          }
        }

        const totalPatients = Object.values(totals).reduce((s, v) => s + v, 0);

        setAggregated({
          totals,
          totalPatients,
          staffB: staffMeals?.breakfast || 0,
          staffL: staffMeals?.lunch || 0,
          staffD: staffMeals?.dinner || 0,
          totalStaff:
            (staffMeals?.breakfast || 0) +
            (staffMeals?.lunch || 0) +
            (staffMeals?.dinner || 0),
        });
      } catch (error) {
        console.error("Failed to aggregate:", error);
      }
    };

    if (dietTypes.length > 0) fetchAggregated();
  }, [submitted, dietTypes, staffMeals]);

  const handleRunCalc = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch(`${API_BASE}/calculations/run`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ date: today }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Calculation failed");

      toast({
        title: "Calculation Complete",
        description: "Ingredient requirements have been calculated.",
      });

      navigate("/calculations/results");
    } catch (error) {
      toast({
        title: "Calculation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const statusIcon = (status) => {
    if (status === "submitted" || status === "locked")
      return <CheckCircle2 className="h-6 w-6 text-success" />;
    if (status === "draft") return <Clock className="h-6 w-6 text-warning" />;
    return <Square className="h-6 w-6 text-orange-500" />;
  };

  // 👇 Sort Wards Alphabetically by Code
  const sortedWardStatuses = useMemo(() => {
    return [...wardStatuses].sort((a, b) => 
      (a.code || "").localeCompare(b.code || "")
    );
  }, [wardStatuses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Loading ward data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-lg font-bold text-foreground">
          Ward Submissions & Calculation
        </h1>
        <div className="flex items-center gap-2 text-base font-semibold text-muted-foreground bg-muted px-4 py-2 rounded-lg">
          <Clock className="h-4 w-4" />
          <span>{today}</span>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5 pb-5 flex flex-wrap gap-5 items-center">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-muted-foreground">Patient Cycle:</span>
            <Badge className="bg-primary text-primary-foreground capitalize text-base px-4 py-2 gap-2">
              <Leaf className="h-4 w-4" /> {dailyCycle.patientCycle}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-muted-foreground">Staff Cycle:</span>
            <Badge className="bg-badge-hospital text-primary-foreground capitalize text-base px-4 py-2 gap-2">
              <Drumstick className="h-4 w-4" /> {dailyCycle.staffCycle}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-heading-sm">Submission Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-base">
            <span className="font-medium text-muted-foreground">
              {submitted} / {total} wards submitted
            </span>
            <span className="font-bold text-primary">{pct}%</span>
          </div>
          <Progress value={pct} className="h-4" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* 👇 Mapped over sorted wards with larger padding and text */}
        {sortedWardStatuses.map((w) => (
          <Card
            key={w.wardId}
            className={`p-4 border transition-colors ${
              w.status === "submitted" || w.status === "locked"
                ? "border-success/40 bg-success/5"
                : w.status === "draft"
                ? "border-warning/40 bg-warning/5"
                : "border-orange-500/40 bg-orange-500/5"
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="min-w-0 pr-2">
                <p className="text-base font-bold truncate text-foreground">{w.wardName}</p>
                <p className="text-sm font-medium text-muted-foreground">{w.code}</p>
              </div>
              <div className="shrink-0 pt-0.5">{statusIcon(w.status)}</div>
            </div>
            
            <div className="mt-3">
              {(w.status === "submitted" || w.status === "locked") && (
                <p className="text-sm text-success font-bold">
                  {w.patientCount} patients
                </p>
              )}
              {w.status === "draft" && (
                <p className="text-sm text-warning font-bold">Draft Saved</p>
              )}
              {w.status === "not_started" && (
                <p className="text-sm text-orange-600 font-bold">Pending</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {aggregated && (
        <Card>
          <CardHeader className="pb-3 border-b mb-4">
            <CardTitle className="text-heading-sm">Aggregated Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-muted-foreground mb-3">Diet Types</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {dietTypes.map((dt) => (
                  <div key={dt.code || dt.id} className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-muted-foreground truncate" title={dt.nameEn || dt.name_en}>
                      {dt.nameEn || dt.name_en}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {aggregated.totals[dt.code || dt.id] || 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-muted-foreground">Staff B</p>
                <p className="text-2xl font-bold mt-1">{aggregated.staffB}</p>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-muted-foreground">Staff L</p>
                <p className="text-2xl font-bold mt-1">{aggregated.staffL}</p>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-muted-foreground">Staff D</p>
                <p className="text-2xl font-bold mt-1">{aggregated.staffD}</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/30 sm:col-span-1 col-span-1">
                <p className="text-sm text-primary font-bold">Total Patients</p>
                <p className="text-2xl font-bold text-primary mt-1">{aggregated.totalPatients}</p>
              </div>
              <div className="bg-badge-hospital/10 rounded-xl p-4 text-center border border-badge-hospital/30 sm:col-span-1 col-span-1">
                <p className="text-sm text-badge-hospital font-bold">Total Staff</p>
                <p className="text-2xl font-bold text-badge-hospital mt-1">{aggregated.totalStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col items-center gap-4 py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-bold touch-target shadow-lg hover:shadow-xl transition-all"
                disabled={(!allSubmitted && !hasExistingCalc) || isCalculating}
                onClick={handleRunCalc}
              >
                {isCalculating ? (
                  <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Calculating...</>
                ) : hasExistingCalc ? (
                  <><Calculator className="mr-3 h-6 w-6" /> Re-run Calculation</>
                ) : (
                  <><Calculator className="mr-3 h-6 w-6" /> Run Calculation</>
                )}
              </Button>
            </span>
          </TooltipTrigger>
          {!allSubmitted && !hasExistingCalc && (
            <TooltipContent className="text-sm font-medium">
              All wards must be submitted before running calculation
            </TooltipContent>
          )}
          {!allSubmitted && hasExistingCalc && (
            <TooltipContent className="text-sm font-medium">
              Not all wards submitted — re-running will use current submissions
            </TooltipContent>
          )}
        </Tooltip>

        {hasExistingCalc && (
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base font-semibold"
            onClick={() => navigate("/calculations/results")}
          >
            View Existing Results
          </Button>
        )}
      </div>
    </div>
  );
};

export default Calculations;