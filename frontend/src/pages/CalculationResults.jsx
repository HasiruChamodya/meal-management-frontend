import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, X } from "lucide-react";
import {
  CALC_RESULTS, VEG_CATEGORIES, MOCK_VEG_ALLOCATIONS
} from "@/lib/calculation-data";

const TAB_LABELS = {
  rice: "Rice & Staples",
  protein: "Protein",
  vegetables: "Vegetables",
  condiments: "Condiments",
  extras: "Extras & Specials",
};

const CalculationResults = () => {
  const [activeTab, setActiveTab] = useState("rice");
  const [breakdownItem, setBreakdownItem] = useState(null);
  const [vegAllocations, setVegAllocations] = useState(
    JSON.parse(JSON.stringify(MOCK_VEG_ALLOCATIONS))
  );

  const addVeg = (catId) => {
    setVegAllocations((prev) => ({
      ...prev,
      [catId]: [...(prev[catId] || []), { vegetable: "", quantityKg: 0 }],
    }));
  };

  const removeVeg = (catId, idx) => {
    setVegAllocations((prev) => ({
      ...prev,
      [catId]: prev[catId].filter((_, i) => i !== idx),
    }));
  };

  const updateVeg = (catId, idx, field, value) => {
    setVegAllocations((prev) => ({
      ...prev,
      [catId]: prev[catId].map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    }));
  };

  const renderTable = (items) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Item (EN)</TableHead>
          <TableHead className="hidden md:table-cell">Item (SI)</TableHead>
          <TableHead className="text-right">Breakfast</TableHead>
          <TableHead className="text-right">Lunch</TableHead>
          <TableHead className="text-right">Dinner</TableHead>
          <TableHead className="text-right font-bold">Grand Total</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="text-muted-foreground">{item.id}</TableCell>
            <TableCell className="font-medium">{item.nameEn}</TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">{item.nameSi}</TableCell>
            <TableCell className="text-right">{item.breakfast != null ? `${item.breakfast} ${item.unit}` : "—"}</TableCell>
            <TableCell className="text-right">{item.lunch != null ? `${item.lunch} ${item.unit}` : "—"}</TableCell>
            <TableCell className="text-right">{item.dinner != null ? `${item.dinner} ${item.unit}` : "—"}</TableCell>
            <TableCell className="text-right font-bold text-primary">{item.grandTotal} {item.unit}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" onClick={() => setBreakdownItem(item)} className="touch-target">
                <Search className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderVegetables = () => (
    <div className="space-y-6">
      {VEG_CATEGORIES.map((cat) => {
        const allocs = vegAllocations[cat.id] || [];
        const allocated = allocs.reduce((s, a) => s + a.quantityKg, 0);
        const pct = Math.min((allocated / cat.requiredKg) * 100, 100);
        const progressColor = allocated > cat.requiredKg ? "text-destructive" : pct >= 80 ? "text-warning" : "text-primary";

        return (
          <Card key={cat.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-label font-semibold">{cat.name}</CardTitle>
                <span className={`text-label font-medium ${progressColor}`}>
                  Allocated: {allocated.toFixed(2)} / {cat.requiredKg} Kg
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={pct} className="h-2" />
              <div className="space-y-2">
                {allocs.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Select value={a.vegetable} onValueChange={(v) => updateVeg(cat.id, idx, "vegetable", v)}>
                      <SelectTrigger className="flex-1 h-10"><SelectValue placeholder="Select vegetable" /></SelectTrigger>
                      <SelectContent>
                        {cat.options.map((o) => (
                          <SelectItem key={o.nameEn} value={o.nameEn}>{o.nameSi} / {o.nameEn}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.001"
                      value={a.quantityKg || ""}
                      onChange={(e) => updateVeg(cat.id, idx, "quantityKg", parseFloat(e.target.value) || 0)}
                      className="w-28 h-10 text-right"
                      placeholder="Kg"
                    />
                    <span className="text-xs text-muted-foreground">Kg</span>
                    <Button variant="ghost" size="icon" onClick={() => removeVeg(cat.id, idx)} className="text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => addVeg(cat.id)}>
                <Plus className="h-4 w-4 mr-1" /> Add Vegetable
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-md font-bold text-foreground">Calculation Results — 2026-03-02</h1>
        <Badge className="bg-primary text-primary-foreground">Calculated</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {Object.keys(TAB_LABELS).map((t) => (
            <TabsTrigger key={t} value={t} className="text-label">{TAB_LABELS[t]}</TabsTrigger>
          ))}
        </TabsList>
        {Object.keys(TAB_LABELS).map((t) => (
          <TabsContent key={t} value={t}>
            <Card>
              <CardContent className="pt-4">
                {t === "vegetables" ? renderVegetables() : renderTable(CALC_RESULTS[t])}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Breakdown Dialog */}
      <Dialog open={!!breakdownItem} onOpenChange={() => setBreakdownItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{breakdownItem?.nameEn} — Breakdown</DialogTitle>
          </DialogHeader>
          {breakdownItem && (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Diet Type</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Norm (g)</TableHead>
                    <TableHead className="text-right">Subtotal (g)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakdownItem.breakdown.map((r) => (
                    <TableRow key={r.dietType}>
                      <TableCell>{r.dietType}</TableCell>
                      <TableCell className="text-right">{r.count}</TableCell>
                      <TableCell className="text-right">{r.normG}</TableCell>
                      <TableCell className="text-right">{r.subtotalG.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center font-semibold text-primary">
                Total = {breakdownItem.breakdown.reduce((s, r) => s + r.subtotalG, 0).toLocaleString()} g
                = {breakdownItem.grandTotal} {breakdownItem.unit}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalculationResults;