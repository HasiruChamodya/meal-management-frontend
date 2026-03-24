import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const MEALS = ["breakfast", "lunch", "dinner"];

const API_ITEMS = "http://localhost:5050/api/items";
const API_WEIGHTS = "http://localhost:5050/api/norm-weights";
const API_DIET_TYPES = "http://localhost:5050/api/diet-types"; // New fetch!

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

const NormWeights = () => {
  const { toast } = useToast();
  
  const [items, setItems] = useState([]);
  const [dietTypes, setDietTypes] = useState([]);
  const [weights, setWeights] = useState([]);
  
  const [selectedItem, setSelectedItem] = useState("");
  const [changed, setChanged] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load Items, Diet Types, and initial weights
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsRes, weightsRes, dietsRes] = await Promise.all([
          fetch(API_ITEMS, { headers: getAuthHeaders() }),
          fetch(API_WEIGHTS, { headers: getAuthHeaders() }),
          fetch(API_DIET_TYPES, { headers: getAuthHeaders() })
        ]);

        if (!itemsRes.ok || !weightsRes.ok || !dietsRes.ok) throw new Error("Failed to fetch data");

        const itemsData = await itemsRes.json();
        const weightsData = await weightsRes.json();
        const dietsData = await dietsRes.json();

        setItems(itemsData.items || []);
        setWeights(weightsData.weights || []);
        
        // Filter active diets and sort them by the displayOrder set by the Admin
        const activeDiets = (dietsData.dietTypes || [])
          .filter(d => d.active)
          .sort((a, b) => a.displayOrder - b.displayOrder);
          
        setDietTypes(activeDiets);
        
        // Auto-select the first item
        if (itemsData.items?.length > 0) {
          setSelectedItem(String(itemsData.items[0].id));
        }
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const currentItem = items.find((i) => String(i.id) === selectedItem);

  const getWeight = (meal, dietTypeId) => {
    const w = weights.find((n) => n.itemId === Number(selectedItem) && n.meal === meal && n.dietTypeId === dietTypeId);
    return w ? w.weight : 0;
  };

  const updateWeight = (meal, dietTypeId, value) => {
    if (value < 0) return;
    const key = `${selectedItem}-${meal}-${dietTypeId}`;
    
    setChanged((p) => new Set(p).add(key));
    
    setWeights((prev) => {
      const idx = prev.findIndex((n) => n.itemId === Number(selectedItem) && n.meal === meal && n.dietTypeId === dietTypeId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], weight: value };
        return updated;
      }
      
      // If row doesn't exist for this combination yet, add it
      return [...prev, { itemId: Number(selectedItem), dietTypeId, meal, weight: value }];
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Get only the rows associated with the currently selected item
      const itemWeights = weights.filter(w => w.itemId === Number(selectedItem));

      const res = await fetch(`${API_WEIGHTS}/${selectedItem}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ weights: itemWeights }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      setChanged(new Set()); // Clear highlights
      toast({ title: "Saved", description: "Norm weights updated successfully." });
    } catch (error) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-md font-bold text-foreground">Norm Weight Matrix Editor</h1>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="max-w-md">
            <Label className="text-label font-semibold">Select Item</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem} disabled={loading}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={loading ? "Loading items..." : "Select an item"} />
              </SelectTrigger>
              <SelectContent>
                {items.map((i) => (
                  <SelectItem key={i.id} value={String(i.id)}>
                    {i.nameSi} / {i.nameEn} ({i.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {currentItem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-label font-semibold">
              {currentItem.nameSi} / {currentItem.nameEn} — Norm Weights ({currentItem.unit === "Kg" ? "Grams" : currentItem.unit})
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {dietTypes.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No active Diet Types found. Please create some in the Diet Types menu.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold border-r">Meal</TableHead>
                    {dietTypes.map((diet) => (
                      <TableHead key={diet.id} className="text-center text-xs font-semibold whitespace-nowrap px-4">
                        {diet.nameEn}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MEALS.map((meal) => (
                    <TableRow key={meal}>
                      <TableCell className="font-semibold capitalize border-r">{meal}</TableCell>
                      {dietTypes.map((diet) => {
                        const key = `${selectedItem}-${meal}-${diet.id}`;
                        const isChanged = changed.has(key);
                        return (
                          <TableCell key={diet.id} className={isChanged ? "bg-primary/10" : ""}>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={getWeight(meal, diet.id) || ""}
                              onChange={(e) => updateWeight(meal, diet.id, parseFloat(e.target.value) || 0)}
                              className={`w-24 h-8 text-right text-sm mx-auto [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isChanged ? 'border-primary ring-1 ring-primary' : ''}`}
                              placeholder="0"
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} disabled={saving || changed.size === 0 || dietTypes.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NormWeights;