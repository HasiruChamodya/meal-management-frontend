import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, ROLE_BADGE_COLORS } from "@/lib/constants";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";

const TopBar = () => {
  const { user } = useAuth();
  const { toggleSidebar, isMobile } = useSidebar();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="touch-target"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="hidden sm:block">
          <h2 className="text-label font-semibold text-foreground leading-tight">
            District General Hospital, Gampaha
          </h2>
        </div>

        <div className="sm:hidden">
          <h2 className="text-label font-semibold text-foreground">
            DGH Gampaha
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-label font-medium text-foreground hidden md:inline">
          {user.name}
        </span>

        <Badge
          className={`${ROLE_BADGE_COLORS[user.role]} text-primary-foreground text-xs px-2 py-0.5`}
        >
          {ROLE_LABELS[user.role]}
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="touch-target text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default TopBar;