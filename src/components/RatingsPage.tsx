import { RatingSummaryCard } from "./RatingSummaryCard";
import { RatingsDistributionCard } from "./RatingsDistributionCard";
import { Card } from "./ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { DateRangeFilter, filterReviewsByDateRange, DateRange } from "./DateRangeFilter";
import { VersionFilter, filterReviewsByVersion } from "./VersionFilter";
import { useState, useMemo } from "react";
import type { AppDetails } from "../utils/api";

interface RatingsPageProps {
  appStoreData: AppDetails | null;
  playStoreData: AppDetails | null;
}

export function RatingsPage({ appStoreData, playStoreData }: RatingsPageProps) {
  const [dateRange, setDateRange] = useState<DateRange>("1year");
  const [versionFilter, setVersionFilter] = useState("all");
  const currentData = appStoreData || playStoreData;
  
  // When "all time" or "1 year" is selected with all versions, show store ratings
  const showCurrentRatings = (dateRange === "all" || dateRange === "1year") && versionFilter === "all";

  if (!currentData) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Avaliações</h1>
          <p className="text-muted-foreground mt-2">
            Adicione um app para ver análise de avaliações
          </p>
        </div>
        <Card className="p-12 rounded-2xl text-center">
          <p className="text-muted-foreground">
            Nenhum app adicionado ainda. Use a barra lateral para adicionar um app.
          </p>
        </Card>
      </div>
    );
  }

  const allReviews = currentData.reviews.map(r => ({
    ...r,
    date: new Date(r.date),
  }));

  let reviews = useMemo(
    () => filterReviewsByDateRange(allReviews, dateRange),
    [allReviews, dateRange]
  );

  reviews = useMemo(
    () => filterReviewsByVersion(reviews, versionFilter),
    [reviews, versionFilter]
  );
  
  // Calculate some stats
  const distribution = useMemo(() => {
    return [1, 2, 3, 4, 5].map(stars => ({
      stars,
      count: reviews.filter(r => r.rating === stars).length,
    }));
  }, [reviews]);

  const totalRatings = distribution.reduce((sum, d) => sum + d.count, 0);
  const positiveRatings = (distribution[3]?.count || 0) + (distribution[4]?.count || 0); // 4 and 5 stars
  const negativeRatings = (distribution[0]?.count || 0) + (distribution[1]?.count || 0); // 1 and 2 stars
  const positivePercent = totalRatings > 0 ? (positiveRatings / totalRatings) * 100 : 0;
  const negativePercent = totalRatings > 0 ? (negativeRatings / totalRatings) * 100 : 0;

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  return (
    <div className="space-y-6">
      <div>
        <h1>Avaliações</h1>
        <p className="text-muted-foreground mt-2">
          Análise detalhada de avaliações de {currentData.app.name}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="flex flex-wrap gap-3">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <VersionFilter 
            reviews={allReviews}
            value={versionFilter}
            onChange={setVersionFilter}
          />
        </div>
      </div>
      
      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RatingSummaryCard 
          averageRating={showCurrentRatings ? currentData.app.averageRating : averageRating}
          totalReviews={showCurrentRatings ? currentData.app.totalReviews : reviews.length}
          showStoreRatings={showCurrentRatings}
        />
        
        {/* Sentiment Card */}
        <Card className="p-6 rounded-2xl">
          <h3 className="mb-4">Sentimento das Avaliações</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} style={{ color: 'var(--sentiment-positive)' }} />
                <span>Positivo (4-5★)</span>
              </div>
              <span className="text-2xl">{positivePercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown size={20} style={{ color: 'var(--sentiment-negative)' }} />
                <span>Negativo (1-2★)</span>
              </div>
              <span className="text-2xl">{negativePercent.toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Distribution */}
      <RatingsDistributionCard distribution={showCurrentRatings ? currentData.distribution : distribution} />

      {/* Detailed Breakdown */}
      <Card className="p-6 rounded-2xl">
        <h3 className="mb-4">Detalhamento de Avaliações</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((stars) => {
            const data = distribution.find(d => d.stars === stars);
            const count = data?.count || 0;
            const percent = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
            
            return (
              <div key={stars} className="text-center p-4 bg-muted rounded-xl">
                <div className="text-3xl mb-2">{stars}★</div>
                <div className="text-2xl mb-1">{count.toLocaleString()}</div>
                <div className="text-muted-foreground">{percent.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}