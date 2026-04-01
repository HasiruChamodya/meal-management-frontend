import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle2, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:5050/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

const Approvals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pendingOrders, setPendingOrders] = useState([]);
  const [recentApproved, setRecentApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pendingRes, allRes] = await Promise.all([
          fetch(`${API_BASE}/orders/pending`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/orders?status=approved`, { headers: getAuthHeaders() }),
        ]);

        const pendingData = await pendingRes.json();
        const allData = await allRes.json();

        if (!pendingRes.ok) throw new Error(pendingData.message);

        setPendingOrders(pendingData.orders || []);
        setRecentApproved((allData.orders || []).slice(0, 5));
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading approvals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-heading-md font-bold text-foreground">Pending Approvals</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-warning">{pendingOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recently Approved</p>
              <p className="text-lg font-bold text-primary">{recentApproved.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending POs table */}
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bill #</TableHead>
                <TableHead className="hidden md:table-cell">Submitted By</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Total (Rs)</TableHead>
                <TableHead>Price Changes</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingOrders.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.date}</TableCell>
                  <TableCell className="font-medium">{p.billNumber}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {p.submittedByName || p.createdByName || "—"}
                  </TableCell>
                  <TableCell className="text-right">{p.itemCount}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell font-semibold">
                    Rs. {p.originalTotal.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {p.priceChanges > 0 ? (
                      <Badge className="bg-warning/20 text-warning">{p.priceChanges} changes</Badge>
                    ) : (
                      <Badge className="bg-primary/20 text-primary">No changes</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => navigate(`/approvals/${p.id}`)}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pendingOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No pending approvals
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

export default Approvals;