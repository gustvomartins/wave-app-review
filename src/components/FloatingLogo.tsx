import { Waves } from "lucide-react";
import { Card } from "./ui/card";

export function FloatingLogo() {
  return (
    <Card className="fixed top-6 left-6 p-4 rounded-[16px] shadow-lg border z-50 backdrop-blur-md bg-card/70">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Waves size={20} className="text-primary-foreground" />
        </div>
        <div>
          <p className="font-medium">Wave App</p>
          <p className="text-muted-foreground">Review</p>
        </div>
      </div>
    </Card>
  );
}
