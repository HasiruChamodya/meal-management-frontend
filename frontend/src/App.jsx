import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import AppLayout from "@/components/layout/AppLayout";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Unauthorized from "@/pages/Unauthorized";

import CensusEntry from "@/pages/CensusEntry";
import CensusSubmissions from "@/pages/CensusSubmissions";
import ConsolidatedDietSheet from "@/pages/ConsolidatedDietSheet";

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
import CalculationHistory from "@/pages/CalculationHistory";
import DailyHistory from "@/pages/DailyHistory";
import CensusHistory from "@/pages/CensusHistory";


const queryClient = new QueryClient();

const Page = ({ children }) => <AppLayout>{children}</AppLayout>;
const LegacyInvoiceDetailRedirect = () => {
  const { id } = useParams();

  return <Navigate to={`/purchase-orders/${id}`} replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route
                path="/dashboard"
                element={
                  <Page>
                    <Dashboard />
                  </Page>
                }
              />

              {/* Diet Clerk */}
              <Route
                path="/census"
                element={
                  <Page>
                    <CensusEntry />
                  </Page>
                }
              />
              <Route
                path="/census/submissions"
                element={
                  <Page>
                    <CensusSubmissions />
                  </Page>
                }
              />
              <Route
                path="/reports/consolidated-diet-sheet"
                element={
                  <Page>
                    <ConsolidatedDietSheet />
                  </Page>
                }
              />
              <Route
                path= "/census/history"
                element={
                  <Page>
                    <CensusHistory />
                  </Page>
                }
              />

              {/* Subject Clerk */}
              <Route
                path="/calculations"
                element={
                  <Page>
                    <Calculations />
                  </Page>
                }
              />
              <Route
                path="/calculations/results"
                element={
                  <Page>
                    <CalculationResults />
                  </Page>
                }
              />
              <Route
                path="/orders"
                element={
                  <Page>
                    <Orders />
                  </Page>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <Page>
                    <OrderDetail />
                  </Page>
                }
              />
              <Route 
                path="/calculations/history"
                element={
                  <Page>
                    <CalculationHistory />
                  </Page>
                }
              />

              {/* Accountant */}
              <Route
                path="/approvals"
                element={
                  <Page>
                    <Approvals />
                  </Page>
                }
              />
              <Route
                path="/approvals/:id"
                element={
                  <Page>
                    <ApprovalDetail />
                  </Page>
                }
              />
              <Route
                path="/purchase-orders"
                element={
                  <Page>
                    <Invoices />
                  </Page>
                }
              />
              <Route
                path="/purchase-orders/:id"
                element={
                  <Page>
                    <InvoiceDetail />
                  </Page>
                }
              />
              <Route
                path="/invoices/:id"
                element={<LegacyInvoiceDetailRedirect />}
              />
              <Route
                path="/accountant/prices"
                element={
                  <Page>
                    <AccountantPriceManagement />
                  </Page>
                }
              />
              <Route
                path="/reports"
                element={
                  <Page>
                    <FinancialReports />
                  </Page>
                }
              />
              <Route
                path="/accountant/reports"
                element={
                  <Page>
                    <IssueReports />
                  </Page>
                }
              />
              <Route
                path="/accountant/history"
                element={
                  <Page>
                    <DailyHistory />
                  </Page>
                }
               />

              {/* Kitchen */}
              <Route
                path="/kitchen"
                element={
                  <Page>
                    <CookSheet />
                  </Page>
                }
              />
              <Route
                path="/kitchen/receiving"
                element={
                  <Page>
                    <DeliveryReceiving />
                  </Page>
                }
              />

              {/* Hospital Admin */}
              <Route
                path="/admin/daily-cycle"
                element={
                  <Page>
                    <AdminDailyCycle />
                  </Page>
                }
              />
              <Route
                path="/admin/wards"
                element={
                  <Page>
                    <AdminWards />
                  </Page>
                }
              />
              <Route
                path="/admin/diet-types"
                element={
                  <Page>
                    <AdminDietTypes />
                  </Page>
                }
              />
              <Route
                path="/admin/items"
                element={
                  <Page>
                    <AdminItems />
                  </Page>
                }
              />
              <Route
                path="/admin/norm-weights"
                element={
                  <Page>
                    <NormWeights />
                  </Page>
                }
              />
              <Route
                path="/admin/diet-cycle"
                element={
                  <Page>
                    <AdminDietCycles />
                  </Page>
                }
              />
              <Route
                path="/admin/recipes"
                element={
                  <Page>
                    <AdminRecipes />
                  </Page>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <Page>
                    <AdminNotifications />
                  </Page>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <Page>
                    <IssueReports />
                  </Page>
                }
              />

              {/* System Admin */}
              <Route
                path="/system/users"
                element={
                  <Page>
                    <SystemUsers />
                  </Page>
                }
              />
              <Route
                path="/system/audit"
                element={
                  <Page>
                    <AuditLogs />
                  </Page>
                }
              />
              <Route
                path="/system/backups"
                element={
                  <Page>
                    <Backups />
                  </Page>
                }
              />
              <Route
                path="/system/settings"
                element={
                  <Page>
                    <SystemSettings />
                  </Page>
                }
              />

              <Route path="/prices" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;