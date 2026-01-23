"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface Ward {
  id: string
  name: string
  number: string
  bedCapacity: string
}

const INITIAL_WARDS: Ward[] = [
  { id: "1", name: "Ward A", number: "101", bedCapacity: "30" },
  { id: "2", name: "Ward B", number: "102", bedCapacity: "25" },
  { id: "3", name: "Ward C", number: "103", bedCapacity: "28" },
  { id: "4", name: "ICU", number: "201", bedCapacity: "15" },
  { id: "5", name: "Pediatric", number: "301", bedCapacity: "20" },
]

export function WardsTab() {
  const [wards, setWards] = useState<Ward[]>(INITIAL_WARDS)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWard, setNewWard] = useState({ name: "", number: "", bedCapacity: "" })

  const handleAddWard = () => {
    if (newWard.name && newWard.number && newWard.bedCapacity) {
      setWards([
        ...wards,
        {
          id: Date.now().toString(),
          ...newWard,
        },
      ])
      setNewWard({ name: "", number: "", bedCapacity: "" })
      setShowAddForm(false)
    }
  }

  const handleDeleteWard = (id: string) => {
    setWards(wards.filter((ward) => ward.id !== id))
  }

  return (
    <div>
      <PageHeader title="Wards" description="Manage hospital wards and bed capacity">
        <Button onClick={() => setShowAddForm(!showAddForm)} size="lg" className="text-base">
          <Plus className="mr-2 h-5 w-5" />
          Add New Ward
        </Button>
      </PageHeader>

      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <Label htmlFor="ward-name" className="text-base font-semibold">
                  Ward Name
                </Label>
                <Input
                  id="ward-name"
                  placeholder="e.g., Ward A"
                  value={newWard.name}
                  onChange={(e) => setNewWard({ ...newWard, name: e.target.value })}
                  className="text-base h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="ward-number" className="text-base font-semibold">
                  Ward Number
                </Label>
                <Input
                  id="ward-number"
                  placeholder="e.g., 101"
                  value={newWard.number}
                  onChange={(e) => setNewWard({ ...newWard, number: e.target.value })}
                  className="text-base h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="bed-capacity" className="text-base font-semibold">
                  Bed Capacity
                </Label>
                <Input
                  id="bed-capacity"
                  type="number"
                  placeholder="e.g., 30"
                  value={newWard.bedCapacity}
                  onChange={(e) => setNewWard({ ...newWard, bedCapacity: e.target.value })}
                  className="text-base h-12"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleAddWard} size="lg" className="text-base">
                Save Ward
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
                  <th className="p-4 text-left text-base font-bold">Ward Name</th>
                  <th className="p-4 text-left text-base font-bold">Ward Number</th>
                  <th className="p-4 text-left text-base font-bold">Bed Capacity</th>
                  <th className="p-4 text-right text-base font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wards.map((ward) => (
                  <tr key={ward.id} className="border-b border-border">
                    <td className="p-4 text-base font-medium">{ward.name}</td>
                    <td className="p-4 text-base">{ward.number}</td>
                    <td className="p-4 text-base">{ward.bedCapacity} beds</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-base bg-transparent">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-base text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                          onClick={() => handleDeleteWard(ward.id)}
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
