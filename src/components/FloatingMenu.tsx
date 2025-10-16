import { Card } from "./ui/card";

interface FloatingMenuProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  menuItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }>;
}

export function FloatingMenu({ currentPage, onPageChange, menuItems }: FloatingMenuProps) {
  return (
    <Card className="fixed top-6 left-1/2 -translate-x-1/2 p-2 rounded-[16px] shadow-lg border z-50 backdrop-blur-md bg-card/70">
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
    </Card>
  );
}
