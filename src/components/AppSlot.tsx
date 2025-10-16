import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, X, Loader2 } from "lucide-react";
import type { AppDetails } from "../utils/api";

interface AppSlotProps {
  store: "appstore" | "playstore";
  appData: AppDetails | null;
  isLoading: boolean;
  onAddClick: () => void;
  onRemoveClick: () => void;
  disabled?: boolean;
}

export function AppSlot({ store, appData, isLoading, onAddClick, onRemoveClick, disabled = false }: AppSlotProps) {
  const storeName = store === "appstore" ? "App Store" : "Google Play";

  if (isLoading) {
    return (
      <Card className="p-3 rounded-xl border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!appData) {
    return (
      <Card 
        className={`p-3 rounded-xl border-dashed border-2 transition-colors ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-primary/50 cursor-pointer'
        }`}
        onClick={disabled ? undefined : onAddClick}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Plus size={20} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-muted-foreground text-[14px] font-bold font-normal">{storeName}</p>
            {disabled && <p className="text-xs text-muted-foreground">Em breve</p>}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 rounded-xl border relative group hover:border-primary/50 transition-colors">
      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border shadow-sm"
        onClick={onRemoveClick}
      >
        <X size={12} />
      </Button>

      <div className="flex items-center gap-3">
        <img 
          src={appData.app.icon} 
          alt={appData.app.name}
          className="w-10 h-10 rounded-lg shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium text-[14px] font-normal font-bold">{appData.app.name}</p>
          <p className="text-muted-foreground truncate text-[12px]">{storeName}</p>
        </div>
      </div>
    </Card>
  );
}
