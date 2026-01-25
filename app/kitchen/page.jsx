"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"

// Removed TypeScript interfaces and used plain JS arrays/objects

const MEAL_TOTALS = [
  { dietType: "NORMAL DIET", count: 125 },
  { dietType: "DIABETIC", count: 42 },
  { dietType: "S1", count: 18 },
  { dietType: "S2", count: 15 },
  { dietType: "RENAL", count: 8 },
  { dietType: "LOW SODIUM", count: 12 },
  { dietType: "SOFT DIET", count: 20 },
]

const PROTEIN_PREP = [
  { name: "CHICKEN", quantity: "30 KG" },
  { name: "EGGS", quantity: "150 PIECES" },
  { name: "FISH", quantity: "15 KG" },
]

const SPECIAL_PREP = [
  { name: "SOUP", portions: 50 },
  { name: "BREAD", portions: 80 },
  { name: "YOGHURT", portions: 65 },
  { name: "FRESH FRUIT", portions: 45 },
]

const RECIPE_DETAILS = [
  {
    dishName: "VEGETABLE CURRY",
    mealType: "LUNCH",
    servings: 125,
    ingredients: [
      { name: "RICE", quantity: "18.75 KG" },
      { name: "MIXED VEGETABLES", quantity: "25 KG" },
      { name: "COOKING OIL", quantity: "1.25 L" },
      { name: "CURRY SPICES", quantity: "625 G" },
      { name: "SALT", quantity: "375 G" },
    ],
  },
  {
    dishName: "CHICKEN STEW",
    mealType: "LUNCH",
    servings: 97,
    ingredients: [
      { name: "RICE", quantity: "14.55 KG" },
      { name: "CHICKEN", quantity: "11.64 KG" },
      { name: "ONIONS", quantity: "4.85 KG" },
      { name: "TOMATOES", quantity: "3.88 KG" },
      { name: "COOKING OIL", quantity: "970 ML" },
    ],
  },
  {
    dishName: "DIABETIC BREAKFAST",
    mealType: "BREAKFAST",
    servings: 42,
    ingredients: [
      { name: "WHOLE WHEAT BREAD", quantity: "42 SLICES" },
      { name: "EGGS", quantity: "42 PIECES" },
      { name: "LOW-FAT MILK", quantity: "4.2 L" },
      { name: "SUGAR-FREE JAM", quantity: "840 G" },
    ],
  },
  {
    dishName: "RENAL DIET SPECIAL",
    mealType: "DINNER",
    servings: 8,
    ingredients: [
      { name: "LOW-PROTEIN RICE", quantity: "1.2 KG" },
      { name: "FISH (LOW PHOSPHORUS)", quantity: "960 G" },
      { name: "STEAMED VEGETABLES", quantity: "1.6 KG" },
      { name: "OLIVE OIL", quantity: "80 ML" },
    ],
  },
]

const FULL_INGREDIENTS = [
  { name: "RICE", quantity: "45 KG" },
  { name: "CHICKEN", quantity: "30 KG" },
  { name: "EGGS", quantity: "150 PIECES" },
  { name: "MILK", quantity: "25 LITERS" },
  { name: "VEGETABLES", quantity: "35 KG" },
  { name: "FISH", quantity: "15 KG" },
  { name: "BREAD", quantity: "80 LOAVES" },
  { name: "YOGHURT", quantity: "65 CUPS" },
  { name: "FRESH FRUIT", quantity: "45 PORTIONS" },
  { name: "COOKING OIL", quantity: "8 LITERS" },
  { name: "SPICES", quantity: "2 KG" },
  { name: "SALT", quantity: "1.5 KG" },
]

export default function KitchenPage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <AuthGuard allowedRole="kitchen">
      <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] p-8">
        <div className="mx-auto max-w-[1920px]">
          {/* Header with Time and Date */}
          <div className="mb-8 text-center border-b-4 border-[#F59E0B] pb-6">
            <h1 className="text-6xl font-bold text-[#F59E0B] mb-2">KITCHEN PREPARATION DISPLAY</h1>
            <div className="text-4xl font-bold text-white">{formatTime(currentTime)}</div>
            <div className="text-2xl text-[#94A3B8] mt-2">{formatDate(currentTime)}</div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Section 1: Meal Totals */}
            <div className="rounded-lg border-4 border-[#3B82F6] bg-[#1E293B] p-8">
              <h2 className="mb-6 text-4xl font-bold text-[#F59E0B] border-b-2 border-[#F59E0B] pb-4">MEAL TOTALS</h2>
              <div className="space-y-4">
                {MEAL_TOTALS.map((meal) => (
                  <div key={meal.dietType} className="flex items-center justify-between border-b border-[#334155] pb-3">
                    <span className="text-3xl font-bold text-white">{meal.dietType}</span>
                    <span className="text-5xl font-bold text-[#10B981]">{meal.count}</span>
                  </div>
                ))}
                <div className="mt-6 flex items-center justify-between border-t-4 border-[#F59E0B] pt-4">
                  <span className="text-4xl font-bold text-[#F59E0B]">TOTAL MEALS</span>
                  <span className="text-6xl font-bold text-[#F59E0B]">
                    {MEAL_TOTALS.reduce((sum, meal) => sum + meal.count, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Lunch Protein Prep */}
            <div className="rounded-lg border-4 border-[#10B981] bg-[#1E293B] p-8">
              <h2 className="mb-6 text-4xl font-bold text-[#F59E0B] border-b-2 border-[#F59E0B] pb-4">
                LUNCH PROTEIN PREP
              </h2>
              <div className="space-y-6">
                {PROTEIN_PREP.map((protein) => (
                  <div key={protein.name} className="flex items-center justify-between border-b border-[#334155] pb-4">
                    <span className="text-4xl font-bold text-white">{protein.name}</span>
                    <span className="text-5xl font-bold text-[#10B981]">{protein.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Special Prep */}
            <div className="rounded-lg border-4 border-[#F59E0B] bg-[#1E293B] p-8">
              <h2 className="mb-6 text-4xl font-bold text-[#F59E0B] border-b-2 border-[#F59E0B] pb-4">SPECIAL PREP</h2>
              <div className="space-y-6">
                {SPECIAL_PREP.map((item) => (
                  <div key={item.name} className="flex items-center justify-between border-b border-[#334155] pb-4">
                    <span className="text-4xl font-bold text-white">{item.name}</span>
                    <span className="text-5xl font-bold text-[#3B82F6]">{item.portions} PORTIONS</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Full Ingredient List */}
            <div className="rounded-lg border-4 border-[#3B82F6] bg-[#1E293B] p-8">
              <h2 className="mb-6 text-4xl font-bold text-[#F59E0B] border-b-2 border-[#F59E0B] pb-4">
                FULL INGREDIENT LIST
              </h2>
              <div className="max-h-[600px] space-y-3 overflow-y-auto pr-4">
                {FULL_INGREDIENTS.map((ingredient) => (
                  <div
                    key={ingredient.name}
                    className="flex items-center justify-between border-b border-[#334155] pb-3"
                  >
                    <span className="text-2xl font-bold text-white">{ingredient.name}</span>
                    <span className="text-3xl font-bold text-[#10B981]">{ingredient.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Recipe Details */}
          <div className="mt-8 rounded-lg border-4 border-[#10B981] bg-[#1E293B] p-8">
            <h2 className="mb-6 text-4xl font-bold text-[#F59E0B] border-b-2 border-[#F59E0B] pb-4">
              RECIPE DETAILS - TODAY'S DISHES
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {RECIPE_DETAILS.map((recipe) => (
                <div key={recipe.dishName} className="rounded-lg border-2 border-[#334155] bg-[#0F172A] p-6">
                  <div className="mb-4 border-b-2 border-[#F59E0B] pb-3">
                    <h3 className="text-3xl font-bold text-white">{recipe.dishName}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xl text-[#94A3B8]">{recipe.mealType}</span>
                      <span className="text-2xl font-bold text-[#10B981]">{recipe.servings} SERVINGS</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-lg font-semibold text-[#F59E0B]">INGREDIENTS:</p>
                    {recipe.ingredients.map((ing) => (
                      <div key={ing.name} className="flex items-center justify-between border-b border-[#334155] pb-2">
                        <span className="text-xl text-white">{ing.name}</span>
                        <span className="text-2xl font-bold text-[#3B82F6]">{ing.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-2xl text-[#94A3B8]">
              Cross-check all quantities before starting preparation • Report any discrepancies immediately
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}