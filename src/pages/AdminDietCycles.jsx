import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DIET_CYCLES } from "@/lib/module-data";
import { Plus, Edit2 } from "lucide-react";

const AdminDietCycles = () => {
  const { toast } = useToast();
  const [cycles, setCycles] = useState([...DIET_CYCLES]);
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const save = () => {
    if (!edit) return;
    if (isNew) {
      setCycles((p) => [...p, edit]);
      toast({ title: "Diet Cycle Added" });
    } else {
      setCycles((p) => p.map((c) => (c.id === edit.id ? edit : c)));
      toast({ title: "Diet Cycle Updated" });
    }
    setEdit(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md font-bold text-foreground">Diet Cycle Management</h1>
        <Button onClick={() => { 
          setIsNew(true); 
          setEdit({ id: String(Date.now()), code: "", nameEn: "", nameSi: "", active: true }); 
        }}>
          <Plus className="h-4 w-4 mr-2" /> Add Cycle
        </Button>
      </div>
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name (EN)</TableHead>
                <TableHead>Name (SI)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.code}</TableCell>
                  <TableCell>{c.nameEn}</TableCell>
                  <TableCell className="text-muted-foreground">{c.nameSi}</TableCell>
                  <TableCell>
                    <Badge className={c.active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                      {c.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setIsNew(false); setEdit(c); }}>
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
            <DialogTitle>{isNew ? "Add Diet Cycle" : "Edit Diet Cycle"}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-4">
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

export default AdminDietCycles;