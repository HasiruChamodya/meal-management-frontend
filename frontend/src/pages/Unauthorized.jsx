import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-heading-lg text-foreground">Access Denied</h1>
        <p className="text-body text-muted-foreground max-w-md">
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <Button onClick={() => navigate("/dashboard")} className="touch-target">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;