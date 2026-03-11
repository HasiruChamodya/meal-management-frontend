import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { WARDS } from "@/lib/ward-data";
import { Plus, Edit2, Trash2 } from "lucide-react";

const AdminWards = () => {
  const { toast } = useToast();
  const [wards, setWards] = useState(WARDS.map((w) => ({ ...w, active: true })));
  const [editWard, setEditWard] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => {
    setIsNew(true);
    setEditWard({ id: "", code: "", name: "", beds: 0, cots: 0, icu: 0, incubators: 0, active: true });
  };

  const save = () => {
    if (!editWard) return;
    if (isNew) {
      setWards((p) => [...p, { ...editWard, id: editWard.code }]);
      toast({ title: "Ward Added" });
    } else {
      setWards((p) => p.map((w) => (w.id === editWard.id ? editWard : w)));
      toast({ title: "Ward Updated" });
    }
    setEditWard(null);
  };

  const deactivate = (id) => {
    setWards((p) => p.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));
    toast({ title: "Ward status changed" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md font-bold text-foreground">Ward Management</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Ward</Button>
      </div>
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Beds</TableHead>
                <TableHead className="text-right">Cots</TableHead>
                <TableHead className="text-right">ICU</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wards.map((w) => (
                <TableRow key={w.id} className={!w.active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{w.code}</TableCell>
                  <TableCell>{w.name}</TableCell>
                  <TableCell className="text-right">{w.beds}</TableCell>
                  <TableCell className="text-right">{w.cots}</TableCell>
                  <TableCell className="text-right">{w.icu}</TableCell>
                  <TableCell className="text-right font-bold">{w.beds + w.cots + w.icu}</TableCell>
                  <TableCell>
                    <Badge className={w.active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                      {w.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setIsNew(false); setEditWard(w); }}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deactivate(w.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Beds</Label><Input type="number" value={editWard.beds} onChange={(e) => setEditWard({ ...editWard, beds: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>Cots</Label><Input type="number" value={editWard.cots} onChange={(e) => setEditWard({ ...editWard, cots: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>ICU</Label><Input type="number" value={editWard.icu} onChange={(e) => setEditWard({ ...editWard, icu: parseInt(e.target.value) || 0 })} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditWard(null)}>Cancel</Button>
            <Button onClick={save}>{isNew ? "Add" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWards;