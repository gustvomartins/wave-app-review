import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 16,
  showValue = false 
}: StarRatingProps) {
  const stars = [];
  
  for (let i = 1; i <= maxRating; i++) {
    const fillPercentage = Math.min(Math.max(rating - (i - 1), 0), 1);
    
    stars.push(
      <div key={i} className="relative inline-block" style={{ width: size, height: size }}>
        <Star 
          size={size} 
          className="absolute text-muted"
          strokeWidth={1.5}
        />
        <div 
          className="absolute overflow-hidden" 
          style={{ width: `${fillPercentage * 100}%` }}
        >
          <Star 
            size={size} 
            className="fill-yellow-500 text-yellow-500"
            strokeWidth={1.5}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {stars}
      </div>
      {showValue && (
        <span className="text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}