"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit2 } from "lucide-react"

interface DietType {
  id: string
  name: string
  ingredients: IngredientRequirement[]
}

interface IngredientRequirement {
  ingredientId: string
  ingredientName: string
  normValue: number
  unit: string
}

export function IngredientRequirementsTab() {
  const [dietTypes, setDietTypes] = useState<DietType[]>([
    {
      id: "1",
      name: "Normal Diet",
      ingredients: [
        { ingredientId: "1", ingredientName: "Rice", normValue: 150, unit: "grams" },
        { ingredientId: "2", ingredientName: "Dal", normValue: 50, unit: "grams" },
        { ingredientId: "3", ingredientName: "Vegetables", normValue: 100, unit: "grams" },
      ],
    },
    {
      id: "2",
      name: "Soft Diet",
      ingredients: [
        { ingredientId: "1", ingredientName: "Rice", normValue: 100, unit: "grams" },
        { ingredientId: "2", ingredientName: "Dal", normValue: 40, unit: "grams" },
        { ingredientId: "4", ingredientName: "Egg", normValue: 1, unit: "piece" },
      ],
    },
  ])

  const [newDietName, setNewDietName] = useState("")
  const [expandedDiet, setExpandedDiet] = useState<string | null>(null)
  const [editingIngredient, setEditingIngredient] = useState<{
    dietId: string
    index: number
  } | null>(null)

  const addDietType = () => {
    if (newDietName.trim()) {
      setDietTypes([
        ...dietTypes,
        {
          id: Date.now().toString(),
          name: newDietName,
          ingredients: [],
        },
      ])
      setNewDietName("")
    }
  }

  const removeDietType = (id: string) => {
    setDietTypes(dietTypes.filter((d) => d.id !== id))
  }

  const addIngredient = (dietId: string) => {
    setDietTypes(
      dietTypes.map((diet) =>
        diet.id === dietId
          ? {
              ...diet,
              ingredients: [
                ...diet.ingredients,
                { ingredientId: "", ingredientName: "", normValue: 0, unit: "grams" },
              ],
            }
          : diet,
      ),
    )
  }

  const removeIngredient = (dietId: string, index: number) => {
    setDietTypes(
      dietTypes.map((diet) =>
        diet.id === dietId
          ? {
              ...diet,
              ingredients: diet.ingredients.filter((_, i) => i !== index),
            }
          : diet,
      ),
    )
  }

  const updateIngredient = (
    dietId: string,
    index: number,
    field: keyof IngredientRequirement,
    value: string | number,
  ) => {
    setDietTypes(
      dietTypes.map((diet) =>
        diet.id === dietId
          ? {
              ...diet,
              ingredients: diet.ingredients.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)),
            }
          : diet,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-foreground">Ingredient Requirements</h2>
        <p className="text-muted-foreground text-lg">Manage norm values for each diet type</p>
      </div>

      {/* Add New Diet Type */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Diet Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="diet-name" className="text-base">
                Diet Type Name
              </Label>
              <Input
                id="diet-name"
                value={newDietName}
                onChange={(e) => setNewDietName(e.target.value)}
                placeholder="e.g., Diabetic Diet"
                className="h-12 text-base mt-2"
              />
            </div>
            <Button onClick={addDietType} className="h-12 text-base">
              <Plus className="mr-2 h-5 w-5" />
              Add Diet Type
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diet Types List */}
      <div className="space-y-4">
        {dietTypes.map((diet) => (
          <Card key={diet.id}>
            <div className="p-6 border-b border-border flex justify-between items-center cursor-pointer hover:bg-accent/50">
              <div onClick={() => setExpandedDiet(expandedDiet === diet.id ? null : diet.id)} className="flex-1">
                <h3 className="text-xl font-bold text-foreground">{diet.name}</h3>
                <p className="text-muted-foreground text-base">{diet.ingredients.length} ingredients</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeDietType(diet.id)}
                className="h-10 text-base"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {expandedDiet === diet.id && (
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Ingredients Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-base">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-bold text-foreground">Ingredient Name</th>
                          <th className="text-left py-3 px-4 font-bold text-foreground">Norm Value</th>
                          <th className="text-left py-3 px-4 font-bold text-foreground">Unit</th>
                          <th className="text-right py-3 px-4 font-bold text-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diet.ingredients.map((ingredient, index) => (
                          <tr key={index} className="border-b border-border hover:bg-accent/50">
                            <td className="py-3 px-4">
                              <Input
                                value={ingredient.ingredientName}
                                onChange={(e) => updateIngredient(diet.id, index, "ingredientName", e.target.value)}
                                placeholder="e.g., Rice"
                                className="h-10 text-base"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <Input
                                type="number"
                                value={ingredient.normValue}
                                onChange={(e) =>
                                  updateIngredient(diet.id, index, "normValue", parseFloat(e.target.value))
                                }
                                placeholder="0"
                                className="h-10 text-base"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <Input
                                value={ingredient.unit}
                                onChange={(e) => updateIngredient(diet.id, index, "unit", e.target.value)}
                                placeholder="grams"
                                className="h-10 text-base"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeIngredient(diet.id, index)}
                                className="h-10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Ingredient Button */}
                  <Button
                    onClick={() => addIngredient(diet.id)}
                    variant="outline"
                    className="w-full h-12 text-base"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Ingredient
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
