import { AppSearchBar } from "./AppSearchBar";
import { AppDetailsCard } from "./AppDetailsCard";
import { RatingSummaryCard } from "./RatingSummaryCard";
import { RatingsDistributionCard } from "./RatingsDistributionCard";
import { ReviewsList } from "./ReviewsList";
import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { searchApps, getAppDetails, AppResult, AppDetails } from "../utils/api";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

interface DashboardPageProps {
  onNavigateToReviews: () => void;
  onAppSelected?: (appData: AppDetails) => void;
}

export function DashboardPage({ onNavigateToReviews, onAppSelected }: DashboardPageProps) {
  const [searchResults, setSearchResults] = useState<AppResult[]>([]);
  const [selectedAppData, setSelectedAppData] = useState<AppDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    setSelectedAppData(null);
    setHasSearched(true);

    try {
      console.log("Searching for:", query);
      const results = await searchApps(query);
      setSearchResults(results);

      if (results.length === 0) {
        setError("No apps found. Try a different search term.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Failed to search apps");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectApp = async (app: AppResult) => {
    setIsLoadingApp(true);
    setError(null);

    try {
      console.log("Loading app details:", app.id);
      const appData = await getAppDetails(app.store, app.id);
      setSelectedAppData(appData);
      setSearchResults([]);
      
      if (onAppSelected) {
        onAppSelected(appData);
      }
    } catch (err) {
      console.error("App details error:", err);
      setError(err instanceof Error ? err.message : "Failed to load app details");
    } finally {
      setIsLoadingApp(false);
    }
  };

  // Convert date strings to Date objects for reviews
  const reviewsWithDates = selectedAppData?.reviews.map(r => ({
    ...r,
    date: new Date(r.date),
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Search for an app and view its ratings and reviews
        </p>
      </div>

      <AppSearchBar onSearch={handleSearch} />

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {searchResults.length > 0 && (
        <div>
          <h2 className="mb-4">Search Results</h2>
          <div className="grid gap-4">
            {searchResults.map((app) => (
              <Card 
                key={app.id} 
                className="p-4 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleSelectApp(app)}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={app.icon} 
                    alt={app.name}
                    className="w-16 h-16 rounded-xl shadow-sm"
                  />
                  <div className="flex-1">
                    <h3>{app.name}</h3>
                    <p className="text-muted-foreground">{app.developer}</p>
                    <p className="text-muted-foreground mt-1">{app.store}</p>
                  </div>
                  <ArrowRight size={20} className="text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isLoadingApp && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="animate-spin text-primary mx-auto mb-4" size={32} />
            <p className="text-muted-foreground">Loading app details and reviews...</p>
            <p className="text-muted-foreground mt-2">This may take a moment for apps with many reviews</p>
          </div>
        </div>
      )}

      {selectedAppData && !isLoadingApp && (
        <>
          <AppDetailsCard app={selectedAppData.app} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RatingSummaryCard 
              averageRating={selectedAppData.app.averageRating}
              totalReviews={selectedAppData.app.totalReviews}
            />
            <RatingsDistributionCard distribution={selectedAppData.distribution} />
          </div>

          {reviewsWithDates.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2>Recent Reviews</h2>
                  <p className="text-muted-foreground mt-1">
                    Showing {Math.min(5, reviewsWithDates.length)} of {reviewsWithDates.length} fetched reviews
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  className="rounded-xl"
                  onClick={onNavigateToReviews}
                >
                  View all {reviewsWithDates.length} reviews
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
              <ReviewsList reviews={reviewsWithDates} />
            </div>
          ) : (
            <Card className="p-8 rounded-2xl text-center">
              <p className="text-muted-foreground">No reviews available for this app yet.</p>
            </Card>
          )}
        </>
      )}

      {hasSearched && !isSearching && !selectedAppData && searchResults.length === 0 && !error && (
        <Card className="p-12 rounded-2xl text-center">
          <p className="text-muted-foreground">
            Enter an app name to search for reviews
          </p>
        </Card>
      )}
    </div>
  );
}