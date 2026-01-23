"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function LogoutButton() {
  const { logout, user } = useAuth()

  return (
    <div className="flex items-center gap-4">
      <span className="text-base text-muted-foreground">
        Welcome, <span className="font-medium text-foreground">{user?.name}</span>
      </span>
      <Button onClick={logout} variant="outline" size="lg" className="h-12 bg-transparent">
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  )
}
