import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronRight, Check, AlertTriangle, Loader2, Calculator } from "lucide-react"; // 👈 Added Calculator icon

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

const STATUS_STYLES = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/20 text-warning",
  approved: "bg-primary/20 text-primary",
  rejected: "bg-destructive/20 text-destructive",
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPo = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/${id}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch order");
        setPo(data.po);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchPo();
  }, [id, toast]);

  const toggleSection = (catId) => {
    setOpenSections((p) => ({ ...p, [catId]: !p[catId] }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/submit`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");

      toast({ title: "Order Submitted", description: "Purchase order submitted for approval." });
      setShowSubmitDialog(false);
      navigate("/orders");
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  // 👇 Replaced Revise logic with Re-run Calculation logic
  const handleRerunCalculation = async () => {
    setSubmitting(true);
    try {
      // Calls the same calculation engine used on the Calculations page
      const res = await fetch(`${API_BASE}/calculations/run`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ date: po.date }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to re-run calculation");

      toast({ title: "Calculation Complete", description: "Ingredient requirements have been recalculated based on the latest census." });
      
      // Navigate to the Calculation Results page so the clerk can review and generate a new PO
      navigate(`/calculations/results?date=${po.date}`);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading order...</span>
      </div>
    );
  }

  if (!po) {
    return <div className="text-center py-12 text-muted-foreground">Purchase order not found.</div>;
  }

  const grandTotal = (po.categories || []).reduce(
    (sum, cat) => sum + cat.items.reduce((s, i) => s + (i.totalPrice || 0), 0), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-md font-bold text-foreground">Order: {po.billNumber}</h1>
        <div className="flex items-center gap-2">
          <span className="text-label text-muted-foreground">{po.date}</span>
          <Badge className={STATUS_STYLES[po.status] || "bg-muted text-muted-foreground"}>
            {po.status?.charAt(0).toUpperCase() + po.status?.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Rejection reason banner */}
      {po.status === "rejected" && po.rejectionReason && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">Rejected by Accountant</p>
                <p className="text-sm text-muted-foreground mt-1">{po.rejectionReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category sections */}
      {(po.categories || []).map((cat) => {
        const catTotal = cat.items.reduce((s, i) => s + (i.totalPrice || 0), 0);
        const isOpen = openSections[cat.id] ?? true;

        return (
          <Collapsible key={cat.id} open={isOpen} onOpenChange={() => toggleSection(cat.id)}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-label font-semibold flex items-center gap-2">
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      {cat.id}. {cat.name}
                    </CardTitle>
                    <span className="text-label font-semibold text-primary">
                      Rs. {catTotal.toLocaleString()}
                    </span>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Item (SI)</TableHead>
                        <TableHead className="hidden lg:table-cell">Item (EN)</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-center w-8">B</TableHead>
                        <TableHead className="text-center w-8">L</TableHead>
                        <TableHead className="text-center w-8">D</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right w-32">Price (Rs)</TableHead>
                        <TableHead className="text-right">Total (Rs)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cat.items.map((item, idx) => (
                        <TableRow key={item.id} className={item.isPriceChanged ? "bg-warning/5" : ""}>
                          <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{item.nameSi}</TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">{item.nameEn}</TableCell>
                          <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                          <TableCell className="text-center">
                            {item.forBreakfast ? <Check className="h-3 w-3 text-primary mx-auto" /> : ""}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.forLunch ? <Check className="h-3 w-3 text-primary mx-auto" /> : ""}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.forDinner ? <Check className="h-3 w-3 text-primary mx-auto" /> : ""}
                          </TableCell>
                          <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                          <TableCell className={`text-right ${item.isPriceChanged ? "bg-warning/10" : ""}`}>
                            <div className="flex items-center justify-end gap-1">
                              {item.isPriceChanged && <AlertTriangle className="h-3 w-3 text-warning" />}
                              <span className="text-sm">Rs. {item.unitPrice.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            Rs. {item.totalPrice.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      {/* Grand Total */}
      <Card className="bg-primary/10 border-primary/30">
        <CardContent className="py-4 flex items-center justify-between">
          <span className="text-heading-sm font-bold text-primary">Grand Total</span>
          <span className="text-heading-md font-bold text-primary">Rs. {grandTotal.toLocaleString()}</span>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-background py-4 border-t -mx-4 px-4 md:-mx-6 md:px-6">
        <Button variant="outline" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>

        {po.status === "draft" && (
          <Button onClick={() => setShowSubmitDialog(true)}>Submit for Approval</Button>
        )}

        {/* 👇 Button replaced here */}
        {po.status === "rejected" && (
          <Button onClick={handleRerunCalculation} disabled={submitting}>
             {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Calculating...</> : <><Calculator className="h-4 w-4 mr-2" /> Re-run Calculations</>}
          </Button>
        )}

        {po.status === "approved" && (
          <Badge className="bg-primary/20 text-primary text-sm px-4 py-2">
            Approved by {po.reviewedByName || "Accountant"}
          </Badge>
        )}
      </div>

      {/* Submit confirmation dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Purchase Order?</DialogTitle>
          </DialogHeader>
          <p className="text-body text-muted-foreground">
            This will send the purchase order for accountant approval.
            You won't be able to edit after submission.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetail;
