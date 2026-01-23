"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface User {
  id: string
  name: string
  role: string
  status: "approved" | "pending" | "rejected"
}

const INITIAL_USERS: User[] = [
  { id: "1", name: "John Smith", role: "Diet Clerk", status: "approved" },
  { id: "2", name: "Sarah Johnson", role: "Admin", status: "approved" },
  { id: "3", name: "Michael Brown", role: "Subject Clerk", status: "approved" },
  { id: "4", name: "Emily Davis", role: "Accountant", status: "approved" },
]

export function UserAccountsTab() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", role: "" })

  const handleAddUser = () => {
    if (newUser.name && newUser.role) {
      setUsers([
        ...users,
        {
          id: Date.now().toString(),
          name: newUser.name,
          role: newUser.role,
          status: "approved",
        },
      ])
      setNewUser({ name: "", role: "" })
      setShowAddForm(false)
    }
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  return (
    <div>
      <PageHeader title="User Accounts" description="Manage system users and their roles">
        <Button onClick={() => setShowAddForm(!showAddForm)} size="lg" className="text-base">
          <Plus className="mr-2 h-5 w-5" />
          Add New User
        </Button>
      </PageHeader>

      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="user-name" className="text-base font-semibold">
                  Full Name
                </Label>
                <Input
                  id="user-name"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="text-base h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="user-role" className="text-base font-semibold">
                  Role
                </Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger id="user-role" className="text-base h-12">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diet Clerk">Diet Clerk</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Subject Clerk">Subject Clerk</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleAddUser} size="lg" className="text-base">
                Save User
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" size="lg" className="text-base">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="p-4 text-left text-base font-bold">Name</th>
                  <th className="p-4 text-left text-base font-bold">Role</th>
                  <th className="p-4 text-left text-base font-bold">Status</th>
                  <th className="p-4 text-right text-base font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border">
                    <td className="p-4 text-base font-medium">{user.name}</td>
                    <td className="p-4 text-base">{user.role}</td>
                    <td className="p-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-base bg-transparent">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-base text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
