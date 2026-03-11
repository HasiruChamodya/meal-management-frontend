import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Unauthorized from "@/pages/Unauthorized";
import CensusEntry from "@/pages/CensusEntry";
import CensusSubmissions from "@/pages/CensusSubmissions";
import Calculations from "@/pages/Calculations";
import CalculationResults from "@/pages/CalculationResults";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Approvals from "@/pages/Approvals";
import ApprovalDetail from "@/pages/ApprovalDetail";
import Invoices from "@/pages/Invoices";
import InvoiceDetail from "@/pages/InvoiceDetail";
import AccountantPriceManagement from "@/pages/AccountantPriceManagement";
import FinancialReports from "@/pages/FinancialReports";
import CookSheet from "@/pages/CookSheet";
import DeliveryReceiving from "@/pages/DeliveryReceiving";
import IssueReports from "@/pages/IssueReports";
import AdminDailyCycle from "@/pages/AdminDailyCycle";
import AdminWards from "@/pages/AdminWards";
import AdminDietTypes from "@/pages/AdminDietTypes";
import AdminItems from "@/pages/AdminItems";
import NormWeights from "@/pages/NormWeights";
import AdminDietCycles from "@/pages/AdminDietCycles";
import AdminRecipes from "@/pages/AdminRecipes";
import AdminNotifications from "@/pages/AdminNotifications";
import SystemUsers from "@/pages/SystemUsers";
import AuditLogs from "@/pages/AuditLogs";
import Backups from "@/pages/Backups";
import SystemSettings from "@/pages/SystemSettings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedPage = ({ children }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const P = ({ children }) => <ProtectedPage>{children}</ProtectedPage>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/dashboard" element={<P><Dashboard /></P>} />
            {/* Diet Clerk */}
            <Route path="/census" element={<P><CensusEntry /></P>} />
            <Route path="/census/submissions" element={<P><CensusSubmissions /></P>} />
            {/* Subject Clerk */}
            <Route path="/calculations" element={<P><Calculations /></P>} />
            <Route path="/calculations/results" element={<P><CalculationResults /></P>} />
            <Route path="/orders" element={<P><Orders /></P>} />
            <Route path="/orders/:id" element={<P><OrderDetail /></P>} />
            {/* Accountant */}
            <Route path="/approvals" element={<P><Approvals /></P>} />
            <Route path="/approvals/:id" element={<P><ApprovalDetail /></P>} />
            <Route path="/invoices" element={<P><Invoices /></P>} />
            <Route path="/invoices/:id" element={<P><InvoiceDetail /></P>} />
            <Route path="/accountant/prices" element={<P><AccountantPriceManagement /></P>} />
            <Route path="/reports" element={<P><FinancialReports /></P>} />
            {/* Kitchen */}
            <Route path="/kitchen" element={<P><CookSheet /></P>} />
            <Route path="/kitchen/receiving" element={<P><DeliveryReceiving /></P>} />
            <Route path="/kitchen/reports" element={<P><IssueReports /></P>} />
            {/* Hospital Admin */}
            <Route path="/admin/daily-cycle" element={<P><AdminDailyCycle /></P>} />
            <Route path="/admin/wards" element={<P><AdminWards /></P>} />
            <Route path="/admin/diet-types" element={<P><AdminDietTypes /></P>} />
            <Route path="/admin/items" element={<P><AdminItems /></P>} />
            <Route path="/admin/norm-weights" element={<P><NormWeights /></P>} />
            <Route path="/admin/diet-cycles" element={<P><AdminDietCycles /></P>} />
            <Route path="/admin/recipes" element={<P><AdminRecipes /></P>} />
            <Route path="/admin/notifications" element={<P><AdminNotifications /></P>} />
            {/* System Admin */}
            <Route path="/system/users" element={<P><SystemUsers /></P>} />
            <Route path="/system/audit" element={<P><AuditLogs /></P>} />
            <Route path="/system/backups" element={<P><Backups /></P>} />
            <Route path="/system/settings" element={<P><SystemSettings /></P>} />
            {/* Legacy redirect */}
            <Route path="/prices" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;