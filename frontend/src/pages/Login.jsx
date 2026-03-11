import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [role, setRole] = useState("diet_clerk");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(role);
    toast({
      title: "Welcome to MealFlow",
      description: `Signed in as ${ROLE_LABELS[role]}`,
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 shadow-primary/10">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Utensils className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-heading-md font-bold text-foreground">MealFlow</h1>
          <p className="text-label text-muted-foreground mt-1">District General Hospital, Gampaha</p>
        </CardHeader>
        <CardContent className="pt-6 pb-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-label font-semibold">Sign in as</Label>
              <Select value={role} onValueChange={(v) => setRole(v)}>
                <SelectTrigger className="h-12 text-input touch-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-body">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-label font-semibold">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="h-12 text-input touch-target"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-label font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="h-12 text-input touch-target"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-body font-semibold touch-target mt-2">
              Sign In
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Demo mode — select a role and click Sign In
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;