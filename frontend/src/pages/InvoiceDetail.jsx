import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "https://hospital-meal-management.onrender.com/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/${id}`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch invoice");

        setInvoice(data.po);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading invoice details...</span>
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center py-12 text-muted-foreground">Invoice not found.</div>;
  }

  const grandTotal = invoice.revisedTotal !== null ? Number(invoice.revisedTotal) : Number(invoice.originalTotal);
  const itemsList = invoice.items || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => navigate("/invoices")} className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto print:shadow-none print:border-0 print:max-w-full">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-heading-md font-bold text-foreground print:text-black">INVOICE</h1>
            <p className="text-muted-foreground text-sm print:text-black">Gampaha District General Hospital</p>
          </div>

          <div className="flex justify-between items-start pt-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1 print:text-black">To</p>
              <p className="font-semibold text-body print:text-black">Manager,</p>
              <p className="text-muted-foreground print:text-black">Multi Purpose Co-operative Society Ltd,</p>
              <p className="text-muted-foreground print:text-black">Gampaha.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1 print:text-black">Invoice Details</p>
              <p className="text-body print:text-black"><span className="font-semibold">Bill No:</span> {invoice.billNumber}</p>
              <p className="text-body print:text-black"><span className="font-semibold">Date:</span> {invoice.poDate || invoice.date}</p>
              <p className="text-body print:text-black">
                <span className="font-semibold">Status:</span>{" "}
                <span className="uppercase text-primary font-bold print:text-black">{invoice.status}</span>
              </p>
            </div>
          </div>

          <Table className="mt-6">
            <TableHeader>
              <TableRow className="print:border-black">
                <TableHead className="w-10 print:text-black font-bold">#</TableHead>
                <TableHead className="print:text-black font-bold">Ingredient</TableHead>
                <TableHead className="print:text-black font-bold">Category</TableHead>
                <TableHead className="text-right print:text-black font-bold">Quantity</TableHead>
                <TableHead className="text-right print:text-black font-bold">Unit Price</TableHead>
                <TableHead className="text-right print:text-black font-bold">Total (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsList.map((item, idx) => {
                // Ensure we use the revised total if the accountant adjusted it
                const lineTotal = item.revisedTotal !== null && item.revisedTotal !== undefined 
                    ? Number(item.revisedTotal) 
                    : Number(item.totalPrice);

                return (
                  <TableRow key={item.id || idx} className="print:border-black">
                    <TableCell className="text-muted-foreground print:text-black">{idx + 1}</TableCell>
                    <TableCell className="font-medium print:text-black">
                      {item.nameEn || item.itemName}
                      {item.nameSi && <span className="block text-xs text-muted-foreground print:text-black/70">{item.nameSi}</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground print:text-black">
                      {item.categoryName || "General"}
                    </TableCell>
                    <TableCell className="text-right font-medium print:text-black">
                      {Number(item.quantity).toLocaleString()} <span className="text-xs text-muted-foreground print:text-black">{item.unit}</span>
                    </TableCell>
                    <TableCell className="text-right print:text-black">
                      {Number(item.unitPrice).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold print:text-black">
                      {lineTotal.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
              {itemsList.length === 0 && (
                <TableRow>
                   <TableCell colSpan={6} className="text-center py-6 text-muted-foreground print:text-black">
                     No items found in this invoice.
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4 mt-6 text-right print:bg-transparent print:border-black print:rounded-none flex justify-between items-center">
            <p className="text-lg font-bold text-foreground uppercase print:text-black">Grand Total</p>
            <p className="text-3xl font-bold text-primary print:text-black">Rs. {grandTotal.toLocaleString()}</p>
          </div>

          <Separator className="my-8 print:hidden" />

          <div className="text-center text-sm text-muted-foreground pt-8 space-y-4 print:text-black">
            <div className="flex justify-between mt-16 px-8">
               <div className="space-y-2 text-center">
                  <div className="border-t border-dashed w-48 border-gray-400 print:border-black"></div>
                  <p className="font-semibold text-black">Prepared By</p>
                  <p className="text-xs">{invoice.createdByName || "Subject Clerk"}</p>
               </div>
               <div className="space-y-2 text-center">
                  <div className="border-t border-dashed w-48 border-gray-400 print:border-black"></div>
                  <p className="font-semibold text-black">Approved By</p>
                  <p className="text-xs">{invoice.reviewedByName || "Accountant"}</p>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDetail;