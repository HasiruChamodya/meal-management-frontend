import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CalendarDays, Check, ChevronDown, ChevronRight, ChevronsUpDown, HelpCircle, Plus, Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTodaySL } from "@/lib/date-utils";

const API_BASE = "http://localhost:5050/api/census";
const WARDS_API = "http://localhost:5050/api/wards";
const ITEMS_API = "http://localhost:5050/api/items";
const DIET_TYPES_API = "http://localhost:5050/api/diet-types";
const RECIPES_API = "http://localhost:5050/api/recipes";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
};

const today = getTodaySL();

const statusConfig = {
  not_started: { label: "Not Submitted", className: "bg-muted text-muted-foreground" },
  draft: { label: "Draft", className: "bg-warning-bg text-warning" },
  submitted: { label: "Submitted", className: "bg-accent text-accent-foreground" },
  locked: { label: "Locked", className: "bg-destructive/10 text-destructive" },
};

const getDietKey = (diet) => String(diet.code || diet.id);

// 👇 Upgraded NumField for better readability and touch targets
const NumField = ({ value, onChange, onEnter, inputRef, className = "", disabled }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter?.();
    }
  };

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => {
        const raw = e.target.value;
        if (/^\d*$/.test(raw)) onChange(raw);
      }}
      onKeyDown={handleKeyDown}
      className={`h-12 text-lg font-semibold text-center text-foreground w-24 touch-target ${className}`}
    />
  );
};

