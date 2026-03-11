import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ITEM_CATEGORIES } from "@/lib/module-data";
import { Plus } from "lucide-react";

const API_BASE = "http://localhost:5050/api/items";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const UNITS = [
  "Kg",
  "g",
  "One",
  "1 loaf",
  "Cup",
  "Bottle",
  "Pk",
  "100g",
  "400g",
  "1L",
  "180ml",
  "375ml",
  "Pcs",
  "Fruit",
  "Pkt",
];

const DIET_CYCLE_OPTIONS = ["Vegetable", "Egg", "Meat", "Dried Fish", "Fish"];

const VEG_CAT_OPTIONS = [
  { value: "palaa", label: "Palaa / Leaves" },
  { value: "gedi", label: "Gedi / Vegetable Fruits" },
  { value: "piti", label: "Piti / Starchy" },
  { value: "other", label: "Other" },
];

const emptyItem = (categoryId) => ({
  nameEn: "",
  nameSi: "",
  unit: "Kg",
  defaultPrice: 0,
  categoryId: categoryId || 1,
  category: ITEM_CATEGORIES.find((c) => c.id === (categoryId || 1))?.name || "",
  isProtein: false,
  dietCycle: null,
  isVegetable: false,
  vegCategory: null,
  isExtra: false,
  calcType: "norm_weight",
});

