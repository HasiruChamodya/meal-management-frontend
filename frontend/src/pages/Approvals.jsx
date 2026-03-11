import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_PENDING } from "@/lib/module-data";
import { Clock, CheckCircle2, DollarSign, Wallet } from "lucide-react";

const Approvals = () => {
  const navigate = useNavigate();
  const stats = [
    { label: "Pending", value: 3, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
    { label: "Approved Today", value: 1, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total This Week", value: "Rs. 42,500", icon: DollarSign, color: "text-badge-hospital", bg: "bg-badge-hospital/10" },
    { label: "Budget Remaining", value: "Rs. 157,500", icon: Wallet, color: "text-muted-foreground", bg: "bg-muted" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-heading-md font-bold text-foreground">Pending Approvals</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bill #</TableHead>
                <TableHead className="hidden md:table-cell">Submitted By</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Original Total</TableHead>
                <TableHead>Price Changes</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PENDING.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.date}</TableCell>
                  <TableCell className="font-medium">{p.billNo}</TableCell>
                  <TableCell className="hidden md:table-cell">{p.submittedBy}</TableCell>
                  <TableCell className="text-right">{p.itemCount}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell font-semibold">Rs. {p.originalTotal.toLocaleString()}</TableCell>
                  <TableCell>
                    {p.priceChanges > 0 ? (
                      <Badge className="bg-warning/20 text-warning">{p.priceChanges} changes</Badge>
                    ) : (
                      <Badge className="bg-primary/20 text-primary">No changes</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => navigate(`/approvals/${p.id}`)}>Review</Button>
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

export default Approvals;