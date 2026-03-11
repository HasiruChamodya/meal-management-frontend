import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MOCK_DIET_TYPES } from "@/lib/module-data";
import { Plus, Edit2 } from "lucide-react";

const AdminDietTypes = () => {
  const { toast } = useToast();
  const [types, setTypes] = useState([...MOCK_DIET_TYPES]);
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => { 
    setIsNew(true); 
    setEdit({ 
      id: String(Date.now()), 
      code: "", 
      nameEn: "", 
      nameSi: "", 
      ageRange: "All", 
      type: "Patient", 
      displayOrder: types.length + 1, 
      active: true 
    }); 
  };

  const save = () => {
    if (!edit) return;
    if (isNew) { 
      setTypes((p) => [...p, edit]); 
      toast({ title: "Diet Type Added" }); 
    }
    else { 
      setTypes((p) => p.map((t) => (t.id === edit.id ? edit : t))); 
      toast({ title: "Diet Type Updated" }); 
    }
    setEdit(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md font-bold text-foreground">Diet Type Management</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Diet Type</Button>
      </div>
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name (EN)</TableHead>
                <TableHead>Name (SI)</TableHead>
                <TableHead>Age Range</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.code}</TableCell>
                  <TableCell>{t.nameEn}</TableCell>
                  <TableCell className="text-muted-foreground">{t.nameSi}</TableCell>
                  <TableCell>{t.ageRange}</TableCell>
                  <TableCell><Badge className="bg-muted text-muted-foreground">{t.type}</Badge></TableCell>
                  <TableCell className="text-right">{t.displayOrder}</TableCell>
                  <TableCell>
                    <Badge className={t.active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                      {t.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setIsNew(false); setEdit(t); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!edit} onOpenChange={() => setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Diet Type" : "Edit Diet Type"}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Code</Label>
                  <Input value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value })} />
                </div>
                <div>
                  <Label>Name (EN)</Label>
                  <Input value={edit.nameEn} onChange={(e) => setEdit({ ...edit, nameEn: e.target.value })} />
                </div>
                <div>
                  <Label>Name (SI)</Label>
                  <Input value={edit.nameSi} onChange={(e) => setEdit({ ...edit, nameSi: e.target.value })} />
                </div>
                <div>
                  <Label>Age Range</Label>
                  <Input value={edit.ageRange} onChange={(e) => setEdit({ ...edit, ageRange: e.target.value })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDietTypes;