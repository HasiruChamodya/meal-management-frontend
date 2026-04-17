import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, History, FileText, Calculator, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";
const getAuthHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("token")}` });

const DailyHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/calculations/history`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setHistory(data.history || []);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load history.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [toast]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-heading-lg font-bold text-foreground flex items-center gap-3">
        <History className="h-7 w-7 text-primary" /> Master Daily Archive
      </h1>
      <Card>
        <CardContent className="pt-4 overflow-x-auto px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow className="text-lg bg-muted/30">
                <TableHead className="font-semibold text-center py-4">Date</TableHead>
                <TableHead className="font-semibold text-center py-4">Census Progress</TableHead>
                <TableHead className="font-semibold text-center py-4">Calculation</TableHead>
                <TableHead className="font-semibold text-center py-4">Purchase Order Status</TableHead>
                <TableHead className="font-semibold text-center py-4">Final Cost (Rs)</TableHead>
                <TableHead className="font-semibold text-center py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((day) => (
                <TableRow key={day.date} className="text-lg hover:bg-muted/50 transition-colors">
                  <TableCell className="text-center font-bold py-5">{day.date}</TableCell>
                  <TableCell className="text-center py-5">
                    {day.submittedWards > 0 ? <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-base px-3 py-1">{day.submittedWards} Wards</Badge> : <span className="text-muted-foreground italic text-sm">No Census</span>}
                  </TableCell>
                  <TableCell className="text-center py-5">
                    {day.calcStatus ? 
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-base px-3 py-1 uppercase">{day.calcStatus}</Badge> : <span className="text-muted-foreground italic text-sm">—</span>}
                  </TableCell>
                  <TableCell className="text-center py-5">
                    {day.poStatus === 'approved' && <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-600 text-base px-3 py-1">Approved</Badge>}
                    {day.poStatus === 'delivered' && <Badge variant="outline" className="bg-success/10 text-success border-success text-base px-3 py-1">Delivered</Badge>}
                    {day.poStatus === 'draft' && <Badge variant="outline" className="text-muted-foreground text-base px-3 py-1">Draft PO</Badge>}
                  </TableCell>
                  <TableCell className="text-center font-bold py-5">
                    {day.grandTotal > 0 ? <span className="text-primary">Rs. {day.grandTotal.toLocaleString()}</span> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs" disabled={!day.poId} onClick={() => navigate(`/purchase-orders/${day.poId}`)}>
                        <Receipt className="h-3 w-3 mr-2" /> Purchase Order
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => navigate(`/reports/consolidated-diet-sheet?date=${day.date}`)}>
                        <FileText className="h-3 w-3 mr-2" /> Diet Sheet
                      </Button>
                    </div>
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
export default DailyHistory;