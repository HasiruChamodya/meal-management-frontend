"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit, Save, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

// Removed TypeScript types/annotations, all state/data uses plain JS.

const MEAL_TYPES = ["B", "L", "D", "Extra", "Soup", "Salad"]
const MOCK_INGREDIENTS = [
  { id: "1", name: "Rice", unit: "g" },
  { id: "2", name: "Chicken", unit: "g" },
  { id: "3", name: "Vegetables", unit: "g" },
  { id: "4", name: "Oil", unit: "ml" },
  { id: "5", name: "Salt", unit: "g" },
  { id: "6", name: "Fish", unit: "g" },
  { id: "7", name: "Egg", unit: "number" },
]

export function RecipesTab() {
  const [recipes, setRecipes] = useState([
    {
      id: "1",
      dishName: "Vegetable Curry",
      mealType: "L",
      isBaseRecipe: true,
      ingredients: [
        { ingredientId: "1", ingredientName: "Rice", quantity: 150, unit: "g" },
        { ingredientId: "3", ingredientName: "Vegetables", quantity: 200, unit: "g" },
        { ingredientId: "4", ingredientName: "Oil", quantity: 10, unit: "ml" },
      ],
    },
    {
      id: "2",
      dishName: "Chicken Stew",
      mealType: "L",
      isBaseRecipe: false,
      ingredients: [
        { ingredientId: "1", ingredientName: "Rice", quantity: 150, unit: "g" },
        { ingredientId: "2", ingredientName: "Chicken", quantity: 120, unit: "g" },
        { ingredientId: "4", ingredientName: "Oil", quantity: 10, unit: "ml" },
      ],
    },
  ])

  const [isEditing, setIsEditing] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [newIngredient, setNewIngredient] = useState({ ingredientId: "", quantity: 0 })

  const handleAddRecipe = () => {
    const newRecipe = {
      id: Date.now().toString(),
      dishName: "",
      mealType: "B",
      isBaseRecipe: false,
      ingredients: [],
    }
    setEditingRecipe(newRecipe)
    setIsEditing(true)
  }

  const handleEditRecipe = (recipe) => {
    setEditingRecipe({ ...recipe })
    setIsEditing(true)
  }

  const handleSaveRecipe = () => {
    if (!editingRecipe) return

    if (recipes.find((r) => r.id === editingRecipe.id)) {
      setRecipes(recipes.map((r) => (r.id === editingRecipe.id ? editingRecipe : r)))
    } else {
      setRecipes([...recipes, editingRecipe])
    }

    setIsEditing(false)
    setEditingRecipe(null)
  }

  const handleDeleteRecipe = (id) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      setRecipes(recipes.filter((r) => r.id !== id))
    }
  }

  const handleAddIngredient = () => {
    if (!editingRecipe || !newIngredient.ingredientId) return

    const ingredient = MOCK_INGREDIENTS.find((i) => i.id === newIngredient.ingredientId)
    if (!ingredient) return

    const newIng = {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      quantity: newIngredient.quantity,
      unit: ingredient.unit,
    }

    setEditingRecipe({
      ...editingRecipe,
      ingredients: [...editingRecipe.ingredients, newIng],
    })

    setNewIngredient({ ingredientId: "", quantity: 0 })
  }

  const handleRemoveIngredient = (ingredientId) => {
    if (!editingRecipe) return
    setEditingRecipe({
      ...editingRecipe,
      ingredients: editingRecipe.ingredients.filter((i) => i.ingredientId !== ingredientId),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Recipe Management</h2>
          <p className="text-base text-muted-foreground mt-2">
            Define standardized recipes with exact ingredient quantities
          </p>
        </div>
        <Button onClick={handleAddRecipe} size="lg" className="text-base">
          <Plus className="mr-2 h-5 w-5" />
          Add Recipe
        </Button>
      </div>

      {isEditing && editingRecipe ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {recipes.find((r) => r.id === editingRecipe.id) ? "Edit Recipe" : "New Recipe"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="dishName" className="text-base font-semibold">
                  Dish Name
                </Label>
                <Input
                  id="dishName"
                  value={editingRecipe.dishName}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, dishName: e.target.value })}
                  placeholder="e.g., Vegetable Curry"
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="mealType" className="text-base font-semibold">
                  Meal Type
                </Label>
                <Select
                  value={editingRecipe.mealType}
                  onValueChange={(value) => setEditingRecipe({ ...editingRecipe, mealType: value })}
                >
                  <SelectTrigger id="mealType" className="text-lg h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="text-base">
                        {type === "B" ? "Breakfast" : type === "L" ? "Lunch" : type === "D" ? "Dinner" : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isBaseRecipe"
                checked={editingRecipe.isBaseRecipe}
                onCheckedChange={(checked) => setEditingRecipe({ ...editingRecipe, isBaseRecipe: checked })}
              />
              <Label htmlFor="isBaseRecipe" className="text-base font-semibold cursor-pointer">
                Base Recipe (for Normal Diet)
              </Label>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Ingredients</h3>

              {editingRecipe.ingredients.length > 0 && (
                <div className="space-y-2">
                  {editingRecipe.ingredients.map((ing) => (
                    <div key={ing.ingredientId} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                      <span className="text-base">
                        {ing.ingredientName}: {ing.quantity} {ing.unit}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveIngredient(ing.ingredientId)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label className="text-base">Ingredient</Label>
                  <Select
                    value={newIngredient.ingredientId}
                    onValueChange={(value) => setNewIngredient({ ...newIngredient, ingredientId: value })}
                  >
                    <SelectTrigger className="text-base h-12">
                      <SelectValue placeholder="Select ingredient" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_INGREDIENTS.map((ing) => (
                        <SelectItem key={ing.id} value={ing.id} className="text-base">
                          {ing.name} ({ing.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-32 space-y-2">
                  <Label className="text-base">Quantity</Label>
                  <Input
                    type="number"
                    value={newIngredient.quantity || ""}
                    onChange={(e) =>
                      setNewIngredient({ ...newIngredient, quantity: Number.parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="text-base h-12"
                  />
                </div>

                <Button onClick={handleAddIngredient} size="lg" className="h-12">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSaveRecipe} size="lg" className="flex-1 text-base">
                <Save className="mr-2 h-5 w-5" />
                Save Recipe
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false)
                  setEditingRecipe(null)
                }}
                variant="outline"
                size="lg"
                className="flex-1 text-base"
              >
                <X className="mr-2 h-5 w-5" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{recipe.dishName}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {recipe.mealType === "B"
                        ? "Breakfast"
                        : recipe.mealType === "L"
                          ? "Lunch"
                          : recipe.mealType === "D"
                            ? "Dinner"
                            : recipe.mealType}
                      {recipe.isBaseRecipe && " • Base Recipe"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditRecipe(recipe)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Ingredients:</p>
                  {recipe.ingredients.map((ing) => (
                    <div key={ing.ingredientId} className="text-base">
                      • {ing.ingredientName}: {ing.quantity} {ing.unit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}