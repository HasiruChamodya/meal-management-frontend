import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Save, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const MEALS = ["breakfast", "lunch", "dinner"];

const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:5050/api"}`;
const API_ITEMS = `${API_BASE}/items`;
const API_WEIGHTS = `${API_BASE}/norm-weights`;
const API_DIET_TYPES = `${API_BASE}/diet-types`; 

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

// 👇 Updated mapping: Only convert standard bulk weights/volumes.
// Everything else (Pkt, Bottle, 100g, 1 loaf, Pcs, etc.) falls back to its exact name!
const UNIT_TO_BASE_LABEL = {
  "Kg": "g (Grams)",
  "g": "g (Grams)",
  "L": "ml (Milliliters)",
  "ml": "ml (Milliliters)",
};

const getBaseUnitLabel = (displayUnit) => {
  return UNIT_TO_BASE_LABEL[displayUnit] || displayUnit;
};

const NormWeights = () => {
  const { toast } = useToast();
  
  const [items, setItems] = useState([]);
  const [dietTypes, setDietTypes] = useState([]);
  const [weights, setWeights] = useState([]);
  
  const [selectedItem, setSelectedItem] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [changed, setChanged] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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

        // Only show items that use norm_weight calculation (exclude raw_sum extras)
        const filteredItems = (itemsData.items || []).filter((i) => i.calcType !== "raw_sum");
        setItems(filteredItems);
        setWeights(weightsData.weights || []);
        
        // Filter active diets and sort them by the displayOrder set by the Admin
        const activeDiets = (dietsData.dietTypes || [])
          .filter(d => d.active)
          .sort((a, b) => a.displayOrder - b.displayOrder);
          
        setDietTypes(activeDiets);
        
        // Auto-select the first item
        if (filteredItems.length > 0) {
          setSelectedItem(String(filteredItems[0].id));
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

  // Alphabetically sort items for the dropdown
  const sortedItems = [...items].sort((a, b) => 
    (a.nameEn || "").localeCompare(b.nameEn || "")
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-md font-bold text-foreground">Norm Weight Matrix Editor</h1>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="max-w-md space-y-2">
            <Label className="text-label font-semibold">Select Item</Label>
            
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={searchOpen}
                  className="w-full justify-between h-12 text-base touch-target border-slate-300 focus:ring-primary/20"
                  disabled={loading}
                >
                  <span className="truncate pr-2">
                    {currentItem 
                      ? `${currentItem.nameEn} (${currentItem.nameSi}) — ${currentItem.unit}`
                      : loading ? "Loading items..." : "Search and select an item..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-xl border border-slate-300 z-50 bg-background" align="start">
                <Command>
                  <CommandInput placeholder="Search item by English or Sinhala name..." className="h-11 text-base border-none focus:ring-0" />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty className="py-6 text-center text-base">No item found.</CommandEmpty>
                    <CommandGroup>
                      {sortedItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={`${item.nameEn} ${item.nameSi}`}
                          onSelect={() => {
                            setSelectedItem(String(item.id));
                            setSearchOpen(false);
                          }}
                          className="text-base py-2.5 cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-3 h-5 w-5 text-primary flex-shrink-0",
                              selectedItem === String(item.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">
                            {item.nameEn} <span className="text-muted-foreground ml-1">({item.nameSi})</span>
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

          </div>
        </CardContent>
      </Card>

      {currentItem && (
        <Card>
          <CardHeader>
            {/* 👇 Updated Title to show the exact required input unit */}
            <CardTitle className="text-label font-semibold flex items-center flex-wrap gap-2">
              {currentItem.nameSi} / {currentItem.nameEn} — Norm Weights
              <span className="text-primary bg-primary/10 px-2 py-1 rounded-md text-sm">
                (Enter in: {getBaseUnitLabel(currentItem.unit)})
              </span>
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