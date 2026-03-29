import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, FolderPlus } from "lucide-react";

const API_BASE = "http://localhost:5050/api";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const DEFAULT_UNITS = [
  "Kg", "g", "One", "1 loaf", "Cup", "Bottle", "Pk",
  "100g", "400g", "L", "180ml", "375ml", "Pcs", "Fruit", "Pkt",
];

// Vegetable categories are derived from the categories list at runtime
// Any category that contains "vegetable", "palaa", "gedi", "piti" in its name
// is considered a vegetable category. New categories added by the admin
// will also appear if they are assigned as veg categories to items.

const AdminItems = () => {
  const { toast } = useToast();

  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([...DEFAULT_UNITS]);
  const [dietCycles, setDietCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [isProteinOn, setIsProteinOn] = useState(false);
  const [isVegOn, setIsVegOn] = useState(false);
  const [isExtraOn, setIsExtraOn] = useState(false);
  const [dietCycle, setDietCycle] = useState("");

  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "" });
  const [editingCat, setEditingCat] = useState(null);

  const [deleteCatDialog, setDeleteCatDialog] = useState(null);

  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch categories");
      setCategories(data.categories || []);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/items`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch items");
      setItems(data.items || []);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchDietCycles = async () => {
    try {
      const res = await fetch(`${API_BASE}/diet-cycles`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch diet cycles");
      setDietCycles((data.cycles || []).filter((c) => c.active));
    } catch (error) {
      console.error("Failed to fetch diet cycles:", error);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchItems(), fetchDietCycles()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const filtered = selectedCat
    ? items.filter((i) => i.categoryId === selectedCat)
    : items;

  // Build vegetable category options dynamically from:
  // 1. Categories whose name contains vegetable-related keywords
  // 2. Any unique vegCategory values already used by existing items
  const vegCatOptions = (() => {
    const options = new Map();

    // From categories — any category with "vegetable", "palaa", "gedi", "piti" in name
    const vegKeywords = ["vegetable", "palaa", "gedi", "piti", "pishta", "elawalu"];
    for (const cat of categories) {
      const nameLower = (cat.name || "").toLowerCase();
      if (vegKeywords.some((kw) => nameLower.includes(kw))) {
        // Create a short key from the category name
        let key = nameLower;
        if (nameLower.includes("palaa")) key = "palaa";
        else if (nameLower.includes("gedi") || nameLower.includes("elawalu")) key = "gedi";
        else if (nameLower.includes("piti") || nameLower.includes("pishta") || nameLower.includes("starchy")) key = "piti";
        else if (nameLower.includes("other")) key = "other";
        else key = nameLower.replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

        options.set(key, { value: key, label: cat.name, categoryId: cat.id });
      }
    }

    // From existing items — pick up any vegCategory values not already in the list
    for (const item of items) {
      if (item.vegCategory && !options.has(item.vegCategory)) {
        options.set(item.vegCategory, {
          value: item.vegCategory,
          label: item.vegCategory.charAt(0).toUpperCase() + item.vegCategory.slice(1),
        });
      }
    }

    // If nothing was found, add a default "other"
    if (options.size === 0) {
      options.set("other", { value: "other", label: "Other" });
    }

    return Array.from(options.values());
  })();

  // ─── Category CRUD ───
  const openAddCategory = () => {
    setEditingCat(null);
    setCatForm({ name: "" });
    setCatDialogOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name });
    setCatDialogOpen(true);
  };

  const saveCategory = async () => {
    if (!catForm.name?.trim()) return;
    try {
      setSaving(true);
      const url = editingCat
        ? `${API_BASE}/categories/${editingCat.id}`
        : `${API_BASE}/categories`;
      const method = editingCat ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: catForm.name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save category");

      toast({
        title: editingCat ? "Category Updated" : "Category Added",
        description: `${catForm.name} saved successfully`,
      });
      setCatDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (cat) => {
    try {
      const res = await fetch(`${API_BASE}/categories/${cat.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete category");

      toast({ title: "Category Deleted", description: `${cat.name} removed` });
      setDeleteCatDialog(null);
      if (selectedCat === cat.id) setSelectedCat(null);
      fetchCategories();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // ─── Item CRUD ───
  const emptyItem = (categoryId) => ({
    nameEn: "", nameSi: "", unit: "Kg", defaultPrice: 0,
    categoryId: categoryId || selectedCat || (categories[0]?.id) || 1,
    isProtein: false, dietCycle: null, isVegetable: false,
    vegCategory: null, isExtra: false, calcType: "norm_weight",
  });

  const openItemDialog = (catId) => {
    setEditingItem(null);
    setNewItem(emptyItem(catId));
    setIsProteinOn(false);
    setIsVegOn(false);
    setIsExtraOn(false);
    setDietCycle(dietCycles.length > 0 ? dietCycles[0].nameEn : "");
    setItemDialogOpen(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      nameEn: item.nameEn,
      nameSi: item.nameSi,
      unit: item.unit,
      defaultPrice: item.defaultPrice,
      categoryId: item.categoryId,
      vegCategory: item.vegCategory,
      calcType: item.calcType,
    });
    setIsProteinOn(item.isProtein || false);
    setIsVegOn(item.isVegetable || false);
    setIsExtraOn(item.isExtra || false);
    setDietCycle(item.dietCycle || (dietCycles.length > 0 ? dietCycles[0].nameEn : ""));
    setItemDialogOpen(true);
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.nameSi} / ${item.nameEn}"? This will deactivate the item.`)) return;
    try {
      const res = await fetch(`${API_BASE}/items/${item.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete item");
      toast({ title: "Item Removed", description: `${item.nameEn} deactivated` });
      fetchItems();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveItem = async () => {
    if (!newItem.nameEn?.trim() || !newItem.nameSi?.trim()) return;
    try {
      setSaving(true);
      const payload = {
        nameEn: newItem.nameEn,
        nameSi: newItem.nameSi,
        unit: newItem.unit || "Kg",
        defaultPrice: newItem.defaultPrice || 0,
        categoryId: newItem.categoryId,
        isProtein: isProteinOn,
        dietCycle: isProteinOn ? dietCycle : null,
        isVegetable: isVegOn,
        vegCategory: isVegOn ? newItem.vegCategory || (vegCatOptions[0]?.value) || "other" : null,
        isExtra: isExtraOn,
        calcType: isExtraOn ? newItem.calcType || "raw_sum" : "norm_weight",
      };

      const url = editingItem ? `${API_BASE}/items/${editingItem.id}` : `${API_BASE}/items`;
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save item");

      toast({
        title: editingItem ? "Item Updated" : "Item Added",
        description: `${newItem.nameSi} / ${newItem.nameEn} saved successfully`,
      });

      setItemDialogOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addCustomUnit = () => {
    if (!newUnit.trim()) return;
    if (units.includes(newUnit.trim())) {
      toast({ title: "Unit exists", description: `"${newUnit}" is already in the list` });
      return;
    }
    setUnits((prev) => [...prev, newUnit.trim()]);
    toast({ title: "Unit Added", description: `"${newUnit}" added to unit options` });
    setNewUnit("");
    setUnitDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md font-bold text-foreground">
          Item & Category Management
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* ─── Category Sidebar ─── */}
        <Card className="md:w-82 shrink-0">
          <CardContent className="pt-4 space-y-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-label font-semibold text-muted-foreground">Categories</span>
              <Button size="sm" onClick={openAddCategory}>
                <FolderPlus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <Button
              variant={!selectedCat ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedCat(null)}
            >
              All Items ({items.length})
            </Button>

            {categories.map((c) => {
              const count = items.filter((i) => i.categoryId === c.id).length;
              const isActive = selectedCat === c.id;
              return (
                <div key={c.id} className="flex items-center">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="flex-1 justify-start text-sm"
                    onClick={() => setSelectedCat(c.id)}
                  >
                    {c.name}
                    <span className="ml-auto text-xs">({count})</span>
                  </Button>
                  <div className="flex gap-0.5 shrink-0">
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); openEditCategory(c); }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => { e.stopPropagation(); setDeleteCatDialog(c); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ─── Items Table ─── */}
        <Card className="flex-1">
          <CardContent className="pt-4 overflow-x-auto">
            <div className="flex justify-end mb-3">
              <Button onClick={() => openItemDialog()} className="touch-target">
                <Plus className="h-4 w-4 mr-2" /> Add New Item
              </Button>
            </div>

            {loading ? (
              <div className="py-6 text-center text-muted-foreground">Loading items...</div>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{item.nameEn}</TableCell>
                      <TableCell className="text-muted-foreground">{item.nameSi}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">Rs. {item.defaultPrice}</TableCell>
                      <TableCell>
                        {item.isProtein && (
                          <Badge className="bg-destructive/20 text-destructive">
                            {item.dietCycle || "Yes"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {item.vegCategory && (
                          <Badge className="bg-primary/20 text-primary capitalize">{item.vegCategory}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-muted text-muted-foreground text-xs">
                          {item.calcType === "norm_weight" ? "Norm Weight" : "Raw Sum"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditItem(item)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem(item)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filtered.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        <Button variant="ghost" size="sm" className="text-primary"
                          onClick={() => openItemDialog(selectedCat || undefined)}>
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}

                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
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

      {/* ─── Add/Edit Category Dialog ─── */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCat ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-label font-semibold">Category Name</Label>
              <Input
                value={catForm.name}
                onChange={(e) => setCatForm({ name: e.target.value })}
                className="h-11"
                placeholder="e.g. Rice / Bread / Noodles"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCategory} disabled={saving || !catForm.name?.trim()}>
              {saving ? "Saving..." : editingCat ? "Update" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Category Confirmation ─── */}
      <Dialog open={!!deleteCatDialog} onOpenChange={() => setDeleteCatDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteCatDialog?.name}"?
              This will fail if there are items still assigned to this category.
              Move or delete those items first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCatDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteCategory(deleteCatDialog)}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add/Edit Item Dialog ─── */}
      <Dialog open={itemDialogOpen} onOpenChange={(open) => { setItemDialogOpen(open); if (!open) setEditingItem(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-label font-semibold">Category</Label>
              <Select
                value={String(newItem.categoryId || "")}
                onValueChange={(v) => setNewItem((p) => ({ ...p, categoryId: Number(v) }))}
              >
                <SelectTrigger className="h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-label font-semibold">Item Name (English) *</Label>
                <Input value={newItem.nameEn || ""} onChange={(e) => setNewItem((p) => ({ ...p, nameEn: e.target.value }))}
                  className="h-11" placeholder="e.g. Rice Nadu" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-label font-semibold">Item Name (Sinhala) *</Label>
                <Input value={newItem.nameSi || ""} onChange={(e) => setNewItem((p) => ({ ...p, nameSi: e.target.value }))}
                  className="h-11" placeholder="e.g. හාල්" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-label font-semibold">Unit</Label>
                <div className="flex gap-2">
                  <Select value={newItem.unit || "Kg"} onValueChange={(v) => setNewItem((p) => ({ ...p, unit: v }))}>
                    <SelectTrigger className="h-11 flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="h-11 w-11 shrink-0"
                    onClick={() => setUnitDialogOpen(true)} title="Add custom unit">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-label font-semibold">Default Price (Rs.)</Label>
                <Input type="number" min={0} step="0.01" value={newItem.defaultPrice || ""}
                  onChange={(e) => setNewItem((p) => ({ ...p, defaultPrice: parseFloat(e.target.value) || 0 }))}
                  className="h-11 text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
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
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select diet cycle" /></SelectTrigger>
                    <SelectContent>
                      {dietCycles.map((c) => (
                        <SelectItem key={c.id} value={c.nameEn}>
                          {c.nameSi ? `${c.nameSi} / ` : ""}{c.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {dietCycles.length === 0 && (
                    <p className="text-xs text-destructive">No diet cycles found. Add them in Diet Cycles page first.</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-label font-semibold">Is Vegetable</Label>
                <Switch checked={isVegOn} onCheckedChange={setIsVegOn} />
              </div>
              {isVegOn && (
                <div className="ml-4 space-y-1.5">
                  <Label className="text-label text-muted-foreground">Vegetable Category</Label>
                  <Select value={newItem.vegCategory || ""} onValueChange={(v) => setNewItem((p) => ({ ...p, vegCategory: v }))}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select vegetable category" /></SelectTrigger>
                    <SelectContent>
                      {vegCatOptions.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {vegCatOptions.length === 0 && (
                    <p className="text-xs text-destructive">No vegetable categories found. Create vegetable categories first.</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-label font-semibold">Is Extra Item</Label>
                <Switch checked={isExtraOn} onCheckedChange={setIsExtraOn} />
              </div>
              {isExtraOn && (
                <div className="ml-4 space-y-1.5">
                  <Label className="text-label text-muted-foreground">Calculation Type</Label>
                  <Select value={newItem.calcType || "raw_sum"} onValueChange={(v) => setNewItem((p) => ({ ...p, calcType: v }))}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
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
            <Button variant="outline" onClick={() => { setItemDialogOpen(false); setEditingItem(null); }} className="touch-target">
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={saving || !newItem.nameEn?.trim() || !newItem.nameSi?.trim()} className="touch-target">
              {saving ? "Saving..." : editingItem ? "Update Item" : "Save Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Custom Unit Dialog ─── */}
      <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Custom Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-label font-semibold">Unit Name</Label>
              <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)}
                className="h-11" placeholder="e.g. 500ml, 250g, Tray" />
            </div>
            <p className="text-xs text-muted-foreground">
              Custom units are added to the dropdown for this session.
              For permanent units, contact the system administrator.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>Cancel</Button>
            <Button onClick={addCustomUnit} disabled={!newUnit.trim()}>Add Unit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminItems;