import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = "http://localhost:5050/api/diet-types";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

const emptyDietType = {
  id: "", code: "", nameEn: "", nameSi: "", ageRange: "All", type: "Patient", displayOrder: 1, active: true,
};

const AdminDietTypes = () => {
  const { toast } = useToast();
  const [types, setTypes] = useState([]);
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchDietTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch diet types");
      setTypes(data.dietTypes || []);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDietTypes(); }, []);

  const openNew = () => {
    setIsNew(true);
    setEdit({ ...emptyDietType, displayOrder: types.filter(t => t.active).length + 1 });
  };

  const save = async () => {
    if (!edit) return;
    try {
      setSaving(true);
      const payload = {
        code: edit.code, nameEn: edit.nameEn, nameSi: edit.nameSi,
        ageRange: edit.ageRange, type: edit.type, displayOrder: Number(edit.displayOrder) || 1, active: edit.active
      };

      const url = isNew ? API_BASE : `${API_BASE}/${edit.id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");

      toast({ title: isNew ? "Diet Type Added" : "Diet Type Updated", description: data.message });
      setEdit(null);
      setIsNew(false);
      fetchDietTypes();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (dietType) => {
    try {
      const res = await fetch(`${API_BASE}/${dietType.id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ active: !dietType.active }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Status update failed");

      toast({ title: "Status Updated", description: `${dietType.nameEn} is now ${!dietType.active ? "Active" : "Inactive"}` });
      fetchDietTypes();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md font-bold text-foreground">Diet Type Management</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Diet Type</Button>
      </div>

      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          {loading ? (
            <div className="py-6 text-center text-muted-foreground">Loading diet types...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name (EN)</TableHead>
                  <TableHead>Name (SI)</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((t) => (
                  <TableRow 
                    key={t.id} 
                    className={cn(
                      "transition-all", 
                      !t.active && "opacity-50 bg-muted/30 grayscale"
                    )}
                  >
                    <TableCell className={cn("font-medium", !t.active && "text-muted-foreground")}>{t.code}</TableCell>
                    <TableCell className={cn(!t.active && "text-muted-foreground")}>{t.nameEn}</TableCell>
                    <TableCell className="text-muted-foreground">{t.nameSi}</TableCell>
                    <TableCell><Badge className="bg-muted text-muted-foreground">{t.type}</Badge></TableCell>
                    <TableCell className="text-right text-muted-foreground">{t.displayOrder}</TableCell>
                    <TableCell>
                      <Badge className={t.active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                        {t.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setIsNew(false); setEdit(t); }} disabled={!t.active}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleStatus(t)}>
                          {t.active ? "Deactivate" : "Activate"}
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

      {/* Dialog code remains exactly the same! */}
      <Dialog open={!!edit} onOpenChange={() => setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isNew ? "Add Diet Type" : "Edit Diet Type"}</DialogTitle></DialogHeader>
          {edit && (
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div><Label>Code</Label><Input value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value })} /></div>
                 <div><Label>Name (EN)</Label><Input value={edit.nameEn} onChange={(e) => setEdit({ ...edit, nameEn: e.target.value })} /></div>
                 <div><Label>Name (SI)</Label><Input value={edit.nameSi} onChange={(e) => setEdit({ ...edit, nameSi: e.target.value })} /></div>
                 <div><Label>Age Range</Label><Input value={edit.ageRange} onChange={(e) => setEdit({ ...edit, ageRange: e.target.value })} /></div>
                 <div>
                   <Label>Type</Label>
                   <Select value={edit.type} onValueChange={(value) => setEdit({ ...edit, type: value })}>
                     <SelectTrigger><SelectValue /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Patient">Patient</SelectItem>
                       <SelectItem value="Staff">Staff</SelectItem>
                       <SelectItem value="Special">Special</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div><Label>Display Order</Label><Input type="number" min={1} value={edit.displayOrder} onChange={(e) => setEdit({ ...edit, displayOrder: parseInt(e.target.value, 10) || 1 })} /></div>
               </div>
             </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDietTypes;