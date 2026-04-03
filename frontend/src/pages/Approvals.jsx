import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle2, Loader2 } from "lucide-react";

const API_BASE = "https://hospital-meal-management.onrender.com/api";

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

  // 👇 Auto-Sort Pending Orders: Newest dates first, then descending by Bill Number
  const sortedPendingOrders = [...pendingOrders].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return (b.billNumber || "").toString().localeCompare((a.billNumber || "").toString());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Loading approvals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-heading-lg font-bold text-foreground">Pending Approvals</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-6 pb-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/20">
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <div>
              {/* 👇 Bumped text sizes for dashboard readability */}
              <p className="text-base font-semibold text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-warning mt-1">{pendingOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6 pb-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/20">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div>
              {/* 👇 Bumped text sizes for dashboard readability */}
              <p className="text-base font-semibold text-muted-foreground">Recently Approved</p>
              <p className="text-3xl font-bold text-success mt-1">{recentApproved.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending POs table */}
      <Card>
        <CardContent className="pt-4 overflow-x-auto px-0 sm:px-6">
          <Table>
            <TableHeader>
              {/* 👇 Upgraded Header Typography & Alignment */}
              <TableRow className="text-lg bg-muted/30">
                <TableHead className="font-semibold text-foreground text-center py-4">Date</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Bill #</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-foreground text-center py-4">Submitted By</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Items</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-foreground text-center py-4">Total (Rs)</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Price Changes</TableHead>
                <TableHead className="text-center font-semibold text-foreground py-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 👇 Mapped over sortedPendingOrders with upgraded Row Typography & Alignment */}
              {sortedPendingOrders.map((p) => (
                <TableRow 
                  key={p.id} 
                  className="text-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/approvals/${p.id}`)}
                >
                  <TableCell className="py-5 text-center text-muted-foreground">{p.date}</TableCell>
                  <TableCell className="py-5 text-center font-bold text-foreground">{p.billNumber}</TableCell>
                  <TableCell className="hidden md:table-cell py-5 text-center text-muted-foreground">
                    {p.submittedByName || p.createdByName || "—"}
                  </TableCell>
                  <TableCell className="py-5 text-center font-medium">{p.itemCount}</TableCell>
                  <TableCell className="hidden sm:table-cell py-5 text-center font-bold text-primary">
                    Rs. {p.originalTotal.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-5 text-center">
                    {p.priceChanges > 0 ? (
                      <Badge className="bg-warning/20 text-warning text-base px-3 py-1">
                        {p.priceChanges} changes
                      </Badge>
                    ) : (
                      <Badge className="bg-success/20 text-success text-base px-3 py-1">
                        No changes
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-5 text-center">
                    <Button size="lg" className="h-10 px-6 touch-target" onClick={(e) => { e.stopPropagation(); navigate(`/approvals/${p.id}`); }}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sortedPendingOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-lg text-muted-foreground py-12">
                    No pending approvals.
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