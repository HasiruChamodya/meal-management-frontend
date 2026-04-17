import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Printer, ChefHat, Users, Beef, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getTodaySL } from "@/lib/date-utils";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const today = getTodaySL();

const CookSheet = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cookSheet, setCookSheet] = useState(null);
  const [dietTypes, setDietTypes] = useState([]); // Store diet types for name mapping

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both the Cook Sheet data AND the Diet Types list at the same time
        const [cookRes, dietRes] = await Promise.all([
          fetch(`${API_BASE}/calculations/cook-sheet?date=${today}`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/diet-types`, { headers: getAuthHeaders() })
        ]);

        const data = await cookRes.json();
        const dietData = await dietRes.json();

        const sheetData = data.cookSheet || data;

        if (!cookRes.ok || (!data.cookSheet && !data.calcRun)) {
          throw new Error(data.message || "No cook sheet found for today");
        }

        setCookSheet(sheetData);
        setDietTypes(dietData.dietTypes || []);
      } catch (error) {
        toast({
          title: "No Cook Sheet",
          description: error.message || "Cook sheet not available for today",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading cook sheet...</span>
      </div>
    );
  }

  if (!cookSheet) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No cook sheet available for today. The calculation has not been run yet.
      </div>
    );
  }

  // --- SAFE Data Extraction ---
  const parseData = (data) => (typeof data === "string" ? JSON.parse(data || "{}") : data || {});

  const patientTotals = parseData(cookSheet.patientTotals);
  const staff = cookSheet.staff || {};
  const dietInstructions = cookSheet.dietInstructions || [];
  const proteinAllocation = cookSheet.proteinAllocation || [];
  const recipes = cookSheet.recipes || [];
  const kanda = cookSheet.kanda;

  const extras = parseData(cookSheet.extras);
  const customExtras = Array.isArray(cookSheet.customExtras) ? cookSheet.customExtras : [];

  const riceData = dietInstructions.find((d) => d.type?.toLowerCase().includes("rice")) || { breakfast: 0, lunch: 0, dinner: 0 };
  const breadData = dietInstructions.find((d) => d.type?.toLowerCase().includes("bread")) || { breakfast: 0, lunch: 0, dinner: 0 };

  const extrasList = [
    ...Object.entries(extras)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([name, qty]) => ({ item: name, qty: Number(qty), unit: "g" })),
    ...customExtras
      .filter((ce) => Number(ce.quantity) > 0)
      .map((ce) => ({ item: ce.name, qty: ce.quantity, unit: ce.unit })),
  ];

  // Helper: Filter out Staff from Patient Totals, and map Code to English Name
  const filteredPatients = Object.entries(patientTotals)
    .filter(([code]) => {
      const c = code.toUpperCase();
      return c !== "STF" && c !== "STAFF"; // Exclude Staff from this table
    })
    .map(([code, count]) => {
      // Find the English name from the database, fallback to code if not found
      const match = dietTypes.find(d => d.code === code);
      const nameEn = match ? (match.nameEn || match.name_en) : code;
      return { code, name: nameEn, count };
    });

  return (
    <div className="space-y-6 max-w-6xl mx-auto print:m-0 print:p-0 print:w-full print:max-w-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:mb-6">
        <div>
          <h1 className="text-heading-md font-bold text-foreground flex items-center gap-2 print:text-black">
            <ChefHat className="h-8 w-8 text-primary print:text-black" />
            Kitchen Cook Sheet
          </h1>
          <p className="text-muted-foreground font-medium mt-1 print:text-black">
            District General Hospital Gampaha
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm py-1 print:hidden">
            Date: {cookSheet.date || today}
          </Badge>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm py-1 print:hidden">
            Cycle: {cookSheet.patientCycle || "Vegetable"}
          </Badge>
          <Button onClick={() => window.print()} className="print:hidden touch-target shadow-sm">
            <Printer className="mr-2 h-4 w-4" /> Print Sheet
          </Button>
        </div>
      </div>

      {/* Print-Only Header Details */}
      <div className="hidden print:block text-sm font-semibold mb-6 border-b-2 border-black pb-2">
        Date: {cookSheet.date || today} | Patient Cycle: {cookSheet.patientCycle || "Vegetable"} | Staff Cycle: {cookSheet.staffCycle || "Chicken"}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Patient & Staff Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2">
            <Card className="print:shadow-none print:border-black print:break-inside-avoid">
              <CardHeader className="bg-muted/30 pb-3 border-b print:bg-transparent print:border-black">
                <CardTitle className="text-label font-bold flex items-center gap-2 print:text-black">
                  <Users className="h-4 w-4 text-primary print:text-black" />
                  Patient Diets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="print:border-black">
                      <TableHead className="font-semibold print:text-black">Diet Type</TableHead>
                      <TableHead className="text-right font-semibold print:text-black">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map(({ code, name, count }) => (
                        <TableRow key={code} className="print:border-black">
                          <TableCell className="font-medium print:text-black">{name}</TableCell>
                          <TableCell className="text-right font-bold text-primary print:text-black">{count || 0}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">No patients</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="print:shadow-none print:border-black print:break-inside-avoid">
              <CardHeader className="bg-muted/30 pb-3 border-b print:bg-transparent print:border-black">
                <CardTitle className="text-label font-bold flex items-center gap-2 print:text-black">
                  <Users className="h-4 w-4 text-primary print:text-black" />
                  Staff Meals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="print:border-black">
                      <TableHead className="font-semibold print:text-black">Meal</TableHead>
                      <TableHead className="text-right font-semibold print:text-black">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="print:border-black">
                      <TableCell className="font-medium print:text-black">Breakfast</TableCell>
                      <TableCell className="text-right font-bold text-primary print:text-black">{staff.breakfast || 0}</TableCell>
                    </TableRow>
                    <TableRow className="print:border-black">
                      <TableCell className="font-medium print:text-black">Lunch</TableCell>
                      <TableCell className="text-right font-bold text-primary print:text-black">{staff.lunch || 0}</TableCell>
                    </TableRow>
                    <TableRow className="print:border-black">
                      <TableCell className="font-medium print:text-black">Dinner</TableCell>
                      <TableCell className="text-right font-bold text-primary print:text-black">{staff.dinner || 0}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Carbohydrates */}
          <Card className="print:shadow-none print:border-black print:break-inside-avoid">
            <CardHeader className="bg-muted/30 pb-3 border-b print:bg-transparent print:border-black">
              <CardTitle className="text-label font-bold flex items-center gap-2 print:text-black">
                <Wheat className="h-4 w-4 text-primary print:text-black" />
                Bulk Carbohydrates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="print:border-black">
                    <TableHead className="font-semibold print:text-black">Type</TableHead>
                    <TableHead className="text-right font-semibold print:text-black">Breakfast</TableHead>
                    <TableHead className="text-right font-semibold print:text-black">Lunch</TableHead>
                    <TableHead className="text-right font-semibold print:text-black">Dinner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="print:border-black">
                    <TableCell className="font-medium print:text-black">Rice (Kg)</TableCell>
                    <TableCell className="text-right font-bold text-primary print:text-black">{riceData.breakfast || "0.00"}</TableCell>
                    <TableCell className="text-right font-bold text-primary print:text-black">{riceData.lunch || "0.00"}</TableCell>
                    <TableCell className="text-right font-bold text-primary print:text-black">{riceData.dinner || "0.00"}</TableCell>
                  </TableRow>
                  <TableRow className="print:border-black">
                    <TableCell className="font-medium print:text-black">White Bread (Loaves)</TableCell>
                    <TableCell className="text-right font-bold text-primary print:text-black">{breadData.breakfast || "0"}</TableCell>
                    <TableCell className="text-right font-bold text-primary print:text-black">{breadData.lunch || "0"}</TableCell>
                    <TableCell className="text-right font-bold text-primary print:text-black">{breadData.dinner || "0"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Protein Allocation */}
          <Card className="print:shadow-none print:border-black print:break-inside-avoid">
            <CardHeader className="bg-muted/30 pb-3 border-b print:bg-transparent print:border-black">
              <CardTitle className="text-label font-bold flex items-center gap-2 print:text-black">
                <Beef className="h-4 w-4 text-primary print:text-black" />
                Protein Allocation (Kg)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="print:border-black">
                    <TableHead className="font-semibold print:text-black">Item</TableHead>
                    <TableHead className="text-right font-semibold print:text-black">Children</TableHead>
                    <TableHead className="text-right font-semibold print:text-black">Patients</TableHead>
                    <TableHead className="text-right font-semibold print:text-black">Staff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proteinAllocation.length > 0 ? (
                    proteinAllocation.map((r) => (
                      <TableRow key={r.nameEn} className="print:border-black">
                        <TableCell className="font-medium print:text-black">{r.nameEn}</TableCell>
                        <TableCell className="text-right font-bold print:text-black">{r.children?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell className="text-right font-bold text-primary print:text-black">{r.patients?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell className="text-right font-bold print:text-black">{r.staff?.toFixed(2) || "0.00"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No proteins allocated</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Recipes (Pol Sambola, Soup, etc.) */}
          {recipes.map((recipe, idx) => (
            <Card key={recipe.recipeId || idx} className="print:shadow-none print:border-black print:break-inside-avoid">
              <CardHeader className="bg-muted/30 pb-3 border-b flex flex-row items-center justify-between space-y-0 print:bg-transparent print:border-black">
                <CardTitle className="text-label font-bold print:text-black">
                  {recipe.recipeName || "Recipe"} Calculation
                </CardTitle>
                <Badge variant="outline" className="bg-background print:border-black print:text-black">
                  {recipe.patientCount || 0} Patients
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="print:border-black">
                      <TableHead className="font-semibold print:text-black">Ingredient</TableHead>
                      <TableHead className="text-right font-semibold print:text-black">Total Need</TableHead>
                      <TableHead className="w-16 font-semibold print:text-black">Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipe.ingredients?.map((ing, i) => (
                      <TableRow key={i} className="print:border-black">
                        <TableCell className="font-medium print:text-black">
                          {ing.nameSi ? `${ing.nameSi} (${ing.nameEn || ing.name})` : ing.nameEn || ing.name}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary print:text-black">{ing.qty}</TableCell>
                        <TableCell className="text-muted-foreground print:text-black">{ing.unit}</TableCell>
                      </TableRow>
                    ))}
                    {!recipe.ingredients?.length && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No ingredients configured</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

          {/* Kanda (Porridge) */}
          {kanda && (
            <Card className="print:shadow-none print:border-black print:break-inside-avoid">
              <CardHeader className="bg-muted/30 pb-3 border-b flex flex-row items-center justify-between space-y-0 print:bg-transparent print:border-black">
                <CardTitle className="text-label font-bold print:text-black">Kenda (Porridge) Calculation</CardTitle>
                <Badge variant="outline" className="bg-background print:border-black print:text-black">
                  {kanda.count || 0} Patients
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="print:border-black">
                      <TableHead className="font-semibold print:text-black">Ingredient</TableHead>
                      <TableHead className="text-right font-semibold print:text-black">Total Need</TableHead>
                      <TableHead className="w-16 font-semibold print:text-black">Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="print:border-black">
                      <TableCell className="font-medium print:text-black">Red Raw Rice (Nadu)</TableCell>
                      <TableCell className="text-right font-bold text-primary print:text-black">{kanda.redRiceG || 0}</TableCell>
                      <TableCell className="text-muted-foreground print:text-black">g</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Extra Items */}
          <Card className="print:shadow-none print:border-black print:break-inside-avoid">
            <CardHeader className="bg-muted/30 pb-3 border-b print:bg-transparent print:border-black">
              <CardTitle className="text-label font-bold print:text-black">Extra Items Request</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="print:border-black">
                    <TableHead className="font-semibold print:text-black">Item</TableHead>
                    <TableHead className="text-right font-semibold print:text-black">Total Need</TableHead>
                    <TableHead className="w-16 font-semibold print:text-black">Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extrasList.length > 0 ? (
                    extrasList.map((e, idx) => (
                      <TableRow key={idx} className="print:border-black">
                        <TableCell className="font-medium print:text-black">{e.item}</TableCell>
                        <TableCell className="text-right font-bold text-primary print:text-black">{e.qty}</TableCell>
                        <TableCell className="text-muted-foreground print:text-black">{e.unit}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No extra items requested</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default CookSheet;