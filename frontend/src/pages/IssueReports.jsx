import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

const IssueReports = () => {
  const { toast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch(`${API_BASE}/invoices/issues`, { headers: getAuthHeaders() });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Failed to fetch issues");
        setIssues(data.issues || []);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading issue reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-xl p-6 text-center flex items-center justify-center gap-3">
        <AlertTriangle className="h-8 w-8 text-primary-foreground" />
        <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">ISSUE REPORTS</h1>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base font-bold">Delivery Date</TableHead>
                <TableHead className="text-base font-bold">Receipt / PO #</TableHead>
                <TableHead className="text-base font-bold text-right">Qty Issues</TableHead>
                <TableHead className="text-base font-bold text-right">Quality Issues</TableHead>
                <TableHead className="text-base font-bold text-center">Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((r) => (
                <TableRow key={r.id} className="min-h-[56px]">
                  <TableCell className="text-base">{r.date}</TableCell>
                  <TableCell className="text-base">
                    <span className="font-bold">{r.orderNo}</span>
                    <br />
                    <span className="text-xs text-muted-foreground">PO: {r.poBillNumber}</span>
                  </TableCell>
                  <TableCell className="text-right text-base font-bold text-destructive">
                    {Number(r.qtyIssues)}
                  </TableCell>
                  <TableCell className="text-right text-base font-bold text-warning">
                    {Number(r.qualityIssues)}
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className="bg-destructive/20 text-destructive capitalize text-sm">Action Needed</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="lg" variant="outline" onClick={() => setSelected(r)}>Review Issues</Button>
                  </TableCell>
                </TableRow>
              ))}
              {issues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-lg">
                    No active issues! All recent deliveries were perfect.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
             <DialogTitle className="text-xl border-b pb-3">
                Issue Details — {selected?.orderNo}
             </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 pt-2">
              
              {/* Overall Delivery Note (if the kitchen left one) */}
              {selected.overallNotes && (
                <div className="bg-muted p-3 rounded-lg border">
                  <p className="text-sm font-bold mb-1">Overall Delivery Note:</p>
                  <p className="text-sm text-muted-foreground">{selected.overallNotes}</p>
                </div>
              )}

              {/* Individual Item Issues */}
              <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                {selected.items.map((it, i) => (
                  <Card key={i} className="border-destructive/30 bg-destructive/5">
                    <CardContent className="pt-4 pb-4 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-base">{it.name}</p>
                        <Badge className="mt-1.5 mb-2 bg-destructive/10 text-destructive border-destructive/20">
                          {it.issue}
                        </Badge>
                        {it.details && (
                          <p className="text-sm bg-background p-2 rounded border mt-1 font-medium">
                            <span className="text-muted-foreground font-normal">Note:</span> {it.details}
                          </p>
                        )}
                      </div>
                      <div className="text-right bg-background p-2 rounded border min-w-[100px]">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Ordered</p>
                        <p className="font-semibold">{it.orderedQty} {it.unit}</p>
                        <div className="border-t my-1"></div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Received</p>
                        <p className="font-bold text-destructive">{it.receivedQty} {it.unit}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                 <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                 <Button>Mark as Resolved</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IssueReports;