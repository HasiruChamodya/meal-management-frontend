import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MOCK_PURCHASE_ORDERS } from "@/lib/calculation-data";
import { ChevronDown, ChevronRight, Check, AlertTriangle } from "lucide-react";

const OrderDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === id);
  const [categories] = useState(po?.categories || []);
  const [openSections, setOpenSections] = useState({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  if (!po) return <div className="text-center py-12 text-muted-foreground">Purchase order not found.</div>;

  const toggleSection = (catId) => {
    setOpenSections((p) => ({ ...p, [catId]: !p[catId] }));
  };

  const grandTotal = categories.reduce(
    (sum, cat) => sum + cat.items.reduce((s, i) => s + i.totalUnits * i.unitPrice, 0), 0
  );

  const handleSubmit = () => {
    setShowSubmitDialog(false);
    toast({ title: "Order Submitted", description: "Purchase order submitted for approval." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-md font-bold text-foreground">Order: {po.billNo}</h1>
        <div className="flex items-center gap-2">
          <span className="text-label text-muted-foreground">{po.date}</span>
          <Badge className="bg-primary/20 text-primary capitalize">{po.status}</Badge>
        </div>
      </div>

      {categories.map((cat) => {
        const catTotal = cat.items.reduce((s, i) => s + i.totalUnits * i.unitPrice, 0);
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
                    <span className="text-label font-semibold text-primary">Rs. {catTotal.toLocaleString()}</span>
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
                        <TableHead className="text-center w-8">Ex</TableHead>
                        <TableHead className="text-center w-8">K</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right w-32">Price (Rs)</TableHead>
                        <TableHead className="text-right">Total (Rs)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cat.items.map((item, idx) => {
                        const priceChanged = item.unitPrice !== item.defaultPrice;
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell className="font-medium">{item.nameSi}</TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground">{item.nameEn}</TableCell>
                            <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                            <TableCell className="text-center">{item.breakfast ? <Check className="h-3 w-3 text-primary mx-auto" /> : ""}</TableCell>
                            <TableCell className="text-center">{item.lunch ? <Check className="h-3 w-3 text-primary mx-auto" /> : ""}</TableCell>
                            <TableCell className="text-center">{item.dinner ? <Check className="h-3 w-3 text-primary mx-auto" /> : ""}</TableCell>
                            <TableCell className="text-center">{item.extra ? <Check className="h-3 w-3 text-primary mx-auto" /> : ""}</TableCell>
                            <TableCell className="text-center">{item.kanda ? <Check className="h-3 w-3 text-primary mx-auto" /> : ""}</TableCell>
                            <TableCell className="text-right font-medium">{item.totalUnits}</TableCell>
                            <TableCell className={`text-right ${priceChanged ? "bg-warning/10" : ""}`}>
                              <div className="flex items-center justify-end gap-1">
                                {priceChanged && <AlertTriangle className="h-3 w-3 text-warning" />}
                                <span className="text-sm">Rs. {item.unitPrice.toLocaleString()}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              Rs. {(item.totalUnits * item.unitPrice).toLocaleString()}
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

      {/* Grand Total */}
      <Card className="bg-primary/10 border-primary/30">
        <CardContent className="py-4 flex items-center justify-between">
          <span className="text-heading-sm font-bold text-primary">Grand Total</span>
          <span className="text-heading-md font-bold text-primary">Rs. {grandTotal.toLocaleString()}</span>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-background py-4 border-t -mx-4 px-4 md:-mx-6 md:px-6">
        <Button variant="outline" onClick={() => toast({ title: "Draft Saved" })}>
          Save Draft
        </Button>
        <Button onClick={() => setShowSubmitDialog(true)}>Submit for Approval</Button>
      </div>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Purchase Order?</DialogTitle>
          </DialogHeader>
          <p className="text-body text-muted-foreground">
            This will send the purchase order for accountant approval. You won't be able to edit after submission.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetail;