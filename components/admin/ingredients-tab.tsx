"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface Ingredient {
  id: string
  name: string
  unit: string
  category: string
}

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: "1", name: "Rice", unit: "kg", category: "Grains" },
  { id: "2", name: "Chicken", unit: "kg", category: "Protein" },
  { id: "3", name: "Eggs", unit: "pieces", category: "Protein" },
  { id: "4", name: "Milk", unit: "liters", category: "Dairy" },
  { id: "5", name: "Vegetables", unit: "kg", category: "Produce" },
]

export function IngredientsTab() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newIngredient, setNewIngredient] = useState({ name: "", unit: "", category: "" })

  const handleAddIngredient = () => {
    if (newIngredient.name && newIngredient.unit && newIngredient.category) {
      setIngredients([
        ...ingredients,
        {
          id: Date.now().toString(),
          ...newIngredient,
        },
      ])
      setNewIngredient({ name: "", unit: "", category: "" })
      setShowAddForm(false)
    }
  }

  const handleDeleteIngredient = (id: string) => {
    setIngredients(ingredients.filter((ingredient) => ingredient.id !== id))
  }

  return (
    <div>
      <PageHeader title="Ingredients" description="Manage ingredient inventory and units">
        <Button onClick={() => setShowAddForm(!showAddForm)} size="lg" className="text-base">
          <Plus className="mr-2 h-5 w-5" />
          Add New Ingredient
        </Button>
      </PageHeader>

      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <Label htmlFor="ingredient-name" className="text-base font-semibold">
                  Ingredient Name
                </Label>
                <Input
                  id="ingredient-name"
                  placeholder="e.g., Chicken"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  className="text-base h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="ingredient-unit" className="text-base font-semibold">
                  Unit
                </Label>
                <Select
                  value={newIngredient.unit}
                  onValueChange={(value) => setNewIngredient({ ...newIngredient, unit: value })}
                >
                  <SelectTrigger id="ingredient-unit" className="text-base h-12">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="grams">Grams (g)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="ingredient-category" className="text-base font-semibold">
                  Category
                </Label>
                <Select
                  value={newIngredient.category}
                  onValueChange={(value) => setNewIngredient({ ...newIngredient, category: value })}
                >
                  <SelectTrigger id="ingredient-category" className="text-base h-12">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grains">Grains</SelectItem>
                    <SelectItem value="Protein">Protein</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Produce">Produce</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleAddIngredient} size="lg" className="text-base">
                Save Ingredient
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" size="lg" className="text-base">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="p-4 text-left text-base font-bold">Ingredient Name</th>
                  <th className="p-4 text-left text-base font-bold">Unit</th>
                  <th className="p-4 text-left text-base font-bold">Category</th>
                  <th className="p-4 text-right text-base font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) => (
                  <tr key={ingredient.id} className="border-b border-border">
                    <td className="p-4 text-base font-medium">{ingredient.name}</td>
                    <td className="p-4 text-base">{ingredient.unit}</td>
                    <td className="p-4 text-base">{ingredient.category}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-base bg-transparent">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-base text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                          onClick={() => handleDeleteIngredient(ingredient.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
