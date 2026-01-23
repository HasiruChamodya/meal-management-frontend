"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"

interface DietType {
  id: string
  name: string
  description: string
  mealRecipes: {
    B: string // Breakfast recipe ID
    L: string // Lunch recipe ID
    D: string // Dinner recipe ID
  }
}

const MOCK_RECIPES = [
  { id: "r1", name: "Vegetable Curry", mealType: "L" },
  { id: "r2", name: "Chicken Stew", mealType: "L" },
  { id: "r3", name: "Fish Curry", mealType: "L" },
  { id: "r4", name: "Standard Breakfast", mealType: "B" },
  { id: "r5", name: "Diabetic Breakfast", mealType: "B" },
  { id: "r6", name: "Protein Breakfast", mealType: "B" },
  { id: "r7", name: "Light Dinner", mealType: "D" },
  { id: "r8", name: "Standard Dinner", mealType: "D" },
  { id: "r9", name: "Renal Diet Dinner", mealType: "D" },
]

const INITIAL_DIETS: DietType[] = [
  {
    id: "1",
    name: "Normal Diet",
    description: "Standard balanced diet for general patients",
    mealRecipes: { B: "r4", L: "r1", D: "r8" },
  },
  {
    id: "2",
    name: "Diabetic Diet",
    description: "Low sugar, controlled carbohydrates",
    mealRecipes: { B: "r5", L: "r1", D: "r7" },
  },
  {
    id: "3",
    name: "Renal Diet",
    description: "Low protein, low phosphorus",
    mealRecipes: { B: "r4", L: "r3", D: "r9" },
  },
]

