import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
// 👇 Added UserCheck here for the activation icon
import { Plus, Edit2, KeyRound, UserX, UserCheck } from "lucide-react";

const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:5050/api"}/users`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Updated with rich theme colors
const STATUS_STYLE = {
  active: "bg-success text-success-foreground hover:bg-success border-transparent font-medium",
  deactivated: "bg-error-bg text-destructive hover:bg-error-bg border-transparent font-medium",
  locked: "bg-destructive/20 text-destructive hover:bg-destructive/20 border-transparent font-medium",
};

const emptyUser = {
  id: "",
  name: "",
  email: "",
  role: "SYSTEM_ADMIN",
  status: "active",
  lastLogin: "Never",
};

const ROLE_OPTIONS = [
  { label: "System Admin", value: "SYSTEM_ADMIN" },
  { label: "Hospital Admin", value: "HOSPITAL_ADMIN" },
  { label: "Diet Clerk", value: "DIET_CLERK" },
  { label: "Subject Clerk", value: "SUBJECT_CLERK" },
  { label: "Accountant", value: "ACCOUNTANT" },
  { label: "Kitchen Staff", value: "KITCHEN" },
];

const formatRoleLabel = (role) => {
  const found = ROLE_OPTIONS.find((r) => r.value === role);
  return found ? found.label : role;
};

const SystemUsers = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch(API_BASE, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openNew = () => {
    setIsNew(true);
    setEdit({
      ...emptyUser,
      id: String(Date.now()),
    });
  };

  const save = async () => {
    if (!edit) return;

    try {
      setSaving(true);

      const payload = {
        name: edit.name,
        email: edit.email,
        role: edit.role,
      };

      let res;
      let data;

      if (isNew) {
        res = await fetch(API_BASE, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ...payload,
            password: "Temp@123",
          }),
        });
      } else {
        res = await fetch(`${API_BASE}/${edit.id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Save failed");
      }

      toast({
        title: isNew ? "User Created" : "User Updated",
        description: data.message,
      });

      setEdit(null);
      setIsNew(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not save user",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "deactivated" : "active";

    try {
      const res = await fetch(`${API_BASE}/${user.id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Status update failed");
      }

      toast({
        title: "User Status Updated",
        description: `${user.name} is now ${newStatus}`,
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not update status",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (user) => {
    try {
      const res = await fetch(`${API_BASE}/${user.id}/reset-password`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      toast({
        title: "Password Reset",
        description: data.message || `Password reset for ${user.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not reset password",
        variant: "destructive",
      });
    }
  };

  // Sort users: Active users at the top, deactivated at the bottom
  const sortedUsers = [...users].sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1;
    if (a.status !== "active" && b.status === "active") return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md font-bold text-foreground">
          User Management
        </h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          {loading ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading users...
            </div>
          ) : (
            <Table>
              <TableHeader>
                {/* Cleaned up hard-coded border colors to rely on theme default */}
                <TableRow className="text-lg">
                  <TableHead className="font-semibold text-foreground text-center">Name</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-foreground text-center">Email</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Role</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Status</TableHead>
                  <TableHead className="hidden sm:table-cell font-semibold text-foreground text-center">Last Login</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedUsers.map((u) => (
                  <TableRow 
                    key={u.id} 
                    /* Cleaned up hard-coded background colors to use the theme's muted hover */
                    className="text-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <TableCell className="font-medium py-5 text-center">{u.name}</TableCell>

                    <TableCell className="hidden md:table-cell text-muted-foreground py-5 text-center">
                      {u.email}
                    </TableCell>

                    <TableCell className="py-5 text-center">
                      <Badge className="bg-muted text-muted-foreground hover:bg-muted border-transparent text-base px-3 py-1">
                       {formatRoleLabel(u.role)}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-5 text-center">
                      <Badge
                        className={`text-base px-3 py-1 ${
                          STATUS_STYLE[u.status] || STATUS_STYLE.deactivated
                        }`}
                      >
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-muted-foreground py-5 text-center">
                      {u.lastLogin || "Never"}
                    </TableCell>

                    <TableCell className="py-5">
                      <div className="flex justify-center gap-2">
                        
                        <Button
                          title="Edit User"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setIsNew(false);
                            setEdit({ ...u });
                          }}
                        >
                          <Edit2 className="h-5 w-5" />
                        </Button>

                        <Button
                          title="Reset Password"
                          variant="ghost"
                          size="icon"
                          onClick={() => resetPassword(u)}
                        >
                          <KeyRound className="h-5 w-5" />
                        </Button>

                        {/* 👇 Updated to dynamically switch icons and colors based on status */}
                        <Button
                          title={u.status === "active" ? "Deactivate User" : "Activate User"}
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStatus(u)}
                        >
                          {u.status === "active" ? (
                            <UserX className="h-5 w-5 text-destructive" />
                          ) : (
                            <UserCheck className="h-5 w-5 text-primary" />
                          )}
                        </Button>

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!edit} onOpenChange={() => setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Add User" : "Edit User"}</DialogTitle>
          </DialogHeader>

          {edit && (
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={edit.name}
                  onChange={(e) =>
                    setEdit({ ...edit, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={edit.email}
                  onChange={(e) =>
                    setEdit({ ...edit, email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Role</Label>
                <Select
                  value={edit.role}
                  onValueChange={(v) => setEdit({ ...edit, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : isNew ? "Create User" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemUsers;