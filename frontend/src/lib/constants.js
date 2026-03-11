import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Users,
  Building2,
  Utensils,
  Calculator,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Receipt,
  ChefHat,
  Truck,
  AlertTriangle,
  Settings,
  Shield,
  History,
  Database,
  Bell,
  Scale,
  Package,
  ListTree,
  CalendarDays,
  BookOpen,
  CheckSquare,
} from "lucide-react";

export const ROLE_LABELS = {
  system_admin: "System Admin",
  hospital_admin: "Hospital Admin",
  diet_clerk: "Diet Clerk",
  subject_clerk: "Subject Clerk",
  accountant: "Accountant",
  kitchen: "Kitchen Staff",
};

export const ROLE_BADGE_COLORS = {
  system_admin: "bg-badge-admin",
  hospital_admin: "bg-badge-hospital",
  diet_clerk: "bg-badge-diet",
  subject_clerk: "bg-badge-subject",
  accountant: "bg-badge-accountant",
  kitchen: "bg-badge-kitchen",
};

export const MOCK_USERS = [
  { id: "1", name: "Kamal Perera", role: "system_admin", username: "admin" },
  { id: "2", name: "Nimal Silva", role: "hospital_admin", username: "hadmin" },
  { id: "3", name: "Sita Fernando", role: "diet_clerk", username: "diet" },
  { id: "4", name: "Ruwan Jayawardena", role: "subject_clerk", username: "subject" },
  { id: "5", name: "Kumari Bandara", role: "accountant", username: "accountant" },
  { id: "6", name: "Sunil Rathnayake", role: "kitchen", username: "kitchen" },
];

export const NAV_ITEMS = {
  diet_clerk: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Census Entry", url: "/census", icon: ClipboardList },
    { title: "My Submissions", url: "/census/submissions", icon: FileText },
  ],
  subject_clerk: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Calculations", url: "/calculations", icon: Calculator },
    { title: "Purchase Orders", url: "/orders", icon: ShoppingCart },
  ],
  accountant: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Pending Approvals", url: "/approvals", icon: CheckSquare },
    { title: "Invoices", url: "/invoices", icon: Receipt },
    { title: "Price Management", url: "/accountant/prices", icon: DollarSign },
    { title: "Financial Reports", url: "/reports", icon: BarChart3 },
  ],
  kitchen: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Cook Sheet", url: "/kitchen", icon: ChefHat },
    { title: "Delivery Receiving", url: "/kitchen/receiving", icon: Truck },
    { title: "Issue Reports", url: "/kitchen/reports", icon: AlertTriangle },
  ],
  hospital_admin: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Daily Meal Cycle", url: "/admin/daily-cycle", icon: CalendarDays },
    { title: "Wards", url: "/admin/wards", icon: Building2 },
    { title: "Diet Types", url: "/admin/diet-types", icon: Utensils },
    { title: "Norm Weights", url: "/admin/norm-weights", icon: Scale },
    { title: "Items", url: "/admin/items", icon: Package },
    { title: "Diet Cycles", url: "/admin/diet-cycles", icon: ListTree },
    { title: "Recipes", url: "/admin/recipes", icon: BookOpen },
    { title: "Notifications", url: "/admin/notifications", icon: Bell },
  ],
  system_admin: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Users", url: "/system/users", icon: Users },
    { title: "Audit Logs", url: "/system/audit", icon: History },
    { title: "Backups", url: "/system/backups", icon: Database },
    { title: "Settings", url: "/system/settings", icon: Settings },
  ],
};

export const DASHBOARD_CARDS = {
  diet_clerk: [
    { title: "Today's Census Entry", description: "Enter patient meal counts for your assigned wards", icon: ClipboardList, url: "/census", color: "text-primary" },
    { title: "My Submissions", description: "View and track your submitted census data", icon: FileText, url: "/census/submissions", color: "text-badge-hospital" },
  ],
  subject_clerk: [
    { title: "Ward Submission Status", description: "Monitor census submissions from all wards", icon: Building2, url: "/calculations", color: "text-primary" },
    { title: "Run Calculation", description: "Calculate ingredient requirements from census data", icon: Calculator, url: "/calculations", color: "text-badge-subject" },
    { title: "Purchase Orders", description: "View and manage purchase orders", icon: ShoppingCart, url: "/orders", color: "text-warning" },
  ],
  accountant: [
    { title: "Pending Approvals", description: "Review and approve purchase orders", icon: CheckSquare, url: "/approvals", color: "text-warning" },
    { title: "Invoices", description: "View and download invoices", icon: Receipt, url: "/invoices", color: "text-badge-hospital" },
    { title: "Price Management", description: "Update default item prices", icon: DollarSign, url: "/accountant/prices", color: "text-badge-accountant" },
    { title: "Financial Reports", description: "Track spending against allocated budgets", icon: BarChart3, url: "/reports", color: "text-primary" },
  ],
  kitchen: [
    { title: "Today's Cook Sheet", description: "View ingredient quantities for today's meals", icon: ChefHat, url: "/kitchen", color: "text-badge-kitchen" },
    { title: "Delivery Receiving", description: "Record incoming ingredient deliveries", icon: Truck, url: "/kitchen/receiving", color: "text-primary" },
    { title: "Issue Reports", description: "View delivery issue history", icon: AlertTriangle, url: "/kitchen/reports", color: "text-warning" },
  ],
  hospital_admin: [
    { title: "Daily Meal Cycle", description: "Set today's patient and staff diet cycles", icon: CalendarDays, url: "/admin/daily-cycle", color: "text-primary" },
    { title: "Ward Configuration", description: "Manage hospital wards and bed counts", icon: Building2, url: "/admin/wards", color: "text-badge-hospital" },
    { title: "Norm Weights", description: "Configure standard ingredient weights per diet type", icon: Scale, url: "/admin/norm-weights", color: "text-badge-subject" },
    { title: "Items", description: "Manage food items and categories", icon: Package, url: "/admin/items", color: "text-warning" },
    { title: "Notifications", description: "View quality and delivery alerts", icon: Bell, url: "/admin/notifications", color: "text-destructive" },
  ],
  system_admin: [
    { title: "User Management", description: "Add, edit, and manage system users", icon: Users, url: "/system/users", color: "text-badge-admin" },
    { title: "Audit Logs", description: "View system activity and change history", icon: History, url: "/system/audit", color: "text-muted-foreground" },
    { title: "Backups", description: "Manage database backups", icon: Database, url: "/system/backups", color: "text-badge-hospital" },
    { title: "Settings", description: "Configure system settings", icon: Settings, url: "/system/settings", color: "text-primary" },
  ],
};