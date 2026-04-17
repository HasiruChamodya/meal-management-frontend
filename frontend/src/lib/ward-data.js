import * as React from "react";
import { getTodaySL } from "./date-utils";

// ─── Ward Data ───
export const WARDS = [
  { id: "WD1", code: "WD1", name: "Medical M", beds: 65, cots: 0, icu: 0, incubators: 0 },
  { id: "WD2", code: "WD2", name: "Medical F", beds: 57, cots: 0, icu: 0, incubators: 0 },
  { id: "WD3", code: "WD3", name: "Eye", beds: 26, cots: 0, icu: 0, incubators: 0 },
  { id: "WD5", code: "WD5", name: "Paediatric", beds: 16, cots: 46, icu: 0, incubators: 0 },
  { id: "WD6", code: "WD6", name: "Gyn A&B", beds: 45, cots: 0, icu: 0, incubators: 0 },
  { id: "WD7", code: "WD7", name: "Surgical M", beds: 78, cots: 0, icu: 0, incubators: 0 },
  { id: "WD8", code: "WD8", name: "Surgical F", beds: 67, cots: 0, icu: 0, incubators: 0 },
  { id: "WD15", code: "WD15", name: "Obs AN B", beds: 35, cots: 0, icu: 0, incubators: 0 },
  { id: "WD14", code: "WD14", name: "Obs PN B", beds: 26, cots: 0, icu: 0, incubators: 0 },
  { id: "WD12", code: "WD12", name: "Medical M2", beds: 43, cots: 0, icu: 0, incubators: 0 },
  { id: "WD11", code: "WD11", name: "Obs AN/PN A", beds: 34, cots: 0, icu: 0, incubators: 0 },
  { id: "WD10", code: "WD10", name: "Respiratory", beds: 14, cots: 0, icu: 0, incubators: 0 },
  { id: "WD17", code: "WD17", name: "ENT/OMF", beds: 24, cots: 0, icu: 0, incubators: 0 },
  { id: "WD4", code: "WD4", name: "Medical F2", beds: 54, cots: 0, icu: 0, incubators: 0 },
  { id: "WD18", code: "WD18", name: "Psychiatry", beds: 22, cots: 0, icu: 0, incubators: 0 },
  { id: "WD9", code: "WD9", name: "Cardiology", beds: 13, cots: 0, icu: 0, incubators: 0 },
  { id: "WD16", code: "WD16", name: "Orthopaedic", beds: 20, cots: 0, icu: 0, incubators: 0 },
  { id: "WD19", code: "WD19", name: "Oncology", beds: 15, cots: 0, icu: 0, incubators: 0 },
  { id: "DU", code: "DU", name: "Dialysis Unit", beds: 6, cots: 0, icu: 0, incubators: 0 },
  { id: "MICU1", code: "MICU1", name: "MICU i", beds: 0, cots: 0, icu: 5, incubators: 0 },
  { id: "MICU2", code: "MICU2", name: "MICU ii", beds: 0, cots: 0, icu: 3, incubators: 0 },
  { id: "SICU", code: "SICU", name: "Surgical ICU", beds: 0, cots: 0, icu: 5, incubators: 0 },
  { id: "CICU", code: "CICU", name: "Cardiac ICU", beds: 0, cots: 0, icu: 5, incubators: 0 },
  { id: "NEO", code: "NEO", name: "Neonatology", beds: 0, cots: 8, icu: 0, incubators: 10 },
  { id: "AE", code: "AE", name: "A&E", beds: 26, cots: 0, icu: 0, incubators: 0 },
];

// ─── Utility Functions ───
export function getWardCapacity(ward) {
  return ward.beds + ward.cots + ward.icu;
}

export function getWardCapacityLabel(ward) {
  const parts = [];
  if (ward.beds > 0) parts.push(`${ward.beds} beds`);
  if (ward.cots > 0) parts.push(`${ward.cots} cots`);
  if (ward.icu > 0) parts.push(`${ward.icu} ICU`);
  if (ward.incubators > 0) parts.push(`${ward.incubators} incubators`);
  return parts.join(" | ");
}

