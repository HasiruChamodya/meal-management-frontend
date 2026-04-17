import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ITEM_CATEGORIES } from "@/lib/module-data";
import { AlertTriangle, Search, Save } from "lucide-react";

const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:5050/api"}/items`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const getCategoryName = (id) => {
  const cat = ITEM_CATEGORIES.find((c) => c.id === id);
  return cat ? cat.name : "Uncategorized";
};

const AccountantPriceManagement = () => {
  const { toast } = useToast();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [search, setSearch] = useState("");
  const [draftPrices, setDraftPrices] = useState({}); // Stores { itemId: newPrice }

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, { headers: getAuthHeaders() });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch items");

      setItems(data.items || []);
      setDraftPrices({}); // Reset drafts on fresh fetch
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

  const handlePriceChange = (id, newPrice) => {
    setDraftPrices((prev) => ({
      ...prev,
      [id]: newPrice,
    }));
  };

  const saveAllChanges = async () => {
    const modifications = Object.keys(draftPrices);
    if (modifications.length === 0) return;

    try {
      setSaving(true);

      // Execute all PUT requests concurrently
      const updatePromises = modifications.map((id) => {
        const originalItem = items.find((i) => String(i.id) === id);
        const payload = {
          ...originalItem,
          defaultPrice: draftPrices[id],
        };

        return fetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }).then((res) => {
          if (!res.ok) throw new Error(`Failed to update item ${id}`);
          return res.json();
        });
      });

      await Promise.all(updatePromises);

      toast({
        title: "Prices Updated",
        description: `Successfully updated ${modifications.length} item price(s). Changes recorded in audit log.`,
      });

      fetchItems();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "An error occurred while saving prices.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 1. Filter items by search
  const filteredItems = items.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.nameEn.toLowerCase().includes(query) ||
      item.nameSi.includes(query)
    );
  });

  // 2. Group filtered items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const catName = getCategoryName(item.categoryId);
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {});

  const hasUnsavedChanges = Object.keys(draftPrices).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-heading-md font-bold text-foreground">Price Management</h1>
        
        <Button 
          onClick={saveAllChanges} 
          disabled={!hasUnsavedChanges || saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : `Save All Changes (${Object.keys(draftPrices).length})`}
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-warning-bg border border-warning/30 px-4 py-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
        <span className="text-foreground">
          Price changes are recorded in the audit log and apply to all future purchase orders.
        </span>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="relative mb-4 w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Item (SI)</TableHead>
                  <TableHead>Item (EN)</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right w-40">Default Price (Rs)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading items...
                    </TableCell>
                  </TableRow>
                ) : Object.keys(groupedItems).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No items match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(groupedItems).map(([category, catItems]) => (
                    <React.Fragment key={category}>
                      {/* Category Header Row */}
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={5} className="font-semibold text-primary">
                          {category}
                        </TableCell>
                      </TableRow>
                      
                      {/* Item Rows */}
                      {catItems.map((p, idx) => {
                        const currentPrice = draftPrices[p.id] !== undefined ? draftPrices[p.id] : p.defaultPrice;
                        const isModified = draftPrices[p.id] !== undefined && draftPrices[p.id] !== p.defaultPrice;

                        return (
                          <TableRow key={p.id} className={isModified ? "bg-accent/30" : ""}>
                            <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell className="font-medium">{p.nameSi}</TableCell>
                            <TableCell>{p.nameEn}</TableCell>
                            <TableCell className="text-muted-foreground">{p.unit}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-xs text-muted-foreground">Rs.</span>
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={currentPrice}
                                  onChange={(e) => handlePriceChange(p.id, parseFloat(e.target.value) || 0)}
                                  className={`w-28 h-8 text-right text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isModified ? 'border-primary ring-1 ring-primary' : ''}`}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountantPriceManagement;