import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MOCK_ISSUE_REPORTS } from "@/lib/module-data";

const STATUS_STYLE = {
  open: "bg-warning/20 text-warning",
  resolved: "bg-primary/20 text-primary",
  escalated: "bg-destructive/20 text-destructive",
};

const IssueReports = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-xl p-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">ISSUE REPORTS</h1>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base font-bold">Date</TableHead>
                <TableHead className="text-base font-bold">Order #</TableHead>
                <TableHead className="text-base font-bold text-right">Qty Issues</TableHead>
                <TableHead className="text-base font-bold text-right">Quality Issues</TableHead>
                <TableHead className="text-base font-bold">Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ISSUE_REPORTS.map((r) => (
                <TableRow key={r.id} className="min-h-[56px]">
                  <TableCell className="text-base">{r.date}</TableCell>
                  <TableCell className="text-base font-medium">{r.orderNo}</TableCell>
                  <TableCell className="text-right text-base font-bold">{r.qtyIssues}</TableCell>
                  <TableCell className="text-right text-base font-bold">{r.qualityIssues}</TableCell>
                  <TableCell><Badge className={`${STATUS_STYLE[r.status]} capitalize text-sm`}>{r.status}</Badge></TableCell>
                  <TableCell><Button size="lg" variant="outline" onClick={() => setSelected(r)}>View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-xl">Issue Report — {selected?.orderNo}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              {selected.items.map((it, i) => (
                <Card key={i}>
                  <CardContent className="pt-3 pb-3">
                    <p className="font-semibold text-base">{it.name}</p>
                    <Badge className="mt-1 bg-warning/20 text-warning">{it.issue}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">{it.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IssueReports;