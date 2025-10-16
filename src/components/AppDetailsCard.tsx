import { Card } from "./ui/card";
import { ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface AppDetailsCardProps {
  app: {
    id: string;
    name: string;
    developer: string;
    icon: string;
    store: "App Store" | "Google Play";
    storeUrl: string;
  };
}

export function AppDetailsCard({ app }: AppDetailsCardProps) {
  return (
    <Card className="p-6 rounded-2xl">
      <div className="flex items-start gap-4">
        <img 
          src={app.icon} 
          alt={app.name}
          className="w-20 h-20 rounded-2xl shadow-md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="truncate">{app.name}</h3>
              <p className="text-muted-foreground mt-1">{app.developer}</p>
              <Badge variant="secondary" className="mt-3">
                {app.store}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-xl"
              onClick={() => window.open(app.storeUrl, '_blank')}
            >
              <ExternalLink size={16} className="mr-2" />
              View in Store
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}