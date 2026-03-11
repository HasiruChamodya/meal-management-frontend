import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "http://localhost:5050/api/audit";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const SEVERITY_BG = {
  info: "",
  data: "bg-badge-hospital/5",
  price: "bg-warning/5",
  approval: "bg-primary/5",
  security: "bg-destructive/5",
};

const prettyValue = (value) => {
  if (!value) return "—";

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return String(value);
  }
};

const shortValue = (value) => {
  if (!value) return "—";
  const text = prettyValue(value);
  return text.length > 60 ? `${text.slice(0, 60)}...` : text;
};

const AuditLogs = () => {
  const { toast } = useToast();

  const [actionFilter, setActionFilter] = useState("all");
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLog, setSelectedLog] = useState(null);
  const [valueType, setValueType] = useState(null); // "old" | "new" | null

  const fetchActions = async () => {
    try {
      const res = await fetch(`${API_BASE}/actions`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch audit actions");
      }

      setActions(data.actions || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not load audit actions",
        variant: "destructive",
      });
    }
  };

  const fetchLogs = async (selectedAction = "all") => {
    try {
      setLoading(true);

      const url =
        selectedAction === "all"
          ? API_BASE
          : `${API_BASE}?action=${encodeURIComponent(selectedAction)}`;

      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch audit logs");
      }

      setLogs(data.logs || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not load audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
    fetchLogs("all");
  }, []);

  useEffect(() => {
    fetchLogs(actionFilter);
  }, [actionFilter]);

  const exportCSV = () => {
    if (!logs.length) {
      toast({
        title: "No Data",
        description: "There are no audit logs to export",
      });
      return;
    }

    const headers = [
      "Timestamp",
      "User",
      "Role",
      "Action",
      "Entity",
      "Old Value",
      "New Value",
      "Severity",
      "Status Code",
      "Success",
    ];

    const rows = logs.map((log) => [
      log.timestamp || "",
      log.user || "",
      log.role || "",
      log.action || "",
      log.entity || "",
      log.oldValue || "",
      log.newValue || "",
      log.severity || "",
      log.status_code ?? "",
      log.success ?? "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "audit_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openValueDialog = (log, type) => {
    setSelectedLog(log);
    setValueType(type);
  };

  const closeDialog = () => {
    setSelectedLog(null);
    setValueType(null);
  };

  const dialogTitle =
    valueType === "old" ? "Old Value" : valueType === "new" ? "New Value" : "";

  const dialogValue =
    valueType === "old"
      ? prettyValue(selectedLog?.oldValue)
      : valueType === "new"
      ? prettyValue(selectedLog?.newValue)
      : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-md font-bold text-foreground">Audit Logs</h1>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-4">
          <div className="w-48">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          {loading ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading audit logs...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="hidden lg:table-cell">Old Value</TableHead>
                  <TableHead className="hidden lg:table-cell">New Value</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className={SEVERITY_BG[log.severity] || ""}
                  >
                    <TableCell className="text-sm font-mono">
                      {log.timestamp}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.user || "System"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-muted text-muted-foreground text-xs">
                        {log.role || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-muted text-muted-foreground text-xs">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.entity}</TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2 max-w-[220px]">
                        <span className="text-xs text-muted-foreground truncate font-mono">
                          {shortValue(log.oldValue)}
                        </span>
                        {log.oldValue && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openValueDialog(log, "old")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2 max-w-[220px]">
                        <span className="text-xs text-muted-foreground truncate font-mono">
                          {shortValue(log.newValue)}
                        </span>
                        {log.newValue && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openValueDialog(log, "new")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {logs.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-6"
                    >
                      No audit logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog && !!valueType} onOpenChange={closeDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Action:</span>{" "}
              {selectedLog?.action || "—"}{" "}
              <span className="mx-2">|</span>
              <span className="font-medium text-foreground">Entity:</span>{" "}
              {selectedLog?.entity || "—"}
            </div>

            <pre className="max-h-[500px] overflow-auto rounded-md border bg-muted/30 p-4 text-xs whitespace-pre-wrap break-words font-mono">
              {dialogValue || "—"}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogs;