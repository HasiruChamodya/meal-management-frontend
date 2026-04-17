import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

// 👇 Upgraded to use rich theme colors and locked hover states
const STATUS_STYLES = {
  draft: "bg-muted text-muted-foreground hover:bg-muted border-transparent font-medium",
  pending: "bg-warning-bg text-warning hover:bg-warning-bg border-transparent font-medium",
  approved: "bg-success text-success-foreground hover:bg-success border-transparent font-medium",
  rejected: "bg-error-bg text-destructive hover:bg-error-bg border-transparent font-medium",
};

const STATUS_LABELS = {
  draft: "Draft",
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
        setOrders(data.orders || []);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [toast]);

  // 👇 Auto-Sort Orders: Newest dates first, then descending by Bill Number
  const sortedOrders = [...orders].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return (b.billNumber || "").toString().localeCompare((a.billNumber || "").toString());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Loading purchase orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-heading-lg font-bold text-foreground">Purchase Orders</h1>
      <Card>
        <CardContent className="pt-4 overflow-x-auto px-0 sm:px-6">
          <Table>
            <TableHeader>
              {/* 👇 Upgraded Header Typography & Alignment */}
              <TableRow className="text-lg bg-muted/30">
                <TableHead className="font-semibold text-foreground text-center py-4">Date</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Bill #</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Status</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-foreground text-center py-4">Created By</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Items</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Total (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 👇 Mapped over sortedOrders with upgraded Row Typography & Alignment */}
              {sortedOrders.map((po) => (
                <TableRow
                  key={po.id}
                  className="text-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/orders/${po.id}`)}
                >
                  <TableCell className="py-5 text-center text-muted-foreground">{po.date}</TableCell>
                  <TableCell className="py-5 text-center font-bold text-foreground">{po.billNumber}</TableCell>
                  <TableCell className="py-5 text-center">
                    <Badge className={cn("text-base px-3 py-1", STATUS_STYLES[po.status] || STATUS_STYLES.draft)}>
                      {STATUS_LABELS[po.status] || po.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-5 text-center text-muted-foreground">
                    {po.createdByName || "—"}
                  </TableCell>
                  <TableCell className="py-5 text-center font-medium text-foreground">{po.itemCount}</TableCell>
                  <TableCell className="py-5 text-center font-bold text-primary">
                    {po.originalTotal > 0 ? `Rs. ${po.originalTotal.toLocaleString()}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {sortedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-lg text-muted-foreground py-12">
                    No purchase orders found.
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

export default Orders;