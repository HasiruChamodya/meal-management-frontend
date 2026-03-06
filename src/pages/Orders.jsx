import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_PURCHASE_ORDERS } from "@/lib/calculation-data";

const STATUS_STYLES = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/20 text-warning",
  approved: "bg-primary/20 text-primary",
  rejected: "bg-destructive/20 text-destructive",
};

const STATUS_LABELS = {
  draft: "Draft", 
  pending: "Pending Approval", 
  approved: "Approved", 
  rejected: "Rejected",
};

const Orders = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-heading-md font-bold text-foreground">Purchase Orders</h1>
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bill #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PURCHASE_ORDERS.map((po) => (
                <TableRow key={po.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/orders/${po.id}`)}>
                  <TableCell>{po.date}</TableCell>
                  <TableCell className="font-medium">{po.billNo}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[po.status]}>{STATUS_LABELS[po.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{po.itemCount}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {po.totalRs > 0 ? `Rs. ${po.totalRs.toLocaleString()}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;