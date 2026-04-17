

// ─── PO Categories (inlined — was imported from calculation-data) ───
// NOTE: If your components import MOCK_PO_CATEGORIES from calculation-data,
// you'll need to inline that data too or import it from this file.

const cloneWithChanges = (cats, changes) =>
  cats.map((c) => ({
    ...c,
    items: c.items.map((i) => ({
      ...i,
      unitPrice: changes[i.id] ?? i.unitPrice,
    })),
  }));

// ─── Accountant Mock Data ───

// NOTE: MOCK_PO_CATEGORIES needs to be defined here or imported from your
// converted calculation-data.jsx file. Replace the placeholder below with
// your actual PO categories data.
const MOCK_PO_CATEGORIES = []; // ← Replace with actual data from calculation-data

export const MOCK_PENDING = [
  {
    id: "PA-001", date: "2026-03-02", billNo: "B-0302",
    submittedBy: "Ruwan Jayawardena", itemCount: 26, originalTotal: 71293.50, priceChanges: 3,
    categories: cloneWithChanges(MOCK_PO_CATEGORIES, { 1: 250, 5: 1150, 18: 520 }),
  },
  {
    id: "PA-002", date: "2026-03-01", billNo: "B-0301",
    submittedBy: "Ruwan Jayawardena", itemCount: 22, originalTotal: 68450.50, priceChanges: 0,
    categories: MOCK_PO_CATEGORIES,
  },
  {
    id: "PA-003", date: "2026-02-28", billNo: "B-0228",
    submittedBy: "Ruwan Jayawardena", itemCount: 20, originalTotal: 55200.00, priceChanges: 1,
    categories: cloneWithChanges(MOCK_PO_CATEGORIES, { 7: 1350 }),
  },
];

// ─── Invoice Data ───

export const MOCK_INVOICES = [
  {
    id: "INV-001", billNo: "000369", date: "2026-03-02",
    supplier: "Multi Purpose Co-operative Society Ltd, Gampaha, Henarathgoda, Mudungoda.",
    grandTotal: 7129.35, generatedBy: "Kumari Bandara",
    categorySummary: [
      { id: 1, name: "Rice / Bread / Noodles / Hoppers", total: 5332.80 },
      { id: 2, name: "Meat / Fish / Egg / Dried Fish", total: 276.00 },
      { id: 3, name: "Vegetables (Palaa) - Leaves", total: 1520.55 },
      { id: 4, name: "Vegetables (Gedi) - Vegetable Fruits", total: 0 },
      { id: 5, name: "Vegetables (Piti) - Starchy", total: 0 },
      { id: 6, name: "Vegetables (Other)", total: 0 },
      { id: 7, name: "Fruits", total: 0 },
      { id: 8, name: "Currystuffs & Condiments", total: 0 },
      { id: 9, name: "Sugar / Milk & Milk Products", total: 0 },
      { id: 10, name: "Biscuits", total: 0 },
      { id: 11, name: "Nutritional Supplements", total: 0 },
    ],
  },
  {
    id: "INV-002", billNo: "000368", date: "2026-03-01",
    supplier: "Multi Purpose Co-operative Society Ltd, Gampaha, Henarathgoda, Mudungoda.",
    grandTotal: 68450.50, generatedBy: "Kumari Bandara",
    categorySummary: [
      { id: 1, name: "Rice / Bread / Noodles / Hoppers", total: 15240.00 },
      { id: 2, name: "Meat / Fish / Egg / Dried Fish", total: 28500.00 },
      { id: 3, name: "Vegetables (Palaa) - Leaves", total: 4200.00 },
      { id: 4, name: "Vegetables (Gedi) - Vegetable Fruits", total: 3800.00 },
      { id: 5, name: "Vegetables (Piti) - Starchy", total: 2100.00 },
      { id: 6, name: "Vegetables (Other)", total: 3500.00 },
      { id: 7, name: "Fruits", total: 2800.00 },
      { id: 8, name: "Currystuffs & Condiments", total: 4510.50 },
      { id: 9, name: "Sugar / Milk & Milk Products", total: 2300.00 },
      { id: 10, name: "Biscuits", total: 800.00 },
      { id: 11, name: "Nutritional Supplements", total: 700.00 },
    ],
  },
];

// ─── Financial Report Data ───

