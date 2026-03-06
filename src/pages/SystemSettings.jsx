import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Clock, Lock, Shield, AlertTriangle } from "lucide-react";

const SystemSettings = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <h1 className="text-heading-md font-bold text-foreground">System Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-label font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" /> Session Timeout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Timeout Duration (minutes)</Label>
              <Input type="number" defaultValue={15} className="w-32 mt-1" />
            </div>
            <p className="text-xs text-muted-foreground">
              Users will be logged out after this period of inactivity.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-label font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4" /> Password Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Minimum Length</Label>
              <Input type="number" defaultValue={8} className="w-32 mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <Switch defaultChecked id="complexity" />
              <Label htmlFor="complexity">Require uppercase, number, and special character</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-label font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" /> Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch id="2fa-admin" defaultChecked />
              <Label htmlFor="2fa-admin">Require 2FA for System Admins</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="2fa-accountant" defaultChecked />
              <Label htmlFor="2fa-accountant">Require 2FA for Accountants</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="2fa-all" />
              <Label htmlFor="2fa-all">Require 2FA for all users</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-label font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Maintenance Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch id="maintenance" />
              <Label htmlFor="maintenance">Enable Maintenance Mode</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              System will be in read-only mode. No data modifications allowed.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast({ title: "Settings Saved" })}>
          <Save className="h-4 w-4 mr-2" /> Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;