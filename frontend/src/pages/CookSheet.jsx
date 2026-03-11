import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { MOCK_AGGREGATED } from "@/lib/calculation-data";

const StatBox = ({ label, value, size = "lg" }) => (
  <div className="bg-card rounded-xl border-2 border-border p-4 text-center">
    <p className={`font-bold text-primary ${size === "lg" ? "text-5xl" : "text-3xl"}`}>{value}</p>
    <p className="text-base text-muted-foreground font-medium mt-1">{label}</p>
  </div>
);

const CookSheet = () => {
  const [extrasOpen, setExtrasOpen] = useState(false);
  const a = MOCK_AGGREGATED;

  // Mock recipe data — calculated quantities
  const polSambolaCount = 45; // patients who ordered pol sambola
  const soupCount = 30; // patients who ordered soup
  const kandaCount = 0; // patients who ordered kanda

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

  const RecipeCard = ({
    title,
    count,
    borderColor,
    ingredients,
  }) => (
    <Card className={`border-2 ${borderColor}`}>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {title} — for {count} patients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ingredients.map((ing) => (
            <div key={ing.nameEn} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-base font-semibold">
                {ing.nameSi} / {ing.nameEn}
              </span>
              <span className="text-xl font-bold text-primary">
                {ing.qty} {ing.unit}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Large header banner */}
      <div className="bg-primary rounded-xl p-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">TODAY'S COOK SHEET</h1>
        <p className="text-xl text-primary-foreground/80 mt-1">2026-03-02</p>
        <Badge className="mt-2 bg-primary-foreground/20 text-primary-foreground text-lg px-4 py-1">Vegetable Cycle</Badge>
      </div>

      {/* Patient details */}
      <Card className="border-2 border-primary">
        <CardHeader><CardTitle className="text-xl font-bold">Patient Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatBox label="Normal Diets" value={a.normal} />
            <StatBox label="Diabetic" value={a.diabetic} />
            <StatBox label="S1 (6-12y)" value={a.s1} />
            <StatBox label="S2 (2-6y)" value={a.s2} />
            <StatBox label="S3 (1-2y)" value={a.s3} />
            <StatBox label="S4" value={a.s4} />
            <StatBox label="S5" value={a.s5} />
            <StatBox label="HPD" value={a.hpd} />
            <StatBox label="Breakfast Extra" value={0} />
          </div>
        </CardContent>
      </Card>

      {/* Staff meals */}
      <Card className="border-2 border-badge-hospital">
        <CardHeader><CardTitle className="text-xl font-bold">Staff Meals</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <StatBox label="Breakfast" value={a.staffB} />
            <StatBox label="Lunch" value={a.staffL} />
            <StatBox label="Dinner" value={a.staffD} />
          </div>
        </CardContent>
      </Card>

      {/* Diet instructions */}
      <Card className="border-2 border-warning">
        <CardHeader><CardTitle className="text-xl font-bold">Diet Instructions to Kitchen</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base font-bold">Type</TableHead>
                <TableHead className="text-base font-bold text-right">Breakfast</TableHead>
                <TableHead className="text-base font-bold text-right">Lunch</TableHead>
                <TableHead className="text-base font-bold text-right">Dinner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { type: "Rice (Kg)", b: "7.36", l: "10.28", d: "6.61" },
                { type: "Bread (loaves)", b: "26", l: "—", d: "26" },
                { type: "Kanda (Kg)", b: "—", l: "—", d: "—" },
              ].map((r) => (
                <TableRow key={r.type}>
                  <TableCell className="text-base font-semibold">{r.type}</TableCell>
                  <TableCell className="text-right text-lg font-bold text-primary">{r.b}</TableCell>
                  <TableCell className="text-right text-lg font-bold text-primary">{r.l}</TableCell>
                  <TableCell className="text-right text-lg font-bold text-primary">{r.d}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Protein */}
      <Card className="border-2 border-destructive">
        <CardHeader><CardTitle className="text-xl font-bold">Protein Allocation</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base font-bold">Item</TableHead>
                <TableHead className="text-base font-bold text-right">Children</TableHead>
                <TableHead className="text-base font-bold text-right">Patients</TableHead>
                <TableHead className="text-base font-bold text-right">Staff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { item: "Egg", c: 0, p: 0, s: 0 },
                { item: "Fish (Kg)", c: 0, p: 0, s: 0 },
                { item: "Dried Fish (Kg)", c: 0, p: 0, s: 0 },
                { item: "Chicken (Kg)", c: 0, p: 3.02, s: 0.75 },
              ].map((r) => (
                <TableRow key={r.item}>
                  <TableCell className="text-base font-semibold">{r.item}</TableCell>
                  <TableCell className="text-right text-lg font-bold">{r.c || "—"}</TableCell>
                  <TableCell className="text-right text-lg font-bold text-primary">{r.p || "—"}</TableCell>
                  <TableCell className="text-right text-lg font-bold">{r.s || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recipes */}
      {polSambolaCount > 0 && (
        <RecipeCard
          title="Pol Sambola"
          count={polSambolaCount}
          borderColor="border-orange-400"
          ingredients={polSambolaIngredients}
        />
      )}

      {soupCount > 0 && (
        <RecipeCard
          title="Soup"
          count={soupCount}
          borderColor="border-badge-hospital"
          ingredients={soupIngredients}
        />
      )}

      {kandaCount > 0 && (
        <RecipeCard
          title="Kanda (Porridge)"
          count={kandaCount}
          borderColor="border-purple-500"
          ingredients={[
            { nameSi: "හාල් - රතු නාඩු", nameEn: "Red Raw Rice", qty: kandaCount * 30, unit: "g" },
          ]}
        />
      )}

      {/* Extra items */}
      <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen}>
        <Card className="border-2 border-border">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ChevronDown className={`h-5 w-5 transition-transform ${extrasOpen ? "" : "-rotate-90"}`} />
                Extra Items
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base font-bold">Item</TableHead>
                    <TableHead className="text-base font-bold text-right">Quantity</TableHead>
                    <TableHead className="text-base font-bold">Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extras.map((e) => (
                    <TableRow key={e.item}>
                      <TableCell className="text-base font-semibold">{e.item}</TableCell>
                      <TableCell className="text-right text-lg font-bold text-primary">{e.qty}</TableCell>
                      <TableCell className="text-base">{e.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default CookSheet;