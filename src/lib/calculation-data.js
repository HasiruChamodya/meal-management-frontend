import * as React from "react";

// --- Ward Data Constants ---
const WARDS = [
  { id: "WD1", code: "WD1", name: "Medical M" },
  { id: "WD2", code: "WD2", name: "Medical F" },
  { id: "WD4", code: "WD4", name: "Surgical M" },
  { id: "WD5", code: "WD5", name: "Surgical F" },
  { id: "WD6", code: "WD6", name: "Orthopedic" },
  { id: "WD7", code: "WD7", name: "Gynecology" },
  { id: "WD8", code: "WD8", name: "Obstetrics" },
  { id: "WD9", code: "WD9", name: "Pediatrics" },
  { id: "WD10", code: "WD10", name: "ENT" },
  { id: "WD11", code: "WD11", name: "Eye" },
  { id: "WD12", code: "WD12", name: "Psychiatry" },
  { id: "WD14", code: "WD14", name: "Cardiology" },
  { id: "WD15", code: "WD15", name: "Neurology" },
  { id: "WD16", code: "WD16", name: "Dialysis" },
  { id: "WD17", code: "WD17", name: "Oncology" },
  { id: "WD18", code: "WD18", name: "Dermatology" },
  { id: "WD19", code: "WD19", name: "Emergency" },
  { id: "DU", code: "DU", name: "Delivery Unit" },
  { id: "MICU1", code: "MICU1", name: "MICU 1" },
  { id: "MICU2", code: "MICU2", name: "MICU 2" },
];

// ─── Ward Submission Status ───
export const MOCK_WARD_STATUSES = WARDS.map((w) => {
  const submitted = [
    "WD1", "WD5", "WD6", "WD7", "WD8", "WD15", "WD14", "WD12", "WD11", "WD10",
    "WD17", "WD18", "WD9", "WD16", "WD19", "DU", "MICU1", "MICU2",
  ];
  const drafts = ["WD2", "WD4"];
  if (submitted.includes(w.id)) {
    const counts = {
      WD1: 14, WD5: 8, WD6: 22, WD7: 35, WD8: 28, WD15: 12, WD14: 10, WD12: 18,
      WD11: 15, WD10: 6, WD17: 11, WD18: 9, WD9: 5, WD16: 8, WD19: 7, DU: 4, MICU1: 3, MICU2: 2,
    };
    return { wardId: w.id, wardName: w.name, code: w.code, status: "submitted", patientCount: counts[w.id] || 0 };
  }
  if (drafts.includes(w.id))
    return { wardId: w.id, wardName: w.name, code: w.code, status: "draft", patientCount: w.id === "WD2" ? 11 : 20 };
  return { wardId: w.id, wardName: w.name, code: w.code, status: "not_started", patientCount: 0 };
});

// ─── Aggregated Totals ───
export const MOCK_AGGREGATED = {
  normal: 47, diabetic: 24, s1: 15, s2: 5, s3: 2, s4: 0, s5: 0, hpd: 0,
  staffB: 10, staffL: 25, staffD: 0,
  totalPatients: 93, totalStaff: 35,
};

// ─── Calculation Result Helpers ───
const makeBreakdown = (total) => [
  { dietType: "Normal", count: 47, normG: Math.round(total * 0.4 / 47 * 1000), subtotalG: Math.round(total * 0.4 * 1000) },
  { dietType: "Diabetic", count: 24, normG: Math.round(total * 0.25 / 24 * 1000), subtotalG: Math.round(total * 0.25 * 1000) },
  { dietType: "S1", count: 15, normG: Math.round(total * 0.15 / 15 * 1000), subtotalG: Math.round(total * 0.15 * 1000) },
  { dietType: "S2", count: 5, normG: Math.round(total * 0.05 / 5 * 1000), subtotalG: Math.round(total * 0.05 * 1000) },
  { dietType: "Staff", count: 35, normG: Math.round(total * 0.15 / 35 * 1000), subtotalG: Math.round(total * 0.15 * 1000) },
];

export const CALC_RESULTS = {
  rice: [
    { id: 1, nameEn: "Rice Nadu", nameSi: "හාල් - තැම්බු නාඩු", breakfast: 7.36, lunch: 10.28, dinner: 6.61, grandTotal: 24.24, unit: "Kg", breakdown: makeBreakdown(24.24) },
    { id: 2, nameEn: "Red Rice Nadu", nameSi: "හාල් - රතු නාඩු", breakfast: 7.36, lunch: 10.28, dinner: 6.61, grandTotal: 24.24, unit: "Kg", breakdown: makeBreakdown(24.24) },
    { id: 3, nameEn: "Bread (loaves)", nameSi: "පාන් 450G", breakfast: 25.25, lunch: null, dinner: 26, grandTotal: 51.25, unit: "Pcs", breakdown: makeBreakdown(51.25) },
    { id: 4, nameEn: "String Hoppers", nameSi: "ඉඳි ආප්ප", breakfast: 15.5, lunch: null, dinner: null, grandTotal: 15.5, unit: "Kg", breakdown: makeBreakdown(15.5) },
    { id: 5, nameEn: "Noodles", nameSi: "නූඩ්ල්ස්", breakfast: null, lunch: 3.2, dinner: null, grandTotal: 3.2, unit: "Kg", breakdown: makeBreakdown(3.2) },
  ],
  protein: [
    { id: 1, nameEn: "Chicken", nameSi: "කුකුළු මස්", breakfast: null, lunch: 18.5, dinner: null, grandTotal: 18.5, unit: "Kg", breakdown: makeBreakdown(18.5) },
    { id: 2, nameEn: "Eggs", nameSi: "බිත්තර", breakfast: 45, lunch: null, dinner: 30, grandTotal: 75, unit: "Pcs", breakdown: makeBreakdown(75) },
    { id: 3, nameEn: "Dried Fish", nameSi: "කරවල", breakfast: null, lunch: 4.2, dinner: 3.1, grandTotal: 7.3, unit: "Kg", breakdown: makeBreakdown(7.3) },
    { id: 4, nameEn: "Fresh Fish", nameSi: "මළු", breakfast: null, lunch: 12.0, dinner: null, grandTotal: 12.0, unit: "Kg", breakdown: makeBreakdown(12.0) },
    { id: 5, nameEn: "Dhal", nameSi: "පරිප්පු", breakfast: 2.5, lunch: 5.8, dinner: 4.1, grandTotal: 12.4, unit: "Kg", breakdown: makeBreakdown(12.4) },
  ],
  vegetables: [],
  condiments: [
    { id: 1, nameEn: "Coconut Oil", nameSi: "පොල් තෙල්", breakfast: 2.1, lunch: 4.5, dinner: 3.2, grandTotal: 9.8, unit: "L", breakdown: makeBreakdown(9.8) },
    { id: 2, nameEn: "Coconut Milk", nameSi: "කිරි පොල්", breakfast: 3.0, lunch: 8.5, dinner: 5.0, grandTotal: 16.5, unit: "L", breakdown: makeBreakdown(16.5) },
    { id: 3, nameEn: "Chilli Powder", nameSi: "මිරිස් කුඩු", breakfast: 0.3, lunch: 0.8, dinner: 0.5, grandTotal: 1.6, unit: "Kg", breakdown: makeBreakdown(1.6) },
    { id: 4, nameEn: "Turmeric Powder", nameSi: "කහ කුඩු", breakfast: 0.1, lunch: 0.3, dinner: 0.2, grandTotal: 0.6, unit: "Kg", breakdown: makeBreakdown(0.6) },
    { id: 5, nameEn: "Salt", nameSi: "ලුණු", breakfast: 0.5, lunch: 1.2, dinner: 0.8, grandTotal: 2.5, unit: "Kg", breakdown: makeBreakdown(2.5) },
    { id: 6, nameEn: "Curry Leaves", nameSi: "කරපිංචා", breakfast: 0.1, lunch: 0.2, dinner: 0.15, grandTotal: 0.45, unit: "Kg", breakdown: makeBreakdown(0.45) },
  ],
  extras: [
    { id: 1, nameEn: "Papaw", nameSi: "පැපොල්", breakfast: 2.4, lunch: null, dinner: null, grandTotal: 2.4, unit: "Kg", breakdown: makeBreakdown(2.4) },
    { id: 2, nameEn: "Banana-Ambul", nameSi: "අම්බුල් කෙසෙල්", breakfast: null, lunch: 35, dinner: null, grandTotal: 35, unit: "Fruit", breakdown: makeBreakdown(35) },
    { id: 3, nameEn: "Yoghurt Cups", nameSi: "යෝගට් කෝප්ප", breakfast: null, lunch: 12, dinner: null, grandTotal: 12, unit: "Pcs", breakdown: makeBreakdown(12) },
    { id: 4, nameEn: "Fresh Milk 1L", nameSi: "නැවුම් කිරි 1L", breakfast: 5, lunch: null, dinner: null, grandTotal: 5, unit: "Pcs", breakdown: makeBreakdown(5) },
  ],
};

// ─── Vegetable Categories ───
export const VEG_CATEGORIES = [
  {
    id: "palaa", name: "Palaa (Leafy Vegetables)", nameSi: "පලා",
    requiredKg: 11.31,
    options: [
      { nameEn: "Adu Gova", nameSi: "අබ ගෝවා" },
      { nameEn: "Gotukola", nameSi: "ගොටුකොළ" },
      { nameEn: "Nivithi", nameSi: "නිවිති" },
      { nameEn: "Mukunuwenna", nameSi: "මුකුණුවැන්න" },
      { nameEn: "Kankun", nameSi: "කංකුං" },
      { nameEn: "Thampala", nameSi: "තම්පලා" },
    ],
  },
  {
    id: "gedi", name: "Gedi (Vegetable Fruits)", nameSi: "ගෙඩි",
    requiredKg: 14.88,
    options: [
      { nameEn: "Brinjal", nameSi: "වම්බටු" },
      { nameEn: "Ladies Fingers", nameSi: "බණ්ඩක්කා" },
      { nameEn: "Ash Plantain", nameSi: "අළු කෙසෙල්" },
      { nameEn: "Snake Gourd", nameSi: "පතෝල" },
      { nameEn: "Bitter Gourd", nameSi: "කරවිල" },
      { nameEn: "Pumpkin", nameSi: "වට්ටක්කා" },
    ],
  },
  {
    id: "piti", name: "Piti (Starchy)", nameSi: "පිටි",
    requiredKg: 7.74,
    options: [
      { nameEn: "Potato", nameSi: "අල" },
      { nameEn: "Sweet Potato", nameSi: "බතල" },
      { nameEn: "Manioc", nameSi: "මඤ්ඤොක්කා" },
      { nameEn: "Breadfruit", nameSi: "දෙල්" },
    ],
  },
  {
    id: "other", name: "Other Vegetables", nameSi: "වෙනත්",
    requiredKg: 11.31,
    options: [
      { nameEn: "Carrot", nameSi: "කැරට්" },
      { nameEn: "Beetroot", nameSi: "බීට්රූට්" },
      { nameEn: "Leeks", nameSi: "ලීක්ස්" },
      { nameEn: "Tomato", nameSi: "තක්කාලි" },
      { nameEn: "Beans", nameSi: "බෝංචි" },
      { nameEn: "Cabbage", nameSi: "ගෝවා" },
    ],
  },
];

export const MOCK_VEG_ALLOCATIONS = {
  palaa: [{ vegetable: "Adu Gova", quantityKg: 4.905 }],
  gedi: [{ vegetable: "Brinjal", quantityKg: 8.0 }, { vegetable: "Pumpkin", quantityKg: 5.0 }],
  piti: [{ vegetable: "Potato", quantityKg: 5.0 }],
  other: [{ vegetable: "Carrot", quantityKg: 4.0 }, { vegetable: "Beans", quantityKg: 3.0 }],
};

