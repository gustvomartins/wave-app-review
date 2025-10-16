import { ReviewsList } from "./ReviewsList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Card } from "./ui/card";
import type { AppDetails } from "../utils/api";

interface ReviewsPageProps {
  appData: AppDetails | null;
}

export function ReviewsPage({ appData }: ReviewsPageProps) {
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");

  if (!appData) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Reviews</h1>
          <p className="text-muted-foreground mt-2">
            No app selected. Search for an app from the Dashboard first.
          </p>
        </div>
        <Card className="p-12 rounded-2xl text-center">
          <p className="text-muted-foreground">
            Please select an app from the Dashboard to view its reviews.
          </p>
        </Card>
      </div>
    );
  }

  // Convert date strings to Date objects
  let filteredReviews = appData.reviews.map(r => ({
    ...r,
    date: new Date(r.date),
  }));

  // Apply rating filter
  if (ratingFilter !== "all") {
    const rating = parseInt(ratingFilter);
    filteredReviews = filteredReviews.filter(r => r.rating === rating);
  }

  // Apply search filter
  if (searchQuery) {
    filteredReviews = filteredReviews.filter(r => 
      r.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply sorting
  if (sortBy === "recent") {
    filteredReviews.sort((a, b) => b.date.getTime() - a.date.getTime());
  } else if (sortBy === "highest") {
    filteredReviews.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "lowest") {
    filteredReviews.sort((a, b) => a.rating - b.rating);
  }

  const totalFetchedReviews = appData.reviews.length;
  const totalAppReviews = appData.app.totalReviews;

  return (
    <div className="space-y-6">
      <div>
        <h1>Reviews</h1>
        <p className="text-muted-foreground mt-2">
          Browse and filter all reviews for {appData.app.name}
        </p>
        {totalAppReviews > totalFetchedReviews && (
          <p className="text-muted-foreground mt-1">
            Showing {totalFetchedReviews.toLocaleString()} of {totalAppReviews.toLocaleString()} total reviews from the App Store
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-card border-border rounded-xl"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[160px] h-11 rounded-xl">
              <SlidersHorizontal size={16} className="mr-2" />
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] h-11 rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <p className="text-muted-foreground mb-4">
          Showing {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
        </p>
        {filteredReviews.length > 0 ? (
          <ReviewsList reviews={filteredReviews} showAll />
        ) : (
          <Card className="p-12 rounded-2xl text-center">
            <p className="text-muted-foreground">
              No reviews match your filters. Try adjusting your search criteria.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}