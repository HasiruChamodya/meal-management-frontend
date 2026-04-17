import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NAV_ITEMS } from "@/lib/constants";
import { Utensils } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (!user) return null;

  const role = user.role?.toUpperCase();

  const navItems = NAV_ITEMS[role] || [];

  const activeItemUrl =
    navItems
      .filter(
        (item) =>
          location.pathname === item.url ||
          location.pathname.startsWith(item.url + "/")
      )
      .sort((a, b) => b.url.length - a.url.length)[0]?.url || null;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4 flex flex-row items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <Utensils className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>

        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-sidebar-foreground truncate">
              Meal Management 
            </span>
            <span className="text-sm font-bold text-sidebar-foreground truncate">
              System 
            </span>
            <span className="text-[10px] text-sidebar-foreground/60 truncate">
              DGH Gampaha
            </span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = activeItemUrl === item.url;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.url} className="touch-target">
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <span className="text-sm">{item.title}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;