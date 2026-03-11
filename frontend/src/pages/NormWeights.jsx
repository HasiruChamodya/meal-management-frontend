import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MOCK_ADMIN_ITEMS, MOCK_NORM_WEIGHTS } from "@/lib/module-data";
import { Save, Upload, Download } from "lucide-react";

const DIET_COLS = ["normal", "diabetic", "hpd", "s1", "s2", "s3", "s4", "s5", "staff"];
const DIET_LABELS = { normal: "Normal", diabetic: "Diabetic", hpd: "HPD", s1: "S1 (6-12y)", s2: "S2 (2-6y)", s3: "S3 (1-2y)", s4: "S4 (6m-1y)", s5: "S5", staff: "Staff" };
const MEALS = ["breakfast", "lunch", "dinner"];

const NormWeights = () => {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState("1");
  const [weights, setWeights] = useState([...MOCK_NORM_WEIGHTS]);
  const [changed, setChanged] = useState(new Set());

  const item = MOCK_ADMIN_ITEMS.find((i) => String(i.id) === selectedItem);

  const getWeight = (meal, diet) => {
    const w = weights.find((n) => n.itemId === Number(selectedItem) && n.meal === meal);
    return w ? w[diet] || 0 : 0;
  };

  const updateWeight = (meal, diet, value) => {
    if (value < 0) return;
    const key = `${selectedItem}-${meal}-${diet}`;
    setChanged((p) => new Set(p).add(key));
    setWeights((prev) => {
      const idx = prev.findIndex((n) => n.itemId === Number(selectedItem) && n.meal === meal);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [diet]: value };
        return updated;
      }
      const newRow = { itemId: Number(selectedItem), meal, normal: 0, diabetic: 0, hpd: 0, s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, staff: 0 };
      newRow[diet] = value;
      return [...prev, newRow];
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-md font-bold text-foreground">Norm Weight Matrix Editor</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" /> Import CSV</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="max-w-md">
            <Label className="text-label font-semibold">Select Item</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MOCK_ADMIN_ITEMS.map((i) => (
                  <SelectItem key={i.id} value={String(i.id)}>{i.nameSi} / {i.nameEn} ({i.unit})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {item && (
        <Card>
          <CardHeader>
            <CardTitle className="text-label font-semibold">{item.nameSi} / {item.nameEn} — Norm Weights (grams)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Meal</TableHead>
                  {DIET_COLS.map((d) => (
                    <TableHead key={d} className="text-center text-xs font-semibold">{DIET_LABELS[d]}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MEALS.map((meal) => (
                  <TableRow key={meal}>
                    <TableCell className="font-semibold capitalize">{meal}</TableCell>
                    {DIET_COLS.map((diet) => {
                      const key = `${selectedItem}-${meal}-${diet}`;
                      const isChanged = changed.has(key);
                      return (
                        <TableCell key={diet} className={isChanged ? "bg-primary/10" : ""}>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={getWeight(meal, diet) || ""}
                            onChange={(e) => updateWeight(meal, diet, parseFloat(e.target.value) || 0)}
                            className="w-24 h-8 text-right text-sm mx-auto [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            placeholder="0"
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-4">
              <Button onClick={() => { setChanged(new Set()); toast({ title: "Saved", description: "Norm weights updated." }); }}>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NormWeights;