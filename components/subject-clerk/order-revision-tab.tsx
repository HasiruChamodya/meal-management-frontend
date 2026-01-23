"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send } from "lucide-react"

interface OrderItem {
  id: string
  ingredient: string
  calculatedQuantity: string
  overrideQuantity: string
  unit: string
  unitPrice: string
  totalPrice: string
}

const INITIAL_ORDER: OrderItem[] = [
  {
    id: "1",
    ingredient: "Rice",
    calculatedQuantity: "45",
    overrideQuantity: "",
    unit: "kg",
    unitPrice: "2.50",
    totalPrice: "112.50",
  },
  {
    id: "2",
    ingredient: "Chicken",
    calculatedQuantity: "30",
    overrideQuantity: "",
    unit: "kg",
    unitPrice: "8.00",
    totalPrice: "240.00",
  },
  {
    id: "3",
    ingredient: "Eggs",
    calculatedQuantity: "150",
    overrideQuantity: "",
    unit: "pieces",
    unitPrice: "0.30",
    totalPrice: "45.00",
  },
  {
    id: "4",
    ingredient: "Milk",
    calculatedQuantity: "25",
    overrideQuantity: "",
    unit: "liters",
    unitPrice: "1.20",
    totalPrice: "30.00",
  },
  {
    id: "5",
    ingredient: "Vegetables",
    calculatedQuantity: "35",
    overrideQuantity: "",
    unit: "kg",
    unitPrice: "3.50",
    totalPrice: "122.50",
  },
]

export function OrderRevisionTab() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(INITIAL_ORDER)

  const handleQuantityOverride = (id: string, value: string) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === id) {
          const quantity = value || item.calculatedQuantity
          const totalPrice = (Number.parseFloat(quantity) * Number.parseFloat(item.unitPrice)).toFixed(2)
          return { ...item, overrideQuantity: value, totalPrice }
        }
        return item
      }),
    )
  }

  const handlePriceOverride = (id: string, value: string) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === id) {
          const quantity = item.overrideQuantity || item.calculatedQuantity
          const totalPrice = (Number.parseFloat(quantity) * Number.parseFloat(value)).toFixed(2)
          return { ...item, unitPrice: value, totalPrice }
        }
        return item
      }),
    )
  }

  const calculateGrandTotal = () => {
    return orderItems.reduce((sum, item) => sum + Number.parseFloat(item.totalPrice), 0).toFixed(2)
  }

  const handleFinalize = () => {
    console.log("Finalizing order:", orderItems)
    alert("Order finalized and sent to Accountant for approval!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Generated Order Sheet</CardTitle>
          <CardDescription className="text-base">
            Review and override quantities or prices as needed before finalizing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="p-4 text-left text-base font-bold">Ingredient</th>
                  <th className="p-4 text-center text-base font-bold">Calculated Qty</th>
                  <th className="p-4 text-center text-base font-bold">Override Qty</th>
                  <th className="p-4 text-center text-base font-bold">Unit</th>
                  <th className="p-4 text-right text-base font-bold">Unit Price</th>
                  <th className="p-4 text-right text-base font-bold">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="p-4 text-base font-medium">{item.ingredient}</td>
                    <td className="p-4 text-center text-base text-muted-foreground">{item.calculatedQuantity}</td>
                    <td className="p-4">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder={item.calculatedQuantity}
                        value={item.overrideQuantity}
                        onChange={(e) => handleQuantityOverride(item.id, e.target.value)}
                        className="w-28 text-center text-base h-12 mx-auto"
                      />
                    </td>
                    <td className="p-4 text-center text-base">{item.unit}</td>
                    <td className="p-4">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handlePriceOverride(item.id, e.target.value)}
                        className="w-28 text-right text-base h-12 ml-auto"
                      />
                    </td>
                    <td className="p-4 text-right text-base font-semibold">${item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50">
                <tr className="border-t-2 border-border">
                  <td colSpan={5} className="p-4 text-right text-lg font-bold">
                    Grand Total:
                  </td>
                  <td className="p-4 text-right text-lg font-bold text-primary">${calculateGrandTotal()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-6">
            <h3 className="text-lg font-semibold">Supplier Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier-name" className="text-base font-semibold">
                  Supplier Name
                </Label>
                <Input id="supplier-name" defaultValue="ABC Food Supplies Ltd." className="text-base h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-date" className="text-base font-semibold">
                  Delivery Date
                </Label>
                <Input id="delivery-date" type="date" className="text-base h-12" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleFinalize} size="lg" className="w-full max-w-md text-lg h-16 font-semibold">
          <Send className="mr-2 h-5 w-5" />
          Finalize and Send to Accountant
        </Button>
      </div>
    </div>
  )
}