export const BUDGET_VS_ACTUAL = [
  { day: "Feb 24", budget: 8500, actual: 7800 },
  { day: "Feb 25", budget: 8500, actual: 8200 },
  { day: "Feb 26", budget: 8500, actual: 9100 },
  { day: "Feb 27", budget: 8500, actual: 8400 },
  { day: "Feb 28", budget: 8500, actual: 7600 },
  { day: "Mar 01", budget: 8500, actual: 8900 },
  { day: "Mar 02", budget: 8500, actual: 7129 },
];

export const TOP_INGREDIENTS = [
  { name: "Rice Nadu", cost: 5332 },
  { name: "Chicken", cost: 20350 },
  { name: "Fresh Fish", cost: 10200 },
  { name: "Eggs", cost: 3450 },
  { name: "Red Rice Nadu", cost: 5818 },
];

// ─── Kitchen Mock Data ───

export const MOCK_RECEIVING = [
  { id: 1, nameEn: "Rice Nadu", nameSi: "හාල් - තැම්බු නාඩු", unit: "Kg", ordered: 24.24, received: 24.24, quality: "good", notes: "" },
  { id: 2, nameEn: "Red Rice Nadu", nameSi: "හාල් - රතු නාඩු", unit: "Kg", ordered: 24.24, received: 24.24, quality: "good", notes: "" },
  { id: 3, nameEn: "Bread", nameSi: "පාන් 450G", unit: "Pcs", ordered: 51, received: 51, quality: "good", notes: "" },
  { id: 4, nameEn: "Chicken", nameSi: "කුකුළු මස්", unit: "Kg", ordered: 18.5, received: 17.2, quality: "good", notes: "Slightly short" },
  { id: 5, nameEn: "Eggs", nameSi: "බිත්තර", unit: "Pcs", ordered: 75, received: 75, quality: "good", notes: "" },
  { id: 6, nameEn: "Dried Fish", nameSi: "කරවල", unit: "Kg", ordered: 7.3, received: 7.3, quality: "poor", notes: "Some discoloration" },
  { id: 7, nameEn: "Fresh Fish", nameSi: "මළු", unit: "Kg", ordered: 12.0, received: 12.0, quality: "good", notes: "" },
  { id: 8, nameEn: "Potato", nameSi: "අල", unit: "Kg", ordered: 5.0, received: 5.0, quality: "good", notes: "" },
  { id: 9, nameEn: "Brinjal", nameSi: "වම්බටු", unit: "Kg", ordered: 8.0, received: 8.0, quality: "good", notes: "" },
  { id: 10, nameEn: "Coconut Oil", nameSi: "පොල් තෙල්", unit: "L", ordered: 9.8, received: 9.8, quality: "good", notes: "" },
  { id: 11, nameEn: "Papaw", nameSi: "පැපොල්", unit: "Kg", ordered: 2.4, received: 2.4, quality: "good", notes: "" },
  { id: 12, nameEn: "Banana-Ambul", nameSi: "අම්බුල් කෙසෙල්", unit: "Fruit", ordered: 35, received: 35, quality: "good", notes: "" },
];

export const MOCK_ISSUE_REPORTS = [
  {
    id: "IR-001", date: "2026-03-02", orderNo: "B-0302", qtyIssues: 1, qualityIssues: 1, status: "open",
    items: [
      { name: "Chicken", issue: "Short delivery", details: "Ordered 18.5Kg, received 17.2Kg" },
      { name: "Dried Fish", issue: "Poor quality", details: "Some discoloration noticed" },
    ],
  },
  {
    id: "IR-002", date: "2026-03-01", orderNo: "B-0301", qtyIssues: 0, qualityIssues: 2, status: "resolved",
    items: [
      { name: "Eggs", issue: "Damaged", details: "5 eggs broken during transport" },
      { name: "Fresh Fish", issue: "Spoiled", details: "Bad smell on 2Kg portion" },
    ],
  },
  {
    id: "IR-003", date: "2026-02-28", orderNo: "B-0228", qtyIssues: 2, qualityIssues: 0, status: "escalated",
    items: [
      { name: "Rice Nadu", issue: "Short delivery", details: "Missing 3Kg" },
      { name: "Bread", issue: "Short delivery", details: "10 loaves short" },
    ],
  },
];

// ─── Admin Mock Data ───

export const MOCK_DIET_TYPES = [
  { id: "1", code: "NOR", nameEn: "Normal", nameSi: "සාමාන්‍ය", ageRange: "All", type: "Patient", displayOrder: 1, active: true },
  { id: "2", code: "DM", nameEn: "Diabetic", nameSi: "දියවැඩියා", ageRange: "All", type: "Patient", displayOrder: 2, active: true },
  { id: "3", code: "BFX", nameEn: "Breakfast Extra", nameSi: "උදේ අමතර", ageRange: "All", type: "Extra", displayOrder: 3, active: true },
  { id: "4", code: "S1", nameEn: "S1", nameSi: "S1", ageRange: "6y-12y", type: "Paediatric", displayOrder: 4, active: true },
  { id: "5", code: "S2", nameEn: "S2", nameSi: "S2", ageRange: "2y-6y", type: "Paediatric", displayOrder: 5, active: true },
  { id: "6", code: "S3", nameEn: "S3", nameSi: "S3", ageRange: "1y-2y", type: "Paediatric", displayOrder: 6, active: true },
  { id: "7", code: "S4", nameEn: "S4", nameSi: "S4", ageRange: "6m-1y", type: "Paediatric", displayOrder: 7, active: true },
  { id: "8", code: "S5", nameEn: "S5 (No Diet)", nameSi: "S5", ageRange: "N/A", type: "Paediatric", displayOrder: 8, active: true },
  { id: "9", code: "HPD", nameEn: "HPD", nameSi: "HPD", ageRange: "All", type: "Special", displayOrder: 9, active: true },
  { id: "10", code: "STF", nameEn: "Staff", nameSi: "කාර්ය මණ්ඩලය", ageRange: "All", type: "Staff", displayOrder: 10, active: true },
];

export const ITEM_CATEGORIES = [
  { id: 1, name: "Rice / Bread / Noodles" },
  { id: 2, name: "Meat / Fish / Egg / Dried Fish" },
  { id: 3, name: "Vegetables - Palaa (Leaves)" },
  { id: 4, name: "Vegetables - Gedi" },
  { id: 5, name: "Vegetables - Piti (Starchy)" },
  { id: 6, name: "Vegetables - Other" },
  { id: 7, name: "Fruits" },
  { id: 8, name: "Currystuffs & Condiments" },
  { id: 9, name: "Sugar / Milk & Milk Products" },
  { id: 10, name: "Biscuits" },
  { id: 11, name: "Nutritional Supplements" },
];