const AdminItems = () => {
  const { toast } = useToast();

  const [selectedCat, setSelectedCat] = useState(null);
  const [items, setItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState(emptyItem(null));
  const [isProteinOn, setIsProteinOn] = useState(false);
  const [isVegOn, setIsVegOn] = useState(false);
  const [isExtraOn, setIsExtraOn] = useState(false);
  const [dietCycle, setDietCycle] = useState("Vegetable");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const filtered = selectedCat
    ? items.filter((i) => i.categoryId === selectedCat)
    : items;

  const fetchItems = async () => {
    try {
      setLoading(true);

      const res = await fetch(API_BASE, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch items");
      }

      setItems(data.items || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not load items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openDialog = (catId) => {
    const cat = catId || selectedCat;
    setNewItem(emptyItem(cat));
    setIsProteinOn(false);
    setIsVegOn(false);
    setIsExtraOn(false);
    setDietCycle("Vegetable");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!newItem.nameEn?.trim() || !newItem.nameSi?.trim()) return;

    try {
      setSaving(true);

      const payload = {
        nameEn: newItem.nameEn,
        nameSi: newItem.nameSi,
        unit: newItem.unit || "Kg",
        defaultPrice: newItem.defaultPrice || 0,
        categoryId: newItem.categoryId || 1,
        isProtein: isProteinOn,
        dietCycle: isProteinOn ? dietCycle : null,
        isVegetable: isVegOn,
        vegCategory: isVegOn ? newItem.vegCategory || "other" : null,
        isExtra: isExtraOn,
        calcType: isExtraOn ? newItem.calcType || "raw_sum" : "norm_weight",
      };

      const res = await fetch(API_BASE, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save item");
      }

      const cat = ITEM_CATEGORIES.find((c) => c.id === newItem.categoryId);

      toast({
        title: "Item added successfully",
        description: `${newItem.nameSi} / ${newItem.nameEn} added to ${cat?.name || "category"}`,
      });

      setDialogOpen(false);
      setNewItem(emptyItem(null));
      setIsProteinOn(false);
      setIsVegOn(false);
      setIsExtraOn(false);
      setDietCycle("Vegetable");

      fetchItems();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not save item",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md font-bold text-foreground">
          Item & Category Management
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-64 shrink-0">
          <CardContent className="pt-4 space-y-1">
            <Button
              variant={!selectedCat ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedCat(null)}
            >
              All Items ({items.length})
            </Button>

            {ITEM_CATEGORIES.map((c) => {
              const count = items.filter((i) => i.categoryId === c.id).length;
              return (
                <Button
                  key={c.id}
                  variant={selectedCat === c.id ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setSelectedCat(c.id)}
                >
                  {c.name}
                  <span className="ml-auto text-xs">({count})</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="pt-4 overflow-x-auto">
            <div className="flex justify-end mb-3">
              <Button onClick={() => openDialog()} className="touch-target">
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </div>

            {loading ? (
              <div className="py-6 text-center text-muted-foreground">
                Loading items...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Item (EN)</TableHead>
                    <TableHead>Item (SI)</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Protein</TableHead>
                    <TableHead className="hidden lg:table-cell">Veg Cat.</TableHead>
                    <TableHead>Calc Type</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{item.nameEn}</TableCell>
                      <TableCell className="text-muted-foreground">{item.nameSi}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">
                        Rs. {item.defaultPrice}
                      </TableCell>
                      <TableCell>
                        {item.isProtein && (
                          <Badge className="bg-destructive/20 text-destructive">
                            Yes
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {item.vegCategory && (
                          <Badge className="bg-primary/20 text-primary capitalize">
                            {item.vegCategory}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-muted text-muted-foreground text-xs">
                          {item.calcType === "norm_weight" ? "Norm Weight" : "Raw Sum"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filtered.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                          onClick={() => openDialog(selectedCat || undefined)}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Item
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}

                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-6"
                      >
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-label font-semibold">Category</Label>
              <Select
                value={String(newItem.categoryId)}
                onValueChange={(v) =>
                  setNewItem((p) => ({
                    ...p,
                    categoryId: Number(v),
                    category:
                      ITEM_CATEGORIES.find((c) => c.id === Number(v))?.name || "",
                  }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-label font-semibold">Item Name (English) *</Label>
                <Input
                  value={newItem.nameEn || ""}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, nameEn: e.target.value }))
                  }
                  className="h-11"
                  placeholder="e.g. Rice Nadu"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-label font-semibold">Item Name (Sinhala) *</Label>
                <Input
                  value={newItem.nameSi || ""}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, nameSi: e.target.value }))
                  }
                  className="h-11"
                  placeholder="e.g. හාල්"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-label font-semibold">Unit</Label>
                <Select
                  value={newItem.unit || "Kg"}
                  onValueChange={(v) =>
                    setNewItem((p) => ({ ...p, unit: v }))
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-label font-semibold">Default Price (Rs.)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={newItem.defaultPrice || ""}
                  onChange={(e) =>
                    setNewItem((p) => ({
                      ...p,
                      defaultPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="h-11 text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="space-y-3 border-t pt-3">
              <div className="flex items-center justify-between">
                <Label className="text-label font-semibold">Is Protein Item</Label>
                <Switch checked={isProteinOn} onCheckedChange={setIsProteinOn} />
              </div>

              {isProteinOn && (
                <div className="ml-4 space-y-1.5">
                  <Label className="text-label text-muted-foreground">Diet Cycle</Label>
                  <Select value={dietCycle} onValueChange={setDietCycle}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIET_CYCLE_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-label font-semibold">Is Vegetable</Label>
                <Switch checked={isVegOn} onCheckedChange={setIsVegOn} />
              </div>

              {isVegOn && (
                <div className="ml-4 space-y-1.5">
                  <Label className="text-label text-muted-foreground">
                    Vegetable Category
                  </Label>
                  <Select
                    value={newItem.vegCategory || "other"}
                    onValueChange={(v) =>
                      setNewItem((p) => ({ ...p, vegCategory: v }))
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VEG_CAT_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-label font-semibold">Is Extra Item</Label>
                <Switch checked={isExtraOn} onCheckedChange={setIsExtraOn} />
              </div>

              {isExtraOn && (
                <div className="ml-4 space-y-1.5">
                  <Label className="text-label text-muted-foreground">
                    Calculation Type
                  </Label>
                  <Select
                    value={newItem.calcType || "raw_sum"}
                    onValueChange={(v) =>
                      setNewItem((p) => ({ ...p, calcType: v }))
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw_sum">Raw Sum</SelectItem>
                      <SelectItem value="norm_weight">Norm Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="touch-target"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !newItem.nameEn?.trim() || !newItem.nameSi?.trim()}
              className="touch-target"
            >
              {saving ? "Saving..." : "Save Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminItems;