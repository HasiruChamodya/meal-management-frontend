import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MOCK_SYSTEM_USERS } from "@/lib/module-data";
import { Plus, Edit2, KeyRound, Shield, ShieldOff, UserX } from "lucide-react";

const STATUS_STYLE = {
  active: "bg-primary/20 text-primary",
  deactivated: "bg-muted text-muted-foreground",
  locked: "bg-destructive/20 text-destructive",
};

const SystemUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([...MOCK_SYSTEM_USERS]);
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => {
    setIsNew(true);
    setEdit({ 
      id: String(Date.now()), 
      name: "", 
      username: "", 
      email: "", 
      role: "Diet Clerk", 
      status: "active", 
      lastLogin: "Never", 
      twoFA: false 
    });
  };

  const save = () => {
    if (!edit) return;
    if (isNew) { 
      setUsers((p) => [...p, edit]); 
      toast({ title: "User Created" }); 
    } else { 
      setUsers((p) => p.map((u) => (u.id === edit.id ? edit : u))); 
      toast({ title: "User Updated" }); 
    }
    setEdit(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md font-bold text-foreground">User Management</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add User</Button>
      </div>

      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Last Login</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge className="bg-muted text-muted-foreground">{u.role}</Badge></TableCell>
                  <TableCell><Badge className={STATUS_STYLE[u.status]}>{u.status}</Badge></TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{u.lastLogin}</TableCell>
                  <TableCell>
                    {u.twoFA ? (
                      <Shield className="h-4 w-4 text-primary" />
                    ) : (
                      <ShieldOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setIsNew(false); setEdit(u); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toast({ title: "Password Reset", description: `Password reset for ${u.name}` })}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { 
                          setUsers((p) => p.map((x) => x.id === u.id ? { 
                            ...x, 
                            status: x.status === "active" ? "deactivated" : "active" 
                          } : x)); 
                        }}
                      >
                        <UserX className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!edit} onOpenChange={() => setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isNew ? "Add User" : "Edit User"}</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input value={edit.username} onChange={(e) => setEdit({ ...edit, username: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={edit.role} onValueChange={(v) => setEdit({ ...edit, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["System Admin","Hospital Admin","Diet Clerk","Subject Clerk","Accountant","Kitchen Staff"].map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isNew && (
                <div className="flex items-center gap-2">
                  <Checkbox id="force-reset" defaultChecked />
                  <Label htmlFor="force-reset">Force password reset on first login</Label>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button onClick={save}>{isNew ? "Create User" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemUsers;