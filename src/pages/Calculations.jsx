import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { MOCK_WARD_STATUSES, MOCK_AGGREGATED } from "@/lib/calculation-data";
import { CheckCircle2, Clock, Square, Calculator, Loader2, Leaf, Drumstick } from "lucide-react";

const Calculations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);

  const submitted = MOCK_WARD_STATUSES.filter((w) => w.status === "submitted").length;
  const total = MOCK_WARD_STATUSES.length;
  const allSubmitted = submitted === total;
  const pct = Math.round((submitted / total) * 100);
  const agg = MOCK_AGGREGATED;

  const handleRunCalc = () => {
    setIsCalculating(true);
    setTimeout(() => {
      toast({ title: "Calculation Complete", description: "Ingredient requirements have been calculated." });
      navigate("/calculations/results");
    }, 1500);
  };

  const statusIcon = (status) => {
    if (status === "submitted") return <CheckCircle2 className="h-5 w-5 text-primary" />;
    if (status === "draft") return <Clock className="h-5 w-5 text-warning" />;
    return <Square className="h-5 w-5 text-muted-foreground" />;
  };

  const statCards = [
    { label: "Normal", value: agg.normal },
    { label: "Diabetic", value: agg.diabetic },
    { label: "S1", value: agg.s1 },
    { label: "S2", value: agg.s2 },
    { label: "S3", value: agg.s3 },
    { label: "S4", value: agg.s4 },
    { label: "S5", value: agg.s5 },
    { label: "HPD", value: agg.hpd },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-md font-bold text-foreground">Ward Submissions & Calculation</h1>
        <div className="flex items-center gap-2 text-label text-muted-foreground">
          <span>2026-03-02</span>
        </div>
      </div>

      {/* Read-only cycle badges */}
      <Card>
        <CardContent className="pt-4 pb-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-label font-semibold">Patient Cycle:</span>
            <Badge className="bg-primary text-primary-foreground capitalize gap-1.5">
              <Leaf className="h-3.5 w-3.5" /> Vegetable
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label font-semibold">Staff Cycle:</span>
            <Badge className="bg-badge-hospital text-primary-foreground capitalize gap-1.5">
              <Drumstick className="h-3.5 w-3.5" /> Chicken
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground italic ml-auto">Set by Hospital Admin</p>
        </CardContent>
      </Card>

      {/* Submission progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-label font-semibold">Submission Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-label">
            <span>{submitted} / {total} wards submitted</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <Progress value={pct} className="h-3" />
        </CardContent>
      </Card>

      {/* Ward grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {MOCK_WARD_STATUSES.map((w) => (
          <Card key={w.wardId} className={`p-3 ${w.status === "submitted" ? "border-primary/40 bg-primary/5" : w.status === "draft" ? "border-warning/40 bg-warning/5" : ""}`}>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-label font-semibold truncate">{w.wardName}</p>
                <p className="text-xs text-muted-foreground">{w.code}</p>
              </div>
              {statusIcon(w.status)}
            </div>
            {w.status === "submitted" && (
              <p className="text-xs text-primary font-medium mt-1">{w.patientCount} patients</p>
            )}
            {w.status === "draft" && (
              <p className="text-xs text-warning font-medium mt-1">Draft</p>
            )}
          </Card>
        ))}
      </div>

      {/* Aggregated totals */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-label font-semibold">Aggregated Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {statCards.map((s) => (
              <div key={s.label} className="bg-muted rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div className="bg-muted rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">Staff B</p>
              <p className="text-lg font-bold">{agg.staffB}</p>
            </div>
            <div className="bg-muted rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">Staff L</p>
              <p className="text-lg font-bold">{agg.staffL}</p>
            </div>
            <div className="bg-muted rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">Staff D</p>
              <p className="text-lg font-bold">{agg.staffD}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-2 text-center border border-primary/30">
              <p className="text-xs text-primary font-medium">Total Patients</p>
              <p className="text-lg font-bold text-primary">{agg.totalPatients}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-2 text-center border border-primary/30">
              <p className="text-xs text-primary font-medium">Total Staff</p>
              <p className="text-lg font-bold text-primary">{agg.totalStaff}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Run Calculation */}
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                size="lg"
                className="h-14 px-10 text-body font-semibold touch-target"
                disabled={!allSubmitted || isCalculating}
                onClick={handleRunCalc}
              >
                {isCalculating ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Calculating...</>
                ) : (
                  <><Calculator className="mr-2 h-5 w-5" /> Run Calculation</>
                )}
              </Button>
            </span>
          </TooltipTrigger>
          {!allSubmitted && (
            <TooltipContent>All wards must be submitted before running calculation</TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );
};

export default Calculations;