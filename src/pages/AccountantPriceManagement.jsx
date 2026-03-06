import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MOCK_PRICES } from "@/lib/calculation-data";
import { AlertTriangle } from "lucide-react";

const AccountantPriceManagement = () => {
  const { toast } = useToast();
  const [prices, setPrices] = useState([...MOCK_PRICES]);

  const updatePrice = (id, newPrice) => {
    setPrices((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, defaultPrice: newPrice, lastUpdated: new Date().toISOString().split("T")[0] } : p
      )
    );
    toast({ title: "Price Updated", description: "Default price has been updated. Change recorded in audit log." });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-heading-md font-bold text-foreground">Price Management</h1>
      <div className="flex items-center gap-2 rounded-lg bg-warning-bg border border-warning/30 px-4 py-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
        <span className="text-foreground">Price changes are recorded in the audit log and apply to all future purchase orders.</span>
      </div>
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Item (SI)</TableHead>
                <TableHead>Item (EN)</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right w-36">Default Price (Rs)</TableHead>
                <TableHead className="hidden sm:table-cell">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.map((p, idx) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{p.nameSi}</TableCell>
                  <TableCell>{p.nameEn}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="text-muted-foreground">{p.unit}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs text-muted-foreground">Rs.</span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={p.defaultPrice}
                        onChange={(e) => updatePrice(p.id, parseFloat(e.target.value) || 0)}
                        className="w-24 h-8 text-right text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{p.lastUpdated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountantPriceManagement;