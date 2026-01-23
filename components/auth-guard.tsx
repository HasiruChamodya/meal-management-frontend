"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRole?: string
}

export function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login")
      return
    }

    // If authenticated and on login page, redirect to user's dashboard
    if (isAuthenticated && pathname === "/login") {
      router.push(`/${user?.role}`)
      return
    }

    // If authenticated but trying to access wrong role's page
    if (isAuthenticated && allowedRole && user?.role !== allowedRole) {
      router.push(`/${user?.role}`)
    }
  }, [isAuthenticated, user, pathname, allowedRole, router])

  // Show loading or nothing while redirecting
  if (!isAuthenticated && pathname !== "/login") {
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>
  }

  if (isAuthenticated && allowedRole && user?.role !== allowedRole) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>
  }

  return <>{children}</>
}
