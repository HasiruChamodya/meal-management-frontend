import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Printer, CalendarDays, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTodaySL } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const ConsolidatedDietSheet = () => {
  const { toast } = useToast();
  const today = getTodaySL();
  
  const [filterDate, setFilterDate] = useState(today);
  const [loading, setLoading] = useState(true);
  
  const [wards, setWards] = useState([]);
  const [dietTypes, setDietTypes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [recipeResults, setRecipeResults] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [wardsRes, dietsRes, recipesRes, subsRes, calcRes] = await Promise.all([
          fetch(`${API_BASE}/wards`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/diet-types`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/recipes`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/census/my-submissions?date=${filterDate}`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/calculations/results?date=${filterDate}`, { headers: getAuthHeaders() }).catch(() => null)
        ]);

        const wardsData = await wardsRes.json();
        const dietsData = await dietsRes.json();
        const recipesData = await recipesRes.json();
        const subsData = await subsRes.json();
        
        let calcData = null;
        if (calcRes && calcRes.ok) {
          calcData = await calcRes.json();
        }

        setWards((wardsData.wards || []).filter(w => w.active));
        setDietTypes((dietsData.dietTypes || []).filter(d => d.active && d.type !== "Staff"));
        setRecipes(recipesData.recipes || []);
        setSubmissions(subsData.submissions || []);
        setRecipeResults(calcData?.recipeResults || null);

      } catch (error) {
        toast({ title: "Error", description: "Failed to load consolidated data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterDate, toast]);

  // Handle Printing
  const handlePrint = () => {
    window.print();
  };

  // --- 1. PREPARE THE MATRIX DATA ---
  const matrixData = useMemo(() => {
    // Sort wards numerically
    const sortedWards = [...wards].sort((a, b) => 
      (a.code || "").localeCompare(b.code || "", undefined, { numeric: true, sensitivity: 'base' })
    );

    // Map submissions by ward ID for fast lookup
    const subMap = {};
    submissions.forEach(sub => { subMap[sub.wardId] = sub; });

    // Process Diets
    const dietRows = dietTypes.map(dt => {
      const row = { id: dt.code, name: dt.nameSi || dt.nameEn, isTotal: false, wards: {}, total: 0 };
      sortedWards.forEach(w => {
        const val = Number(subMap[w.id]?.diets?.[dt.code]) || 0;
        row.wards[w.id] = val;
        row.total += val;
      });
      return row;
    });

    // Process Recipes (Special)
    const specialRows = recipes.map(r => {
      const row = { id: r.recipeKey, name: r.name, isTotal: false, wards: {}, total: 0 };
      sortedWards.forEach(w => {
        const val = Number(subMap[w.id]?.special?.[r.recipeKey]) || 0;
        row.wards[w.id] = val;
        row.total += val;
      });
      return row;
    });

    // Process Extras (Dynamically extract all unique extras)
    const extraKeys = new Set();
    submissions.forEach(sub => {
      Object.keys(sub.extras || {}).forEach(k => extraKeys.add(k));
      (sub.customExtras || []).forEach(ce => extraKeys.add(ce.name));
    });

    const extraRows = Array.from(extraKeys).sort().map(extName => {
      const row = { id: extName, name: extName, isTotal: false, wards: {}, total: 0 };
      sortedWards.forEach(w => {
        let val = Number(subMap[w.id]?.extras?.[extName]) || 0;
        // Check custom extras if not found in standard extras
        if (val === 0 && subMap[w.id]?.customExtras) {
            const ce = subMap[w.id].customExtras.find(c => c.name === extName);
            if (ce) val = Number(ce.quantity) || 0;
        }
        row.wards[w.id] = val;
        row.total += val;
      });
      return row;
    });

    // Process Ward Grand Totals
    const wardTotals = { id: 'TOTAL', name: 'එකතුව (Total)', isTotal: true, wards: {}, total: 0 };
    sortedWards.forEach(w => {
        const val = Number(subMap[w.id]?.totalPatients) || 0;
        wardTotals.wards[w.id] = val;
        wardTotals.total += val;
    });

    return { sortedWards, dietRows, specialRows, extraRows, wardTotals };
  }, [wards, dietTypes, recipes, submissions]);


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Generating Consolidated Sheet...</span>
      </div>
    );
  }

  const { sortedWards, dietRows, specialRows, extraRows, wardTotals } = matrixData;

  // Base styling for table cells to ensure perfect printing
  const cellStyle = "border border-slate-400 print:border-black px-2 py-1.5 text-center text-sm print:text-xs";
  const headerStyle = "border border-slate-400 print:border-black px-2 py-2 bg-muted/50 print:bg-transparent font-bold text-center text-sm print:text-xs whitespace-nowrap";

  return (
    <div className="space-y-6 print:space-y-4 print:m-0 print:p-0">
      
      {/* --- NON-PRINTABLE CONTROLS --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <h1 className="text-heading-lg font-bold text-foreground">Consolidated Diet Sheet</h1>
        <div className="flex items-center gap-3">
          <Label className="text-base font-semibold shrink-0">Date:</Label>
          <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="h-11 w-44" />
          <Button onClick={handlePrint} className="h-11 touch-target"><Printer className="w-4 h-4 mr-2" /> Print Sheet</Button>
        </div>
      </div>

      {/* --- PRINTABLE REPORT CONTENT --- */}
      <div className="bg-white print:shadow-none print:bg-white rounded-lg border print:border-none shadow-sm p-4 print:p-0 overflow-x-auto print:overflow-visible">
        
        {/* Print Header */}
        <div className="hidden print:flex flex-col items-center justify-center mb-6">
          <h2 className="text-xl font-bold font-serif underline decoration-2 underline-offset-4">රෝගී ආහාර අනුමානය - දිස්ත්‍රික් මහ රෝහල ගම්පහ</h2>
          <h3 className="text-lg font-bold mt-1">Consolidated Diet Sheet</h3>
          <div className="flex items-center gap-2 mt-2 font-semibold">
            <CalendarDays className="w-4 h-4" /> {filterDate}
          </div>
        </div>

        {submissions.length === 0 ? (
           <div className="py-10 text-center text-muted-foreground print:hidden">No ward submissions found for this date.</div>
        ) : (
          <table className="w-full border-collapse min-w-max print:min-w-0">
            <thead>
              <tr>
                <th className={cn(headerStyle, "text-left min-w-[200px]")}>ආහාර වර්ගය (Diet/Item)</th>
                {sortedWards.map(w => (
                  <th key={w.id} className={headerStyle}>{w.code}</th>
                ))}
                <th className={headerStyle}>එකතුව<br/>(Total)</th>
              </tr>
            </thead>
            <tbody>
              
              {/* DIETS */}
              {dietRows.map(row => (
                <tr key={row.id} className="hover:bg-muted/30 print:hover:bg-transparent">
                  <td className={cn(cellStyle, "text-left font-medium")}>{row.name}</td>
                  {sortedWards.map(w => (
                    <td key={w.id} className={cellStyle}>{row.wards[w.id] > 0 ? row.wards[w.id] : ""}</td>
                  ))}
                  <td className={cn(cellStyle, "font-bold text-primary print:text-black")}>{row.total > 0 ? row.total : ""}</td>
                </tr>
              ))}

              {/* WARD GRAND TOTALS */}
              <tr className="bg-primary/5 print:bg-transparent border-t-2 border-t-slate-500 print:border-t-black">
                  <td className={cn(cellStyle, "text-left font-bold text-primary print:text-black")}>{wardTotals.name}</td>
                  {sortedWards.map(w => (
                    <td key={w.id} className={cn(cellStyle, "font-bold text-primary print:text-black")}>{wardTotals.wards[w.id] > 0 ? wardTotals.wards[w.id] : ""}</td>
                  ))}
                  <td className={cn(cellStyle, "font-bold text-lg text-primary print:text-black")}>{wardTotals.total > 0 ? wardTotals.total : ""}</td>
              </tr>

              {/* SEPARATOR */}
              <tr><td colSpan={sortedWards.length + 2} className="h-6 print:h-4 border-none"></td></tr>
              
              {/* RECIPES / SPECIAL */}
              {specialRows.length > 0 && (
                <>
                  <tr>
                    <td colSpan={sortedWards.length + 2} className="font-bold text-left bg-muted/50 print:bg-transparent border border-slate-400 print:border-black px-2 py-1">Special Requests / Recipes</td>
                  </tr>
                  {specialRows.map(row => (
                    <tr key={row.id} className="hover:bg-muted/30 print:hover:bg-transparent">
                      <td className={cn(cellStyle, "text-left font-medium")}>{row.name}</td>
                      {sortedWards.map(w => (
                        <td key={w.id} className={cellStyle}>{row.wards[w.id] > 0 ? row.wards[w.id] : ""}</td>
                      ))}
                      <td className={cn(cellStyle, "font-bold")}>{row.total > 0 ? row.total : ""}</td>
                    </tr>
                  ))}
                </>
              )}

              {/* EXTRAS */}
              {extraRows.length > 0 && (
                <>
                  <tr><td colSpan={sortedWards.length + 2} className="h-4 print:h-2 border-none"></td></tr>
                  <tr>
                    <td colSpan={sortedWards.length + 2} className="font-bold text-left bg-muted/50 print:bg-transparent border border-slate-400 print:border-black px-2 py-1">Extra Items</td>
                  </tr>
                  {extraRows.map(row => (
                    <tr key={row.id} className="hover:bg-muted/30 print:hover:bg-transparent">
                      <td className={cn(cellStyle, "text-left font-medium")}>{row.name}</td>
                      {sortedWards.map(w => (
                        <td key={w.id} className={cellStyle}>{row.wards[w.id] > 0 ? row.wards[w.id] : ""}</td>
                      ))}
                      <td className={cn(cellStyle, "font-bold")}>{row.total > 0 ? row.total : ""}</td>
                    </tr>
                  ))}
                </>
              )}

            </tbody>
          </table>
        )}

      </div>

      {/* --- RECIPE INGREDIENTS BREAKDOWN --- */}
      {submissions.length > 0 && (
        <div className="mt-8 pt-8 print:pt-4 border-t-2 print:border-t print:border-dashed print:break-inside-avoid">
          <h3 className="text-heading-sm font-bold mb-4">Recipe Ingredients Breakdown</h3>
          
          {!recipeResults ? (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-warning/10 text-warning border border-warning/20">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-semibold">Ingredient breakdown will be available here after the Subject Clerk runs the daily calculation.</p>
            </div>
          ) : recipeResults.length === 0 ? (
            <p className="text-muted-foreground italic">No recipe requests for this date.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-6 print:gap-4">
              {recipeResults.map(recipe => (
                <div key={recipe.recipeId} className="border border-slate-300 print:border-black rounded-lg p-4 print:p-2">
                  <h4 className="font-bold text-lg border-b border-slate-300 print:border-black pb-2 mb-3">
                    {recipe.recipeName}
                    <span className="block text-sm font-normal text-muted-foreground print:text-black">
                      {recipe.rawPatientCount} patients requested
                    </span>
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex justify-between border-b border-dashed border-slate-200 print:border-slate-400 pb-1">
                        <span>{ing.nameEn}</span>
                        <span className="font-bold">{ing.qty} {ing.unit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ConsolidatedDietSheet;