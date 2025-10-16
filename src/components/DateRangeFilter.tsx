import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "lucide-react";

export type DateRange = "7days" | "15days" | "1month" | "3months" | "6months" | "1year";

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

const dateRangeOptions = [
  { value: "7days" as const, label: "Últimos 7 dias" },
  { value: "15days" as const, label: "Últimos 15 dias" },
  { value: "1month" as const, label: "Último mês" },
  { value: "3months" as const, label: "Últimos 3 meses" },
  { value: "6months" as const, label: "Últimos 6 meses" },
  { value: "1year" as const, label: "Último ano" },
];

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl">
        <Calendar size={16} className="mr-2" />
        <SelectValue placeholder="Selecionar período" />
      </SelectTrigger>
      <SelectContent>
        {dateRangeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function filterReviewsByDateRange<T extends { date: Date }>(
  reviews: T[],
  dateRange: DateRange
): T[] {
  if (dateRange === "1year") return reviews;

  const now = new Date();
  const cutoffDate = new Date();

  switch (dateRange) {
    case "7days":
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case "15days":
      cutoffDate.setDate(now.getDate() - 15);
      break;
    case "1month":
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case "3months":
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case "6months":
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case "1year":
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return reviews.filter(r => r.date >= cutoffDate);
}
