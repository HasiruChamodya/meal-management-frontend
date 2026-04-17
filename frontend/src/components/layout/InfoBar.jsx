import { useState, useEffect } from "react";
import { CalendarDays, Leaf, Drumstick } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

const InfoBar = () => {
  const [patientCycle, setPatientCycle] = useState("—");
  const [staffCycle, setStaffCycle] = useState("—");

  const today = new Date().toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const todayISO = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        const res = await fetch(`${API_BASE}/daily-cycle?date=${todayISO}`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.cycle) {
          setPatientCycle(data.cycle.patientCycle || "Not Set");
          setStaffCycle(data.cycle.staffCycle || "Not Set");
        }
      } catch {
        // Silently fail — bar just shows "—"
      }
    };
    fetchCycle();
  }, []);

  return (
    <div className="h-9 bg-info-bar flex items-center px-4 gap-6 text-info-bar-foreground text-xs font-medium shrink-0 overflow-x-auto whitespace-nowrap">
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        Today: {today}
      </span>
      <span className="flex items-center gap-1.5">
        <Leaf className="h-3.5 w-3.5" />
        Diet Cycle: {patientCycle}
      </span>
      <span className="flex items-center gap-1.5">
        <Drumstick className="h-3.5 w-3.5" />
        Staff Cycle: {staffCycle}
      </span>
    </div>
  );
};

export default InfoBar;