// ─── Purchase Order Data ───
const mkItem = (id, si, en, u, b, l, d, ex, k, t, p) => ({
  id, nameSi: si, nameEn: en, unit: u, breakfast: b, lunch: l, dinner: d, extra: ex, kanda: k, totalUnits: t, unitPrice: p, defaultPrice: p,
});

export const MOCK_PO_CATEGORIES = [
  { id: 1, name: "Rice / Bread / Noodles", items: [
    mkItem(1, "හාල් - තැම්බු නාඩු", "Rice Nadu", "Kg", true, true, true, false, false, 24.24, 220),
    mkItem(2, "හාල් - රතු නාඩු", "Red Rice Nadu", "Kg", true, true, true, false, false, 24.24, 240),
    mkItem(3, "පාන් 450G", "Bread (loaves)", "Pcs", true, false, true, false, false, 51.25, 85),
    mkItem(4, "නූඩ්ල්ස්", "Noodles", "Kg", false, true, false, false, false, 3.2, 350),
  ]},
  { id: 2, name: "Meat / Fish / Egg / Dried Fish", items: [
    mkItem(5, "කුකුළු මස්", "Chicken", "Kg", false, true, false, false, false, 18.5, 1100),
    mkItem(6, "බිත්තර", "Eggs", "Pcs", true, false, true, false, false, 75, 46),
    mkItem(7, "කරවල", "Dried Fish", "Kg", false, true, true, false, false, 7.3, 1200),
    mkItem(8, "මළු", "Fresh Fish", "Kg", false, true, false, false, false, 12.0, 850),
  ]},
  { id: 3, name: "Vegetables - Palaa (Leaves)", items: [
    mkItem(9, "අබ ගෝවා", "Adu Gova", "Kg", false, true, true, false, false, 4.905, 280),
    mkItem(10, "ගොටුකොළ", "Gotukola", "Kg", true, false, false, false, false, 3.0, 320),
  ]},
  { id: 4, name: "Vegetables - Gedi", items: [
    mkItem(11, "වම්බටු", "Brinjal", "Kg", false, true, true, false, false, 8.0, 180),
    mkItem(12, "වට්ටක්කා", "Pumpkin", "Kg", false, true, false, false, false, 5.0, 120),
  ]},
  { id: 5, name: "Vegetables - Piti (Starchy)", items: [
    mkItem(13, "අල", "Potato", "Kg", true, true, true, false, false, 5.0, 350),
  ]},
  { id: 6, name: "Vegetables - Other", items: [
    mkItem(14, "කැරට්", "Carrot", "Kg", false, true, false, false, false, 4.0, 280),
    mkItem(15, "බෝංචි", "Beans", "Kg", false, true, true, false, false, 3.0, 320),
  ]},
  { id: 7, name: "Fruits", items: [
    mkItem(16, "පැපොල්", "Papaw", "Kg", true, false, false, true, false, 2.4, 150),
    mkItem(17, "අම්බුල් කෙසෙල්", "Banana-Ambul", "Fruit", false, true, false, true, false, 35, 15),
  ]},
  { id: 8, name: "Currystuffs & Condiments", items: [
    mkItem(18, "පොල් තෙල්", "Coconut Oil", "L", true, true, true, false, false, 9.8, 480),
    mkItem(19, "මිරිස් කුඩු", "Chilli Powder", "Kg", true, true, true, false, false, 1.6, 1800),
    mkItem(20, "කහ කුඩු", "Turmeric Powder", "Kg", true, true, true, false, false, 0.6, 2200),
    mkItem(21, "ලුණු", "Salt", "Kg", true, true, true, false, false, 2.5, 90),
  ]},
  { id: 9, name: "Sugar / Milk & Milk Products", items: [
    mkItem(22, "සීනි", "Sugar", "Kg", true, true, true, false, false, 3.5, 220),
    mkItem(23, "නැවුම් කිරි 1L", "Fresh Milk 1L", "Pcs", true, false, false, true, false, 5, 320),
    mkItem(24, "යෝගට් කෝප්ප", "Yoghurt Cups", "Pcs", false, true, false, true, false, 12, 65),
  ]},
  { id: 10, name: "Biscuits", items: [
    mkItem(25, "බිස්කට්", "Cream Crackers", "Pkt", true, false, true, false, false, 20, 85),
  ]},
  { id: 11, name: "Nutritional Supplements", items: [
    mkItem(26, "තිරිගු පිටි", "Thriposha", "Kg", true, false, false, false, false, 2.0, 380),
  ]},
];

export const MOCK_PURCHASE_ORDERS = [
  {
    id: "PO-2026-0301",
    date: "2026-03-01",
    billNo: "B-0301",
    status: "approved",
    itemCount: 22,
    totalRs: 68450.50,
    categories: MOCK_PO_CATEGORIES,
  },
  {
    id: "PO-2026-0302",
    date: "2026-03-02",
    billNo: "B-0302",
    status: "draft",
    itemCount: 26,
    totalRs: 0,
    categories: MOCK_PO_CATEGORIES,
  },
];

// ─── Price Management ───
export const MOCK_PRICES = [
  { id: 1, nameSi: "හාල් - තැම්බු නාඩු", nameEn: "Rice Nadu", category: "Rice / Bread / Noodles", unit: "Kg", defaultPrice: 220, lastUpdated: "2026-02-28" },
  { id: 2, nameSi: "හාල් - රතු නාඩු", nameEn: "Red Rice Nadu", category: "Rice / Bread / Noodles", unit: "Kg", defaultPrice: 240, lastUpdated: "2026-02-28" },
  { id: 3, nameSi: "පාන් 450G", nameEn: "Bread (loaves)", category: "Rice / Bread / Noodles", unit: "Pcs", defaultPrice: 85, lastUpdated: "2026-02-20" },
  { id: 4, nameSi: "නූඩ්ල්ස්", nameEn: "Noodles", category: "Rice / Bread / Noodles", unit: "Kg", defaultPrice: 350, lastUpdated: "2026-02-15" },
  { id: 5, nameSi: "කුකුළු මස්", nameEn: "Chicken", category: "Meat / Fish / Egg", unit: "Kg", defaultPrice: 1100, lastUpdated: "2026-03-01" },
  { id: 6, nameSi: "බිත්තර", nameEn: "Eggs", category: "Meat / Fish / Egg", unit: "Pcs", defaultPrice: 46, lastUpdated: "2026-03-01" },
  { id: 7, nameSi: "කරවල", nameEn: "Dried Fish", category: "Meat / Fish / Egg", unit: "Kg", defaultPrice: 1200, lastUpdated: "2026-02-25" },
  { id: 8, nameSi: "මළු", nameEn: "Fresh Fish", category: "Meat / Fish / Egg", unit: "Kg", defaultPrice: 850, lastUpdated: "2026-03-01" },
  { id: 9, nameSi: "පොල් තෙල්", nameEn: "Coconut Oil", category: "Condiments", unit: "L", defaultPrice: 480, lastUpdated: "2026-02-20" },
  { id: 10, nameSi: "මිරිස් කුඩු", nameEn: "Chilli Powder", category: "Condiments", unit: "Kg", defaultPrice: 1800, lastUpdated: "2026-02-15" },
  { id: 11, nameSi: "අල", nameEn: "Potato", category: "Vegetables", unit: "Kg", defaultPrice: 350, lastUpdated: "2026-03-01" },
  { id: 12, nameSi: "කැරට්", nameEn: "Carrot", category: "Vegetables", unit: "Kg", defaultPrice: 280, lastUpdated: "2026-03-01" },
  { id: 13, nameSi: "වම්බටු", nameEn: "Brinjal", category: "Vegetables", unit: "Kg", defaultPrice: 180, lastUpdated: "2026-02-28" },
  { id: 14, nameSi: "සීනි", nameEn: "Sugar", category: "Sugar / Milk", unit: "Kg", defaultPrice: 220, lastUpdated: "2026-02-20" },
  { id: 15, nameSi: "නැවුම් කිරි 1L", nameEn: "Fresh Milk 1L", category: "Sugar / Milk", unit: "Pcs", defaultPrice: 320, lastUpdated: "2026-02-28" },
];