export function DietTypesTab() {
  const [diets, setDiets] = useState<DietType[]>(INITIAL_DIETS)
  const [expandedDiet, setExpandedDiet] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDiet, setEditingDiet] = useState<DietType | null>(null)
  const [newDiet, setNewDiet] = useState({
    name: "",
    description: "",
    mealRecipes: { B: "", L: "", D: "" },
  })

  const handleAddDiet = () => {
    if (newDiet.name && newDiet.description) {
      setDiets([
        ...diets,
        {
          id: Date.now().toString(),
          name: newDiet.name,
          description: newDiet.description,
          mealRecipes: newDiet.mealRecipes,
        },
      ])
      setNewDiet({ name: "", description: "", mealRecipes: { B: "", L: "", D: "" } })
      setShowAddForm(false)
    }
  }

  const handleEditDiet = (diet: DietType) => {
    setEditingDiet(diet)
    setExpandedDiet(diet.id)
  }

  const handleSaveEdit = () => {
    if (editingDiet) {
      setDiets(diets.map((d) => (d.id === editingDiet.id ? editingDiet : d)))
      setEditingDiet(null)
    }
  }

  const handleDeleteDiet = (id: string) => {
    if (confirm("Are you sure you want to delete this diet type?")) {
      setDiets(diets.filter((diet) => diet.id !== id))
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedDiet(expandedDiet === id ? null : id)
    if (expandedDiet !== id) {
      setEditingDiet(null)
    }
  }

  const getRecipeName = (recipeId: string) => {
    const recipe = MOCK_RECIPES.find((r) => r.id === recipeId)
    return recipe ? recipe.name : "Not Assigned"
  }

  const getRecipesByMealType = (mealType: string) => {
    return MOCK_RECIPES.filter((r) => r.mealType === mealType)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Diet Types</h2>
          <p className="text-base text-muted-foreground mt-2">
            Manage diet types and assign standardized recipes for each meal
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="lg" className="text-base">
          <Plus className="mr-2 h-5 w-5" />
          Add New Diet Type
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Diet Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="diet-name" className="text-base font-semibold">
                  Diet Type Name
                </Label>
                <Input
                  id="diet-name"
                  placeholder="e.g., Low Sodium Diet"
                  value={newDiet.name}
                  onChange={(e) => setNewDiet({ ...newDiet, name: e.target.value })}
                  className="text-base h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="diet-description" className="text-base font-semibold">
                  Description
                </Label>
                <Input
                  id="diet-description"
                  placeholder="Brief description"
                  value={newDiet.description}
                  onChange={(e) => setNewDiet({ ...newDiet, description: e.target.value })}
                  className="text-base h-12"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Assign Recipes for Each Meal</h3>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <Label htmlFor="breakfast-recipe" className="text-base font-semibold">
                    Breakfast Recipe
                  </Label>
                  <Select
                    value={newDiet.mealRecipes.B}
                    onValueChange={(value) =>
                      setNewDiet({ ...newDiet, mealRecipes: { ...newDiet.mealRecipes, B: value } })
                    }
                  >
                    <SelectTrigger id="breakfast-recipe" className="text-base h-12">
                      <SelectValue placeholder="Select recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {getRecipesByMealType("B").map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id} className="text-base">
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lunch-recipe" className="text-base font-semibold">
                    Lunch Recipe
                  </Label>
                  <Select
                    value={newDiet.mealRecipes.L}
                    onValueChange={(value) =>
                      setNewDiet({ ...newDiet, mealRecipes: { ...newDiet.mealRecipes, L: value } })
                    }
                  >
                    <SelectTrigger id="lunch-recipe" className="text-base h-12">
                      <SelectValue placeholder="Select recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {getRecipesByMealType("L").map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id} className="text-base">
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="dinner-recipe" className="text-base font-semibold">
                    Dinner Recipe
                  </Label>
                  <Select
                    value={newDiet.mealRecipes.D}
                    onValueChange={(value) =>
                      setNewDiet({ ...newDiet, mealRecipes: { ...newDiet.mealRecipes, D: value } })
                    }
                  >
                    <SelectTrigger id="dinner-recipe" className="text-base h-12">
                      <SelectValue placeholder="Select recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {getRecipesByMealType("D").map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id} className="text-base">
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleAddDiet} size="lg" className="text-base">
                Save Diet Type
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false)
                  setNewDiet({ name: "", description: "", mealRecipes: { B: "", L: "", D: "" } })
                }}
                variant="outline"
                size="lg"
                className="text-base"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {diets.map((diet) => (
          <Card key={diet.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{diet.name}</CardTitle>
                  <CardDescription className="text-base mt-1">{diet.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleExpanded(diet.id)} className="text-base">
                    {expandedDiet === diet.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-base bg-transparent"
                    onClick={() => handleEditDiet(diet)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-base text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    onClick={() => handleDeleteDiet(diet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedDiet === diet.id && (
              <CardContent>
                {editingDiet?.id === diet.id ? (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold">Edit Recipe Assignments</h4>

                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Breakfast Recipe</Label>
                        <Select
                          value={editingDiet.mealRecipes.B}
                          onValueChange={(value) =>
                            setEditingDiet({
                              ...editingDiet,
                              mealRecipes: { ...editingDiet.mealRecipes, B: value },
                            })
                          }
                        >
                          <SelectTrigger className="text-base h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getRecipesByMealType("B").map((recipe) => (
                              <SelectItem key={recipe.id} value={recipe.id} className="text-base">
                                {recipe.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Lunch Recipe</Label>
                        <Select
                          value={editingDiet.mealRecipes.L}
                          onValueChange={(value) =>
                            setEditingDiet({
                              ...editingDiet,
                              mealRecipes: { ...editingDiet.mealRecipes, L: value },
                            })
                          }
                        >
                          <SelectTrigger className="text-base h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getRecipesByMealType("L").map((recipe) => (
                              <SelectItem key={recipe.id} value={recipe.id} className="text-base">
                                {recipe.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Dinner Recipe</Label>
                        <Select
                          value={editingDiet.mealRecipes.D}
                          onValueChange={(value) =>
                            setEditingDiet({
                              ...editingDiet,
                              mealRecipes: { ...editingDiet.mealRecipes, D: value },
                            })
                          }
                        >
                          <SelectTrigger className="text-base h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getRecipesByMealType("D").map((recipe) => (
                              <SelectItem key={recipe.id} value={recipe.id} className="text-base">
                                {recipe.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleSaveEdit} size="lg" className="text-base">
                        Save Changes
                      </Button>
                      <Button onClick={() => setEditingDiet(null)} variant="outline" size="lg" className="text-base">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold">Assigned Recipes:</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Breakfast</p>
                        <p className="text-base font-medium">{getRecipeName(diet.mealRecipes.B)}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Lunch</p>
                        <p className="text-base font-medium">{getRecipeName(diet.mealRecipes.L)}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Dinner</p>
                        <p className="text-base font-medium">{getRecipeName(diet.mealRecipes.D)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
