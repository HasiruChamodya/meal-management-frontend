"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/status-badge"
import { Send } from "lucide-react"

// Removed TypeScript interface (IngredientPrice) and type annotations. All state/data are plain JS.

const INITIAL_PRICES = [
  { id: "1", name: "Rice", currentPrice: "2.50", newPrice: "", unit: "kg", status: "approved" },
  { id: "2", name: "Chicken", currentPrice: "8.00", newPrice: "", unit: "kg", status: "approved" },
  { id: "3", name: "Eggs", currentPrice: "0.30", newPrice: "", unit: "piece", status: "approved" },
  { id: "4", name: "Milk", currentPrice: "1.20", newPrice: "", unit: "liter", status: "approved" },
  { id: "5", name: "Vegetables", currentPrice: "3.50", newPrice: "", unit: "kg", status: "approved" },
  { id: "6", name: "Fish", currentPrice: "12.00", newPrice: "", unit: "kg", status: "approved" },
  { id: "7", name: "Bread", currentPrice: "2.00", newPrice: "", unit: "loaf", status: "approved" },
  { id: "8", name: "Yoghurt", currentPrice: "1.50", newPrice: "", unit: "cup", status: "approved" },
]

export function PricingTab() {
  const [prices, setPrices] = useState(INITIAL_PRICES)

  const handlePriceChange = (id, value) => {
    setPrices(
      prices.map((item) =>
        item.id === id ? { ...item, newPrice: value, status: value ? "pending" : "approved" } : item,
      ),
    )
  }

  const handleSubmit = () => {
    const changedPrices = prices.filter((item) => item.newPrice)
    if (changedPrices.length > 0) {
      console.log("Submitting price changes:", changedPrices)
      alert(`${changedPrices.length} price changes submitted for approval!`)
    } else {
      alert("No price changes to submit")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="p-4 text-left text-base font-bold">Ingredient Name</th>
                  <th className="p-4 text-left text-base font-bold">Unit</th>
                  <th className="p-4 text-right text-base font-bold">Current Unit Price</th>
                  <th className="p-4 text-right text-base font-bold">New Unit Price</th>
                  <th className="p-4 text-center text-base font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="p-4 text-base font-medium">{item.name}</td>
                    <td className="p-4 text-base">{item.unit}</td>
                    <td className="p-4 text-right text-base font-semibold">${item.currentPrice}</td>
                    <td className="p-4">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={item.currentPrice}
                        value={item.newPrice}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="w-32 text-right text-base h-12 ml-auto"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleSubmit} size="lg" className="w-full max-w-md text-lg h-16 font-semibold">
          <Send className="mr-2 h-5 w-5" />
          Submit Price Changes for Approval
        </Button>
      </div>
    </div>
  )
}