import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import InfoBar from "./InfoBar";

const AppLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <InfoBar />
          <div className="hidden md:flex items-center h-8 px-4 border-b bg-card">
            <SidebarTrigger className="h-6 w-6 text-muted-foreground" />
          </div>
          <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;