export const MOCK_ADMIN_ITEMS = [
  { id:1, nameEn:"Rice Nadu", nameSi:"හාල් - තැම්බු නාඩු", unit:"Kg", defaultPrice:220, categoryId:1, category:"Rice / Bread / Noodles", isProtein:false, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:2, nameEn:"Red Rice Nadu", nameSi:"හාල් - රතු නාඩු", unit:"Kg", defaultPrice:240, categoryId:1, category:"Rice / Bread / Noodles", isProtein:false, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:3, nameEn:"Bread (loaves)", nameSi:"පාන් 450G", unit:"Pcs", defaultPrice:85, categoryId:1, category:"Rice / Bread / Noodles", isProtein:false, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:4, nameEn:"Noodles", nameSi:"නූඩ්ල්ස්", unit:"Kg", defaultPrice:350, categoryId:1, category:"Rice / Bread / Noodles", isProtein:false, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:5, nameEn:"String Hoppers", nameSi:"ඉඳි ආප්ප", unit:"Kg", defaultPrice:300, categoryId:1, category:"Rice / Bread / Noodles", isProtein:false, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:6, nameEn:"Chicken", nameSi:"කුකුළු මස්", unit:"Kg", defaultPrice:1100, categoryId:2, category:"Meat / Fish / Egg / Dried Fish", isProtein:true, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:7, nameEn:"Eggs", nameSi:"බිත්තර", unit:"Pcs", defaultPrice:46, categoryId:2, category:"Meat / Fish / Egg / Dried Fish", isProtein:true, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:8, nameEn:"Dried Fish", nameSi:"කරවල", unit:"Kg", defaultPrice:1200, categoryId:2, category:"Meat / Fish / Egg / Dried Fish", isProtein:true, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:9, nameEn:"Fresh Fish", nameSi:"මළු", unit:"Kg", defaultPrice:850, categoryId:2, category:"Meat / Fish / Egg / Dried Fish", isProtein:true, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:10, nameEn:"Dhal", nameSi:"පරිප්පු", unit:"Kg", defaultPrice:520, categoryId:2, category:"Meat / Fish / Egg / Dried Fish", isProtein:false, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:11, nameEn:"Adu Gova", nameSi:"අබ ගෝවා", unit:"Kg", defaultPrice:280, categoryId:3, category:"Vegetables - Palaa", isProtein:false, vegCategory:"palaa", isExtra:false, calcType:"norm_weight" },
  { id:12, nameEn:"Gotukola", nameSi:"ගොටුකොළ", unit:"Kg", defaultPrice:320, categoryId:3, category:"Vegetables - Palaa", isProtein:false, vegCategory:"palaa", isExtra:false, calcType:"norm_weight" },
  { id:13, nameEn:"Brinjal", nameSi:"වම්බටු", unit:"Kg", defaultPrice:180, categoryId:4, category:"Vegetables - Gedi", isProtein:false, vegCategory:"gedi", isExtra:false, calcType:"norm_weight" },
  { id:14, nameEn:"Pumpkin", nameSi:"වට්ටක්කා", unit:"Kg", defaultPrice:120, categoryId:4, category:"Vegetables - Gedi", isProtein:false, vegCategory:"gedi", isExtra:false, calcType:"norm_weight" },
  { id:15, nameEn:"Potato", nameSi:"අල", unit:"Kg", defaultPrice:350, categoryId:5, category:"Vegetables - Piti", isProtein:false, vegCategory:"piti", isExtra:false, calcType:"norm_weight" },
  { id:16, nameEn:"Sweet Potato", nameSi:"බතල", unit:"Kg", defaultPrice:200, categoryId:5, category:"Vegetables - Piti", isProtein:false, vegCategory:"piti", isExtra:false, calcType:"norm_weight" },
  { id:17, nameEn:"Carrot", nameSi:"කැරට්", unit:"Kg", defaultPrice:280, categoryId:6, category:"Vegetables - Other", isProtein:false, vegCategory:"other", isExtra:false, calcType:"norm_weight" },
  { id:18, nameEn:"Beans", nameSi:"බෝංචි", unit:"Kg", defaultPrice:320, categoryId:6, category:"Vegetables - Other", isProtein:false, vegCategory:"other", isExtra:false, calcType:"norm_weight" },
  { id:19, nameEn:"Papaw", nameSi:"පැපොල්", unit:"Kg", defaultPrice:150, categoryId:7, category:"Fruits", isProtein:false, vegCategory:null, isExtra:true, calcType:"raw_sum" },
  { id:20, nameEn:"Banana-Ambul", nameSi:"අම්බුල් කෙසෙල්", unit:"Fruit", defaultPrice:15, categoryId:7, category:"Fruits", isProtein:false, vegCategory:null, isExtra:true, calcType:"raw_sum" },
  { id:21, nameEn:"Coconut Oil", nameSi:"පොල් තෙල්", unit:"L", defaultPrice:480, categoryId:8, category:"Currystuffs & Condiments", isProtein:false, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:22, nameEn:"Chilli Powder", nameSi:"මිරිස් කුඩු", unit:"Kg", defaultPrice:1800, categoryId:8, category:"Currystuffs & Condiments", isProtein:false, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:23, nameEn:"Sugar", nameSi:"සීනි", unit:"Kg", defaultPrice:220, categoryId:9, category:"Sugar / Milk & Milk Products", isProtein:false, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:24, nameEn:"Fresh Milk 1L", nameSi:"නැවුම් කිරි 1L", unit:"Pcs", defaultPrice:320, categoryId:9, category:"Sugar / Milk & Milk Products", isProtein:false, vegCategory:null, isExtra:true, calcType:"raw_sum" },
  { id:25, nameEn:"Cream Crackers", nameSi:"බිස්කට්", unit:"Pkt", defaultPrice:85, categoryId:10, category:"Biscuits", isProtein:false, vegCategory:null, isExtra:false, calcType:"norm_weight" },
  { id:26, nameEn:"Thriposha", nameSi:"තිරිගු පිටි", unit:"Kg", defaultPrice:380, categoryId:11, category:"Nutritional Supplements", isProtein:false, vegCategory:null, isExtra:false, calcType:"norm_weight" },
];

// ─── Norm Weight Matrix ───

export const MOCK_NORM_WEIGHTS = [
  { itemId:1, meal:"breakfast", normal:75, diabetic:75, hpd:0, s1:60, s2:60, s3:40, s4:0, s5:0, staff:75 },
  { itemId:1, meal:"lunch", normal:100, diabetic:75, hpd:0, s1:60, s2:60, s3:40, s4:0, s5:0, staff:100 },
  { itemId:1, meal:"dinner", normal:75, diabetic:75, hpd:0, s1:60, s2:60, s3:40, s4:0, s5:0, staff:0 },
  { itemId:6, meal:"breakfast", normal:0, diabetic:0, hpd:0, s1:0, s2:0, s3:0, s4:0, s5:0, staff:0 },
  { itemId:6, meal:"lunch", normal:40, diabetic:40, hpd:0, s1:30, s2:20, s3:0, s4:0, s5:0, staff:40 },
  { itemId:6, meal:"dinner", normal:0, diabetic:0, hpd:0, s1:0, s2:0, s3:0, s4:0, s5:0, staff:0 },
];

export const DIET_CYCLES = [
  { id: "1", code: "VEG", nameEn: "Vegetable", nameSi: "එළවළු", active: true },
  { id: "2", code: "EGG", nameEn: "Egg", nameSi: "බිත්තර", active: true },
  { id: "3", code: "MCF", nameEn: "Meat/Canned Fish", nameSi: "මස්/ටින් මාළු", active: true },
  { id: "4", code: "DRF", nameEn: "Dried Fish", nameSi: "කරවල", active: true },
  { id: "5", code: "FSH", nameEn: "Fish", nameSi: "මාළු", active: true },
];

export const RECIPE_DATA = {
  polSambola: {
    name: "Pol Sambola",
    ingredients: [
      { name: "Coconut (850g seeds)", normPerPatient: 0.1, unit: "seeds" },
      { name: "Dried Chillies", normPerPatient: 0.9, unit: "g" },
      { name: "Red Onion", normPerPatient: 0.9, unit: "g" },
      { name: "Lime", normPerPatient: 0.5, unit: "g" },
      { name: "Salt", normPerPatient: 0.3, unit: "g" },
    ],
  },
  soup: {
    name: "Soup / Kanda",
    ingredients: [
      { name: "Carrot", normPerPatient: 5, unit: "g" },
      { name: "Beans", normPerPatient: 5, unit: "g" },
      { name: "Leeks", normPerPatient: 3, unit: "g" },
      { name: "Potato", normPerPatient: 8, unit: "g" },
      { name: "Salt", normPerPatient: 0.5, unit: "g" },
      { name: "Pepper", normPerPatient: 0.2, unit: "g" },
    ],
  },
};

export const RECIPE_CONVERSION = [
  { dietType: "Normal", factor: 1.0 },
  { dietType: "Diabetic", factor: 1.0 },
  { dietType: "S1", factor: 0.72 },
  { dietType: "S2", factor: 0.72 },
  { dietType: "S3", factor: 0.48 },
  { dietType: "Staff", factor: 1.0 },
];

// ─── System Admin Mock Data ───

export const MOCK_SYSTEM_USERS = [
  { id: "1", name: "Kamal Perera", username: "admin", email: "kamal@dgh.lk", role: "System Admin", status: "active", lastLogin: "2026-03-02 09:15", twoFA: true },
  { id: "2", name: "Nimal Silva", username: "hadmin", email: "nimal@dgh.lk", role: "Hospital Admin", status: "active", lastLogin: "2026-03-02 08:30", twoFA: true },
  { id: "3", name: "Sita Fernando", username: "diet", email: "sita@dgh.lk", role: "Diet Clerk", status: "active", lastLogin: "2026-03-02 07:45", twoFA: false },
  { id: "4", name: "Ruwan Jayawardena", username: "subject", email: "ruwan@dgh.lk", role: "Subject Clerk", status: "active", lastLogin: "2026-03-02 08:00", twoFA: false },
  { id: "5", name: "Kumari Bandara", username: "accountant", email: "kumari@dgh.lk", role: "Accountant", status: "active", lastLogin: "2026-03-01 16:30", twoFA: true },
  { id: "6", name: "Sunil Rathnayake", username: "kitchen", email: "sunil@dgh.lk", role: "Kitchen Staff", status: "active", lastLogin: "2026-03-02 06:00", twoFA: false },
  { id: "7", name: "Anura Wijesinghe", username: "diet2", email: "anura@dgh.lk", role: "Diet Clerk", status: "deactivated", lastLogin: "2026-02-15 10:00", twoFA: false },
  { id: "8", name: "Chaminda Peris", username: "kitchen2", email: "chaminda@dgh.lk", role: "Kitchen Staff", status: "locked", lastLogin: "2026-02-28 14:20", twoFA: false },
];

