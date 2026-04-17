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
  SYSTEM_ADMIN: "System Admin",
  HOSPITAL_ADMIN: "Hospital Admin",
  DIET_CLERK: "Diet Clerk",
  SUBJECT_CLERK: "Subject Clerk",
  ACCOUNTANT: "Accountant",
  KITCHEN: "Kitchen Staff",
};

export const ROLE_BADGE_COLORS = {
  SYSTEM_ADMIN: "bg-badge-admin",
  HOSPITAL_ADMIN: "bg-badge-hospital",
  DIET_CLERK: "bg-badge-diet",
  SUBJECT_CLERK: "bg-badge-subject",
  ACCOUNTANT: "bg-badge-accountant",
  KITCHEN: "bg-badge-kitchen",
};

export const NAV_ITEMS = {
  DIET_CLERK: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Census Entry", url: "/census", icon: ClipboardList },
    { title: "Census Submissions", url: "/census/submissions", icon: FileText },
    { title: "Past Census History", url: "/census/history", icon: History },
    { title: "Consolidated Diet Sheet", url: "/reports/consolidated-diet-sheet", icon: FileText },
  ],

  SUBJECT_CLERK: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Calculations", url: "/calculations", icon: Calculator },
    { title: "Calculation Results", url: "/calculations/results", icon: FileText },
    { title: "Past Calculations History", url: "/calculations/history", icon: History },
    { title: "Orders", url: "/orders", icon: ShoppingCart },
    
  ],

  ACCOUNTANT: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Financial Reports", url: "/reports", icon: BarChart3 },
    { title: "Price Management", url: "/accountant/prices", icon: DollarSign },
    { title: "Approvals", url: "/approvals", icon: CheckSquare },
    { title: "Purchase Orders", url: "/purchase-orders", icon: Receipt },
    { title: "Issue Reports", url: "/accountant/reports", icon: AlertTriangle },
    { title: "Daily Archive", url: "/accountant/history", icon: History },
  ],

  SYSTEM_ADMIN: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "System Users", url: "/system/users", icon: Users },
    { title: "Audit Logs", url: "/system/audit", icon: History },
    //{ title: "Settings", url: "/system/settings", icon: Settings },
    
  ],

  HOSPITAL_ADMIN: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Admin Daily Cycle", url: "/admin/daily-cycle", icon: CalendarDays },
    { title: "Admin Diet Cycle", url: "/admin/diet-cycle", icon: ListTree },
    { title: "Admin Diet Type", url: "/admin/diet-types", icon: Utensils },
    { title: "Admin Items", url: "/admin/items", icon: Package },
    { title: "Admin Norm Weights", url: "/admin/norm-weights", icon: Scale },
    { title: "Admin Recipes", url: "/admin/recipes", icon: BookOpen },
    { title: "Admin Wards", url: "/admin/wards", icon: Building2 },
    { title: "Issue Reports", url: "/admin/reports", icon: AlertTriangle },
  ],

  KITCHEN: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Cook Sheet", url: "/kitchen", icon: ChefHat },
    { title: "Delivery Receiving", url: "/kitchen/receiving", icon: Truck },
  ],
};

export const DASHBOARD_CARDS = {
  DIET_CLERK: [
    {
      title: "Today's Census Entry",
      description: "Enter patient meal counts for your assigned wards",
      icon: ClipboardList,
      url: "/census",
      color: "text-primary",
    },
    {
      title: "My Submissions",
      description: "View and track your submitted census data",
      icon: FileText,
      url: "/census/submissions",
      color: "text-badge-hospital",
    },
    {
      title: "Consolidated Diet Sheet",
      description: "View the consolidated diet sheet for all wards",
      icon: FileText,
      url: "/reports/consolidated-diet-sheet",
      color: "text-badge-diet",
    }
  ],
  SUBJECT_CLERK: [
    {
      title: "Ward Submission Status",
      description: "Monitor census submissions from all wards",
      icon: Building2,
      url: "/calculations",
      color: "text-primary",
    },
    {
      title: "Run Calculation",
      description: "Calculate ingredient requirements from census data",
      icon: Calculator,
      url: "/calculations",
      color: "text-badge-subject",
    },
    {
      title: "Purchase Orders",
      description: "View and manage purchase orders",
      icon: ShoppingCart,
      url: "/orders",
      color: "text-warning",
    },
  ],
  ACCOUNTANT: [
    {
      title: "Pending Approvals",
      description: "Review and approve purchase orders",
      icon: CheckSquare,
      url: "/approvals",
      color: "text-warning",
    },
    {
      title: "Purchase Orders",
      description: "View and manage purchase orders",
      icon: Receipt,
      url: "/invoices",
      color: "text-badge-hospital",
    },
    {
      title: "Price Management",
      description: "Update default item prices",
      icon: DollarSign,
      url: "/accountant/prices",
      color: "text-badge-accountant",
    },
    {
      title: "Financial Reports",
      description: "Track spending against allocated budgets",
      icon: BarChart3,
      url: "/reports",
      color: "text-primary",
    },
    {
      title: "Issue Reports",
      description: "View delivery issue history",
      icon: AlertTriangle,
      url: "/accountant/reports",
      color: "text-destructive",
    },
  ],
  KITCHEN: [
    {
      title: "Today's Cook Sheet",
      description: "View ingredient quantities for today's meals",
      icon: ChefHat,
      url: "/kitchen",
      color: "text-badge-kitchen",
    },
    {
      title: "Delivery Receiving",
      description: "Record incoming ingredient deliveries",
      icon: Truck,
      url: "/kitchen/receiving",
      color: "text-primary",
    },
  ],
  HOSPITAL_ADMIN: [
    {
      title: "Daily Meal Cycle",
      description: "Set today's patient and staff diet cycles",
      icon: CalendarDays,
      url: "/admin/daily-cycle",
      color: "text-primary",
    },
    {
      title: "Ward Configuration",
      description: "Manage hospital wards and bed counts",
      icon: Building2,
      url: "/admin/wards",
      color: "text-badge-hospital",
    },
    {
      title: "Norm Weights",
      description: "Configure standard ingredient weights per diet type",
      icon: Scale,
      url: "/admin/norm-weights",
      color: "text-badge-subject",
    },
    {
      title: "Items",
      description: "Manage food items and categories",
      icon: Package,
      url: "/admin/items",
      color: "text-warning",
    },
    {
      title: "Issue Reports",
      description: "View delivery issue history",
      icon: AlertTriangle,
      url: "/admin/reports",
      color: "text-destructive",
    },
  ],
  SYSTEM_ADMIN: [
    {
      title: "User Management",
      description: "Add, edit, and manage system users",
      icon: Users,
      url: "/system/users",
      color: "text-badge-admin",
    },
    {
      title: "Audit Logs",
      description: "View system activity and change history",
      icon: History,
      url: "/system/audit",
      color: "text-muted-foreground",
    },
    {
      title: "Backups",
      description: "Manage database backups",
      icon: Database,
      url: "/system/backups",
      color: "text-badge-hospital",
    },
    // {
    //   title: "Settings",
    //   description: "Configure system settings",
    //   icon: Settings,
    //   url: "/system/settings",
    //   color: "text-primary",
    // },
  ],
};