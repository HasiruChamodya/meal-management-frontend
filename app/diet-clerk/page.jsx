"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { LogoutButton } from "@/components/logout-button"

// Removed TypeScript type usage (like Record<string, ...>), now just plain JS

const DIET_TYPES = ["Normal", "Diabetic", "S1", "S2", "Renal", "Low Sodium", "Soft Diet"]
const WARDS = ["Ward A", "Ward B", "Ward C", "Ward D", "Ward E", "ICU", "Pediatric"]
const MEAL_TYPES = ["Vegetable", "Egg", "Chicken", "Fish", "Beef", "Mixed"]
const EXTRA_ITEMS = ["Yoghurt", "Fresh Milk", "Fruit Juice", "Fresh Fruit", "Bread (Extra)", "Soup", "Dessert"]

export default function DietClerkPage() {
  const [mealCounts, setMealCounts] = useState({})
  const [lunchMealType, setLunchMealType] = useState("")
  const [staffMeals, setStaffMeals] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
  })
  const [extraItems, setExtraItems] = useState({})

  // No more parameter typing in function arguments

  const handleMealCountChange = (diet, ward, value) => {
    setMealCounts((prev) => ({
      ...prev,
      [diet]: {
        ...prev[diet],
        [ward]: value,
      },
    }))
  }

  const handleExtraItemChange = (item, value) => {
    setExtraItems((prev) => ({
      ...prev,
      [item]: value,
    }))
  }

  const handleSubmit = () => {
    console.log("Submitting meal plan:", {
      mealCounts,
      lunchMealType,
      staffMeals,
      extraItems,
    })
    alert("Meal plan submitted successfully!")
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <AuthGuard allowedRole="diet-clerk">
      <div className="min-h-screen bg-background p-6 md:p-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-base" size="lg">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
            <LogoutButton />
          </div>

          <PageHeader title="Daily Meal Cycle Entry" description={currentDate} />

          <div className="space-y-6">
            {/* Card 1: Meal Counts by Ward */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Meal Counts by Ward</CardTitle>
                <CardDescription className="text-base">
                  Enter the number of meals needed for each diet type in each ward
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="p-4 text-left text-base font-bold">Diet Type</th>
                        {WARDS.map((ward) => (
                          <th key={ward} className="p-4 text-center text-base font-bold">
                            {ward}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DIET_TYPES.map((diet) => (
                        <tr key={diet} className="border-b border-border">
                          <td className="p-4 font-semibold text-base">{diet}</td>
                          {WARDS.map((ward) => (
                            <td key={ward} className="p-4">
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={mealCounts[diet]?.[ward] || ""}
                                onChange={(e) => handleMealCountChange(diet, ward, e.target.value)}
                                className="w-24 text-center text-lg h-12"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Cycle Type & Staff Meals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Cycle Type & Staff Meals</CardTitle>
                <CardDescription className="text-base">
                  Select today's lunch protein and enter staff meal counts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="lunch-type" className="text-base font-semibold">
                    Today's Lunch Meal Type
                  </Label>
                  <Select value={lunchMealType} onValueChange={setLunchMealType}>
                    <SelectTrigger id="lunch-type" className="text-lg h-14">
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="text-base">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <Label htmlFor="staff-breakfast" className="text-base font-semibold">
                      Staff Breakfasts
                    </Label>
                    <Input
                      id="staff-breakfast"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={staffMeals.breakfast}
                      onChange={(e) => setStaffMeals((prev) => ({ ...prev, breakfast: e.target.value }))}
                      className="text-lg h-14"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="staff-lunch" className="text-base font-semibold">
                      Staff Lunches
                    </Label>
                    <Input
                      id="staff-lunch"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={staffMeals.lunch}
                      onChange={(e) => setStaffMeals((prev) => ({ ...prev, lunch: e.target.value }))}
                      className="text-lg h-14"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="staff-dinner" className="text-base font-semibold">
                      Staff Dinners
                    </Label>
                    <Input
                      id="staff-dinner"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={staffMeals.dinner}
                      onChange={(e) => setStaffMeals((prev) => ({ ...prev, dinner: e.target.value }))}
                      className="text-lg h-14"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Extra Items & Special Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Extra Items & Special Requests</CardTitle>
                <CardDescription className="text-base">
                  Enter quantities for additional items needed today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {EXTRA_ITEMS.map((item) => (
                    <div key={item} className="space-y-3">
                      <Label htmlFor={item} className="text-base font-semibold">
                        {item}
                      </Label>
                      <Input
                        id={item}
                        type="number"
                        min="0"
                        placeholder="0"
                        value={extraItems[item] || ""}
                        onChange={(e) => handleExtraItemChange(item, e.target.value)}
                        className="text-lg h-14"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button onClick={handleSubmit} size="lg" className="w-full max-w-md text-lg h-16 font-semibold">
                <Save className="mr-2 h-5 w-5" />
                Submit Today's Meal Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}