// ─── Diet Fields ───
export const DIET_FIELDS = [
  { key: "normal", label: "Normal Diets" },
  { key: "diabetic", label: "Diabetic Diets" },
  { key: "breakfastExtra", label: "Breakfast (Extra)", tooltip: "Extra items for breakfast only" },
  { key: "s1", label: "S1 (6y–12y)" },
  { key: "s2", label: "S2 (2y–6y)" },
  { key: "s3", label: "S3 (1y–2y)" },
  { key: "s4", label: "S4 (6m–1y)" },
  { key: "s5", label: "S5 (No Diet)" },
  { key: "hpd", label: "HPD" },
];

// ─── Extra Items ───
export const EXTRA_ITEMS = [
  { name: "Papaw", unit: "g", allowDecimal: false },
  { name: "Banana-Anamaalu", unit: "Fruit", allowDecimal: false },
  { name: "Banana-Ambul", unit: "Fruit", allowDecimal: false },
  { name: "Orange Green", unit: "Fruit", allowDecimal: false },
  { name: "Avocado", unit: "g", allowDecimal: false },
  { name: "Apple", unit: "Fruit", allowDecimal: false },
  { name: "Grapes", unit: "g", allowDecimal: false },
  { name: "Cheese Portions", unit: "Pcs", allowDecimal: false },
  { name: "Yoghurt Drinks", unit: "Pcs", allowDecimal: false },
  { name: "Yoghurt Cups", unit: "Pcs", allowDecimal: false },
  { name: "Fish", unit: "g", allowDecimal: false },
  { name: "Boiled Eggs", unit: "Pcs", allowDecimal: false },
  { name: "Fresh Milk 1L", unit: "Pcs", allowDecimal: false },
  { name: "Milk Packet 180ml", unit: "Pcs", allowDecimal: false },
  { name: "Sugar", unit: "g", allowDecimal: false },
  { name: "Tea", unit: "g", allowDecimal: false },
  { name: "Bread", unit: "Pcs", allowDecimal: false },
  { name: "Orange Yellow", unit: "Fruit", allowDecimal: false },
];

// ─── Mock Data ───
export const MOCK_SUBMISSIONS = [
  {
    id: "sub-1",
    wardId: "WD1",
    wardName: "Medical M",
    date: getTodaySL(),
    diets: { normal: 10, diabetic: 4, breakfastExtra: 0, s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, hpd: 0 },
    staff: { breakfast: 2, lunch: 5, dinner: 0 },
    special: { soupKanda: 0, polSambola: 0 },
    extras: {
      Papaw: 800, "Banana-Anamaalu": 0, "Banana-Ambul": 4, "Orange Green": 0,
      Avocado: 0, Apple: 0, Grapes: 0, "Cheese Portions": 0,
      "Yoghurt Drinks": 0, "Yoghurt Cups": 2, Fish: 0, "Boiled Eggs": 0,
      "Fresh Milk 1L": 1, "Milk Packet 180ml": 0, Sugar: 0, Tea: 0,
      Bread: 0, "Orange Yellow": 0,
    },
    customExtras: [],
    status: "submitted",
    submittedAt: new Date().toISOString(),
    totalPatients: 14,
  },
  {
    id: "sub-2",
    wardId: "WD2",
    wardName: "Medical F",
    date: getTodaySL(),
    diets: { normal: 8, diabetic: 2, breakfastExtra: 1, s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, hpd: 0 },
    staff: { breakfast: 1, lunch: 3, dinner: 2 },
    special: { soupKanda: 2, polSambola: 3 },
    extras: {},
    customExtras: [],
    status: "draft",
    totalPatients: 11,
  },
  {
    id: "sub-3",
    wardId: "WD3",
    wardName: "Eye",
    date: getTodaySL(),
    diets: { normal: 0, diabetic: 0, breakfastExtra: 0, s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, hpd: 0 },
    staff: { breakfast: 0, lunch: 0, dinner: 0 },
    special: { soupKanda: 0, polSambola: 0 },
    extras: {},
    customExtras: [],
    status: "not_started",
    totalPatients: 0,
  },
];