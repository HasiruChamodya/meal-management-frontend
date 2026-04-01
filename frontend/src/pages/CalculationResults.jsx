import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, FileText, ClipboardList } from "lucide-react";
import { getTodaySL } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const API_BASE = "http://localhost:5050/api";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const today = getTodaySL();

const CalculationResults = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [generatingPO, setGeneratingPO] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [breakdownItem, setBreakdownItem] = useState(null);
  const [breakdownData, setBreakdownData] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  const [calcRun, setCalcRun] = useState(null);
  const [tabs, setTabs] = useState({});
  const [categories, setCategories] = useState([]);
  const [poLineItems, setPoLineItems] = useState([]);

  const [allItemsByCategory, setAllItemsByCategory] = useState({});
  const [flatItems, setFlatItems] = useState([]); 

  const [recipeResults, setRecipeResults] = useState([]);
  
  // Start completely empty so the clerk has 100% control
  const [selections, setSelections] = useState({});

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        const [calcRes, itemsRes] = await Promise.all([
          fetch(`${API_BASE}/calculations/results?date=${today}`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/items`, { headers: getAuthHeaders() }),
        ]);

        const calcData = await calcRes.json();
        const itemsData = await itemsRes.json();

        if (!calcRes.ok) throw new Error(calcData.message || "No calculation results found");

        setCalcRun(calcData.run);
        setTabs(calcData.tabs || {});
        const cats = calcData.categories || [];
        setCategories(cats);
        if (cats.length > 0) setActiveTab(String(cats[0].id));

        setRecipeResults(calcData.recipeResults || []);
        setPoLineItems(calcData.poLineItems || []);

        const items = itemsData.items || [];
        setFlatItems(items);

        // Group ALL items by categoryId, and duplicate Extras into their own tab
        const grouped = {};
        const extrasList = [];

        for (const item of items) {
          const catId = String(item.categoryId);
          if (!grouped[catId]) grouped[catId] = [];
          
          const itemObj = {
            id: item.id,
            nameEn: item.nameEn,
            nameSi: item.nameSi,
            unit: item.unit,
            defaultPrice: item.defaultPrice || 0,
            categoryId: item.categoryId,
            isExtra: item.isExtra || false
          };
          
          grouped[catId].push(itemObj);

          if (item.isExtra) {
              extrasList.push(itemObj);
          }
        }
        grouped['extras'] = extrasList;
        setAllItemsByCategory(grouped);

        // Explicitly start with no auto-selections
        setSelections({});

      } catch (error) {
        toast({ title: "Error", description: error.message || "Failed to load calculation results", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [toast]);

  const fetchBreakdown = async (item) => {
    setBreakdownItem(item);
    setLoadingBreakdown(true);
    try {
      const res = await fetch(`${API_BASE}/calculations/breakdown/${item.id}?date=${today}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch breakdown");
      setBreakdownData(data);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setBreakdownData(null);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const toggleItemSelection = (item, defaultQty) => {
    setSelections((prev) => {
      const existing = prev[item.id];
      if (existing?.selected) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return {
        ...prev,
        [item.id]: { selected: true, quantity: defaultQty || 0, unit: item.unit || "Kg", customPrice: null },
      };
    });
  };

  const updateSelectionQuantity = (itemId, quantity) => {
    setSelections((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], quantity: parseFloat(quantity) || 0 },
    }));
  };

  const handleGeneratePO = async () => {
    setGeneratingPO(true);
    try {
      const finalSelectedItems = [];
      
      // Pull EXACTLY what the user ticked in the UI boxes. No hidden items.
      for (const [itemId, sel] of Object.entries(selections)) {
        if (sel.selected && sel.quantity > 0) {
           const itemInfo = flatItems.find(i => String(i.id) === String(itemId));
           if (itemInfo) {
               finalSelectedItems.push({
                   itemId: itemInfo.id,
                   categoryId: itemInfo.categoryId,
                   quantity: sel.quantity,
                   unit: itemInfo.unit,
                   unitPrice: itemInfo.defaultPrice,
                   defaultPrice: itemInfo.defaultPrice,
                   forBreakfast: true,
                   forLunch: true,
                   forDinner: true,
                   forExtra: itemInfo.isExtra || false,
                   forKanda: false,
               });
           }
        }
      }

      if (finalSelectedItems.length === 0) {
        toast({ title: "No items to order", description: "Please select items via the checkboxes.", variant: "destructive" });
        setGeneratingPO(false);
        return;
      }

      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          date: calcRun.date || today,
          calcRunId: calcRun.id,
          items: finalSelectedItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.existingId) {
          toast({ title: "PO Already Exists", description: "Navigating to existing purchase order." });
          navigate(`/orders/${data.existingId}`);
          return;
        }
        throw new Error(data.message || "Failed to create purchase order");
      }

      toast({ title: "Purchase Order Created", description: `PO #${data.po.billNumber} created successfully.` });
      navigate(`/orders/${data.po.id}`);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setGeneratingPO(false);
    }
  };

  const renderCalculatedTable = (items) => {
    // 👇 Auto-Sort Calculated Items Alphabetically
    const sortedItems = [...items].sort((a, b) => (a.nameEn || "").localeCompare(b.nameEn || ""));

    return (
      <Table>
        <TableHeader>
          {/* 👇 Upgraded Header Typography & Alignment */}
          <TableRow className="text-lg bg-muted/30">
            <TableHead className="w-12 text-center font-semibold text-foreground py-4">#</TableHead>
            <TableHead className="text-center font-semibold text-foreground py-4">Item (EN)</TableHead>
            <TableHead className="hidden md:table-cell text-center font-semibold text-foreground py-4">Item (SI)</TableHead>
            <TableHead className="text-center font-semibold text-foreground py-4">Breakfast</TableHead>
            <TableHead className="text-center font-semibold text-foreground py-4">Lunch</TableHead>
            <TableHead className="text-center font-semibold text-foreground py-4">Dinner</TableHead>
            <TableHead className="text-center font-bold text-foreground py-4">Grand Total</TableHead>
            <TableHead className="w-16 text-center font-semibold text-foreground py-4">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 👇 Upgraded Row Typography & Alignment */}
          {sortedItems.map((item, idx) => (
            <TableRow key={item.id} className="text-lg hover:bg-muted/50 transition-colors">
              <TableCell className="text-muted-foreground py-5 text-center">{idx + 1}</TableCell>
              <TableCell className="font-medium py-5 text-center">{item.nameEn}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground py-5 text-center">{item.nameSi}</TableCell>
              <TableCell className="text-center py-5">{item.breakfast != null ? `${item.breakfast} ${item.unit}` : "—"}</TableCell>
              <TableCell className="text-center py-5">{item.lunch != null ? `${item.lunch} ${item.unit}` : "—"}</TableCell>
              <TableCell className="text-center py-5">{item.dinner != null ? `${item.dinner} ${item.unit}` : "—"}</TableCell>
              <TableCell className="text-center font-bold text-primary py-5">{item.grandTotal} {item.unit}</TableCell>
              <TableCell className="py-5 text-center">
                {item.breakdown && item.breakdown.length > 0 && (
                  <div className="flex justify-center">
                    <Button variant="ghost" size="icon" onClick={() => fetchBreakdown(item)} className="touch-target h-8 w-8">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {sortedItems.length === 0 && (
            <TableRow><TableCell colSpan={8} className="text-center text-lg text-muted-foreground py-8">No items calculated for this category</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  const renderSelectionTable = (catId, catName) => {
    // 👇 Auto-Sort Selection Options Alphabetically
    const options = [...(allItemsByCategory[catId] || [])].sort((a, b) => (a.nameEn || "").localeCompare(b.nameEn || ""));
    const selectedCount = options.filter((o) => selections[o.id]?.selected).length;

    if (options.length === 0) return null;

    return (
      <Card className="mt-6 border-primary/20">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-heading-sm">Select Items to Order — {catName}</CardTitle>
            {selectedCount > 0 && (<span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{selectedCount} item{selectedCount > 1 ? "s" : ""} selected</span>)}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              {/* 👇 Upgraded Header Typography & Alignment */}
              <TableRow className="text-lg">
                <TableHead className="w-16 text-center font-semibold text-foreground py-4">Order</TableHead>
                <TableHead className="text-center font-semibold text-foreground py-4">Item (EN)</TableHead>
                <TableHead className="hidden md:table-cell text-center font-semibold text-foreground py-4">Item (SI)</TableHead>
                <TableHead className="text-center font-semibold text-foreground py-4">Unit</TableHead>
                <TableHead className="text-center font-semibold text-foreground py-4">Unit Price (Rs)</TableHead>
                <TableHead className="text-center font-semibold text-foreground py-4 w-40">Quantity</TableHead>
                <TableHead className="text-center font-semibold text-foreground py-4">Total (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 👇 Upgraded Row Typography, Inputs & Alignment */}
              {options.map((item) => {
                const isSelected = selections[item.id]?.selected || false;
                const qty = selections[item.id]?.quantity || 0;
                const totalPrice = Math.round(qty * item.defaultPrice * 100) / 100;

                const calculatedItem = poLineItems.find((po) => String(po.itemId) === String(item.id));
                let suggestedQty = calculatedItem ? calculatedItem.calculatedQty : 0;
                
                if (suggestedQty === 0 && item.isExtra && calcRun?.extrasTotals) {
                    suggestedQty = Number(calcRun.extrasTotals[item.nameEn]) || 0;
                }

                return (
                  <TableRow key={item.id} className={cn("text-lg transition-colors", isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "opacity-80 hover:bg-muted/30")}>
                    <TableCell className="py-5 text-center">
                      <div className="flex justify-center">
                        <Checkbox className="h-5 w-5" checked={isSelected} onCheckedChange={() => toggleItemSelection(item, suggestedQty)} />
                      </div>
                    </TableCell>
                    <TableCell className={`py-5 text-center font-medium ${isSelected ? "" : "text-muted-foreground"}`}>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span>{item.nameEn}</span>
                        {/* 👇 Larger, clearer Guidance Badge */}
                        {suggestedQty > 0 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-warning/10 text-warning border-warning/40 font-bold whitespace-nowrap gap-1.5">
                            <ClipboardList className="h-3.5 w-3.5" /> Requested: {suggestedQty}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground py-5 text-center">{item.nameSi}</TableCell>
                    <TableCell className="text-muted-foreground py-5 text-center">{item.unit}</TableCell>
                    <TableCell className="py-5 text-center">Rs. {item.defaultPrice.toLocaleString()}</TableCell>
                    <TableCell className="py-5 text-center">
                      {isSelected ? (
                        <div className="flex justify-center">
                          <Input 
                            type="number" 
                            step="0.001" 
                            min={0} 
                            value={qty === 0 ? "" : qty} 
                            placeholder={suggestedQty > 0 ? String(suggestedQty) : "0"} 
                            onChange={(e) => updateSelectionQuantity(item.id, e.target.value)} 
                            className="w-32 h-11 text-center text-lg font-semibold border-slate-300 focus:border-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
                          />
                        </div>
                      ) : (<span className="text-muted-foreground">—</span>)}
                    </TableCell>
                    <TableCell className="py-5 text-center font-bold">
                      {isSelected && qty > 0 ? (<span className="text-primary">Rs. {totalPrice.toLocaleString()}</span>) : (<span className="text-muted-foreground">—</span>)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {selectedCount > 0 && (
                <TableRow className="bg-primary/10 text-lg border-t-2 border-primary/20">
                  <TableCell colSpan={6} className="text-right text-primary font-bold py-5">Category Price Subtotal:</TableCell>
                  <TableCell className="text-center text-primary font-bold py-5 text-xl">
                    Rs. {Math.round(options.filter((o) => selections[o.id]?.selected).reduce((sum, o) => sum + (selections[o.id]?.quantity || 0) * o.defaultPrice, 0) * 100) / 100}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Loading calculation results...</span>
      </div>
    );
  }

  if (!calcRun) {
    return (
      <div className="text-center py-16 text-lg text-muted-foreground">
        No calculation results found for today. Run the calculation from the Calculations page.
      </div>
    );
  }

  let grandTotal = 0;
  const processedItemIds = new Set();

  for (const [catId, catItems] of Object.entries(allItemsByCategory)) {
     for (const item of catItems) {
         if (selections[item.id]?.selected && !processedItemIds.has(item.id)) {
             grandTotal += (selections[item.id].quantity || 0) * item.defaultPrice;
             processedItemIds.add(item.id);
         }
     }
  }
  grandTotal = Math.round(grandTotal * 100) / 100;

  // 👇 Sort recipes alphabetically
  const sortedRecipes = [...recipeResults].sort((a, b) => (a.recipeName || "").localeCompare(b.recipeName || ""));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-lg font-bold text-foreground">Calculation Results — {calcRun.date}</h1>
        <div className="flex items-center gap-3">
          <Badge className="bg-success text-success-foreground hover:bg-success border-transparent text-base px-4 py-2 capitalize">{calcRun.status}</Badge>
          {grandTotal > 0 && (<Badge className="bg-badge-hospital text-primary-foreground text-base px-4 py-2">Grand Total: Rs. {grandTotal.toLocaleString()}</Badge>)}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
        <TabsList className="flex flex-wrap h-auto gap-2 mb-4">
          {categories.map((cat) => {
            const catId = String(cat.id);
            const catItems = allItemsByCategory[catId] || [];
            const uniqueCatItems = Array.from(new Map(catItems.map(i => [i.id, i])).values());
            const selectedCount = uniqueCatItems.filter((o) => selections[o.id]?.selected).length;
            
            return (
              <TabsTrigger key={cat.id} value={catId} className="text-base h-11 px-5 gap-2 touch-target data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {cat.name}
                {selectedCount > 0 && (<span className="bg-background text-foreground text-xs font-bold rounded-full px-2 py-0.5">{selectedCount}</span>)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((cat) => {
          const catId = String(cat.id);
          const catItems = tabs[catId] || [];

          return (
            <TabsContent key={cat.id} value={catId}>
              <Card>
                <CardHeader className="pb-3 border-b bg-muted/10"><CardTitle className="text-heading-sm">Calculated Requirements</CardTitle></CardHeader>
                <CardContent className="pt-0 px-0 sm:px-6">{renderCalculatedTable(catItems)}</CardContent>
              </Card>
              {renderSelectionTable(catId, cat.name)}
            </TabsContent>
          );
        })}
      </Tabs>

      {sortedRecipes.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-heading-md font-bold text-foreground mb-4">Special Requests — Recipe Calculations</h2>
          {sortedRecipes.map((recipe) => {
            // 👇 Sort ingredients inside the recipe alphabetically
            const sortedIngredients = [...(recipe.ingredients || [])].sort((a, b) => (a.nameEn || "").localeCompare(b.nameEn || ""));

            return (
              <Card key={recipe.recipeId} className="border-primary/20">
                <CardHeader className="pb-3 bg-muted/10 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-heading-sm">{recipe.recipeName}</CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-muted text-muted-foreground text-base px-3 py-1 hover:bg-muted">{recipe.rawPatientCount} patients requested</Badge>
                      <Badge className="bg-primary text-primary-foreground text-base px-3 py-1">Weighted count: {recipe.weightedCount}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-0 sm:px-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-lg">
                        <TableHead className="w-12 text-center font-semibold text-foreground py-4">#</TableHead>
                        <TableHead className="text-center font-semibold text-foreground py-4">Ingredient (EN)</TableHead>
                        <TableHead className="hidden md:table-cell text-center font-semibold text-foreground py-4">Ingredient (SI)</TableHead>
                        <TableHead className="text-center font-semibold text-foreground py-4">Norm / Patient</TableHead>
                        <TableHead className="text-center font-bold text-foreground py-4">Total Quantity</TableHead>
                        <TableHead className="text-center font-semibold text-foreground py-4">Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedIngredients.map((ing, idx) => (
                        <TableRow key={idx} className="text-lg hover:bg-muted/50 transition-colors">
                          <TableCell className="text-muted-foreground py-5 text-center">{idx + 1}</TableCell>
                          <TableCell className="font-medium py-5 text-center">{ing.nameEn}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground py-5 text-center">{ing.nameSi}</TableCell>
                          <TableCell className="py-5 text-center">{ing.normPerPatient}</TableCell>
                          <TableCell className="font-bold text-primary py-5 text-center text-xl">{ing.qty}</TableCell>
                          <TableCell className="text-muted-foreground py-5 text-center">{ing.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur border-t-2 border-primary/20 py-4 -mx-4 px-4 md:-mx-6 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-base text-muted-foreground font-medium">{processedItemIds.size} items manually selected across all categories</p>
          <p className="text-2xl font-bold text-primary mt-1">Grand Total: Rs. {grandTotal.toLocaleString()}</p>
        </div>
        <Button size="lg" className="h-14 px-10 text-lg font-bold touch-target shadow-md hover:shadow-lg transition-all" disabled={generatingPO || processedItemIds.size === 0} onClick={handleGeneratePO}>
          {generatingPO ? (<><Loader2 className="h-6 w-6 mr-3 animate-spin" /> Generating PO...</>) : (<><FileText className="h-6 w-6 mr-3" /> Generate Purchase Order</>)}
        </Button>
      </div>

      <Dialog open={!!breakdownItem} onOpenChange={() => { setBreakdownItem(null); setBreakdownData(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-2xl">{breakdownItem?.nameEn} — Breakdown</DialogTitle></DialogHeader>
          {loadingBreakdown ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : breakdownData ? (
            <div className="space-y-6 mt-2">
              <Table>
                <TableHeader>
                  <TableRow className="text-lg">
                    <TableHead className="font-semibold text-foreground text-center py-3">Diet Type</TableHead>
                    <TableHead className="font-semibold text-foreground text-center py-3">Total (g)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakdownData.breakdown.map((r) => (
                    <TableRow key={r.code} className="text-lg">
                      <TableCell className="py-4 text-center font-medium">{r.dietType}</TableCell>
                      <TableCell className="py-4 text-center">{r.totalG.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 bg-primary/10 rounded-xl text-center text-xl font-bold text-primary border border-primary/20">
                Grand Total: {breakdownItem?.grandTotal} {breakdownItem?.unit}
              </div>
            </div>
          ) : (<p className="text-muted-foreground text-center py-8 text-lg">No breakdown data available</p>)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalculationResults;