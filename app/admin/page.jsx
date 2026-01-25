"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UserAccountsTab } from "@/components/admin/user-accounts-tab"
import { WardsTab } from "@/components/admin/wards-tab"
import { DietTypesTab } from "@/components/admin/diet-types-tab"
import { IngredientsTab } from "@/components/admin/ingredients-tab"
import { IngredientRequirementsTab } from "@/components/admin/ingredient-requirements-tab"
import { DietCycleTab } from "@/components/admin/diet-cycle-tab"
import { SystemSettingsTab } from "@/components/admin/system-settings-tab"
import { AuthGuard } from "@/components/auth-guard"
import { LogoutButton } from "@/components/logout-button"
import { RecipesTab } from "@/components/admin/recipes-tab"

// Removed TypeScript type usage, replaced with plain string
// Removed TabType annotation and all 'as TabType' casts
// Added 'diet-cycle' to tabs and logic instead of mapping to a type

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users")

  const tabs = [
    { id: "users", label: "User Accounts" },
    { id: "wards", label: "Wards" },
    { id: "ingredients", label: "Ingredients" },
    { id: "diets", label: "Ingredient Requirements" },
    { id: "diet-cycle", label: "Diet Cycle Management" },
    { id: "settings", label: "System Settings" },
  ]

  return (
    <AuthGuard allowedRole="admin">
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Left Sidebar Navigation */}
          <aside className="w-64 min-h-screen bg-card border-r border-border p-6">
            <Link href="/">
              <Button variant="ghost" className="mb-8 text-base w-full justify-start" size="lg">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>

            <nav className="space-y-2">
              <h2 className="mb-4 text-xl font-bold text-foreground">Admin Panel</h2>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-border">
              <LogoutButton />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6 md:p-12">
            <div className="mx-auto max-w-6xl">
              {activeTab === "users" && <UserAccountsTab />}
              {activeTab === "wards" && <WardsTab />}
              {activeTab === "ingredients" && <IngredientsTab />}
              {activeTab === "diets" && <IngredientRequirementsTab />}
              {activeTab === "diet-cycle" && <DietCycleTab />}
              {activeTab === "settings" && <SystemSettingsTab />}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}