export const MOCK_AUDIT_LOGS = [
  { id:"A1", timestamp:"2026-03-02 09:15:30", user:"Kamal Perera", action:"Login", entity:"Session", oldValue:"", newValue:"", ipAddress:"192.168.1.100", severity:"info" },
  { id:"A2", timestamp:"2026-03-02 09:00:15", user:"Sita Fernando", action:"Census Submitted", entity:"WD1 - Medical M", oldValue:"", newValue:'{"normal":10,"diabetic":4}', ipAddress:"192.168.1.55", severity:"data" },
  { id:"A3", timestamp:"2026-03-02 08:45:00", user:"Ruwan Jayawardena", action:"Price Change", entity:"Rice Nadu", oldValue:'{"price":220}', newValue:'{"price":250}', ipAddress:"192.168.1.60", severity:"price" },
  { id:"A4", timestamp:"2026-03-01 16:30:00", user:"Kumari Bandara", action:"PO Approved", entity:"PO-2026-0301", oldValue:'{"status":"pending"}', newValue:'{"status":"approved","total":68450.50}', ipAddress:"192.168.1.70", severity:"approval" },
  { id:"A5", timestamp:"2026-03-01 14:00:00", user:"Kamal Perera", action:"Password Reset", entity:"User: Chaminda Peris", oldValue:"", newValue:"Password reset forced", ipAddress:"192.168.1.100", severity:"security" },
  { id:"A6", timestamp:"2026-03-01 11:20:00", user:"Nimal Silva", action:"Norm Weight Changed", entity:"Rice Nadu - Lunch", oldValue:'{"normal":90}', newValue:'{"normal":100}', ipAddress:"192.168.1.50", severity:"data" },
  { id:"A7", timestamp:"2026-03-01 10:00:00", user:"Kamal Perera", action:"User Deactivated", entity:"User: Anura Wijesinghe", oldValue:'{"status":"active"}', newValue:'{"status":"deactivated"}', ipAddress:"192.168.1.100", severity:"security" },
  { id:"A8", timestamp:"2026-02-28 16:45:00", user:"Kumari Bandara", action:"PO Rejected", entity:"PO-2026-0228", oldValue:'{"status":"pending"}', newValue:'{"status":"rejected","reason":"Budget exceeded"}', ipAddress:"192.168.1.70", severity:"approval" },
  { id:"A9", timestamp:"2026-02-28 09:30:00", user:"Sunil Rathnayake", action:"Delivery Confirmed", entity:"Order B-0228", oldValue:"", newValue:'{"issues":2}', ipAddress:"192.168.1.80", severity:"data" },
  { id:"A10", timestamp:"2026-02-28 08:00:00", user:"Sita Fernando", action:"Login", entity:"Session", oldValue:"", newValue:"", ipAddress:"192.168.1.55", severity:"info" },
];

export const MOCK_BACKUPS = [
  { id:"BK1", date:"2026-03-02 02:00", size:"245 MB", type:"automatic", status:"completed" },
  { id:"BK2", date:"2026-03-01 14:30", size:"243 MB", type:"manual", status:"completed" },
  { id:"BK3", date:"2026-03-01 02:00", size:"243 MB", type:"automatic", status:"completed" },
  { id:"BK4", date:"2026-02-28 02:00", size:"241 MB", type:"automatic", status:"completed" },
  { id:"BK5", date:"2026-02-27 02:00", size:"240 MB", type:"automatic", status:"failed" },
  { id:"BK6", date:"2026-02-26 02:00", size:"238 MB", type:"automatic", status:"completed" },
];

// ─── Notification Mock Data ───

export const MOCK_NOTIFICATIONS = [
  { id:"N1", date:"2026-03-02 10:30", type:"quality_report", message:"Quality issue reported: Dried Fish discoloration", from:"Sunil Rathnayake (Kitchen)", read:false, details:"Dried Fish (කරවල) showed visible discoloration in today's delivery. Photos attached." },
  { id:"N2", date:"2026-03-02 10:25", type:"delivery", message:"Delivery shortage: Chicken 1.3Kg short", from:"Sunil Rathnayake (Kitchen)", read:false, details:"Ordered 18.5Kg but received only 17.2Kg of Chicken." },
  { id:"N3", date:"2026-03-01 15:00", type:"quality_report", message:"Spoiled items reported in delivery B-0301", from:"Sunil Rathnayake (Kitchen)", read:true, details:"5 eggs broken, 2Kg fish portion had bad smell." },
  { id:"N4", date:"2026-02-28 09:00", type:"system", message:"System backup failed - disk space low", from:"System", read:true, details:"Automatic backup at 02:00 failed due to insufficient disk space." },
];