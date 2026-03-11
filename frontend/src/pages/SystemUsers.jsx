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
import { Plus, Edit2, KeyRound, UserX } from "lucide-react";

const API_BASE = "http://localhost:5050/api/users";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const STATUS_STYLE = {
  active: "bg-primary/20 text-primary",
  deactivated: "bg-muted text-muted-foreground",
  locked: "bg-destructive/20 text-destructive",
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
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Last Login
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>

                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {u.email}
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-muted text-muted-foreground">
                        {formatRoleLabel(u.role)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          STATUS_STYLE[u.status] || STATUS_STYLE.deactivated
                        }
                      >
                        {u.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {u.lastLogin || "Never"}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setIsNew(false);
                            setEdit({
                              id: u.id,
                              name: u.name,
                              email: u.email,
                              role: u.role,
                              status: u.status,
                              lastLogin: u.lastLogin || "Never",
                            });
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => resetPassword(u)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStatus(u)}
                        >
                          <UserX className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-6"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
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