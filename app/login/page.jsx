"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Hospital } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

// Removed TypeScript type import and type annotations

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Please enter both username and password")
      return
    }

    const success = login(username, password)
    if (!success) {
      setError("Invalid username or password")
    }
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
          <CardTitle className="text-3xl">Hospital Meal Management</CardTitle>
          <CardDescription className="text-base">Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 text-base"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 text-base pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 text-base text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>
            )}

            <Button type="submit" className="w-full h-14 text-base" size="lg">
              Sign In
            </Button>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-base text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Diet Clerk: dietclerk / Password123</p>
              <p>Admin: admin / Password123</p>
              <p>Subject Clerk: subjectclerk / Password123</p>
              <p>Accountant: accountant / Password123</p>
              <p>Kitchen: kitchen / Password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}