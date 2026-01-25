"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hospital, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

// Removed all TypeScript imports/types (including 'import type' and type annotations in function signatures)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Please enter your email address")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    // In a real app, this would call the backend API to send reset email
    // For now, just show success message
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent password reset instructions to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg text-base text-muted-foreground">
              <p className="mb-2">Please check your email and click the reset link to create a new password.</p>
              <p>If you don't see the email, check your spam folder.</p>
            </div>

            <Link href="/login">
              <Button className="w-full h-14 text-base" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
              </Button>
            </Link>

            <div className="text-center">
              <button
                onClick={() => setSubmitted(false)}
                className="text-base text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <Hospital className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Reset Your Password</CardTitle>
          <CardDescription className="text-base">
            Enter your email address and we'll send you instructions to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-base"
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="p-4 text-base text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>
            )}

            <Button type="submit" className="w-full h-14 text-base" size="lg">
              Send Reset Instructions
            </Button>

            <Link href="/login">
              <Button variant="outline" className="w-full h-14 text-base bg-transparent" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
              </Button>
            </Link>
          </form>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800 mb-2">Need Help?</p>
            <p className="text-sm text-amber-700">
              If you don't have access to your email, please contact your system administrator for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}