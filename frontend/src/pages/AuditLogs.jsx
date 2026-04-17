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
import { Download, Eye, CheckCircle2, XCircle, ShieldAlert, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:5050/api"}/audit`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ─── TRANSLATION DICTIONARY FOR NON-IT USERS ─────────────────────────────────
const ACTION_DICTIONARY = {
  "LOGIN_SUCCESS": "User Logged In",
  "LOGIN_FAILED": "Failed Login Attempt",
  "LOGIN_BLOCKED": "Login Blocked (Account Deactivated)",
  "LOGIN_INTERCEPTED_FOR_PASSWORD_CHANGE": "Login Stopped (Password Reset Required)",
  "REGISTER_SUCCESS": "New User Registered",
  "REGISTER_FAILED_EMAIL_EXISTS": "Registration Failed (Email Already Exists)",
  "USER_SET_NEW_PASSWORD": "User Created New Password",
  "USER_SET_PASSWORD_FAILED": "Failed to Create Password",
  "USER_SET_PASSWORD_ERROR": "Error Creating Password",
  "CREATE_USER": "Admin Created New User",
  "UPDATE_USER": "User Details Updated",
  "CHANGE_USER_STATUS": "User Account Status Changed",
  "RESET_PASSWORD": "Admin Reset User Password",
  "GET_USERS": "Viewed System Users List"
};

const getFriendlyAction = (action) => {
  if (!action) return "Unknown Action";
  return ACTION_DICTIONARY[action] || String(action).replace(/_/g, " ");
};
// Format dates cleanly (e.g. "Apr 3, 2026, 12:15 PM")
const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true
  }).format(date);
};

// Clean up JSON for the details modal
const parseDetails = (value) => {
  if (!value) return "No additional details recorded.";
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return JSON.stringify(parsed, null, 2).replace(/["{}]/g, ''); // Strips out JSON brackets for clean reading
  } catch {
    return String(value);
  }
};

const AuditLogs = () => {
  const { toast } = useToast();

  const [actionFilter, setActionFilter] = useState("all");
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLog, setSelectedLog] = useState(null);

  const fetchActions = async () => {
    try {
      const res = await fetch(`${API_BASE}/actions`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setActions(data.actions || []);
    } catch (error) {
      console.error("Failed to fetch actions");
    }
  };

  const fetchLogs = async (selectedAction = "all") => {
    try {
      setLoading(true);
      const url = selectedAction === "all"
          ? API_BASE
          : `${API_BASE}?action=${encodeURIComponent(selectedAction)}`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch audit logs");
      setLogs(data.logs || []);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
    if (!logs.length) return toast({ title: "No Data", description: "There are no audit logs to export" });

    const headers = ["Date & Time", "User", "Role", "Action Taken", "System Module", "Success", "Details"];
    const rows = logs.map((log) => [
      formatDateTime(log.timestamp),
      log.user || "System",
      log.role || "—",
      getFriendlyAction(log.action),
      log.entity || "—",
      log.success ? "Yes" : "No",
      JSON.stringify(log.details || "")
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "System_Audit_Logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-md font-bold text-foreground">System Audit Logs</h1>
          <p className="text-muted-foreground text-sm">Monitor recent activity, logins, and security events across the hospital system.</p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* ── Filter Controls ── */}
      <Card className="shadow-sm">
        <CardContent className="pt-4 flex flex-wrap gap-4 items-center">
          <span className="text-sm font-semibold text-gray-700">Filter Activity by Type:</span>
          <div className="w-[280px]">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-10 bg-gray-50">
                <SelectValue placeholder="Showing All Activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Show All Activity</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {getFriendlyAction(a)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Main Logs Table ── */}
      <Card className="shadow-sm">
        <CardContent className="pt-4 overflow-x-auto px-0 sm:px-6">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground animate-pulse">
              Loading system records...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="py-4 font-semibold text-gray-700">Date & Time</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">User / Staff Member</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">Action Taken</TableHead>
                  <TableHead className="py-4 font-semibold text-center text-gray-700">Status</TableHead>
                  <TableHead className="py-4 font-semibold text-right text-gray-700">More Info</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/40 transition-colors">
                    
                    {/* Date */}
                    <TableCell className="py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(log.timestamp)}
                    </TableCell>

                    {/* User */}
                    <TableCell className="py-4">
                      <div className="font-medium text-gray-900">{log.user || "Automated System"}</div>
                      <div className="text-xs text-gray-500 capitalize">{log.role ? log.role.replace("_", " ") : ""}</div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        {log.severity === "security" ? (
                          <ShieldAlert className="h-4 w-4 text-red-500" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-400" />
                        )}
                        <span className={`font-medium ${log.severity === "security" ? "text-red-700" : "text-gray-800"}`}>
                          {getFriendlyAction(log.action)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4 text-center">
                      {log.success ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 px-3 py-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Successful
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1.5 px-3 py-1">
                          <XCircle className="h-3.5 w-3.5" /> Failed
                        </Badge>
                      )}
                    </TableCell>

                    {/* Details Button */}
                    <TableCell className="py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)} className="text-primary hover:text-primary/80">
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </Button>
                    </TableCell>

                  </TableRow>
                ))}

                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12 text-lg">
                      No matching activity found in the system.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Record Details Modal ── */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {selectedLog?.success ? <CheckCircle2 className="h-6 w-6 text-emerald-500"/> : <XCircle className="h-6 w-6 text-red-500"/>}
              Activity Record Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-2">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Action Performed</p>
                <p className="font-medium text-gray-900">{getFriendlyAction(selectedLog?.action)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date & Time</p>
                <p className="font-medium text-gray-900">{formatDateTime(selectedLog?.timestamp)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Performed By</p>
                <p className="font-medium text-gray-900">{selectedLog?.user || "System"} ({selectedLog?.role?.replace("_", " ") || "No Role"})</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">System Module</p>
                <p className="font-medium text-gray-900 capitalize">{selectedLog?.entity || "General"}</p>
              </div>
            </div>

            {/* In-Depth Context */}
            <div className="space-y-4">
              {selectedLog?.details && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">Additional Context</h4>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {parseDetails(selectedLog.details)}
                  </pre>
                </div>
              )}
              
              {/* Only show old/new values if they exist to prevent confusing empty boxes */}
              {selectedLog?.oldValue && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">Previous Data (Before Change)</h4>
                  <pre className="text-sm text-red-600 whitespace-pre-wrap font-sans bg-red-50 p-3 rounded-lg border border-red-100">
                    {parseDetails(selectedLog.oldValue)}
                  </pre>
                </div>
              )}

              {selectedLog?.newValue && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">Updated Data (After Change)</h4>
                  <pre className="text-sm text-emerald-600 whitespace-pre-wrap font-sans bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    {parseDetails(selectedLog.newValue)}
                  </pre>
                </div>
              )}
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogs;