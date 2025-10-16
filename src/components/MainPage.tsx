import { useState } from "react";
import { AddAppDialog } from "./AddAppDialog";
import { AppSlot } from "./AppSlot";
import { RatingSummaryCard } from "./RatingSummaryCard";
import { RatingsDistributionCard } from "./RatingsDistributionCard";
import { ReviewsList } from "./ReviewsList";
import { ComparisonView } from "./ComparisonView";
import { getAppDetails, AppResult, AppDetails } from "../utils/api";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, SlidersHorizontal, LayoutGrid, LayoutList } from "lucide-react";

export function MainPage() {
  // App slots
  const [appStoreData, setAppStoreData] = useState<AppDetails | null>(null);
  const [playStoreData, setPlayStoreData] = useState<AppDetails | null>(null);
  
  // Loading states
  const [isLoadingAppStore, setIsLoadingAppStore] = useState(false);
  const [isLoadingPlayStore, setIsLoadingPlayStore] = useState(false);
  
  // Dialog states
  const [showAppStoreDialog, setShowAppStoreDialog] = useState(false);
  const [showPlayStoreDialog, setShowPlayStoreDialog] = useState(false);
  
  // View mode
  const [viewMode, setViewMode] = useState<"individual" | "comparison">("individual");
  
  // Individual view - which store to show
  const [selectedStore, setSelectedStore] = useState<"appstore" | "playstore">("appstore");
  
  // Review filters
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAppStoreSelect = async (app: AppResult) => {
    setIsLoadingAppStore(true);
    try {
      const appData = await getAppDetails(app.store, app.id);
      setAppStoreData(appData);
    } catch (err) {
      console.error("Error loading app:", err);
    } finally {
      setIsLoadingAppStore(false);
    }
  };

  const handlePlayStoreSelect = async (app: AppResult) => {
    setIsLoadingPlayStore(true);
    try {
      const appData = await getAppDetails(app.store, app.id);
      setPlayStoreData(appData);
    } catch (err) {
      console.error("Error loading app:", err);
    } finally {
      setIsLoadingPlayStore(false);
    }
  };

  // Get current data for individual view
  const currentData = selectedStore === "appstore" ? appStoreData : playStoreData;

  // Filter reviews for individual view
  let filteredReviews = currentData?.reviews.map(r => ({
    ...r,
    date: new Date(r.date),
  })) || [];

  // Apply filters
  if (ratingFilter !== "all") {
    const rating = parseInt(ratingFilter);
    filteredReviews = filteredReviews.filter(r => r.rating === rating);
  }

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

  const hasAnyApp = appStoreData || playStoreData;
  const hasBothApps = appStoreData && playStoreData;

  return (
    <div className="space-y-6">
      <div>
        <h1>App Reviews Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Add apps to analyze their ratings and reviews
        </p>
      </div>

      {/* App Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppSlot
          store="appstore"
          appData={appStoreData}
          isLoading={isLoadingAppStore}
          onAddClick={() => setShowAppStoreDialog(true)}
          onRemoveClick={() => setAppStoreData(null)}
        />
        <AppSlot
          store="playstore"
          appData={playStoreData}
          isLoading={isLoadingPlayStore}
          onAddClick={() => setShowPlayStoreDialog(true)}
          onRemoveClick={() => setPlayStoreData(null)}
        />
      </div>

      {/* View Mode Toggle (only show if at least one app is added) */}
      {hasAnyApp && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "individual" ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              onClick={() => setViewMode("individual")}
            >
              <LayoutList size={16} className="mr-2" />
              Individual
            </Button>
            {hasBothApps && (
              <Button
                variant={viewMode === "comparison" ? "default" : "outline"}
                size="sm"
                className="rounded-xl"
                onClick={() => setViewMode("comparison")}
              >
                <LayoutGrid size={16} className="mr-2" />
                Comparison
              </Button>
            )}
          </div>

          {/* Store selector for individual view */}
          {viewMode === "individual" && hasBothApps && (
            <Select value={selectedStore} onValueChange={(v) => setSelectedStore(v as "appstore" | "playstore")}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appstore">App Store</SelectItem>
                <SelectItem value="playstore">Google Play</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === "comparison" && hasBothApps ? (
        <ComparisonView 
          appStoreData={appStoreData}
          playStoreData={playStoreData}
        />
      ) : currentData && viewMode === "individual" ? (
        <>
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RatingSummaryCard 
              averageRating={currentData.app.averageRating}
              totalReviews={currentData.app.totalReviews}
            />
            <RatingsDistributionCard distribution={currentData.distribution} />
          </div>

          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2>All Reviews</h2>
              <p className="text-muted-foreground">
                {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Review Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
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

            {filteredReviews.length > 0 ? (
              <ReviewsList reviews={filteredReviews} showAll />
            ) : (
              <Card className="p-8 rounded-2xl text-center">
                <p className="text-muted-foreground">
                  No reviews match your filters.
                </p>
              </Card>
            )}
          </div>
        </>
      ) : !hasAnyApp ? (
        <Card className="p-12 rounded-2xl text-center">
          <h3 className="mb-2">No Apps Added</h3>
          <p className="text-muted-foreground">
            Click "Add App" on any slot above to get started
          </p>
        </Card>
      ) : null}

      {/* Add App Dialogs */}
      <AddAppDialog
        open={showAppStoreDialog}
        onClose={() => setShowAppStoreDialog(false)}
        store="appstore"
        onAppSelect={handleAppStoreSelect}
      />
      <AddAppDialog
        open={showPlayStoreDialog}
        onClose={() => setShowPlayStoreDialog(false)}
        store="playstore"
        onAppSelect={handlePlayStoreSelect}
      />
    </div>
  );
}
