import { RatingSummaryCard } from "./RatingSummaryCard";
import { RatingsDistributionCard } from "./RatingsDistributionCard";
import { ReviewsList } from "./ReviewsList";
import { Card } from "./ui/card";
import { DateRangeFilter, filterReviewsByDateRange, DateRange } from "./DateRangeFilter";
import { VersionFilter, filterReviewsByVersion } from "./VersionFilter";
import { useState, useMemo } from "react";
import type { AppDetails } from "../utils/api";

interface SummaryPageProps {
  appStoreData: AppDetails | null;
  playStoreData: AppDetails | null;
}

export function SummaryPage({ appStoreData, playStoreData }: SummaryPageProps) {
  const [dateRange, setDateRange] = useState<DateRange>("1year");
  const [versionFilter, setVersionFilter] = useState("all");
  const currentData = appStoreData || playStoreData;
  
  // When "all time" or "1 year" is selected with all versions, show store ratings
  const showCurrentRatings = (dateRange === "all" || dateRange === "1year") && versionFilter === "all";

  if (!currentData) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Resumo</h1>
          <p className="text-muted-foreground mt-2">
            Adicione um app para ver o resumo de análises
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

  const filteredDistribution = useMemo(() => {
    return [1, 2, 3, 4, 5].map(stars => ({
      stars,
      count: reviews.filter(r => r.rating === stars).length,
    }));
  }, [reviews]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  return (
    <div className="space-y-6">
      <div>
        <h1>Resumo</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral de {currentData.app.name}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="flex gap-3">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <VersionFilter 
            reviews={allReviews}
            value={versionFilter}
            onChange={setVersionFilter}
          />
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RatingSummaryCard 
          averageRating={showCurrentRatings ? currentData.app.averageRating : averageRating}
          totalReviews={showCurrentRatings ? currentData.app.totalReviews : reviews.length}
          showStoreRatings={showCurrentRatings}
        />
        <RatingsDistributionCard distribution={showCurrentRatings ? currentData.distribution : filteredDistribution} />
      </div>

      {/* App Info Card */}
      <Card className="p-6 rounded-2xl">
        <h3 className="mb-4">Informações do App</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <img 
              src={currentData.app.icon} 
              alt={currentData.app.name}
              className="w-16 h-16 rounded-xl shadow-sm"
            />
            <div>
              <h4>{currentData.app.name}</h4>
              <p className="text-muted-foreground mt-1">{currentData.app.developer}</p>
              <a 
                href={currentData.app.storeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline mt-2 inline-block"
              >
                Ver na {currentData.app.store}
              </a>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-muted-foreground">Total de Reviews</p>
              <p className="text-2xl">{currentData.app.totalReviews.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reviews Obtidos</p>
              <p className="text-2xl">{reviews.length.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Version and Country Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version Breakdown */}
        <Card className="p-6 rounded-2xl">
          <h3 className="mb-4 font-bold">Distribuição por Versão</h3>
          <div className="space-y-3">
            {(() => {
              const versionCounts = reviews.reduce((acc, r) => {
                const version = r.version || 'Desconhecida';
                acc[version] = (acc[version] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              const sorted = Object.entries(versionCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);
              
              if (sorted.length === 0) {
                return <p className="text-muted-foreground text-center py-4">Nenhum dado de versão disponível</p>;
              }
              
              return sorted.map(([version, count]) => {
                const percent = (count / reviews.length) * 100;
                return (
                  <div key={version} className="flex items-center gap-3">
                    <div className="w-24 truncate">
                      <span>{version}</span>
                    </div>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-chart-1 transition-all duration-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="w-16 text-right">
                      <span>{count}</span>
                    </div>
                    <div className="w-12 text-right text-muted-foreground">
                      <span>{percent.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </Card>

        {/* Country Breakdown */}
        <Card className="p-6 rounded-2xl">
          <h3 className="mb-4">Avaliações por país</h3>
          <div className="space-y-3">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Atualmente apresentando dados do Brasil
              </p>
              <p className="text-muted-foreground mt-2">
                {reviews.length} reviews analizadas
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Reviews Preview */}
      <div>
        <h2 className="mb-4 font-bold">Recent Reviews</h2>
        {reviews.length > 0 ? (
          <ReviewsList reviews={reviews.slice(0, 5)} />
        ) : (
          <Card className="p-8 rounded-2xl text-center">
            <p className="text-muted-foreground">No reviews available</p>
          </Card>
        )}
      </div>
    </div>
  );
}