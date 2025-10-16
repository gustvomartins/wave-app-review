import { Card } from "./ui/card";
import { DateRangeFilter, filterReviewsByDateRange, DateRange } from "./DateRangeFilter";
import { VersionFilter, filterReviewsByVersion } from "./VersionFilter";
import { useState, useMemo } from "react";
import { extractTopicClusters } from "../utils/clusteringAnalyzer";
import type { AppDetails } from "../utils/api";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { StarRating } from "./StarRating";

interface ClusteringTopicsPageProps {
  appStoreData: AppDetails | null;
  playStoreData: AppDetails | null;
}

export function ClusteringTopicsPage({ appStoreData, playStoreData }: ClusteringTopicsPageProps) {
  const [dateRange, setDateRange] = useState<DateRange>("1year");
  const [versionFilter, setVersionFilter] = useState("all");
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const currentData = appStoreData || playStoreData;

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topic)) {
        newSet.delete(topic);
      } else {
        newSet.add(topic);
      }
      return newSet;
    });
  };

  if (!currentData) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Análise por Tópicos</h1>
          <p className="text-muted-foreground mt-2">
            Adicione um app para ver análise de tópicos
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

  const topicClusters = useMemo(() => extractTopicClusters(reviews), [reviews]);

  return (
    <div className="space-y-6">
      <div>
        <h1>Análise por Tópicos</h1>
        <p className="text-muted-foreground mt-2">
          Categorias e temas principais nos reviews de {currentData.app.name}
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

      {/* Topic Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topicClusters.map((cluster) => {
          const total = cluster.sentiment.positive + cluster.sentiment.neutral + cluster.sentiment.negative;
          const positivePercent = total > 0 ? (cluster.sentiment.positive / total) * 100 : 0;
          const neutralPercent = total > 0 ? (cluster.sentiment.neutral / total) * 100 : 0;
          const negativePercent = total > 0 ? (cluster.sentiment.negative / total) * 100 : 0;
          
          const dominantSentiment = 
            positivePercent > neutralPercent && positivePercent > negativePercent ? 'positive' :
            negativePercent > positivePercent && negativePercent > neutralPercent ? 'negative' : 'neutral';

          const isExpanded = expandedTopics.has(cluster.topic);

          return (
            <Collapsible key={cluster.topic} open={isExpanded} onOpenChange={() => toggleTopic(cluster.topic)}>
              <Card className="p-6 rounded-2xl">
                <CollapsibleTrigger className="w-full text-left">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold">{cluster.topic}</h3>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cluster.keywords.slice(0, 5).map(keyword => (
                          <Badge key={keyword} variant="secondary" className="rounded-lg">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-3xl font-bold">{cluster.count}</p>
                      <p className="text-sm text-muted-foreground">menções</p>
                    </div>
                  </div>
                </CollapsibleTrigger>

                {/* Sentiment Distribution */}
                <div className="mb-4">
                  <div className="flex h-4 rounded-full overflow-hidden">
                    {positivePercent > 0 && (
                      <div 
                        style={{ width: `${positivePercent}%`, backgroundColor: 'var(--sentiment-positive)' }}
                      />
                    )}
                    {neutralPercent > 0 && (
                      <div 
                        style={{ width: `${neutralPercent}%`, backgroundColor: 'var(--sentiment-neutral)' }}
                      />
                    )}
                    {negativePercent > 0 && (
                      <div 
                        style={{ width: `${negativePercent}%`, backgroundColor: 'var(--sentiment-negative)' }}
                      />
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-2 text-sm">
                    <span style={{ color: 'var(--sentiment-positive)' }}>{positivePercent.toFixed(0)}% positivo</span>
                    <span style={{ color: 'var(--sentiment-neutral)' }}>{neutralPercent.toFixed(0)}% neutro</span>
                    <span style={{ color: 'var(--sentiment-negative)' }}>{negativePercent.toFixed(0)}% negativo</span>
                  </div>
                </div>

                {/* Average Rating */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Nota Média</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{cluster.avgRating.toFixed(1)}★</span>
                    {dominantSentiment === 'positive' && <TrendingUp size={18} style={{ color: 'var(--sentiment-positive)' }} />}
                    {dominantSentiment === 'negative' && <TrendingDown size={18} style={{ color: 'var(--sentiment-negative)' }} />}
                    {dominantSentiment === 'neutral' && <Minus size={18} style={{ color: 'var(--sentiment-neutral)' }} />}
                  </div>
                </div>

                <CollapsibleContent className="mt-4">
                  <div className="pt-4 border-t space-y-3">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Reviews relacionados a "{cluster.topic}":
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

      {/* No topics found */}
      {topicClusters.length === 0 && (
        <Card className="p-12 rounded-2xl text-center">
          <p className="text-muted-foreground">
            Nenhum tópico encontrado nos reviews selecionados.
          </p>
        </Card>
      )}
    </div>
  );
}
