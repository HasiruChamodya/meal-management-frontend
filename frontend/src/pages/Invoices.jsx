import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Printer, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_BASE = "https://hospital-meal-management.onrender.com/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

const Invoices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load invoices");

        const history = (data.orders || []).filter(order => 
          ['approved', 'partially_delivered', 'delivered'].includes(order.status)
        );

        setInvoices(history);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [toast]);

  // 👇 Auto-Sort Invoices: Newest dates first, then descending by Bill Number
  const sortedInvoices = [...invoices].sort((a, b) => {
    const dateA = a.poDate || a.date;
    const dateB = b.poDate || b.date;
    const dateDiff = new Date(dateB) - new Date(dateA);
    if (dateDiff !== 0) return dateDiff;
    return (b.billNumber || "").toString().localeCompare((a.billNumber || "").toString());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Loading invoice history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-heading-lg font-bold text-foreground flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          Supplier Invoice History
        </h1>
      </div>
      
      <Card>
        <CardContent className="pt-4 overflow-x-auto px-0 sm:px-6">
          <Table>
            <TableHeader>
              {/* 👇 Upgraded Header Typography & Alignment */}
              <TableRow className="text-lg bg-muted/30">
                <TableHead className="font-semibold text-foreground text-center py-4">Bill #</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Date</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-foreground text-center py-4">Supplier</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Grand Total (Rs)</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Status</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-foreground text-center py-4">Approved By</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 👇 Mapped over sortedInvoices with upgraded Row Typography & Alignment */}
              {sortedInvoices.map((inv) => {
                const finalTotal = inv.revisedTotal !== null ? inv.revisedTotal : inv.originalTotal;

                return (
                  <TableRow 
                    key={inv.id} 
                    className="text-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <TableCell className="font-bold text-center py-5">{inv.billNumber}</TableCell>
                    <TableCell className="text-center py-5 text-muted-foreground">{inv.poDate || inv.date}</TableCell>
                    <TableCell className="hidden md:table-cell text-center text-muted-foreground max-w-[200px] truncate py-5">
                      Manager, MPCS Ltd, Gampaha
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary py-5">
                      Rs. {Number(finalTotal).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center py-5">
                      {inv.status === 'approved' && <Badge variant="outline" className="text-blue-600 border-blue-600 text-base px-3 py-1 bg-blue-50/50">Sent to Supplier</Badge>}
                      {inv.status === 'delivered' && <Badge variant="outline" className="text-success border-success bg-success/10 text-base px-3 py-1">Delivered</Badge>}
                      {inv.status === 'partially_delivered' && <Badge variant="outline" className="text-warning border-warning bg-warning/10 text-base px-3 py-1">Partial Delivery</Badge>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center text-muted-foreground py-5">
                      {inv.reviewedByName || "Accountant"}
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex justify-center gap-2">
                        <Button 
                          title="View Invoice"
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${inv.id}`); }} 
                          className="touch-target"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button 
                          title="Print Invoice"
                          variant="ghost" 
                          size="icon" 
                          className="touch-target" 
                          onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${inv.id}`); }}
                        >
                          <Printer className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-lg text-muted-foreground py-12">
                    No generated invoices found. Approve a Purchase Order first.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;