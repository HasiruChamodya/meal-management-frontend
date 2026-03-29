import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DIET_CYCLES } from "@/lib/module-data";
import { CalendarDays, Leaf, Drumstick, Save } from "lucide-react";

const AdminDailyCycle = () => {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [patientCycle, setPatientCycle] = useState("Vegetable");
  const [staffCycle, setStaffCycle] = useState("Chicken");
  const [saved, setSaved] = useState(true);

  const handleSave = () => {
    setSaved(true);
    toast({ title: "Cycle Selection Saved", description: `Diet cycles set for ${date}` });
  };

  return (import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getTodaySL } from "@/lib/date-utils";
import { CalendarDays, Leaf, Drumstick, Save, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:5050/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

const AdminDailyCycle = () => {
  const { toast } = useToast();
  const today = getTodaySL();

  const [date, setDate] = useState(today);
  const [patientCycle, setPatientCycle] = useState("");
  const [staffCycle, setStaffCycle] = useState("");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Diet cycles from database
  const [dietCycles, setDietCycles] = useState([]);

  // Current saved cycle (for display badge)
  const [currentCycle, setCurrentCycle] = useState(null);

  // Fetch diet cycles from API
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [cyclesRes, dailyRes] = await Promise.all([
          fetch(`${API_BASE}/diet-cycles`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/daily-cycle?date=${today}`, { headers: getAuthHeaders() }),
        ]);

        const cyclesData = await cyclesRes.json();
        const dailyData = await dailyRes.json();

        // Only show active cycles
        const activeCycles = (cyclesData.cycles || []).filter((c) => c.active);
        setDietCycles(activeCycles);

        // Set current saved values
        if (dailyData.cycle) {
          setCurrentCycle(dailyData.cycle);
          setPatientCycle(dailyData.cycle.patientCycle || "");
          setStaffCycle(dailyData.cycle.staffCycle || "");
        } else if (activeCycles.length > 0) {
          // Default to first cycle if nothing is set
          setPatientCycle(activeCycles[0].nameEn);
          setStaffCycle(activeCycles[0].nameEn);
        }
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Refetch daily cycle when date changes
  useEffect(() => {
    const fetchForDate = async () => {
      try {
        const res = await fetch(`${API_BASE}/daily-cycle?date=${date}`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();

        if (data.cycle) {
          setPatientCycle(data.cycle.patientCycle || "");
          setStaffCycle(data.cycle.staffCycle || "");
          setSaved(true);
        }
      } catch (error) {
        console.error("Failed to fetch cycle for date:", error);
      }
    };

    if (date) fetchForDate();
  }, [date]);

  const handleSave = async () => {
    if (!patientCycle || !staffCycle) {
      toast({ title: "Error", description: "Both patient and staff cycles are required", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/daily-cycle`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ date, patientCycle, staffCycle }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save cycle");

      setCurrentCycle({ patientCycle, staffCycle, date });
      setSaved(true);
      toast({ title: "Cycle Selection Saved", description: `Diet cycles set for ${date}` });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading cycle data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-heading-md font-bold text-foreground">Daily Meal Cycle</h1>

      {/* Current active cycles */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <p className="text-label font-semibold text-muted-foreground mb-3">Today's Active Cycles</p>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1.5 gap-2">
              <Leaf className="h-4 w-4" /> Patient: {currentCycle?.patientCycle || patientCycle || "Not Set"}
            </Badge>
            <Badge className="bg-badge-hospital text-primary-foreground text-sm px-4 py-1.5 gap-2">
              <Drumstick className="h-4 w-4" /> Staff: {currentCycle?.staffCycle || staffCycle || "Not Set"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cycle selection form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-heading-sm">Set Diet Cycles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5 max-w-xs">
            <Label className="text-label font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" /> Date
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setSaved(false); }}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-label font-semibold flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" /> Patient Diet Cycle
              </Label>
              <Select
                value={patientCycle}
                onValueChange={(v) => { setPatientCycle(v); setSaved(false); }}
              >
                <SelectTrigger className="h-12 touch-target"><SelectValue placeholder="Select cycle" /></SelectTrigger>
                <SelectContent>
                  {dietCycles.map((c) => (
                    <SelectItem key={c.id} value={c.nameEn}>
                      {c.nameSi ? `${c.nameSi} / ` : ""}{c.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-label font-semibold flex items-center gap-2">
                <Drumstick className="h-4 w-4 text-badge-hospital" /> Staff Diet Cycle
              </Label>
              <Select
                value={staffCycle}
                onValueChange={(v) => { setStaffCycle(v); setSaved(false); }}
              >
                <SelectTrigger className="h-12 touch-target"><SelectValue placeholder="Select cycle" /></SelectTrigger>
                <SelectContent>
                  {dietCycles.map((c) => (
                    <SelectItem key={c.id} value={c.nameEn}>
                      {c.nameSi ? `${c.nameSi} / ` : ""}{c.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {dietCycles.length === 0 && (
            <p className="text-sm text-destructive">
              No diet cycles found. Please add cycles in the Diet Cycles management page first.
            </p>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={saved || saving || !patientCycle || !staffCycle}
              className="h-12 px-8 touch-target"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save Cycle Selection</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDailyCycle;
    <div className="space-y-6">
      <h1 className="text-heading-md font-bold text-foreground">Daily Meal Cycle</h1>

      {/* Current active cycles */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <p className="text-label font-semibold text-muted-foreground mb-3">Today's Active Cycles</p>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1.5 gap-2">
              <Leaf className="h-4 w-4" /> Patient: {patientCycle}
            </Badge>
            <Badge className="bg-badge-hospital text-primary-foreground text-sm px-4 py-1.5 gap-2">
              <Drumstick className="h-4 w-4" /> Staff: {staffCycle}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cycle selection form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-heading-sm">Set Diet Cycles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5 max-w-xs">
            <Label className="text-label font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" /> Date
            </Label>
            <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSaved(false); }} className="h-11" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-label font-semibold flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" /> Patient Diet Cycle
              </Label>
              <Select value={patientCycle} onValueChange={(v) => { setPatientCycle(v); setSaved(false); }}>
                <SelectTrigger className="h-12 touch-target"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIET_CYCLES.map((c) => (
                    <SelectItem key={c.id} value={c.nameEn}>{c.nameSi} / {c.nameEn}</SelectItem>
                  ))}
                  <SelectItem value="Chicken">Chicken</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-label font-semibold flex items-center gap-2">
                <Drumstick className="h-4 w-4 text-badge-hospital" /> Staff Diet Cycle
              </Label>
              <Select value={staffCycle} onValueChange={(v) => { setStaffCycle(v); setSaved(false); }}>
                <SelectTrigger className="h-12 touch-target"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIET_CYCLES.map((c) => (
                    <SelectItem key={c.id} value={c.nameEn}>{c.nameSi} / {c.nameEn}</SelectItem>
                  ))}
                  <SelectItem value="Chicken">Chicken</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saved} className="h-12 px-8 touch-target">
              <Save className="h-4 w-4 mr-2" /> Save Cycle Selection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDailyCycle;