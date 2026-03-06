import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MOCK_RECEIVING } from "@/lib/module-data";
import { Camera, CheckCircle2, AlertTriangle } from "lucide-react";

const QUALITY_OPTIONS = [
  { value: "good", label: "✅ Good", color: "bg-primary/10 text-primary" },
  { value: "poor", label: "⚠️ Poor Quality", color: "bg-warning/10 text-warning" },
  { value: "spoiled", label: "🔴 Spoiled", color: "bg-destructive/10 text-destructive" },
  { value: "partial", label: "🟡 Partially Damaged", color: "bg-warning/10 text-warning" },
];

const DeliveryReceiving = () => {
  const { toast } = useToast();
  const [items, setItems] = useState([...MOCK_RECEIVING]);
  const [overallNotes, setOverallNotes] = useState("");

  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const getRowClass = (item) => {
    if (item.received === 0 && item.ordered > 0) return "bg-destructive/10";
    if (item.received < item.ordered) return "bg-destructive/5";
    if (item.received > item.ordered) return "bg-warning/5";
    if (item.quality !== "good") return item.quality === "spoiled" ? "bg-destructive/5" : "bg-warning/5";
    return "";
  };

  const getDiscrepancy = (item) => {
    if (item.received === 0 && item.ordered > 0) return <Badge className="bg-destructive text-destructive-foreground text-xs">MISSING</Badge>;
    if (item.received < item.ordered) return <Badge className="bg-destructive text-destructive-foreground text-xs">SHORT</Badge>;
    if (item.received > item.ordered) return <Badge className="bg-warning text-warning-foreground text-xs">EXCESS</Badge>;
    return null;
  };

  const qtyIssues = items.filter((i) => i.received !== i.ordered).length;
  const qualityIssues = items.filter((i) => i.quality !== "good").length;
  const okCount = items.filter((i) => i.received === i.ordered && i.quality === "good").length;
  const hasIssues = qtyIssues > 0 || qualityIssues > 0;

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-xl p-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">DELIVERY RECEIVING</h1>
        <p className="text-lg text-primary-foreground/80">2026-03-02 | Order #000369</p>
        <Badge className="mt-2 bg-warning text-warning-foreground text-base px-4 py-1">In Progress</Badge>
      </div>

      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base font-bold min-w-[180px]">Item</TableHead>
                <TableHead className="text-base font-bold text-right">Ordered</TableHead>
                <TableHead className="text-base font-bold text-right w-28">Received</TableHead>
                <TableHead className="text-base font-bold w-44">Quality</TableHead>
                <TableHead className="text-base font-bold w-40">Notes</TableHead>
                <TableHead className="w-16"></TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className={`min-h-[72px] ${getRowClass(item)}`}>
                  <TableCell>
                    <p className="text-base font-semibold">{item.nameEn}</p>
                    <p className="text-sm text-muted-foreground">{item.nameSi}</p>
                  </TableCell>
                  <TableCell className="text-right text-base font-bold">{item.ordered} {item.unit}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      step="0.01"
                      value={item.received}
                      onChange={(e) => updateItem(item.id, "received", parseFloat(e.target.value) || 0)}
                      className="w-24 h-12 text-right text-base font-bold ml-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Select value={item.quality} onValueChange={(v) => updateItem(item.id, "quality", v)}>
                      <SelectTrigger className="h-12 text-base">
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
                      onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                      className="h-12 text-sm"
                      placeholder="Notes..."
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon" className="h-12 w-12">
                      <Camera className="h-5 w-5" />
                    </Button>
                  </TableCell>
                  <TableCell>{getDiscrepancy(item)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-primary">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
            <p className="text-2xl font-bold text-primary">{okCount}/{items.length}</p>
            <p className="text-sm text-muted-foreground">Items OK</p>
          </CardContent>
        </Card>
        <Card className={qtyIssues > 0 ? "border-destructive" : ""}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${qtyIssues > 0 ? "text-destructive" : "text-muted-foreground"}`}>{qtyIssues}</p>
            <p className="text-sm text-muted-foreground">Qty Issues</p>
          </CardContent>
        </Card>
        <Card className={qualityIssues > 0 ? "border-warning" : ""}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${qualityIssues > 0 ? "text-warning" : "text-muted-foreground"}`}>{qualityIssues}</p>
            <p className="text-sm text-muted-foreground">Quality Issues</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          <p className="text-base font-semibold mb-2">Overall Notes</p>
          <Textarea value={overallNotes} onChange={(e) => setOverallNotes(e.target.value)} placeholder="General delivery comments..." className="min-h-[80px] text-base" />
        </CardContent>
      </Card>

      <div className="sticky bottom-0 bg-background py-4 border-t -mx-4 px-4 md:-mx-6 md:px-6">
        {hasIssues ? (
          <Button className="w-full h-14 text-lg font-bold bg-warning hover:bg-warning/90 text-warning-foreground" onClick={() => toast({ title: "Delivery Confirmed", description: `${qtyIssues + qualityIssues} issues reported.` })}>
            <AlertTriangle className="mr-2 h-5 w-5" /> Confirm Delivery & Submit Issue Report
            <span className="ml-2 text-sm font-normal">⚠ {qtyIssues + qualityIssues} issues found</span>
          </Button>
        ) : (
          <Button className="w-full h-14 text-lg font-bold" onClick={() => toast({ title: "Delivery Confirmed", description: "All items received OK." })}>
            <CheckCircle2 className="mr-2 h-5 w-5" /> Confirm Delivery — All Good ✓
          </Button>
        )}
      </div>
    </div>
  );
};

export default DeliveryReceiving;