import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RECIPE_DATA, RECIPE_CONVERSION } from "@/lib/module-data";
import { Save } from "lucide-react";

const AdminRecipes = () => {
  const { toast } = useToast();
  const [selected, setSelected] = useState("polSambola");
  const recipe = RECIPE_DATA[selected];

  return (
    <div className="space-y-6">
      <h1 className="text-heading-md font-bold text-foreground">Recipe Formula Editor</h1>

      <Card>
        <CardContent className="pt-4">
          <Select value={selected} onValueChange={(v) => setSelected(v)}>
            <SelectTrigger className="w-64 h-12"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="polSambola">Pol Sambola</SelectItem>
              <SelectItem value="soup">Soup / Kanda</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-label font-semibold">{recipe.name} — Ingredients</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead className="text-right">Norm Per Patient</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipe.ingredients.map((ing, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{ing.name}</TableCell>
                  <TableCell className="text-right">
                    <Input type="number" step="0.01" min={0} defaultValue={ing.normPerPatient} className="w-24 h-8 text-right text-sm ml-auto [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ing.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-label font-semibold">Diet Conversion Factors</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Diet Type</TableHead><TableHead className="text-right">Factor</TableHead></TableRow></TableHeader>
            <TableBody>
              {RECIPE_CONVERSION.map((r) => (
                <TableRow key={r.dietType}>
                  <TableCell className="font-medium">{r.dietType}</TableCell>
                  <TableCell className="text-right">
                    <Input type="number" step="0.01" min={0} defaultValue={r.factor} className="w-24 h-8 text-right text-sm ml-auto [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast({ title: "Recipe Saved" })}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
      </div>
    </div>
  );
};

export default AdminRecipes;