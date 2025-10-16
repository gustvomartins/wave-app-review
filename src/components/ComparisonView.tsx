import { Card } from "./ui/card";
import { RatingSummaryCard } from "./RatingSummaryCard";
import { RatingsDistributionCard } from "./RatingsDistributionCard";
import { ReviewsList } from "./ReviewsList";
import type { AppDetails } from "../utils/api";
import { Apple, PlayCircle } from "lucide-react";

interface ComparisonViewProps {
  appStoreData: AppDetails | null;
  playStoreData: AppDetails | null;
}

export function ComparisonView({ appStoreData, playStoreData }: ComparisonViewProps) {
  const appStoreReviews = appStoreData?.reviews.map(r => ({
    ...r,
    date: new Date(r.date),
  })) || [];

  const playStoreReviews = playStoreData?.reviews.map(r => ({
    ...r,
    date: new Date(r.date),
  })) || [];

  return (
    <div className="space-y-6">
      <h2>Store Comparison</h2>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App Store Column */}
        <div className="space-y-6">
          <Card className="p-4 rounded-2xl border-2">
            <div className="flex items-center gap-2 mb-4">
              <Apple size={24} />
              <h3>App Store</h3>
            </div>
            
            {appStoreData ? (
              <>
                <div className="space-y-4">
                  <RatingSummaryCard 
                    averageRating={appStoreData.app.averageRating}
                    totalReviews={appStoreData.app.totalReviews}
                  />
                  <RatingsDistributionCard distribution={appStoreData.distribution} />
                </div>

                <div className="mt-6">
                  <h4 className="mb-4">Recent Reviews ({appStoreReviews.length})</h4>
                  <ReviewsList reviews={appStoreReviews.slice(0, 3)} />
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                No data available for App Store
              </p>
            )}
          </Card>
        </div>

        {/* Google Play Column */}
        <div className="space-y-6">
          <Card className="p-4 rounded-2xl border-2">
            <div className="flex items-center gap-2 mb-4">
              <PlayCircle size={24} />
              <h3>Google Play</h3>
            </div>
            
            {playStoreData ? (
              <>
                <div className="space-y-4">
                  <RatingSummaryCard 
                    averageRating={playStoreData.app.averageRating}
                    totalReviews={playStoreData.app.totalReviews}
                  />
                  <RatingsDistributionCard distribution={playStoreData.distribution} />
                </div>

                <div className="mt-6">
                  <h4 className="mb-4">Recent Reviews ({playStoreReviews.length})</h4>
                  <ReviewsList reviews={playStoreReviews.slice(0, 3)} />
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                No data available for Google Play
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Summary Stats */}
      {appStoreData && playStoreData && (
        <Card className="p-6 rounded-2xl">
          <h3 className="mb-4">Summary Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-muted-foreground mb-2">Average Rating</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Apple size={18} />
                  <span className="text-2xl">{appStoreData.app.averageRating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle size={18} />
                  <span className="text-2xl">{playStoreData.app.averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-2">Total Reviews</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Apple size={18} />
                  <span className="text-2xl">{appStoreData.app.totalReviews.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle size={18} />
                  <span className="text-2xl">{playStoreData.app.totalReviews.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-2">Reviews Fetched</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Apple size={18} />
                  <span className="text-2xl">{appStoreReviews.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle size={18} />
                  <span className="text-2xl">{playStoreReviews.length}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
