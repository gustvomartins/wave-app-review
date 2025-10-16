import { Card } from "./ui/card";
import { DateRangeFilter, filterReviewsByDateRange, DateRange } from "./DateRangeFilter";
import { VersionFilter, filterReviewsByVersion } from "./VersionFilter";
import { useState, useMemo } from "react";
import { extractWordClusters } from "../utils/clusteringAnalyzer";
import type { AppDetails } from "../utils/api";
import { ChartContainer, ChartConfig } from "./ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { StarRating } from "./StarRating";

interface ClusteringWordsPageProps {
  appStoreData: AppDetails | null;
  playStoreData: AppDetails | null;
}

const chartConfig = {
  count: {
    label: "Frequência",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ClusteringWordsPage({ appStoreData, playStoreData }: ClusteringWordsPageProps) {
  const [dateRange, setDateRange] = useState<DateRange>("1year");
  const [versionFilter, setVersionFilter] = useState("all");
  const [expandedWords, setExpandedWords] = useState<Set<string>>(new Set());
  const currentData = appStoreData || playStoreData;

  const toggleWord = (word: string) => {
    setExpandedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  if (!currentData) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Análise por Palavras</h1>
          <p className="text-muted-foreground mt-2">
            Adicione um app para ver análise de palavras
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

  const wordClusters = useMemo(() => extractWordClusters(reviews), [reviews]);

  const chartData = wordClusters.slice(0, 15).map(cluster => ({
    word: cluster.word,
    count: cluster.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1>Análise por Palavras</h1>
        <p className="text-muted-foreground mt-2">
          Palavras mais frequentes nos reviews de {currentData.app.name}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-end gap-3">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        <VersionFilter 
          reviews={allReviews}
          value={versionFilter}
          onChange={setVersionFilter}
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl">
          <p className="text-muted-foreground mb-2">Palavras Únicas</p>
          <p className="text-4xl font-bold">{wordClusters.length}</p>
        </Card>
        <Card className="p-6 rounded-2xl">
          <p className="text-muted-foreground mb-2 font-bold font-normal">Palavra Mais Frequente</p>
          <p className="text-2xl font-bold">{wordClusters[0]?.word || '-'}</p>
          <p className="text-muted-foreground">{wordClusters[0]?.count || 0} menções</p>
        </Card>
        <Card className="p-6 rounded-2xl">
          <p className="text-muted-foreground mb-2">Reviews Analisados</p>
          <p className="text-4xl font-bold">{reviews.length}</p>
        </Card>
      </div>

      {/* Top Words Chart */}
      <Card className="p-6 rounded-2xl">
        <h3 className="mb-4 font-weight-bold font-bold">Top 15 Palavras Mais Frequentes</h3>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis 
                dataKey="word" 
                type="category" 
                width={120}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      {/* Word Details */}
      <div>
        <h2 className="mb-4 font-bold">Análise Detalhada por Palavra</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {wordClusters.slice(0, 20).map((cluster) => {
            const total = cluster.sentiment.positive + cluster.sentiment.neutral + cluster.sentiment.negative;
            const positivePercent = total > 0 ? (cluster.sentiment.positive / total) * 100 : 0;
            const neutralPercent = total > 0 ? (cluster.sentiment.neutral / total) * 100 : 0;
            const negativePercent = total > 0 ? (cluster.sentiment.negative / total) * 100 : 0;
            const isExpanded = expandedWords.has(cluster.word);

            return (
              <Collapsible key={cluster.word} open={isExpanded} onOpenChange={() => toggleWord(cluster.word)}>
                <Card className="p-4 rounded-2xl">
                  <CollapsibleTrigger className="w-full text-left">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold">{cluster.word}</h4>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                      <span className="text-2xl text-muted-foreground font-bold">{cluster.count}</span>
                    </div>
                  </CollapsibleTrigger>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full"
                          style={{ width: `${positivePercent}%`, backgroundColor: 'var(--sentiment-positive)' }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {cluster.sentiment.positive} pos
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full"
                          style={{ width: `${neutralPercent}%`, backgroundColor: 'var(--sentiment-neutral)' }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {cluster.sentiment.neutral} neu
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full"
                          style={{ width: `${negativePercent}%`, backgroundColor: 'var(--sentiment-negative)' }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {cluster.sentiment.negative} neg
                      </span>
                    </div>
                  </div>

                  <CollapsibleContent className="mt-4">
                    <div className="pt-4 border-t space-y-3">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Reviews contendo "{cluster.word}":
                      </p>
                      {cluster.reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <StarRating rating={review.rating} />
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm">{review.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            — {review.author}
                          </p>
                        </div>
                      ))}
                      {cluster.reviews.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          +{cluster.reviews.length - 5} reviews adicionais
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
}
