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
// 👇 Added Ban and CheckCircle for consistent action icons
import { Plus, Edit2, Ban, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = "http://localhost:5050/api/wards";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// 👇 Added rich theme colors for consistency
const STATUS_STYLE = {
  active: "bg-success text-success-foreground hover:bg-success border-transparent font-medium",
  inactive: "bg-error-bg text-destructive hover:bg-error-bg border-transparent font-medium",
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

  // 👇 Sort Wards: Active at the top (sorted by code), Inactive at the bottom
  const sortedWards = [...wards].sort((a, b) => {
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    return (a.code || "").localeCompare(b.code || "");
  });

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
                {/* 👇 Upgraded text-lg and text-center headers */}
                <TableRow className="text-lg">
                  <TableHead className="font-semibold text-foreground text-center">Code</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Name</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Beds</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Cots</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">ICU</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Incubators</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Total</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Status</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* 👇 Mapped over sortedWards */}
                {sortedWards.map((w) => (
                  <TableRow 
                    key={w.id} 
                    className={cn(
                      "text-lg hover:bg-muted/50 transition-colors cursor-pointer",
                      !w.active && "opacity-60 grayscale"
                    )}
                  >
                    <TableCell className={cn("font-medium py-5 text-center", !w.active && "text-muted-foreground")}>{w.code}</TableCell>
                    <TableCell className={cn("py-5 text-center", !w.active && "text-muted-foreground")}>{w.name}</TableCell>
                    <TableCell className="py-5 text-center">{w.beds}</TableCell>
                    <TableCell className="py-5 text-center">{w.cots}</TableCell>
                    <TableCell className="py-5 text-center">{w.icu}</TableCell>
                    <TableCell className="py-5 text-center">{w.incubators}</TableCell>
                    <TableCell className="py-5 text-center font-bold text-primary">
                      {(w.beds || 0) + (w.cots || 0) + (w.icu || 0) + (w.incubators || 0)}
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <Badge 
                        className={`text-base px-3 py-1 ${
                          w.active ? STATUS_STYLE.active : STATUS_STYLE.inactive
                        }`}
                      >
                        {w.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex justify-center gap-2">
                        <Button 
                          title="Edit Ward"
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setIsNew(false); setEditWard({ ...w }); }} 
                          disabled={!w.active}
                        >
                          <Edit2 className="h-5 w-5" />
                        </Button>
                        <Button 
                          title={w.active ? "Deactivate Ward" : "Activate Ward"}
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deactivate(w)}
                        >
                          {w.active ? (
                            <Ban className="h-5 w-5 text-destructive" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
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
                <div><Label className="text-base font-semibold">Ward Code</Label><Input className="h-11 text-base mt-1" value={editWard.code} onChange={(e) => setEditWard({ ...editWard, code: e.target.value })} /></div>
                <div><Label className="text-base font-semibold">Name</Label><Input className="h-11 text-base mt-1" value={editWard.name} onChange={(e) => setEditWard({ ...editWard, name: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-base font-semibold">Beds</Label><Input className="h-11 text-base mt-1" type="number" min={0} value={editWard.beds} onChange={(e) => setEditWard({ ...editWard, beds: parseInt(e.target.value) || 0 })} /></div>
                <div><Label className="text-base font-semibold">Cots</Label><Input className="h-11 text-base mt-1" type="number" min={0} value={editWard.cots} onChange={(e) => setEditWard({ ...editWard, cots: parseInt(e.target.value) || 0 })} /></div>
                <div><Label className="text-base font-semibold">ICU</Label><Input className="h-11 text-base mt-1" type="number" min={0} value={editWard.icu} onChange={(e) => setEditWard({ ...editWard, icu: parseInt(e.target.value) || 0 })} /></div>
                <div><Label className="text-base font-semibold">Incubators</Label><Input className="h-11 text-base mt-1" type="number" min={0} value={editWard.incubators} onChange={(e) => setEditWard({ ...editWard, incubators: parseInt(e.target.value) || 0 })} /></div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setEditWard(null)} className="touch-target">Cancel</Button>
            <Button onClick={save} disabled={saving} className="touch-target">{saving ? "Saving..." : isNew ? "Add" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWards;