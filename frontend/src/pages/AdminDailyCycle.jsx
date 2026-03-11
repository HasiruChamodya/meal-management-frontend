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

  return (
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