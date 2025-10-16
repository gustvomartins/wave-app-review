import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";

interface AppSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AppSearchBar({ onSearch, placeholder = "Search by app name or enter App ID...", disabled = false }: AppSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 h-12 bg-card border-border rounded-2xl"
        disabled={disabled}
      />
    </form>
  );
}