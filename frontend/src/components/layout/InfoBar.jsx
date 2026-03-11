import { CalendarDays, Leaf, Drumstick } from "lucide-react";

const InfoBar = () => {
  const today = new Date().toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="h-9 bg-info-bar flex items-center px-4 gap-6 text-info-bar-foreground text-xs font-medium shrink-0 overflow-x-auto whitespace-nowrap">
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        Today: {today}
      </span>
      <span className="flex items-center gap-1.5">
        <Leaf className="h-3.5 w-3.5" />
        Diet Cycle: Vegetable
      </span>
      <span className="flex items-center gap-1.5">
        <Drumstick className="h-3.5 w-3.5" />
        Staff Cycle: Chicken
      </span>
    </div>
  );
};

export default InfoBar;