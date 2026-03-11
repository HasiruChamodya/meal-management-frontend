import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { MOCK_BACKUPS } from "@/lib/module-data";
import { Download, RefreshCw, Loader2 } from "lucide-react";

const STATUS_STYLE = {
  completed: "bg-primary/20 text-primary",
  in_progress: "bg-badge-hospital/20 text-badge-hospital",
  failed: "bg-destructive/20 text-destructive",
};

const Backups = () => {
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [backing, setBacking] = useState(false);

  const triggerBackup = () => {
    setShowConfirm(false);
    setBacking(true);
    setTimeout(() => { 
      setBacking(false); 
      toast({ title: "Backup Complete", description: "Manual backup created successfully." }); 
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md font-bold text-foreground">Database Backups</h1>
        <Button onClick={() => setShowConfirm(true)} disabled={backing}>
          {backing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Backing up...</>
          ) : (
            <><RefreshCw className="h-4 w-4 mr-2" /> Manual Backup</>
          )}
        </Button>
      </div>

      {backing && (
        <Card className="border-badge-hospital/30">
          <CardContent className="pt-4 space-y-2">
            <p className="text-sm font-medium">Creating backup...</p>
            <Progress value={65} className="h-2" />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_BACKUPS.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-sm">{b.date}</TableCell>
                  <TableCell>{b.size}</TableCell>
                  <TableCell><Badge className="bg-muted text-muted-foreground capitalize">{b.type}</Badge></TableCell>
                  <TableCell><Badge className={STATUS_STYLE[b.status]}>{b.status}</Badge></TableCell>
                  <TableCell>
                    {b.status === "completed" && (
                      <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">Backups are retained for 30 days. Older backups are automatically deleted.</p>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Trigger Manual Backup?</DialogTitle></DialogHeader>
          <p className="text-body text-muted-foreground">This will create a full database backup. This may take a few minutes.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={triggerBackup}>Start Backup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Backups;