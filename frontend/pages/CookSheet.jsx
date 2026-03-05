import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_AGGREGATED = {
  normal: 85,
  diabetic: 12,
  s1: 3,
  s2: 1,
  s3: 0,
  s4: 0,
  s5: 2,
  hpd: 0,
  staffB: 24,
  staffL: 30,
  staffD: 18,
};

// ─── Reusable Components ──────────────────────────────────────────────────────

const StatBox = ({ label, value, size = "lg", colorClass = "text-blue-600" }) => (
  <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4 text-center shadow-sm">
    <p className={`font-black ${colorClass} ${size === "lg" ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"}`}>
      {value}
    </p>
    <p className="text-sm sm:text-base text-gray-500 font-bold mt-1 uppercase tracking-wider">
      {label}
    </p>
  </div>
);

const RecipeCard = ({ title, count, borderColor, headerColor, ingredients }) => (
  <div className={`bg-white rounded-xl shadow-md border-2 overflow-hidden ${borderColor}`}>
    <div className={`px-5 py-4 border-b-2 ${borderColor} ${headerColor}`}>
      <h3 className="text-lg sm:text-xl font-black text-gray-900">
        {title} — <span className="opacity-80 font-semibold">for {count} patients</span>
      </h3>
    </div>
    <div className="p-0">
      <div className="divide-y divide-gray-100">
        {ingredients.map((ing) => (
          <div key={ing.nameEn} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-base sm:text-lg font-bold text-gray-900">{ing.nameSi}</p>
              <p className="text-xs sm:text-sm font-medium text-gray-500">{ing.nameEn}</p>
            </div>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-blue-700">
                {ing.qty}
              </span>
              <span className="text-sm sm:text-base font-bold text-gray-500 ml-1.5">
                {ing.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const CookSheet = () => {
  const [extrasOpen, setExtrasOpen] = useState(false);
  const a = MOCK_AGGREGATED;

  // Mock recipe data — calculated quantities
  const polSambolaCount = 45;
  const soupCount = 30;
  const kandaCount = 0;

  const polSambolaIngredients = [
    { nameSi: "පොල්", nameEn: "Coconut (850g seeds)", qty: Math.round(polSambolaCount * 0.1 * 10) / 10, unit: "seeds" },
    { nameSi: "කෑම මිරිස්", nameEn: "Dried Chillies", qty: Math.round(polSambolaCount * 0.9), unit: "g" },
    { nameSi: "රතු ළූණු", nameEn: "Red Onion", qty: Math.round(polSambolaCount * 0.9), unit: "g" },
    { nameSi: "දෙහි", nameEn: "Lime", qty: Math.round(polSambolaCount * 0.5), unit: "g" },
    { nameSi: "ගම්මිරිස්", nameEn: "Dried Pepper", qty: Math.round(polSambolaCount * 0.3), unit: "g" },
    { nameSi: "ලුණු", nameEn: "Salt", qty: Math.round(polSambolaCount * 0.3), unit: "g" },
  ];

  const soupIngredients = [
    { nameSi: "කැරට්", nameEn: "Carrot", qty: soupCount * 5, unit: "g" },
    { nameSi: "බෝංචි", nameEn: "Beans", qty: soupCount * 5, unit: "g" },
    { nameSi: "ලීක්ස්", nameEn: "Leeks", qty: soupCount * 3, unit: "g" },
    { nameSi: "ගෝවා", nameEn: "Gova", qty: soupCount * 4, unit: "g" },
    { nameSi: "තක්කාලි", nameEn: "Tomato", qty: soupCount * 3, unit: "g" },
    { nameSi: "අල", nameEn: "Potato", qty: soupCount * 8, unit: "g" },
    { nameSi: "පරිප්පු", nameEn: "Lentils", qty: soupCount * 5, unit: "g" },
  ];

  const extras = [
    { item: "Papaw", qty: "4,600", unit: "g" },
    { item: "Banana (Ambul)", qty: "24", unit: "fruits" },
    { item: "Yoghurt Cups", qty: "6", unit: "cups" },
    { item: "Fresh Milk", qty: "6", unit: "L" },
    { item: "Boiled Eggs", qty: "6", unit: "pcs" },
    { item: "Orange (Yellow)", qty: "3", unit: "fruits" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-6 pb-24">
      
      {/* Large Header Banner */}
      <div className="bg-blue-700 rounded-2xl p-8 text-center shadow-lg border-b-4 border-blue-900">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
          TODAY'S COOK SHEET
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 font-bold mt-2">2026-03-02</p>
        <div className="mt-5 inline-flex items-center px-5 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm shadow-sm">
          <span className="text-lg font-bold text-white tracking-wider uppercase">Vegetable Cycle</span>
        </div>
      </div>

      {/* Patient Details */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-blue-500 overflow-hidden">
        <div className="bg-blue-50 border-b-2 border-blue-100 px-6 py-4">
          <h2 className="text-xl font-black text-blue-900 uppercase tracking-widest">Patient Details</h2>
        </div>
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <StatBox label="Normal Diets" value={a.normal} />
            <StatBox label="Diabetic" value={a.diabetic} />
            <StatBox label="S1 (6-12y)" value={a.s1} colorClass="text-indigo-600" />
            <StatBox label="S2 (2-6y)" value={a.s2} colorClass="text-indigo-600" />
            <StatBox label="S3 (1-2y)" value={a.s3} colorClass="text-indigo-600" />
            <StatBox label="S4" value={a.s4} colorClass="text-indigo-600" />
            <StatBox label="S5" value={a.s5} colorClass="text-indigo-600" />
            <StatBox label="HPD" value={a.hpd} colorClass="text-amber-600" />
            <StatBox label="Breakfast Extra" value={0} colorClass="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Staff Meals */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-indigo-500 overflow-hidden">
        <div className="bg-indigo-50 border-b-2 border-indigo-100 px-6 py-4">
          <h2 className="text-xl font-black text-indigo-900 uppercase tracking-widest">Staff Meals</h2>
        </div>
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <StatBox label="Breakfast" value={a.staffB} colorClass="text-indigo-600" />
            <StatBox label="Lunch" value={a.staffL} colorClass="text-indigo-600" />
            <StatBox label="Dinner" value={a.staffD} colorClass="text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Diet Instructions to Kitchen */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-amber-500 overflow-hidden">
        <div className="bg-amber-50 border-b-2 border-amber-200 px-6 py-4">
          <h2 className="text-xl font-black text-amber-900 uppercase tracking-widest">Diet Instructions to Kitchen</h2>
        </div>
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-white border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Breakfast</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Lunch</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Dinner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { type: "Rice (Kg)", b: "7.36", l: "10.28", d: "6.61" },
                { type: "Bread (loaves)", b: "26", l: "—", d: "26" },
                { type: "Kanda (Kg)", b: "—", l: "—", d: "—" },
              ].map((r) => (
                <tr key={r.type} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-base sm:text-lg font-bold text-gray-900">{r.type}</td>
                  <td className="px-6 py-4 text-right text-xl sm:text-2xl font-black text-blue-700">{r.b}</td>
                  <td className="px-6 py-4 text-right text-xl sm:text-2xl font-black text-blue-700">{r.l}</td>
                  <td className="px-6 py-4 text-right text-xl sm:text-2xl font-black text-blue-700">{r.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Protein Allocation */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-red-500 overflow-hidden">
        <div className="bg-red-50 border-b-2 border-red-200 px-6 py-4">
          <h2 className="text-xl font-black text-red-900 uppercase tracking-widest">Protein Allocation</h2>
        </div>
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-white border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Children</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Patients</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { item: "Egg", c: 0, p: 0, s: 0 },
                { item: "Fish (Kg)", c: 0, p: 0, s: 0 },
                { item: "Dried Fish (Kg)", c: 0, p: 0, s: 0 },
                { item: "Chicken (Kg)", c: 0, p: 3.02, s: 0.75 },
              ].map((r) => (
                <tr key={r.item} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-base sm:text-lg font-bold text-gray-900">{r.item}</td>
                  <td className="px-6 py-4 text-right text-xl sm:text-2xl font-black text-gray-400">{r.c || "—"}</td>
                  <td className="px-6 py-4 text-right text-xl sm:text-2xl font-black text-blue-700">{r.p || "—"}</td>
                  <td className="px-6 py-4 text-right text-xl sm:text-2xl font-black text-indigo-600">{r.s || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polSambolaCount > 0 && (
          <RecipeCard
            title="Pol Sambola"
            count={polSambolaCount}
            borderColor="border-orange-500"
            headerColor="bg-orange-50"
            ingredients={polSambolaIngredients}
          />
        )}

        {soupCount > 0 && (
          <RecipeCard
            title="Soup"
            count={soupCount}
            borderColor="border-indigo-500"
            headerColor="bg-indigo-50"
            ingredients={soupIngredients}
          />
        )}

        {kandaCount > 0 && (
          <div className="md:col-span-2">
            <RecipeCard
              title="Kanda (Porridge)"
              count={kandaCount}
              borderColor="border-purple-500"
              headerColor="bg-purple-50"
              ingredients={[
                { nameSi: "හාල් - රතු නාඩු", nameEn: "Red Raw Rice", qty: kandaCount * 30, unit: "g" },
              ]}
            />
          </div>
        )}
      </div>

      {/* Extra Items (Collapsible) */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-300 overflow-hidden transition-all duration-300">
        <button 
          onClick={() => setExtrasOpen(!extrasOpen)}
          className="w-full flex items-center justify-between px-6 py-5 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none"
        >
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
            <div className={`transform transition-transform duration-300 ${extrasOpen ? "rotate-0" : "-rotate-90"}`}>
              <ChevronDown className="h-6 w-6 text-gray-500" />
            </div>
            Extra Items
          </h2>
        </button>
        
        {extrasOpen && (
          <div className="border-t-2 border-gray-200">
            <div className="overflow-x-auto p-0">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-white border-b-2 border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Quantity</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider w-32">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {extras.map((e) => (
                    <tr key={e.item} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-base sm:text-lg font-bold text-gray-900">{e.item}</td>
                      <td className="px-6 py-4 text-right text-xl sm:text-2xl font-black text-blue-700">{e.qty}</td>
                      <td className="px-6 py-4 text-base font-bold text-gray-500">{e.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default CookSheet;