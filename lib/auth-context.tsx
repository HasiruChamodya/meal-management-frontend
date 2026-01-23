"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type UserRole = "diet-clerk" | "admin" | "subject-clerk" | "accountant" | "kitchen"

interface User {
  username: string
  role: UserRole
  name: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user database (in real app, this would be backend API)
const MOCK_USERS: Record<string, { password: string; role: UserRole; name: string }> = {
  dietclerk: { password: "Password123", role: "diet-clerk", name: "Diet Clerk" },
  admin: { password: "Password123", role: "admin", name: "Administrator" },
  subjectclerk: { password: "Password123", role: "subject-clerk", name: "Subject Clerk" },
  accountant: { password: "Password123", role: "accountant", name: "Accountant" },
  kitchen: { password: "Password123", role: "kitchen", name: "Kitchen Staff" },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("hospital_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (username: string, password: string): boolean => {
    const userRecord = MOCK_USERS[username]

    if (userRecord && userRecord.password === password) {
      const userData: User = {
        username,
        role: userRecord.role,
        name: userRecord.name,
      }
      setUser(userData)
      localStorage.setItem("hospital_user", JSON.stringify(userData))

      // Redirect to appropriate dashboard
      router.push(`/${userRecord.role}`)
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("hospital_user")
    router.push("/login")
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
