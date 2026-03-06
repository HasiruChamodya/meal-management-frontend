import { useAuth } from "@/contexts/AuthContext";
import { DASHBOARD_CARDS, ROLE_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  const cards = DASHBOARD_CARDS[user.role] || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-lg text-foreground">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user.name.split(" ")[0]}
        </h1>
        <p className="text-body text-muted-foreground mt-1">
          {ROLE_LABELS[user.role]} Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link key={card.url} to={card.url} className="group">
            <Card className="h-full border hover:shadow-md transition-all duration-200 hover:border-primary/30 cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-lg bg-accent flex items-center justify-center ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-heading-sm mb-1">{card.title}</CardTitle>
                <CardDescription className="text-label">{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;