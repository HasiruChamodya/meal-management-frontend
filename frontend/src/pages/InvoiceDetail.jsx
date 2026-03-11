import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { MOCK_INVOICES } from "@/lib/module-data";
import { Download, Printer } from "lucide-react";

const InvoiceDetail = () => {
  const { id } = useParams();
  const inv = MOCK_INVOICES.find((i) => i.id === id);

  if (!inv) return <div className="text-center py-12 text-muted-foreground">Invoice not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Print</Button>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
      </div>

      <Card className="max-w-3xl mx-auto print:shadow-none print:border-0">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-heading-md font-bold">Invoice for Raw Provisions</h1>
            <p className="text-label text-muted-foreground">Date: {inv.date} | Bill No: {inv.billNo}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-muted-foreground">From:</p>
              <p className="font-medium">{inv.supplier}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">To:</p>
              <p className="font-medium">Director, District General Hospital, Yakkala Road, Gampaha.</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Invoice Description</TableHead>
                <TableHead className="text-right">Total Price (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inv.categorySummary.map((cs) => (
                <TableRow key={cs.id}>
                  <TableCell className="text-muted-foreground">{cs.id}</TableCell>
                  <TableCell>{cs.name}</TableCell>
                  <TableCell className="text-right font-medium">{cs.total > 0 ? `Rs. ${cs.total.toLocaleString()}` : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-primary font-medium">GRAND TOTAL</p>
            <p className="text-2xl font-bold text-primary">Rs. {inv.grandTotal.toLocaleString()}</p>
          </div>

          <Separator />

          <div className="text-center text-sm text-muted-foreground pt-8 space-y-4">
            <div className="border-t border-dashed w-64 mx-auto pt-2">
              Manager, Multi Purpose Co-operative Society Ltd, Gampaha
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDetail;