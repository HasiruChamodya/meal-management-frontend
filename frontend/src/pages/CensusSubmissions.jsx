import { useState, useMemo } from "react";
import { MOCK_SUBMISSIONS } from "@/lib/ward-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays } from "lucide-react";
import { DIET_FIELDS, EXTRA_ITEMS } from "@/lib/ward-data";

const statusConfig = {
  not_started: { label: "Not Started", className: "bg-muted text-muted-foreground" },
  draft: { label: "Draft", className: "bg-warning-bg text-warning border-warning/30" },
  submitted: { label: "Submitted", className: "bg-accent text-accent-foreground" },
  locked: { label: "Locked", className: "bg-destructive/10 text-destructive" },
};

const CensusSubmissions = () => {
  const today = new Date().toISOString().split("T")[0];
  const [filterDate, setFilterDate] = useState(today);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const submissions = useMemo(
    () => MOCK_SUBMISSIONS.filter((s) => s.date === filterDate),
    [filterDate]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-heading-lg text-foreground">My Submissions</h1>
        <div className="flex items-center gap-2">
          <Label className="text-label font-semibold shrink-0">Date:</Label>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-10 w-44 text-label"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-label font-semibold p-3">Ward</TableHead>
                <TableHead className="text-label font-semibold p-3 text-center">Total Patients</TableHead>
                <TableHead className="text-label font-semibold p-3 text-center hidden sm:table-cell">Staff (B/L/D)</TableHead>
                <TableHead className="text-label font-semibold p-3 text-center">Status</TableHead>
                <TableHead className="text-label font-semibold p-3 text-right hidden sm:table-cell">Submitted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No submissions found for this date.
                  </TableCell>
                </TableRow>
              )}
              {submissions.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <TableCell className="p-3 font-medium text-body">{entry.wardName}</TableCell>
                  <TableCell className="p-3 text-center text-body">{entry.totalPatients}</TableCell>
                  <TableCell className="p-3 text-center text-body hidden sm:table-cell">
                    {entry.staff.breakfast} / {entry.staff.lunch} / {entry.staff.dinner}
                  </TableCell>
                  <TableCell className="p-3 text-center">
                    <Badge className={statusConfig[entry.status].className + " text-xs"}>
                      {statusConfig[entry.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-3 text-right text-label text-muted-foreground hidden sm:table-cell">
                    {entry.submittedAt
                      ? new Date(entry.submittedAt).toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedEntry.wardName}
                  <Badge className={statusConfig[selectedEntry.status].className + " text-xs"}>
                    {statusConfig[selectedEntry.status].label}
                  </Badge>
                </DialogTitle>
                <p className="text-label text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(selectedEntry.date).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <h4 className="text-label font-semibold mb-2">Patient Diets</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {DIET_FIELDS.map((f) => (
                      <div key={f.key} className="flex justify-between text-body py-1">
                        <span className="text-muted-foreground">{f.label}</span>
                        <span className="font-medium">{selectedEntry.diets[f.key] || 0}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-2 mt-2 border-t text-body font-bold">
                    <span>Total</span>
                    <span className="text-primary">{selectedEntry.totalPatients}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-label font-semibold mb-2">Staff Meals</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {["breakfast", "lunch", "dinner"].map((m) => (
                      <div key={m} className="bg-muted rounded-lg py-2">
                        <p className="text-xs text-muted-foreground capitalize">{m}</p>
                        <p className="text-body font-bold">{selectedEntry.staff[m]}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {Object.entries(selectedEntry.extras).some(([, v]) => v > 0) && (
                  <div>
                    <h4 className="text-label font-semibold mb-2">Extra Items</h4>
                    <div className="space-y-1">
                      {Object.entries(selectedEntry.extras)
                        .filter(([, v]) => v > 0)
                        .map(([name, qty]) => {
                          const item = EXTRA_ITEMS.find((e) => e.name === name);
                          return (
                            <div key={name} className="flex justify-between text-body">
                              <span className="text-muted-foreground">{name}</span>
                              <span className="font-medium">{qty} {item?.unit || ""}</span>
                            </div>
                          );
                        })}
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