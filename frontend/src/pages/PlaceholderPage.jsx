import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

const PlaceholderPage = () => {
  const location = useLocation();
  const pageName = location.pathname
    .slice(1)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="space-y-4">
      <h1 className="text-heading-lg text-foreground">{pageName}</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Construction className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-body text-muted-foreground">
            This module is under development and will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;