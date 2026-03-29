import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = "http://localhost:5050/api/wards";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const emptyWard = {
  id: "", code: "", name: "", beds: 0, cots: 0, icu: 0, incubators: 0, active: true,
};

const AdminWards = () => {
  const { toast } = useToast();

  const [wards, setWards] = useState([]);
  const [editWard, setEditWard] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchWards = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, { method: "GET", headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch wards");
      setWards(data.wards || []);
    } catch (error) {
      toast({ title: "Error", description: error.message || "Could not load wards", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWards(); }, []);

  const openNew = () => { setIsNew(true); setEditWard({ ...emptyWard }); };

  const save = async () => {
    if (!editWard) return;
    try {
      setSaving(true);
      const payload = {
        code: editWard.code, name: editWard.name, beds: Number(editWard.beds) || 0,
        cots: Number(editWard.cots) || 0, icu: Number(editWard.icu) || 0, incubators: Number(editWard.incubators) || 0,
      };

      const url = isNew ? API_BASE : `${API_BASE}/${editWard.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Save failed");

      toast({ title: isNew ? "Ward Added" : "Ward Updated", description: data.message });
      setEditWard(null); setIsNew(false); fetchWards();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Could not save ward", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (ward) => {
    const newStatus = !ward.active;
    try {
      const res = await fetch(`${API_BASE}/${ward.id}/status`, {
        method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify({ active: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change ward status");

      toast({ title: "Ward Status Changed", description: `${ward.name} is now ${newStatus ? "Active" : "Inactive"}` });
      fetchWards();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Could not update ward status", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md font-bold text-foreground">Ward Management</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Ward</Button>
      </div>

      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          {loading ? (
            <div className="py-6 text-center text-muted-foreground">Loading wards...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Beds</TableHead>
                  <TableHead className="text-right">Cots</TableHead>
                  <TableHead className="text-right">ICU</TableHead>
                  <TableHead className="text-right">Incubators</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {wards.map((w) => (
                  <TableRow key={w.id} className={cn("transition-all", !w.active && "opacity-50 bg-muted/30 grayscale")}>
                    <TableCell className={cn("font-medium", !w.active && "text-muted-foreground")}>{w.code}</TableCell>
                    <TableCell className={cn(!w.active && "text-muted-foreground")}>{w.name}</TableCell>
                    <TableCell className="text-right">{w.beds}</TableCell>
                    <TableCell className="text-right">{w.cots}</TableCell>
                    <TableCell className="text-right">{w.icu}</TableCell>
                    <TableCell className="text-right">{w.incubators}</TableCell>
                    <TableCell className="text-right font-bold">
                      {(w.beds || 0) + (w.cots || 0) + (w.icu || 0) + (w.incubators || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge className={w.active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                        {w.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setIsNew(false); setEditWard({ ...w }); }} disabled={!w.active}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deactivate(w)}>
                          {w.active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {wards.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-6">No wards found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editWard} onOpenChange={() => setEditWard(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isNew ? "Add Ward" : "Edit Ward"}</DialogTitle></DialogHeader>
          {editWard && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Ward Code</Label><Input value={editWard.code} onChange={(e) => setEditWard({ ...editWard, code: e.target.value })} /></div>
                <div><Label>Name</Label><Input value={editWard.name} onChange={(e) => setEditWard({ ...editWard, name: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Beds</Label><Input type="number" value={editWard.beds} onChange={(e) => setEditWard({ ...editWard, beds: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>Cots</Label><Input type="number" value={editWard.cots} onChange={(e) => setEditWard({ ...editWard, cots: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>ICU</Label><Input type="number" value={editWard.icu} onChange={(e) => setEditWard({ ...editWard, icu: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>Incubators</Label><Input type="number" value={editWard.incubators} onChange={(e) => setEditWard({ ...editWard, incubators: parseInt(e.target.value) || 0 })} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditWard(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : isNew ? "Add" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWards;