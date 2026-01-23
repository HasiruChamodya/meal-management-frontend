"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle, XCircle, Download, Mail, TrendingUp } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { LogoutButton } from "@/components/logout-button"

interface PendingApproval {
  id: string
  type: string
  description: string
  submittedBy: string
  date: string
  changes?: Change[]
  notes?: string
}

interface Change {
  item: string
  oldValue: string
  newValue: string
}

const INITIAL_APPROVALS: PendingApproval[] = [
  {
    id: "1",
    type: "Purchase Order",
    description: "Purchase Order for delivery on 2025-01-12 - Total: $550.00",
    submittedBy: "Subject Clerk",
    date: "2025-01-10",
    changes: [
      { item: "Chicken", oldValue: "30 kg @ $8.00/kg", newValue: "32 kg @ $8.50/kg" },
      { item: "Rice", oldValue: "45 kg @ $2.50/kg", newValue: "48 kg @ $2.75/kg" },
    ],
    notes: "Increased chicken quantity due to ward demand. Updated prices based on latest supplier quote.",
  },
  {
    id: "2",
    type: "Purchase Order",
    description: "Additional Order for vegetables - Total: $245.00",
    submittedBy: "Subject Clerk",
    date: "2025-01-10",
    changes: [
      { item: "Vegetables", oldValue: "35 kg @ $3.50/kg", newValue: "40 kg @ $3.75/kg" },
    ],
    notes: "Increased vegetable quantity due to higher than expected patient count.",
  },
]

export default function AccountantPage() {
  const [approvals, setApprovals] = useState<PendingApproval[]>(INITIAL_APPROVALS)
  const [reportType, setReportType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [forecastPeriod, setForecastPeriod] = useState("last-30-days")

  const handleApprove = (id: string) => {
    const item = approvals.find((a) => a.id === id)
    if (item) {
      alert(`Approved: ${item.description}`)
      setApprovals(approvals.filter((a) => a.id !== id))
    }
  }

  const handleReject = (id: string) => {
    const item = approvals.find((a) => a.id === id)
    if (item) {
      alert(`Rejected: ${item.description}`)
      setApprovals(approvals.filter((a) => a.id !== id))
    }
  }

  const handleConfirmInvoice = () => {
    alert("Invoice confirmed and email sent to supplier!")
  }

  const handleDownloadReport = () => {
    if (reportType && startDate && endDate) {
      alert(`Downloading ${reportType} report from ${startDate} to ${endDate}`)
    } else {
      alert("Please select report type and date range")
    }
  }

  const handleDownloadForecast = () => {
    alert(`Downloading Meal Forecasting & Trend Analysis report for ${forecastPeriod}`)
  }

  return (
    <AuthGuard allowedRole="accountant">
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

          <PageHeader title="Accountant Dashboard" description="Financial oversight and final approvals" />

          <div className="space-y-6">
            {/* Card 1: Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Pending Approvals</CardTitle>
                <CardDescription className="text-base">Review and approve or reject submitted items</CardDescription>
              </CardHeader>
              <CardContent>
                {approvals.length > 0 ? (
                  <div className="space-y-6">
                    {approvals.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-border bg-card p-6 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                {item.type}
                              </span>
                              <span className="text-sm text-muted-foreground">{item.date}</span>
                            </div>
                            <p className="text-base font-medium leading-relaxed">{item.description}</p>
                            <p className="text-sm text-muted-foreground">Submitted by: {item.submittedBy}</p>
                          </div>
                        </div>

                        {/* Changes Section */}
                        {item.changes && item.changes.length > 0 && (
                          <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border">
                            <h4 className="font-semibold text-base text-foreground">Changes Made:</h4>
                            {item.changes.map((change, idx) => (
                              <div key={idx} className="text-sm space-y-1">
                                <p className="font-medium text-foreground">{change.item}</p>
                                <p className="text-muted-foreground">From: {change.oldValue}</p>
                                <p className="text-primary font-medium">To: {change.newValue}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Notes Section */}
                        {item.notes && (
                          <div className="bg-warning/10 rounded-lg p-4 border border-warning/20">
                            <h4 className="font-semibold text-base text-foreground mb-2">Subject Clerk Notes:</h4>
                            <p className="text-sm text-foreground">{item.notes}</p>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-border">
                          <Button
                            onClick={() => handleApprove(item.id)}
                            size="lg"
                            className="bg-success text-success-foreground hover:bg-success/90 text-base font-semibold flex-1"
                          >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(item.id)}
                            size="lg"
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground text-base font-semibold flex-1"
                          >
                            <XCircle className="mr-2 h-5 w-5" />
                            Send Back for Revision
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-lg text-muted-foreground">No pending approvals at this time</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 2: Final Invoice Review */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Final Invoice Review</CardTitle>
                <CardDescription className="text-base">
                  Review the finalized invoice before sending to supplier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-border bg-muted/30 p-6">
                  <div className="mb-6 grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-base font-semibold text-muted-foreground">Supplier</h3>
                      <p className="text-lg font-medium">ABC Food Supplies Ltd.</p>
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold text-muted-foreground">Delivery Date</h3>
                      <p className="text-lg font-medium">January 12, 2025</p>
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold text-muted-foreground">Invoice Number</h3>
                      <p className="text-lg font-medium">INV-2025-001</p>
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold text-muted-foreground">Total Amount</h3>
                      <p className="text-2xl font-bold text-primary">$550.00</p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-border pt-4">
                    <h3 className="text-base font-semibold">Order Items:</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-base">
                        <span>Rice (45 kg @ $2.50/kg)</span>
                        <span className="font-semibold">$112.50</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span>Chicken (30 kg @ $8.00/kg)</span>
                        <span className="font-semibold">$240.00</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span>Eggs (150 pieces @ $0.30/piece)</span>
                        <span className="font-semibold">$45.00</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span>Milk (25 liters @ $1.20/liter)</span>
                        <span className="font-semibold">$30.00</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span>Vegetables (35 kg @ $3.50/kg)</span>
                        <span className="font-semibold">$122.50</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleConfirmInvoice}
                    size="lg"
                    className="w-full max-w-md text-lg h-16 font-semibold"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Confirm and Email Invoice to Supplier
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Reports with Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Reports & Analytics</CardTitle>
                <CardDescription className="text-base">
                  Download financial reports and view trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="standard" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12">
                    <TabsTrigger value="standard" className="text-base">
                      Standard Reports
                    </TabsTrigger>
                    <TabsTrigger value="forecasting" className="text-base">
                      Meal Forecasting & Trends
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="standard" className="space-y-6 mt-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-3">
                        <Label htmlFor="report-type" className="text-base font-semibold">
                          Report Type
                        </Label>
                        <Select value={reportType} onValueChange={setReportType}>
                          <SelectTrigger id="report-type" className="text-base h-12">
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily-logistics" className="text-base">
                              Daily Logistics
                            </SelectItem>
                            <SelectItem value="financial-summary" className="text-base">
                              Financial Summary
                            </SelectItem>
                            <SelectItem value="ingredient-usage" className="text-base">
                              Ingredient Usage
                            </SelectItem>
                            <SelectItem value="supplier-payments" className="text-base">
                              Supplier Payments
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="start-date" className="text-base font-semibold">
                          Start Date
                        </Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="text-base h-12"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="end-date" className="text-base font-semibold">
                          End Date
                        </Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="text-base h-12"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={handleDownloadReport} size="lg" className="w-full max-w-md text-base h-14">
                        <Download className="mr-2 h-5 w-5" />
                        Download PDF Report
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="forecasting" className="space-y-6 mt-6">
                    <div className="rounded-lg border border-border bg-muted/30 p-6 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">Meal Forecasting & Trend Analysis</h3>
                          <p className="text-base text-muted-foreground leading-relaxed">
                            Analyze meal count trends, ingredient consumption rates, and predict future requirements
                            based on historical data. This report helps optimize inventory planning and budget
                            forecasting.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="forecast-period" className="text-base font-semibold">
                          Analysis Period
                        </Label>
                        <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                          <SelectTrigger id="forecast-period" className="text-base h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="last-30-days" className="text-base">
                              Last 30 Days
                            </SelectItem>
                            <SelectItem value="last-90-days" className="text-base">
                              Last 90 Days (Quarterly)
                            </SelectItem>
                            <SelectItem value="last-6-months" className="text-base">
                              Last 6 Months
                            </SelectItem>
                            <SelectItem value="last-12-months" className="text-base">
                              Last 12 Months (Annual)
                            </SelectItem>
                            <SelectItem value="month-to-month" className="text-base">
                              Month-to-Month Comparison
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="rounded-lg bg-card p-4 space-y-3">
                        <h4 className="text-base font-semibold">Report Includes:</h4>
                        <ul className="space-y-2 text-base text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Meal count trends by diet type over selected period</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Ingredient consumption rates and patterns</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Cost analysis and budget variance tracking</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Seasonal variations and peak demand periods</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Predictive forecasting for next period requirements</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={handleDownloadForecast} size="lg" className="w-full max-w-md text-base h-14">
                        <Download className="mr-2 h-5 w-5" />
                        Download Forecasting Report
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
