import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, Edit2 } from "lucide-react";

const API_BASE = "http://localhost:5050/api/recipes";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const AdminRecipes = () => {
  const { toast } = useToast();

  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false);

  const [editingRecipe, setEditingRecipe] = useState(null);
  const [newRecipe, setNewRecipe] = useState({ recipeKey: "", name: "" });

  const [ingredientForm, setIngredientForm] = useState({
    itemId: "",
    normPerPatient: 0,
    unit: "g",
    editId: null,
  });

  const selectedRecipe = recipes.find((r) => String(r.id) === String(selectedRecipeId));

  const fetchRecipes = async () => {
    try {
      const res = await fetch(API_BASE, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch recipes");

      setRecipes(data.recipes || []);

      if (!selectedRecipeId && data.recipes?.length) {
        setSelectedRecipeId(String(data.recipes[0].id));
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchRecipeIngredients = async (recipeId) => {
    if (!recipeId) return;
    try {
      const res = await fetch(`${API_BASE}/${recipeId}/ingredients`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch ingredients");
      setIngredients(data.ingredients || []);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/items/list`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch items");
      setItems(data.items || []);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchRecipes(), fetchItems()]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedRecipeId) fetchRecipeIngredients(selectedRecipeId);
  }, [selectedRecipeId]);

  const openAddRecipe = () => {
    setEditingRecipe(null);
    setNewRecipe({ recipeKey: "", name: "" });
    setRecipeDialogOpen(true);
  };

  const openEditRecipe = () => {
    if (!selectedRecipe) return;
    setEditingRecipe(selectedRecipe);
    setNewRecipe({
      recipeKey: selectedRecipe.recipeKey,
      name: selectedRecipe.name,
    });
    setRecipeDialogOpen(true);
  };

  const saveRecipe = async () => {
    try {
      const url = editingRecipe ? `${API_BASE}/${editingRecipe.id}` : API_BASE;
      const method = editingRecipe ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(newRecipe),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save recipe");

      toast({
        title: editingRecipe ? "Recipe Updated" : "Recipe Added",
        description: data.message,
      });

      setRecipeDialogOpen(false);
      await fetchRecipes();

      if (!editingRecipe && data.recipe?.id) {
        setSelectedRecipeId(String(data.recipe.id));
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openAddIngredient = () => {
    setIngredientForm({
      itemId: "",
      normPerPatient: 0,
      unit: "g",
      editId: null,
    });
    setIngredientDialogOpen(true);
  };

  const openEditIngredient = (ingredient) => {
    setIngredientForm({
      itemId: String(ingredient.itemId),
      normPerPatient: ingredient.normPerPatient,
      unit: ingredient.unit,
      editId: ingredient.id,
    });
    setIngredientDialogOpen(true);
  };

  const saveIngredient = async () => {
    try {
      let res;

      if (ingredientForm.editId) {
        res = await fetch(`${API_BASE}/ingredients/${ingredientForm.editId}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            normPerPatient: ingredientForm.normPerPatient,
            unit: ingredientForm.unit,
          }),
        });
      } else {
        res = await fetch(`${API_BASE}/${selectedRecipeId}/ingredients`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            itemId: Number(ingredientForm.itemId),
            normPerPatient: Number(ingredientForm.normPerPatient),
            unit: ingredientForm.unit,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save ingredient");

      toast({
        title: ingredientForm.editId ? "Ingredient Updated" : "Ingredient Added",
        description: data.message,
      });

      setIngredientDialogOpen(false);
      fetchRecipeIngredients(selectedRecipeId);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteIngredient = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/ingredients/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete ingredient");

      toast({ title: "Ingredient Removed", description: data.message });
      fetchRecipeIngredients(selectedRecipeId);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-heading-md font-bold text-foreground">Recipe Formula Editor</h1>

      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-3">
          <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
            <SelectTrigger className="w-64 h-12">
              <SelectValue placeholder="Select recipe" />
            </SelectTrigger>
            <SelectContent>
              {recipes.map((recipe) => (
                <SelectItem key={recipe.id} value={String(recipe.id)}>
                  {recipe.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={openAddRecipe}>
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </Button>

          <Button variant="outline" onClick={openEditRecipe} disabled={!selectedRecipe}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Recipe
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-label font-semibold">
            {selectedRecipe ? `${selectedRecipe.name} — Ingredients` : "Ingredients"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 text-center text-muted-foreground">Loading...</div>
          ) : (
            <>
              <div className="flex justify-end mb-3">
                <Button onClick={openAddIngredient} disabled={!selectedRecipe}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Ingredient (SI)</TableHead>
                    <TableHead className="text-right">Norm Per Patient</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ing) => (
                    <TableRow key={ing.id}>
                      <TableCell className="font-medium">{ing.itemNameEn}</TableCell>
                      <TableCell className="text-muted-foreground">{ing.itemNameSi}</TableCell>
                      <TableCell className="text-right">{ing.normPerPatient}</TableCell>
                      <TableCell className="text-muted-foreground">{ing.unit}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditIngredient(ing)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteIngredient(ing.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {ingredients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                        No ingredients found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => fetchRecipeIngredients(selectedRecipeId)} disabled={!selectedRecipe}>
          <Save className="h-4 w-4 mr-2" />
          Refresh Recipe
        </Button>
      </div>

      <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRecipe ? "Edit Recipe" : "Add Recipe"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Recipe Key</Label>
              <Input
                value={newRecipe.recipeKey}
                onChange={(e) => setNewRecipe((p) => ({ ...p, recipeKey: e.target.value }))}
                placeholder="e.g. polSambola"
              />
            </div>
            <div>
              <Label>Recipe Name</Label>
              <Input
                value={newRecipe.name}
                onChange={(e) => setNewRecipe((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Pol Sambola"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRecipeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveRecipe}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ingredientDialogOpen} onOpenChange={setIngredientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ingredientForm.editId ? "Edit Ingredient" : "Add Ingredient"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Item</Label>
              <Select
                value={ingredientForm.itemId}
                onValueChange={(v) =>
                  setIngredientForm((p) => {
                    const selectedItem = items.find((i) => String(i.id) === String(v));
                    return {
                      ...p,
                      itemId: v,
                      unit: selectedItem?.unit || p.unit,
                    };
                  })
                }
                disabled={!!ingredientForm.editId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item from items table" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.nameEn} ({item.nameSi})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Norm Per Patient</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={ingredientForm.normPerPatient}
                onChange={(e) =>
                  setIngredientForm((p) => ({
                    ...p,
                    normPerPatient: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div>
              <Label>Unit</Label>
              <Input
                value={ingredientForm.unit}
                onChange={(e) =>
                  setIngredientForm((p) => ({ ...p, unit: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIngredientDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveIngredient}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRecipes;