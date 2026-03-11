import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MOCK_NOTIFICATIONS } from "@/lib/module-data";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check } from "lucide-react";

const TYPE_STYLE = {
  quality_report: "bg-warning/20 text-warning",
  delivery: "bg-destructive/20 text-destructive",
  system: "bg-muted text-muted-foreground",
};

const AdminNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([...MOCK_NOTIFICATIONS]);
  const [selected, setSelected] = useState(null);
  const unread = notifications.filter((n) => !n.read).length;

  const markRead = (id) => {
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
    toast({ title: "Marked as read" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md font-bold text-foreground flex items-center gap-2">
          Notifications
          {unread > 0 && <Badge className="bg-destructive text-destructive-foreground">{unread}</Badge>}
        </h1>
      </div>
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>From</TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n) => (
                <TableRow key={n.id} className={!n.read ? "bg-primary/5 font-medium" : ""}>
                  <TableCell className="text-sm">{n.date}</TableCell>
                  <TableCell>
                    <Badge className={TYPE_STYLE[n.type] || "bg-muted text-muted-foreground"}>
                      {n.type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">{n.message}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{n.from}</TableCell>
                  <TableCell>
                    {!n.read && (
                      <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                        <Check className="h-4 w-4 mr-1" /> Read
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { 
                        setSelected(n); 
                        if (!n.read) markRead(n.id); 
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.message}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">From: {selected?.from}</p>
            <p className="text-sm text-muted-foreground">Date: {selected?.date}</p>
            <p className="text-body mt-2">{selected?.details}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotifications;