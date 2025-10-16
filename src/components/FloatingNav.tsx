import { Waves } from "lucide-react";
import { Card } from "./ui/card";

interface FloatingNavProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  menuItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }>;
}

export function FloatingNav({ currentPage, onPageChange, menuItems }: FloatingNavProps) {
  return (
    <Card className="fixed bottom-8 left-8 p-4 rounded-2xl shadow-2xl border-2 z-50 backdrop-blur-sm bg-card/95">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Waves size={20} className="text-primary-foreground" />
          </div>
          <div>
            <p className="font-medium">Wave App</p>
            <p className="text-muted-foreground">Review</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-accent text-foreground hover:shadow-sm'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </Card>
  );
}
