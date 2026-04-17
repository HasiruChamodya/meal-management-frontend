import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTodaySL } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:5050/api"}/census`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const statusConfig = {
  not_started: { label: "Not Started", className: "bg-muted text-muted-foreground hover:bg-muted border-transparent font-medium" },
  draft: { label: "Draft", className: "bg-warning-bg text-warning hover:bg-warning-bg border-transparent font-medium" },
  submitted: { label: "Submitted", className: "bg-success text-success-foreground hover:bg-success border-transparent font-medium" },
  locked: { label: "Locked", className: "bg-destructive/20 text-destructive hover:bg-destructive/20 border-transparent font-medium" },
};

const CensusSubmissions = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams(); 
  const urlDate = searchParams.get("date"); 
  const today = getTodaySL();
  const [filterDate, setFilterDate] = useState(urlDate ||today);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [staffMeals, setStaffMeals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dietTypes, setDietTypes] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const fetchSubmissions = async (date) => {
    try {
      setLoading(true);

      const [submissionsRes, staffRes] = await Promise.all([
        fetch(`${API_BASE}/my-submissions?date=${date}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/staff?date=${date}`, { headers: getAuthHeaders() }),
      ]);

      const submissionsData = await submissionsRes.json();
      const staffData = await staffRes.json();

      if (!submissionsRes.ok) throw new Error(submissionsData.message || "Failed to fetch submissions");

      setSubmissions(submissionsData.submissions || []);
      setStaffMeals(staffData.staffMeals || null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(filterDate);

    fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5050/api"}/diet-types`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => setDietTypes(data.dietTypes || []))
      .catch(() => {});

    fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5050/api"}/recipes`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => setRecipes(data.recipes || []))
      .catch(() => {});
  }, [filterDate]);

  const getDietLabel = (code) => {
    const dt = dietTypes.find(
      (d) => String(d.code) === String(code) || String(d.id) === String(code)
    );
    return dt ? `${dt.nameEn} (${dt.code})` : code;
  };

  const getSpecialLabel = (key) => {
    const recipe = recipes.find(
      (r) => r.recipeKey === key || r.recipeKey?.toLowerCase() === key?.toLowerCase()
    );
    if (recipe) return recipe.name;
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
  };

  const sortedSubmissions = useMemo(() => {
    return [...(submissions || [])].sort((a, b) => 
      (a.wardName || "").localeCompare(b.wardName || "", undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [submissions]);

  const staffTotal = staffMeals
    ? (staffMeals.breakfast || 0) + (staffMeals.lunch || 0) + (staffMeals.dinner || 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-lg font-bold text-foreground">My Submissions</h1>

        <div className="flex items-center gap-3">
          <Label className="text-base font-semibold shrink-0">Date:</Label>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-12 w-48 text-base touch-target cursor-pointer"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-heading-sm flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Staff Meals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {staffMeals ? (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-muted rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">Breakfast</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{staffMeals.breakfast || 0}</p>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">Lunch</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{staffMeals.lunch || 0}</p>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">Dinner</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{staffMeals.dinner || 0}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-base font-semibold text-muted-foreground">Total Staff Meals</span>
                <span className="text-2xl font-bold text-primary">{staffTotal}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn("text-base px-3 py-1", statusConfig[staffMeals.status]?.className || "bg-muted text-muted-foreground")}>
                  {statusConfig[staffMeals.status]?.label || staffMeals.status}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-base text-muted-foreground py-6 text-center">
              No staff meals submitted for this date.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-heading-sm">Ward Submissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-lg bg-muted/30">
                <TableHead className="font-semibold text-foreground text-center py-4">Ward</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4">Total Patients</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4 hidden sm:table-cell">Status</TableHead>
                <TableHead className="font-semibold text-foreground text-center py-4 hidden sm:table-cell">Submitted At</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-lg text-muted-foreground">
                    Loading submissions...
                  </TableCell>
                </TableRow>
              )}

              {!loading && sortedSubmissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-lg text-muted-foreground">
                    No ward submissions found for this date.
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                sortedSubmissions.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="text-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <TableCell className="py-5 font-medium text-center">
                      {entry.wardName}
                    </TableCell>

                    <TableCell className="py-5 text-center font-bold">
                      {/* 👇 Display a badge instead of '0' to make it clear this is an empty submission */}
                      {entry.totalPatients === 0 ? (
                        <Badge variant="outline" className="text-muted-foreground border-dashed">0 Patients</Badge>
                      ) : (
                        entry.totalPatients
                      )}
                    </TableCell>

                    <TableCell className="py-5 text-center hidden sm:table-cell">
                      <Badge className={cn("text-base px-3 py-1", statusConfig[entry.status]?.className || "bg-muted text-muted-foreground")}>
                        {statusConfig[entry.status]?.label || entry.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-5 text-center text-muted-foreground hidden sm:table-cell">
                      {entry.submittedAt
                        ? new Date(entry.submittedAt).toLocaleTimeString("en-LK", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-3">
                  {selectedEntry.wardName}
                  <Badge className={cn("text-base px-3 py-1", statusConfig[selectedEntry.status]?.className || "bg-muted text-muted-foreground")}>
                    {statusConfig[selectedEntry.status]?.label || selectedEntry.status}
                  </Badge>
                </DialogTitle>

                <p className="text-base text-muted-foreground flex items-center gap-2 mt-1">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(selectedEntry.date).toLocaleDateString("en-LK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* 👇 Clearly indicate if no patient meals were requested */}
                {selectedEntry.totalPatients === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-lg italic border-b mb-4">
                    No patient meals requested for this ward today.
                  </div>
                ) : (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 border-b pb-2">Patient Diets</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      {Object.entries(selectedEntry.diets || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-lg py-1">
                          <span className="text-muted-foreground">{getDietLabel(key)}</span>
                          <span className="font-semibold">{value || 0}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between pt-3 mt-4 border-t text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">{selectedEntry.totalPatients}</span>
                    </div>
                  </div>
                )}

                {Object.values(selectedEntry.special || {}).some((v) => Number(v) > 0) && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 border-b pb-2">Special Requests</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedEntry.special || {})
                        .filter(([, v]) => Number(v) > 0)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between text-lg">
                            <span className="text-muted-foreground">{getSpecialLabel(key)}</span>
                            <span className="font-semibold">{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {Object.values(selectedEntry.extras || {}).some((v) => Number(v) > 0) && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 border-b pb-2">Extra Items</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedEntry.extras || {})
                        .filter(([, v]) => Number(v) > 0)
                        .map(([name, qty]) => (
                          <div key={name} className="flex justify-between text-lg">
                            <span className="text-muted-foreground">{name}</span>
                            <span className="font-semibold">{qty}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {selectedEntry.customExtras?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 border-b pb-2">Custom Extra Items</h4>
                    <div className="space-y-2">
                      {selectedEntry.customExtras.map((item, index) => (
                        <div key={index} className="flex justify-between text-lg">
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-semibold">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CensusSubmissions;