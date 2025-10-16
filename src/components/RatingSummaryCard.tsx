import { Card } from "./ui/card";
import { StarRating } from "./StarRating";
import { MessageSquare, Info } from "lucide-react";

interface RatingSummaryCardProps {
  averageRating: number;
  totalReviews: number;
  showStoreRatings?: boolean;
}

export function RatingSummaryCard({ averageRating, totalReviews, showStoreRatings = false }: RatingSummaryCardProps) {
  return (
    <Card className="p-6 rounded-2xl">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground">Nota Média</p>
            {showStoreRatings && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-lg">
                <Info size={14} className="text-primary" />
                <span className="text-xs text-primary">Avaliações atuais da loja</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-5xl">{averageRating.toFixed(1)}</span>
            <div className="flex flex-col gap-1">
              <StarRating rating={averageRating} size={20} />
              <p className="text-muted-foreground">de 5.0</p>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare size={18} />
            <span>{totalReviews.toLocaleString()} reviews no total</span>
          </div>
        </div>
      </div>
    </Card>
  );
}