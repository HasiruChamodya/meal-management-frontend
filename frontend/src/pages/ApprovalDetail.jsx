import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronRight, Check, AlertTriangle, ArrowDown, ArrowUp, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

const ApprovalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revisions, setRevisions] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

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

  const getRevised = (item) =>
    revisions[item.itemId] || { qty: item.quantity, price: item.unitPrice };

  const updateRevision = (itemId, field, value) => {
    setRevisions((prev) => {
      // Find the original item to get defaults
      let original = null;
      for (const cat of po.categories || []) {
        original = cat.items.find((i) => i.itemId === itemId);
        if (original) break;
      }
      const existing = prev[itemId] || {
        qty: original?.quantity || 0,
        price: original?.unitPrice || 0,
      };
      return { ...prev, [itemId]: { ...existing, [field]: parseFloat(value) || 0 } };
    });
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/approve`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ revisions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to approve");

      toast({
        title: "PO Approved",
        description: `Purchase order approved with Rs. ${data.result.revisedTotal.toLocaleString()} total.`,
      });
      setShowApproveDialog(false);
      navigate("/approvals");
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/reject`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject");

      toast({ title: "PO Rejected", description: "Returned to Subject Clerk for revision." });
      setShowRejectDialog(false);
      navigate("/approvals");
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading order for review...</span>
      </div>
    );
  }

  if (!po) {
    return <div className="text-center py-12 text-muted-foreground">Not found.</div>;
  }

  // Calculate totals
  const originalTotal = (po.categories || []).reduce(
    (s, c) => s + c.items.reduce((a, i) => a + (i.totalPrice || 0), 0), 0
  );

  const revisedTotal = (po.categories || []).reduce(
    (s, c) => s + c.items.reduce((a, i) => {
      const r = getRevised(i);
      return a + r.qty * r.price;
    }, 0), 0
  );

  const diff = Math.round((revisedTotal - originalTotal) * 100) / 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-md font-bold text-foreground">Review: {po.billNumber}</h1>
        <Badge className="bg-warning/20 text-warning">Pending Approval</Badge>
      </div>

      {/* Comparison summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Original Total</p>
            <p className="text-lg font-bold">Rs. {originalTotal.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className={diff < 0 ? "border-primary/40" : diff > 0 ? "border-destructive/40" : ""}>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Your Revisions</p>
            <p className={`text-lg font-bold ${diff < 0 ? "text-primary" : diff > 0 ? "text-destructive" : ""}`}>
              Rs. {Math.round(revisedTotal).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Difference</p>
            <p className={`text-lg font-bold flex items-center justify-center gap-1 ${diff < 0 ? "text-primary" : diff > 0 ? "text-destructive" : ""}`}>
              {diff !== 0 && (diff < 0 ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />)}
              {diff < 0 ? "-" : diff > 0 ? "+" : ""}Rs. {Math.abs(diff).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category sections with revision inputs */}
      {(po.categories || []).map((cat) => {
        const isOpen = openSections[cat.id] ?? true;
        return (
          <Collapsible key={cat.id} open={isOpen} onOpenChange={() => setOpenSections((p) => ({ ...p, [cat.id]: !p[cat.id] }))}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 pb-2">
                  <CardTitle className="text-label font-semibold flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    {cat.id}. {cat.name}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center w-8">B</TableHead>
                        <TableHead className="text-center w-8">L</TableHead>
                        <TableHead className="text-center w-8">D</TableHead>
                        <TableHead className="text-right">Calc Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right w-24">Rev. Qty</TableHead>
                        <TableHead className="text-right w-28">Rev. Price</TableHead>
                        <TableHead className="text-right">Rev. Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cat.items.map((item, idx) => {
                        const rev = getRevised(item);
                        const qtyChanged = rev.qty !== item.quantity;
                        const priceRevised = rev.price !== item.unitPrice;

                        return (
                          <TableRow key={item.id} className={item.isPriceChanged ? "bg-warning/5" : ""}>
                            <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell>
                              <span className="font-medium">{item.nameSi}</span>
                              <span className="text-muted-foreground text-xs ml-1">/ {item.nameEn}</span>
                              {item.isPriceChanged && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertTriangle className="h-3 w-3 text-warning inline ml-1" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Default: Rs.{item.defaultPrice} → Changed to: Rs.{item.unitPrice}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.forBreakfast ? <Check className="h-3 w-3 text-primary mx-auto" /> : ""}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.forLunch ? <Check className="h-3 w-3 text-primary mx-auto" /> : ""}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.forDinner ? <Check className="h-3 w-3 text-primary mx-auto" /> : ""}
                            </TableCell>
                            <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                            <TableCell className="text-right">Rs. {item.unitPrice}</TableCell>
                            <TableCell className={`text-right ${qtyChanged ? "bg-badge-hospital/10" : ""}`}>
                              <Input
                                type="number"
                                step="0.01"
                                value={rev.qty}
                                onChange={(e) => updateRevision(item.itemId, "qty", e.target.value)}
                                className="w-20 h-8 text-right text-sm ml-auto [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </TableCell>
                            <TableCell className={`text-right ${priceRevised ? "bg-badge-hospital/10" : ""}`}>
                              <Input
                                type="number"
                                value={rev.price}
                                onChange={(e) => updateRevision(item.itemId, "price", e.target.value)}
                                className="w-24 h-8 text-right text-sm ml-auto [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              Rs. {Math.round(rev.qty * rev.price).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      {/* Actions */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-background py-4 border-t -mx-4 px-4 md:-mx-6 md:px-6">
        <Button variant="outline" onClick={() => navigate("/approvals")}>
          Back
        </Button>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10"
          onClick={() => setShowRejectDialog(true)}
        >
          Reject — Return to Subject Clerk
        </Button>
        <Button onClick={() => setShowApproveDialog(true)}>
          Approve Purchase Order
        </Button>
      </div>

      {/* Approve dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Purchase Order?</DialogTitle>
          </DialogHeader>
          <p className="text-body text-muted-foreground">
            You are approving PO #{po.billNumber} for Rs. {Math.round(revisedTotal).toLocaleString()}.
            This action is timestamped to your User ID. Continue?
          </p>
          {diff !== 0 && (
            <p className={`text-sm font-medium ${diff < 0 ? "text-primary" : "text-destructive"}`}>
              {Object.keys(revisions).length} item(s) revised.
              Total {diff < 0 ? "decreased" : "increased"} by Rs. {Math.abs(diff).toLocaleString()}.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Approving...</> : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Purchase Order?</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Provide a reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectReason.trim()}
            >
              {processing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Rejecting...</> : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalDetail;