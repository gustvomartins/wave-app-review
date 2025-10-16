import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Info } from "lucide-react";

interface CurrentRatingsToggleProps {
  showCurrentRatings: boolean;
  onToggle: (value: boolean) => void;
}

export function CurrentRatingsToggle({ showCurrentRatings, onToggle }: CurrentRatingsToggleProps) {
  return (
    <Card className="p-4 rounded-xl border inline-flex items-center gap-3">
      <Info size={16} className="text-muted-foreground" />
      <Label htmlFor="current-ratings" className="cursor-pointer">
        Show store ratings
      </Label>
      <Switch 
        id="current-ratings"
        checked={showCurrentRatings} 
        onCheckedChange={onToggle}
      />
    </Card>
  );
}
