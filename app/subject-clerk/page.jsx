"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PricingTab } from "@/components/subject-clerk/pricing-tab"
import { OrderRevisionTab } from "@/components/subject-clerk/order-revision-tab"
import { AuthGuard } from "@/components/auth-guard"
import { LogoutButton } from "@/components/logout-button"

// Removed TypeScript type annotations/use; using string union for tab states

export default function SubjectClerkPage() {
  const [activeTab, setActiveTab] = useState("pricing")

  return (
    <AuthGuard allowedRole="subject-clerk">
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

          <div className="mb-8">
            <h1 className="mb-4 text-balance">Subject Clerk Workspace</h1>
            <p className="text-lg text-muted-foreground">Manage pricing and review orders before approval</p>
          </div>

          <div className="mb-6 flex gap-3 border-b border-border">
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-6 py-3 text-base font-semibold transition-colors ${
                activeTab === "pricing"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Update Ingredient Prices
            </button>
            <button
              onClick={() => setActiveTab("revision")}
              className={`px-6 py-3 text-base font-semibold transition-colors ${
                activeTab === "revision"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Revise Order
            </button>
          </div>

          {activeTab === "pricing" && <PricingTab />}
          {activeTab === "revision" && <OrderRevisionTab />}
        </div>
      </div>
    </AuthGuard>
  )
}