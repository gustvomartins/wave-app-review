import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Package } from "lucide-react";
import { useMemo } from "react";

interface VersionFilterProps {
  reviews: Array<{ version?: string | null }>;
  value: string;
  onChange: (value: string) => void;
}

export function VersionFilter({ reviews, value, onChange }: VersionFilterProps) {
  const versions = useMemo(() => {
    const versionSet = new Set<string>();
    reviews.forEach(r => {
      const version = r.version || 'Desconhecida';
      versionSet.add(version);
    });
    
    return Array.from(versionSet).sort((a, b) => {
      // Sort versions, with "Desconhecida" at the end
      if (a === 'Desconhecida') return 1;
      if (b === 'Desconhecida') return -1;
      return b.localeCompare(a, undefined, { numeric: true });
    });
  }, [reviews]);

  if (versions.length === 0) {
    return null;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl">
        <Package size={16} className="mr-2" />
        <SelectValue placeholder="Todas versões" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas versões</SelectItem>
        {versions.map((version) => (
          <SelectItem key={version} value={version}>
            {version}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function filterReviewsByVersion<T extends { version?: string | null }>(
  reviews: T[],
  version: string
): T[] {
  if (version === "all") return reviews;
  return reviews.filter(r => (r.version || 'Desconhecida') === version);
}
