"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (user?.role) {
      // Redirect to appropriate dashboard based on role
      router.push(`/${user.role}`)
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="text-lg text-muted-foreground mb-4">Loading...</div>
      </div>
    </div>
  )
}
