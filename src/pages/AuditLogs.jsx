import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_AUDIT_LOGS } from "@/lib/module-data";
import { Download } from "lucide-react";

const SEVERITY_BG = {
  info: "",
  data: "bg-badge-hospital/5",
  price: "bg-warning/5",
  approval: "bg-primary/5",
  security: "bg-destructive/5",
};

const AuditLogs = () => {
  const [actionFilter, setActionFilter] = useState("all");
  const filtered = actionFilter === "all" ? MOCK_AUDIT_LOGS : MOCK_AUDIT_LOGS.filter((l) => l.action === actionFilter);
  const actions = [...new Set(MOCK_AUDIT_LOGS.map((l) => l.action))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-heading-md font-bold text-foreground">Audit Logs</h1>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
      </div>

      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-4">
          <div className="w-48">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-10"><SelectValue placeholder="All Actions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead className="hidden lg:table-cell">Old Value</TableHead>
                <TableHead className="hidden lg:table-cell">New Value</TableHead>
                <TableHead className="hidden md:table-cell">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id} className={SEVERITY_BG[log.severity]}>
                  <TableCell className="text-sm font-mono">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell><Badge className="bg-muted text-muted-foreground text-xs">{log.action}</Badge></TableCell>
                  <TableCell className="text-sm">{log.entity}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[150px] truncate font-mono">{log.oldValue || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[150px] truncate font-mono">{log.newValue || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm font-mono text-muted-foreground">{log.ipAddress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;