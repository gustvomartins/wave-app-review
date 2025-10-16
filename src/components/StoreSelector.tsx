import { Apple, PlayCircle } from "lucide-react";
import { Card } from "./ui/card";

interface StoreSelectorProps {
  selectedStore: "appstore" | "playstore" | "both";
  onStoreChange: (store: "appstore" | "playstore" | "both") => void;
}

export function StoreSelector({ selectedStore, onStoreChange }: StoreSelectorProps) {
  const stores = [
    { id: "appstore" as const, label: "App Store", icon: Apple },
    { id: "playstore" as const, label: "Google Play", icon: PlayCircle },
    { id: "both" as const, label: "Both Stores", icon: null },
  ];

  return (
    <Card className="p-2 rounded-2xl inline-flex gap-2">
      {stores.map((store) => {
        const Icon = store.icon;
        const isActive = selectedStore === store.id;
        
        return (
          <button
            key={store.id}
            onClick={() => onStoreChange(store.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl transition-all
              ${isActive 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'hover:bg-accent text-foreground'
              }
            `}
          >
            {Icon && <Icon size={18} />}
            <span>{store.label}</span>
          </button>
        );
      })}
    </Card>
  );
}
