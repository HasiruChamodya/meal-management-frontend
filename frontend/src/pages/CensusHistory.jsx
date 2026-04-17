import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, History, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";
const getAuthHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("token")}` });

const CensusHistory = () => {
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
        <History className="h-7 w-7 text-primary" /> Past Census Entries
      </h1>
      <Card>
        <CardContent className="pt-4 overflow-x-auto px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow className="text-lg bg-muted/30">
                <TableHead className="font-semibold text-center py-4">Date</TableHead>
                <TableHead className="font-semibold text-center py-4">Wards Submitted</TableHead>
                <TableHead className="font-semibold text-center py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((day) => (
                <TableRow key={day.date} className="text-lg hover:bg-muted/50 transition-colors">
                  <TableCell className="text-center font-bold py-5">{day.date}</TableCell>
                  <TableCell className="text-center py-5">
                    {day.submittedWards > 0 ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-base">{day.submittedWards} Wards</Badge>
                    ) : <span className="text-muted-foreground italic">No Census</span>}
                  </TableCell>
                  <TableCell className="py-5 text-center">
                    <Button variant="outline" onClick={() => navigate(`/census/submissions?date=${day.date}`)}>
                      <FileText className="h-4 w-4 mr-2" /> View Past Census
                    </Button>
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
export default CensusHistory;