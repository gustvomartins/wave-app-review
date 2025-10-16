import { Card } from "./ui/card";
import { StarRating } from "./StarRating";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: Date;
  version?: string;
}

interface ReviewsListProps {
  reviews: Review[];
  showAll?: boolean;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export function ReviewsList({ reviews, showAll = false }: ReviewsListProps) {
  const displayReviews = showAll ? reviews : reviews.slice(0, 5);

  return (
    <div className="space-y-4">
      {displayReviews.map((review) => (
        <Card key={review.id} className="p-6 rounded-2xl hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <span>{review.author[0].toUpperCase()}</span>
                </div>
                <div>
                  <p>{review.author}</p>
                  <p className="text-muted-foreground">
                    {formatTimeAgo(review.date)}
                  </p>
                </div>
              </div>
            </div>
            <StarRating rating={review.rating} size={16} showValue />
          </div>
          <p className="text-foreground/90 leading-relaxed">{review.text}</p>
          {review.version && (
            <p className="text-muted-foreground mt-3">Version {review.version}</p>
          )}
        </Card>
      ))}
    </div>
  );
}