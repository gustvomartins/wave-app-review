import { ReviewsList } from "./ReviewsList";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { DateRangeFilter, filterReviewsByDateRange, DateRange } from "./DateRangeFilter";
import { VersionFilter, filterReviewsByVersion } from "./VersionFilter";
import { useState, useMemo } from "react";
import type { AppDetails } from "../utils/api";

interface ReviewsPageNewProps {
  appStoreData: AppDetails | null;
  playStoreData: AppDetails | null;
}

export function ReviewsPageNew({ appStoreData, playStoreData }: ReviewsPageNewProps) {
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("1year");
  const [versionFilter, setVersionFilter] = useState("all");

  const currentData = appStoreData || playStoreData;

  if (!currentData) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Reviews</h1>
          <p className="text-muted-foreground mt-2">
            Adicione um app para ver seus reviews
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

  // Apply date range filter first
  let reviews = useMemo(
    () => filterReviewsByDateRange(allReviews, dateRange),
    [allReviews, dateRange]
  );

  // Apply version filter
  reviews = useMemo(
    () => filterReviewsByVersion(reviews, versionFilter),
    [reviews, versionFilter]
  );

  // Apply rating filter
  if (ratingFilter !== "all") {
    const rating = parseInt(ratingFilter);
    reviews = reviews.filter(r => r.rating === rating);
  }

  if (searchQuery) {
    reviews = reviews.filter(r => 
      r.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply sorting
  if (sortBy === "recent") {
    reviews.sort((a, b) => b.date.getTime() - a.date.getTime());
  } else if (sortBy === "highest") {
    reviews.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "lowest") {
    reviews.sort((a, b) => a.rating - b.rating);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Reviews</h1>
        <p className="text-muted-foreground mt-2">
          Todos os reviews de {currentData.app.name}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Buscar reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-card border-border rounded-xl"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          
          <VersionFilter 
            reviews={allReviews}
            value={versionFilter}
            onChange={setVersionFilter}
          />
          
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl">
              <SlidersHorizontal size={16} className="mr-2" />
              <SelectValue placeholder="Filtrar por nota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Notas</SelectItem>
              <SelectItem value="5">5 Estrelas</SelectItem>
              <SelectItem value="4">4 Estrelas</SelectItem>
              <SelectItem value="3">3 Estrelas</SelectItem>
              <SelectItem value="2">2 Estrelas</SelectItem>
              <SelectItem value="1">1 Estrela</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais Recentes</SelectItem>
              <SelectItem value="highest">Maior Nota</SelectItem>
              <SelectItem value="lowest">Menor Nota</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews Count */}
      <p className="text-muted-foreground">
        Mostrando {reviews.length} review{reviews.length !== 1 ? 's' : ''}
      </p>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <ReviewsList reviews={reviews} showAll />
      ) : (
        <Card className="p-8 rounded-2xl text-center">
          <p className="text-muted-foreground">
            Nenhum review corresponde aos seus filtros.
          </p>
        </Card>
      )}
    </div>
  );
}