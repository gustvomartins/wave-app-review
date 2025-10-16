import { Waves } from "lucide-react";

interface TopNavProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  menuItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }>;
}

export function TopNav({ currentPage, onPageChange, menuItems }: TopNavProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-card/70 border-b border-border/50">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Waves size={20} className="text-primary-foreground" />
          </div>
          <div>
            <p className="font-medium">Wave App</p>
            <p className="text-muted-foreground">Review</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-accent text-foreground hover:shadow-sm'
                  }
                `}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
