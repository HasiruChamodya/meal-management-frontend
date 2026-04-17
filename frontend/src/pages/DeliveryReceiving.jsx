import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertTriangle, Loader2, Truck } from "lucide-react";
import { getTodaySL } from "@/lib/date-utils";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const QUALITY_OPTIONS = [
  { value: "good", label: "✅ Good" },
  { value: "poor", label: "⚠️ Poor Quality" },
  { value: "spoiled", label: "🔴 Spoiled" },
  { value: "partial", label: "🟡 Partially Damaged" },
];

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

const DeliveryReceiving = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data States
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [poDetails, setPoDetails] = useState(null);
  
  // Form States
  const [items, setItems] = useState([]);
  const [overallNotes, setOverallNotes] = useState("");

  // 1. Fetch Pending Orders on Load
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch(`${API_BASE}/invoices/pending`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (res.ok) setPendingOrders(data.deliveries || []);
      } catch (error) {
        toast({ title: "Error", description: "Could not load pending deliveries.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, [toast]);

  // 2. Fetch PO Details when an order is selected
  useEffect(() => {
    if (!selectedPoId) return;
    const fetchPoDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/invoices/po/${selectedPoId}`, { headers: getAuthHeaders() });
        const data = await res.json();
        
        if (res.ok && data.po) {
          setPoDetails(data.po);
          // Initialize the interactive checklist, defaulting 'received' to 'ordered'
          const initialItems = data.po.items.map(item => ({
            poItemId: item.id,
            itemId: item.itemId,
            nameEn: item.nameEn,
            nameSi: item.nameSi,
            unit: item.unit,
            ordered: Number(item.quantity),
            received: Number(item.quantity), 
            unitPrice: Number(item.unitPrice),
            quality: "good",
            notes: ""
          }));
          setItems(initialItems);
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load order details.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchPoDetails();
  }, [selectedPoId, toast]);

  // Handle Input Changes
  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map((i) => (i.poItemId === id ? { ...i, [field]: value } : i)));
  };

  // Submit the Delivery
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const payloadItems = items.map(i => ({
        poItemId: i.poItemId,
        itemId: i.itemId,
        orderedQty: i.ordered,
        receivedQty: i.received,
        unitPrice: i.unitPrice,
        totalPrice: i.received * i.unitPrice,
        status: i.received === i.ordered && i.quality === "good" ? "complete" : 
                i.received === 0 ? "rejected" : "partial",
        notes: i.quality !== "good" ? `[${i.quality.toUpperCase()}] ${i.notes}` : i.notes
      }));

      // Auto-generate a receipt number so the Kitchen staff doesn't have to type it!
      const autoReceiptNumber = `REC-${selectedPoId}-${Date.now().toString().slice(-5)}`;

      const res = await fetch(`${API_BASE}/invoices/receive`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          poId: selectedPoId,
          invoiceNumber: autoReceiptNumber, 
          invoiceDate: getTodaySL(), // Automatically use today's date
          items: payloadItems,
          overallNotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit delivery");

      toast({ title: "Delivery Saved!", description: "The receipt has been sent to the Accountant." });
      
      // Reset form
      setSelectedPoId("");
      setPoDetails(null);
      setItems([]);
      setOverallNotes("");
      
      // Refresh pending orders list
      setPendingOrders(prev => prev.filter(po => po.id !== Number(selectedPoId)));

    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !poDetails) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // --- Calculations for the Summary Boxes ---
  const qtyIssues = items.filter((i) => i.received !== i.ordered).length;
  const qualityIssues = items.filter((i) => i.quality !== "good").length;
  const okCount = items.filter((i) => i.received === i.ordered && i.quality === "good").length;
  const hasIssues = qtyIssues > 0 || qualityIssues > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Order Selection */}
      <div className="bg-primary rounded-xl p-6 text-center shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground flex items-center justify-center gap-3">
          <Truck className="h-8 w-8" />
          DELIVERY RECEIVING
        </h1>
        <div className="max-w-md mx-auto mt-4 text-left">
          <label className="text-primary-foreground/90 text-sm font-semibold mb-1 block">Select Arriving Truck / Order:</label>
          <Select value={selectedPoId} onValueChange={setSelectedPoId}>
            <SelectTrigger className="bg-background text-foreground h-12">
              <SelectValue placeholder="-- Choose an Approved Order --" />
            </SelectTrigger>
            <SelectContent>
              {pendingOrders.map(po => (
                <SelectItem key={po.id} value={po.id.toString()}>
                  Order #{po.bill_number} (From {po.po_date})
                </SelectItem>
              ))}
              {pendingOrders.length === 0 && (
                <SelectItem value="none" disabled>No pending deliveries right now.</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!poDetails ? (
        <div className="text-center py-16 text-muted-foreground">
          <Truck className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Ready to Receive</h2>
          <p>When the supplier arrives, select their order from the dropdown above.</p>
        </div>
      ) : (
        <>
          {/* Interactive Item Checklist */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="bg-muted/30 pb-3 border-b">
              <CardTitle className="text-lg">Item Checklist</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base font-bold min-w-[180px]">Item</TableHead>
                    <TableHead className="text-base font-bold text-right">Ordered</TableHead>
                    <TableHead className="text-base font-bold text-right w-32">Received</TableHead>
                    <TableHead className="text-base font-bold w-48">Quality</TableHead>
                    <TableHead className="text-base font-bold min-w-[200px]">Notes</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const rowClass = item.received === 0 && item.ordered > 0 ? "bg-destructive/10" :
                                     item.received < item.ordered ? "bg-warning/10" :
                                     item.received > item.ordered ? "bg-primary/5" :
                                     item.quality !== "good" ? "bg-destructive/5" : "";

                    return (
                      <TableRow key={item.poItemId} className={`min-h-[72px] ${rowClass}`}>
                        <TableCell>
                          <p className="text-base font-semibold">{item.nameEn}</p>
                          <p className="text-sm text-muted-foreground">{item.nameSi}</p>
                        </TableCell>
                        <TableCell className="text-right text-base font-bold text-muted-foreground">{item.ordered} {item.unit}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.received === '' ? '' : item.received}
                            onChange={(e) => updateItem(item.poItemId, "received", e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="w-28 h-12 text-right text-lg font-bold ml-auto bg-background border-primary/50"
                          />
                        </TableCell>
                        <TableCell>
                          <Select value={item.quality} onValueChange={(v) => updateItem(item.poItemId, "quality", v)}>
                            <SelectTrigger className="h-12 text-base bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {QUALITY_OPTIONS.map((q) => (
                                <SelectItem key={q.value} value={q.value} className="text-base py-3">{q.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.notes}
                            onChange={(e) => updateItem(item.poItemId, "notes", e.target.value)}
                            className="h-12 text-sm bg-background"
                            placeholder={item.quality !== "good" ? "Required reason..." : "Optional note..."}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                           {item.received < item.ordered && <Badge variant="destructive">SHORT</Badge>}
                           {item.received > item.ordered && <Badge className="bg-warning text-warning-foreground">EXCESS</Badge>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Issue Summary Dash */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-primary">{okCount}/{items.length}</p>
                <p className="text-sm font-semibold text-primary/80">Items Perfect</p>
              </CardContent>
            </Card>
            <Card className={qtyIssues > 0 ? "border-destructive bg-destructive/5" : ""}>
              <CardContent className="pt-4 text-center">
                <p className={`text-3xl font-bold ${qtyIssues > 0 ? "text-destructive" : "text-muted-foreground"}`}>{qtyIssues}</p>
                <p className={`text-sm font-semibold mt-1 ${qtyIssues > 0 ? "text-destructive/80" : "text-muted-foreground"}`}>Qty Issues</p>
              </CardContent>
            </Card>
            <Card className={qualityIssues > 0 ? "border-warning bg-warning/10" : ""}>
              <CardContent className="pt-4 text-center">
                <p className={`text-3xl font-bold ${qualityIssues > 0 ? "text-warning" : "text-muted-foreground"}`}>{qualityIssues}</p>
                <p className={`text-sm font-semibold mt-1 ${qualityIssues > 0 ? "text-warning/80" : "text-muted-foreground"}`}>Quality Issues</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-4">
              <label className="text-base font-semibold mb-2 block">Overall Delivery Notes (Optional)</label>
              <Textarea 
                value={overallNotes} 
                onChange={(e) => setOverallNotes(e.target.value)} 
                placeholder="e.g. Truck arrived 2 hours late. Ice was melted..." 
                className="min-h-[80px] text-base" 
              />
            </CardContent>
          </Card>

          {/* Floating Submission Action Bar */}
          <div className="sticky bottom-0 bg-background py-4 border-t -mx-4 px-4 md:-mx-6 md:px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-10">
            {hasIssues ? (
              <Button 
                disabled={submitting}
                className="w-full h-14 text-lg font-bold bg-warning hover:bg-warning/90 text-warning-foreground" 
                onClick={handleSubmit}
              >
                {submitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <AlertTriangle className="mr-2 h-5 w-5" />}
                Confirm Delivery & Submit Issue Report
                <span className="ml-2 text-sm font-normal">({qtyIssues + qualityIssues} issues found)</span>
              </Button>
            ) : (
              <Button 
                disabled={submitting}
                className="w-full h-14 text-lg font-bold" 
                onClick={handleSubmit}
              >
                {submitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                Confirm Delivery — All Good ✓
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryReceiving;