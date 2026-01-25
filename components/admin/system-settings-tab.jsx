"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"

// All state and logic is plain JS, no TypeScript types/annotations.

export function SystemSettingsTab() {
  const [settings, setSettings] = useState({
    hospitalName: "City General Hospital",
    hospitalAddress: "123 Medical Center Drive\nCity, State 12345",
    hospitalPhone: "+1 (555) 123-4567",
    hospitalEmail: "admin@cityhospital.com",
    supplierName: "Fresh Foods Supplier Co.",
    supplierAddress: "456 Supply Street\nCity, State 12345",
    supplierPhone: "+1 (555) 987-6543",
    supplierEmail: "orders@freshfoodssupplier.com",
  })

  const handleSave = () => {
    console.log("Saving settings:", settings)
    alert("System settings saved successfully!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">System Settings</h2>
        <p className="text-base text-muted-foreground mt-2">Configure hospital and supplier information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hospital Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Hospital Information</CardTitle>
            <CardDescription className="text-base">Details that appear on reports and invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="hospitalName" className="text-base font-semibold">
                Hospital Name
              </Label>
              <Input
                id="hospitalName"
                value={settings.hospitalName}
                onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
                className="text-lg h-12"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="hospitalAddress" className="text-base font-semibold">
                Address
              </Label>
              <Textarea
                id="hospitalAddress"
                value={settings.hospitalAddress}
                onChange={(e) => setSettings({ ...settings, hospitalAddress: e.target.value })}
                rows={3}
                className="text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="hospitalPhone" className="text-base font-semibold">
                Phone Number
              </Label>
              <Input
                id="hospitalPhone"
                value={settings.hospitalPhone}
                onChange={(e) => setSettings({ ...settings, hospitalPhone: e.target.value })}
                className="text-lg h-12"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="hospitalEmail" className="text-base font-semibold">
                Email Address
              </Label>
              <Input
                id="hospitalEmail"
                type="email"
                value={settings.hospitalEmail}
                onChange={(e) => setSettings({ ...settings, hospitalEmail: e.target.value })}
                className="text-lg h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Supplier Information</CardTitle>
            <CardDescription className="text-base">Primary supplier for ingredient orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="supplierName" className="text-base font-semibold">
                Supplier Name
              </Label>
              <Input
                id="supplierName"
                value={settings.supplierName}
                onChange={(e) => setSettings({ ...settings, supplierName: e.target.value })}
                className="text-lg h-12"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="supplierAddress" className="text-base font-semibold">
                Address
              </Label>
              <Textarea
                id="supplierAddress"
                value={settings.supplierAddress}
                onChange={(e) => setSettings({ ...settings, supplierAddress: e.target.value })}
                rows={3}
                className="text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="supplierPhone" className="text-base font-semibold">
                Phone Number
              </Label>
              <Input
                id="supplierPhone"
                value={settings.supplierPhone}
                onChange={(e) => setSettings({ ...settings, supplierPhone: e.target.value })}
                className="text-lg h-12"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="supplierEmail" className="text-base font-semibold">
                Email Address
              </Label>
              <Input
                id="supplierEmail"
                type="email"
                value={settings.supplierEmail}
                onChange={(e) => setSettings({ ...settings, supplierEmail: e.target.value })}
                className="text-lg h-12"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={handleSave} size="lg" className="w-full max-w-md text-lg h-14">
          <Save className="mr-2 h-5 w-5" />
          Save System Settings
        </Button>
      </div>
    </div>
  )
}