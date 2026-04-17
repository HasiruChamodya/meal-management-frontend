import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Lock } from "lucide-react";

const SystemSettings = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <h1 className="text-heading-md font-bold text-foreground">System Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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