const CensusEntryPage = () => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("patients");
  const [wards, setWards] = useState([]);
  const [wardStatuses, setWardStatuses] = useState([]);
  const [extraItemsMaster, setExtraItemsMaster] = useState([]);
  const [dietTypes, setDietTypes] = useState([]);
  const [recipesMaster, setRecipesMaster] = useState([]);

  const [wardId, setWardId] = useState("");
  const [wardSearchOpen, setWardSearchOpen] = useState(false);

  const [diets, setDiets] = useState({});
  const [special, setSpecial] = useState({});
  const [extras, setExtras] = useState({});
  const [customExtras, setCustomExtras] = useState([]);

  const [staffMeals, setStaffMeals] = useState({ breakfast: "", lunch: "", dinner: "" });
  const [staffStatus, setStaffStatus] = useState("not_started");

  const [status, setStatus] = useState("not_started");

  const [extrasOpen, setExtrasOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newItem, setNewItem] = useState({ name: "", quantity: "", unit: "Pcs" });

  const inputRefs = useRef([]);
  const focusNext = (idx) => { const next = inputRefs.current[idx + 1]; next?.focus(); };
  const registerRef = (idx) => (el) => { inputRefs.current[idx] = el; };

  const ward = useMemo(() => wards.find((w) => String(w.id) === String(wardId)), [wards, wardId]);

  const capacity = ward ? Number(ward.beds || 0) + Number(ward.cots || 0) + Number(ward.icu || 0) + Number(ward.incubators || 0) : 0;
  const submittedCount = wardStatuses.filter((w) => w.status === "submitted" || w.status === "locked").length;
  const submissionPct = wards.length ? Math.round((submittedCount / wards.length) * 100) : 0;

  const totalPatients = useMemo(() => {
    return Object.values(diets).reduce((sum, value) => sum + (parseInt(value, 10) || 0), 0);
  }, [diets]);

  const capacityPercent = capacity > 0 ? Math.min((totalPatients / capacity) * 100, 120) : 0;
  const overCapacity = totalPatients > capacity && capacity > 0;
  const progressColor = overCapacity ? "bg-destructive" : capacityPercent >= 80 ? "bg-warning" : "bg-primary";

  const isReadOnly = status === "locked";
  const staffReadOnly = staffStatus === "locked";

  const buildEmptyDiets = useCallback((types) => {
    return Object.fromEntries((types || []).map((diet) => [getDietKey(diet), ""]));
  }, []);

  const initExtrasObject = useCallback((itemsList) => {
    return Object.fromEntries((itemsList || []).map((i) => [i.name, ""]));
  }, []);

  const normalizeWardStatuses = useCallback((statusesFromApi, wardsSource) => {
    return (wardsSource || []).map((w) => {
      const sub = statusesFromApi.find((s) => String(s.wardId) === String(w.id));
      return { ward: w, status: sub?.status || "not_started", totalPatients: sub?.totalPatients || 0 };
    });
  }, []);

  const toNumberObject = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, parseInt(v, 10) || 0]));
  const toCustomExtrasPayload = (items) => items.map((item) => ({ ...item, quantity: parseInt(item.quantity, 10) || 0 }));

  const fetchDietTypes = async () => {
    const res = await fetch(DIET_TYPES_API, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch diet types");

    return (data.dietTypes || [])
      .filter(diet => diet.active && diet.type !== "Staff")
      .map((diet) => ({
        ...diet,
        code: diet.code || String(diet.id),
        nameEn: diet.nameEn || diet.name_en || diet.name || "Unnamed Diet",
        nameSi: diet.nameSi || diet.name_si || "",
        tooltip: diet.tooltip || "",
      }));
  };

  const fetchWards = async () => {
    const res = await fetch(WARDS_API, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch wards");
    return (data.wards || []).filter(ward => ward.active); 
  };

  const fetchStatuses = async () => {
    const res = await fetch(`${API_BASE}/statuses?date=${today}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch ward statuses");
    return data.statuses || [];
  };

  const fetchExtraItems = async () => {
    const res = await fetch(ITEMS_API, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch items");

    return (data.items || []).filter((item) => item.isExtra).map((item) => ({ id: item.id, name: item.nameEn, unit: item.unit }));
  };

  const fetchRecipes = async () => {
    const res = await fetch(RECIPES_API, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch recipes");
    return (data.recipes || []).map((r) => ({ id: r.id, key: r.recipeKey, name: r.name }));
  };

  const fetchStaffMeals = async () => {
    const res = await fetch(`${API_BASE}/staff?date=${today}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch staff meals");

    if (data.staffMeals) {
      setStaffMeals({
        breakfast: String(data.staffMeals.breakfast ?? ""),
        lunch: String(data.staffMeals.lunch ?? ""),
        dinner: String(data.staffMeals.dinner ?? ""),
      });
      setStaffStatus(data.staffMeals.status || "submitted");
    } else {
      setStaffMeals({ breakfast: "", lunch: "", dinner: "" });
      setStaffStatus("not_started");
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);
        const [wardsData, statusesData, itemsData, dietTypesData, recipesData] = await Promise.all([
          fetchWards(), fetchStatuses(), fetchExtraItems(), fetchDietTypes(), fetchRecipes(),
        ]);

        setWards(wardsData);
        setExtraItemsMaster(itemsData);
        setDietTypes(dietTypesData);
        setRecipesMaster(recipesData);
        setExtras(initExtrasObject(itemsData));
        setDiets(buildEmptyDiets(dietTypesData));
        setWardStatuses(normalizeWardStatuses(statusesData, wardsData));

        const emptySpecial = {};
        for (const r of recipesData) { emptySpecial[r.key] = ""; }
        setSpecial(emptySpecial);

        await fetchStaffMeals();
      } catch (error) {
        toast({ title: "Error", description: error.message || "Failed to load census page", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [buildEmptyDiets, initExtrasObject, normalizeWardStatuses, toast]);

  const loadWardData = useCallback(
    async (id) => {
      try {
        setWardId(String(id));
        setWardSearchOpen(false);

        const res = await fetch(`${API_BASE}/ward/${id}?date=${today}`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch ward census");

        if (data.census) {
          const normalizedDiets = Object.fromEntries(Object.entries(data.census.diets || {}).map(([k, v]) => [String(k), String(v ?? "")]));
          setDiets({ ...buildEmptyDiets(dietTypes), ...normalizedDiets });

          const loadedSpecial = {};
          for (const r of recipesMaster) {
            loadedSpecial[r.key] = String(data.census.special?.[r.key] ?? "");
          }
          setSpecial(loadedSpecial);

          setExtras({
            ...initExtrasObject(extraItemsMaster),
            ...Object.fromEntries(Object.entries(data.census.extras || {}).map(([k, v]) => [k, String(v ?? "")])),
          });
          setCustomExtras((data.census.customExtras || []).map((item) => ({ ...item, quantity: String(item.quantity ?? "") })));
          setStatus(data.census.status || "not_started");
        } else {
          setDiets(buildEmptyDiets(dietTypes));

          const emptySpec = {};
          for (const r of recipesMaster) { emptySpec[r.key] = ""; }
          setSpecial(emptySpec);

          setExtras(initExtrasObject(extraItemsMaster));
          setCustomExtras([]);
          setStatus("not_started");
        }
      } catch (error) {
        toast({ title: "Error", description: error.message || "Failed to load ward data", variant: "destructive" });
      }
    },
    [buildEmptyDiets, dietTypes, extraItemsMaster, recipesMaster, initExtrasObject, toast]
  );

  const saveDraft = async () => {
    if (!wardId) return;
    try {
      setSavingDraft(true);
      const payload = {
        wardId, date: today, diets: toNumberObject(diets), special: toNumberObject(special),
        extras: toNumberObject(extras), customExtras: toCustomExtrasPayload(customExtras),
      };

      const res = await fetch(`${API_BASE}/draft`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save draft");

      setStatus("draft");
      const statusesData = await fetchStatuses();
      setWardStatuses(normalizeWardStatuses(statusesData, wards));
      toast({ title: "Draft Saved", description: `${ward?.name || "Ward"} draft saved successfully.` });
    } catch (error) {
      toast({ title: "Error", description: error.message || "Could not save draft", variant: "destructive" });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!wardId) return;
    try {
      setSubmitting(true);
      const payload = {
        wardId, date: today, diets: toNumberObject(diets), special: toNumberObject(special),
        extras: toNumberObject(extras), customExtras: toCustomExtrasPayload(customExtras),
      };

      const res = await fetch(`${API_BASE}/submit`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit census");

      setConfirmOpen(false);
      setStatus("submitted");

      const statusesData = await fetchStatuses();
      const normalized = normalizeWardStatuses(statusesData, wards);
      setWardStatuses(normalized);

      toast({ title: "Success", description: `${ward?.name} data saved and submitted.` });

      if (status !== "submitted") {
        const nextWard = normalized.find(
          (w) => String(w.ward.id) !== String(wardId) && (w.status === "not_started" || w.status === "draft")
        );
        if (nextWard) setTimeout(() => loadWardData(nextWard.ward.id), 400);
      }
    } catch (error) {
      toast({ title: "Error", description: error.message || "Could not submit census", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCustomItem = () => {
    if (!newItem.name.trim()) return;
    setCustomExtras((prev) => [...prev, { ...newItem, name: newItem.name.trim() }]);
    setNewItem({ name: "", quantity: "", unit: "Pcs" });
    setAddItemOpen(false);
  };

  const handleSubmitStaff = async () => {
    try {
      const res = await fetch(`${API_BASE}/staff/submit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          date: today,
          breakfast: parseInt(staffMeals.breakfast, 10) || 0,
          lunch: parseInt(staffMeals.lunch, 10) || 0,
          dinner: parseInt(staffMeals.dinner, 10) || 0,
          staffCycle: "Chicken",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit staff meals");

      setStaffStatus("submitted");
      toast({ title: "Success", description: "Staff meal counts saved for today." });
    } catch (error) {
      toast({ title: "Error", description: error.message || "Could not submit staff meals", variant: "destructive" });
    }
  };

  let refIdx = 0;

  return (
    <div className="space-y-4 pb-28 md:pb-6">
      <h1 className="text-heading-lg text-foreground">Census Entry</h1>

      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold">{submittedCount} / {wards.length} wards submitted</span>
            <span className="text-base font-bold text-primary">{submissionPct}%</span>
          </div>
          <Progress value={submissionPct} className="h-3" />
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-3">
            {wardStatuses.map((ws) => {
              const isSubmitted = ws.status === "submitted" || ws.status === "locked";
              const isActive = String(ws.ward.id) === String(wardId);
              return (
                <button
                  key={ws.ward.id}
                  onClick={() => loadWardData(ws.ward.id)}
                  className={cn(
                    "rounded-lg p-2 text-center text-sm border transition-all cursor-pointer",
                    isActive && "ring-2 ring-primary",
                    isSubmitted ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <p className="font-semibold truncate text-base">{ws.ward.code}</p>
                  {isSubmitted && <p className="text-xs">{ws.totalPatients}p</p>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex gap gap-10 h-12">
          <TabsTrigger value="patients" className="flex-1 touch-target text-base">Patient Census</TabsTrigger>
          <TabsTrigger value="staff" className="flex-1 touch-target text-base">Staff Meals</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-base font-semibold">Select Ward</Label>
                  <Popover open={wardSearchOpen} onOpenChange={setWardSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={wardSearchOpen} className="w-full justify-between h-12 text-base touch-target text-foreground">
                        {ward ? `${ward.name} (${ward.code})` : "Search or select a ward…"}
                        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search by ward name…" className="text-base h-11" />
                        <CommandList>
                          <CommandEmpty className="text-base py-6 text-center">No ward found.</CommandEmpty>
                          <CommandGroup>
                            {wards.map((w) => (
                              <CommandItem key={w.id} value={`${w.name} ${w.code}`} onSelect={() => loadWardData(w.id)} className="text-base py-2">
                                <Check className={cn("mr-2 h-5 w-5", String(wardId) === String(w.id) ? "opacity-100" : "opacity-0")} />
                                <span className="font-medium">{w.name}</span>
                                <span className="ml-2 text-muted-foreground text-sm">({w.code})</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="h-10 gap-2 text-sm px-4 py-1">
                    <CalendarDays className="h-4 w-4" />
                    {new Date().toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" })}
                  </Badge>

                  {ward && (
                    <Badge className={statusConfig[status].className + " h-10 text-sm px-4 py-1"}>
                      {statusConfig[status].label}
                    </Badge>
                  )}
                </div>
              </div>

              {ward && <p className="text-base font-medium text-muted-foreground">Capacity: {capacity}</p>}
            </CardContent>
          </Card>

          {!ward && (
            <Card>
              <CardContent className="py-20 text-center text-muted-foreground text-lg">
                {loading ? "Loading wards..." : "Select a ward above to begin entering census data."}
              </CardContent>
            </Card>
          )}

          {ward && (
            <>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-heading-sm">Patient Counts</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {overCapacity && (
                    <div className="flex items-center gap-2 rounded-lg bg-error-bg border border-destructive/30 px-4 py-3 text-destructive text-base font-medium">
                      <AlertTriangle className="h-5 w-5 shrink-0" /> Patient count exceeds ward capacity of {capacity}!
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {dietTypes.map((diet) => {
                      const idx = refIdx++;
                      const dietKey = getDietKey(diet);
                      return (
                        <div key={dietKey} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-base font-semibold">{diet.nameEn}</Label>
                            {diet.tooltip && (
                              <Tooltip>
                                <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                <TooltipContent side="top" className="text-sm">{diet.tooltip}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <NumField
                            className="text-primary border-slate-300 focus:border-primary"
                            disabled={isReadOnly}
                            value={diets[dietKey] ?? ""}
                            onChange={(v) => !isReadOnly && setDiets((prev) => ({ ...prev, [dietKey]: v }))}
                            onEnter={() => focusNext(idx)}
                            inputRef={registerRef(idx)}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-foreground">Total Patients</span>
                      <span className={`text-heading-md font-bold ${overCapacity ? "text-destructive" : "text-primary"}`}>{totalPatients} / {capacity}</span>
                    </div>
                    <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                      <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${progressColor}`} style={{ width: `${Math.min(capacityPercent, 100)}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-heading-sm">Special Requests</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {recipesMaster.map((item) => {
                      const idx = refIdx++;
                      return (
                        <div key={item.key} className="space-y-2">
                          <Label className="text-base font-semibold">{item.name}</Label>
                          <NumField
                            className="text-primary w-full border-slate-300 focus:border-primary"
                            disabled={isReadOnly}
                            value={special[item.key] ?? ""}
                            onChange={(v) => !isReadOnly && setSpecial((s) => ({ ...s, [item.key]: v }))}
                            onEnter={() => focusNext(idx)}
                            inputRef={registerRef(idx)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-heading-sm">Extra Items</CardTitle>
                        {extrasOpen ? <ChevronDown className="h-6 w-6 text-muted-foreground" /> : <ChevronRight className="h-6 w-6 text-muted-foreground" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="grid grid-cols-[1fr_120px_80px] gap-4 bg-muted px-5 py-3 text-base font-semibold text-muted-foreground">
                          <span>Item</span><span className="text-center">Qty</span><span className="text-center">Unit</span>
                        </div>
                        {extraItemsMaster.map((item) => {
                          const idx = refIdx++;
                          return (
                            <div key={item.id} className="grid grid-cols-[1fr_120px_80px] gap-4 px-5 py-3 border-t items-center">
                              <span className="text-lg font-medium">{item.name}</span>
                              <NumField
                                disabled={isReadOnly}
                                value={extras[item.name] ?? ""}
                                onChange={(v) => !isReadOnly && setExtras((e) => ({ ...e, [item.name]: v }))}
                                onEnter={() => focusNext(idx)}
                                inputRef={registerRef(idx)}
                                className="w-full text-primary border-slate-300 focus:border-primary"
                              />
                              <span className="text-base font-medium text-muted-foreground text-center">{item.unit}</span>
                            </div>
                          );
                        })}
                        {customExtras.map((item, i) => (
                          <div key={`custom-${i}`} className="grid grid-cols-[1fr_120px_80px] gap-4 px-5 py-3 border-t items-center bg-accent/30">
                            <span className="text-lg font-medium">{item.name}</span>
                            <NumField
                              disabled={isReadOnly}
                              value={item.quantity ?? ""}
                              onChange={(v) => !isReadOnly && setCustomExtras((prev) => prev.map((ce, j) => j === i ? { ...ce, quantity: v } : ce))}
                              className="w-full text-primary border-slate-300 focus:border-primary"
                            />
                            <span className="text-base font-medium text-muted-foreground text-center">{item.unit}</span>
                          </div>
                        ))}
                      </div>
                      {!isReadOnly && (
                        <Button variant="outline" className="mt-4 h-11 text-base touch-target" onClick={() => setAddItemOpen(true)}>
                          <Plus className="h-5 w-5 mr-2" /> Add Custom Item
                        </Button>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {!isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 md:static bg-card border-t md:border-0 p-4 md:p-0 flex gap-4 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none">
                  <Button variant="outline" className="h-12 text-base font-semibold touch-target" disabled={!wardId || savingDraft} onClick={saveDraft}>
                    <Save className="h-5 w-5 mr-2" /> {savingDraft ? "Saving..." : "Save Draft"}
                  </Button>
                  <Button
                    className={cn("flex-1 md:flex-none h-12 text-base font-semibold touch-target", status === "submitted" ? "bg-accent text-accent-foreground hover:bg-accent/90" : "")}
                    disabled={overCapacity || totalPatients === 0 || submitting}
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Send className="h-5 w-5 mr-2" />
                    {submitting ? "Saving..." : status === "submitted" ? "Update Ward Data" : "Submit Ward Data"}
                  </Button>
                </div>
              )}

              {isReadOnly && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-5 py-4 text-base font-medium text-destructive">
                  This ward's census has been locked by the calculation engine and can no longer be edited.
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="staff" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-heading-sm">Staff Meal Counts for Today</CardTitle>
              <p className="text-base text-muted-foreground mt-1">Enter total staff meal counts (not per-ward).</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {["breakfast", "lunch", "dinner"].map((meal) => (
                  <div key={meal} className="space-y-3 text-center">
                    <Label className="text-lg font-bold capitalize">{meal}</Label>
                    <NumField
                      disabled={staffReadOnly}
                      value={staffMeals[meal] ?? ""}
                      onChange={(v) => !staffReadOnly && setStaffMeals((s) => ({ ...s, [meal]: v }))}
                      className="h-16 text-3xl text-center touch-target font-bold w-full border-slate-300 focus:border-primary"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-badge-hospital text-primary-foreground px-4 py-2 text-base font-medium">Staff Cycle: Chicken</Badge>
              </div>
              
              {!staffReadOnly ? (
                <div className="pt-4 border-t">
                  <Button
                    className={cn("h-12 px-8 touch-target text-base font-semibold w-full sm:w-auto", staffStatus === "submitted" ? "bg-accent text-accent-foreground hover:bg-accent/90" : "")}
                    onClick={handleSubmitStaff}
                    disabled={ (parseInt(staffMeals.breakfast, 10) || 0) + (parseInt(staffMeals.lunch, 10) || 0) + (parseInt(staffMeals.dinner, 10) || 0) === 0}
                  >
                    <Send className="h-5 w-5 mr-2" /> {staffStatus === "submitted" ? "Update Staff Meals" : "Submit Staff Meals"}
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-5 py-4 text-base font-medium text-destructive">
                  Staff meals have been locked by the calculation engine and cannot be edited.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">{status === "submitted" ? "Update Census Data" : "Submit Census Data"}</DialogTitle>
            <DialogDescription className="text-base mt-2">
              {status === "submitted" 
                ? `You are about to override the submitted data for ${ward?.name}. Continue?`
                : `Are you sure you want to submit ${ward?.name}'s data?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="h-11 text-base touch-target">Cancel</Button>
            <Button onClick={handleSubmit} className="h-11 text-base font-semibold touch-target">Yes, {status === "submitted" ? "Update" : "Submit"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-xl">Add Custom Extra Item</DialogTitle></DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Item Name</Label>
              <Input value={newItem.name} onChange={(e) => setNewItem((n) => ({ ...n, name: e.target.value }))} className="h-12 text-lg text-primary border-slate-300 focus:border-primary" placeholder="Enter item name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Quantity</Label>
                <NumField value={newItem.quantity ?? ""} onChange={(v) => setNewItem((n) => ({ ...n, quantity: v }))} className="w-full text-primary border-slate-300 focus:border-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Unit</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12 w-full justify-between text-lg text-foreground border-slate-300">
                      {newItem.unit} <ChevronsUpDown className="ml-2 h-5 w-5 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-1">
                    {["Pcs", "g", "kg", "ml", "L", "Fruit"].map((u) => (
                      <Button key={u} variant="ghost" size="sm" className="w-full justify-start text-base" onClick={() => setNewItem((n) => ({ ...n, unit: u }))}>{u}</Button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 mt-6">
            <Button variant="outline" onClick={() => setAddItemOpen(false)} className="h-11 text-base touch-target">Cancel</Button>
            <Button onClick={handleAddCustomItem} disabled={!newItem.name.trim()} className="h-11 text-base font-semibold touch-target">Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CensusEntryPage;