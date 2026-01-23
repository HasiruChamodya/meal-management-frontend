"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"

interface DietCycle {
  id: string
  name: string
  items: CycleItem[]
  active: boolean
}

interface CycleItem {
  id: string
  name: string
  category: string
}

const DIET_CYCLE_TYPES = ["Meat", "Vegetable", "Egg", "Canned Fish", "Dried Fish", "Fish"]

export function DietCycleTab() {
  const [cycles, setCycles] = useState<DietCycle[]>([
    {
      id: "1",
      name: "Meat",
      active: true,
      items: [
        { id: "1", name: "Chicken", category: "Poultry" },
        { id: "2", name: "Mutton", category: "Meat" },
      ],
    },
    {
      id: "2",
      name: "Vegetable",
      active: false,
      items: [
        { id: "3", name: "Carrot", category: "Root Vegetable" },
        { id: "4", name: "Spinach", category: "Leafy Vegetable" },
      ],
    },
  ])

  const [expandedCycle, setExpandedCycle] = useState<string | null>(null)
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("")

  const toggleCycleActive = (id: string) => {
    setCycles(cycles.map((cycle) => (cycle.id === id ? { ...cycle, active: !cycle.active } : cycle)))
  }

  const addItem = (cycleId: string) => {
    if (newItemName.trim()) {
      setCycles(
        cycles.map((cycle) =>
          cycle.id === cycleId
            ? {
                ...cycle,
                items: [
                  ...cycle.items,
                  { id: Date.now().toString(), name: newItemName, category: newItemCategory },
                ],
              }
            : cycle,
        ),
      )
      setNewItemName("")
      setNewItemCategory("")
    }
  }

  const removeItem = (cycleId: string, itemId: string) => {
    setCycles(
      cycles.map((cycle) =>
        cycle.id === cycleId
          ? {
              ...cycle,
              items: cycle.items.filter((item) => item.id !== itemId),
            }
          : cycle,
      ),
    )
  }

  const assignCycle = (cycleName: string) => {
    // In a real app, this would update the hospital's current diet cycle
    console.log("Assigning cycle:", cycleName)
    alert(`Diet Cycle "${cycleName}" has been assigned for lunch meals across the hospital.`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-foreground">Diet Cycle Management</h2>
        <p className="text-muted-foreground text-lg">
          Manage diet cycles (Meat, Vegetable, Egg, etc.) that apply to lunch meals
        </p>
      </div>

      {/* Active Cycle Assignment */}
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Assign Diet Cycle for Today's Lunch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DIET_CYCLE_TYPES.map((cycle) => (
              <Button
                key={cycle}
                variant={selectedCycle === cycle ? "default" : "outline"}
                onClick={() => {
                  setSelectedCycle(cycle)
                  assignCycle(cycle)
                }}
                className="h-12 text-base"
              >
                {cycle}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diet Cycles List */}
      <div className="space-y-4">
        {cycles.map((cycle) => (
          <Card key={cycle.id}>
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div
                className="flex-1 cursor-pointer hover:opacity-70"
                onClick={() => setExpandedCycle(expandedCycle === cycle.id ? null : cycle.id)}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-foreground">{cycle.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      cycle.active
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cycle.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-muted-foreground text-base">{cycle.items.length} items</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={cycle.active ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCycleActive(cycle.id)}
                  className="h-10 text-base"
                >
                  {cycle.active ? "Active" : "Inactive"}
                </Button>
                {expandedCycle === cycle.id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>

            {expandedCycle === cycle.id && (
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Items List */}
                  {cycle.items.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-bold text-lg mb-3 text-foreground">Items in this cycle:</h4>
                      <div className="space-y-2">
                        {cycle.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-card p-3 rounded border border-border"
                          >
                            <div>
                              <p className="font-medium text-base text-foreground">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeItem(cycle.id, item.id)}
                              className="h-10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Item */}
                  <div className="border-t border-border pt-4 space-y-4">
                    <h4 className="font-bold text-lg text-foreground">Add new item to {cycle.name}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`item-name-${cycle.id}`} className="text-base">
                          Item Name
                        </Label>
                        <Input
                          id={`item-name-${cycle.id}`}
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="e.g., Chicken Breast"
                          className="h-12 text-base mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`item-category-${cycle.id}`} className="text-base">
                          Category
                        </Label>
                        <Input
                          id={`item-category-${cycle.id}`}
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          placeholder="e.g., Poultry"
                          className="h-12 text-base mt-2"
                        />
                      </div>
                    </div>
                    <Button onClick={() => addItem(cycle.id)} className="w-full h-12 text-base">
                      <Plus className="mr-2 h-5 w-5" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
