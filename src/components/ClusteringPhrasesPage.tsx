import { Card } from "./ui/card";
import { DateRangeFilter, filterReviewsByDateRange, DateRange } from "./DateRangeFilter";
import { VersionFilter, filterReviewsByVersion } from "./VersionFilter";
import { useState, useMemo } from "react";
import { extractPhraseClusters } from "../utils/clusteringAnalyzer";
import type { AppDetails } from "../utils/api";
import { Quote, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { StarRating } from "./StarRating";

interface ClusteringPhrasesPageProps {
  appStoreData: AppDetails | null;
  playStoreData: AppDetails | null;
}

export function ClusteringPhrasesPage({ appStoreData, playStoreData }: ClusteringPhrasesPageProps) {
  const [dateRange, setDateRange] = useState<DateRange>("1year");
  const [versionFilter, setVersionFilter] = useState("all");
  const [expandedPhrases, setExpandedPhrases] = useState<Set<string>>(new Set());
  const currentData = appStoreData || playStoreData;

  const togglePhrase = (phrase: string) => {
    setExpandedPhrases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phrase)) {
        newSet.delete(phrase);
      } else {
        newSet.add(phrase);
      }
      return newSet;
    });
  };

  if (!currentData) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Análise por Frases</h1>
          <p className="text-muted-foreground mt-2">
            Adicione um app para ver análise de frases
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

  const phraseClusters = useMemo(() => extractPhraseClusters(reviews), [reviews]);

  return (
    <div className="space-y-6">
      <div>
        <h1>Análise por Frases</h1>
        <p className="text-muted-foreground mt-2">
          Frases e expressões recorrentes nos reviews de {currentData.app.name}
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
          <p className="text-muted-foreground mb-2 font-bold font-normal">Frases Recorrentes</p>
          <p className="text-4xl font-bold">{phraseClusters.length}</p>
        </Card>
        <Card className="p-6 rounded-2xl">
          <p className="text-muted-foreground mb-2 font-bold font-normal">Frase Mais Comum</p>
          <p className="text-sm truncate text-[24px] font-bold">{phraseClusters[0]?.phrase || '-'}</p>
          <p className="text-muted-foreground">{phraseClusters[0]?.count || 0}× repetida</p>
        </Card>
        <Card className="p-6 rounded-2xl">
          <p className="text-muted-foreground mb-2 font-bold font-normal">Reviews Analisados</p>
          <p className="text-4xl font-bold">{reviews.length}</p>
        </Card>
      </div>

      {/* Phrase List */}
      <div className="space-y-4">
        {phraseClusters.map((cluster, index) => {
          const total = cluster.sentiment.positive + cluster.sentiment.neutral + cluster.sentiment.negative;
          const positivePercent = total > 0 ? (cluster.sentiment.positive / total) * 100 : 0;
          const neutralPercent = total > 0 ? (cluster.sentiment.neutral / total) * 100 : 0;
          const negativePercent = total > 0 ? (cluster.sentiment.negative / total) * 100 : 0;
          
          const dominantSentiment = positivePercent > neutralPercent && positivePercent > negativePercent ? 'positive' : negativePercent > positivePercent && negativePercent > neutralPercent ? 'negative' : 'neutral';

          const borderColor = dominantSentiment === 'positive' ? 'var(--sentiment-positive)' : dominantSentiment === 'negative' ? 'var(--sentiment-negative)' : 'var(--sentiment-neutral)';
          const isExpanded = expandedPhrases.has(cluster.phrase);

          return (
            <Collapsible key={index} open={isExpanded} onOpenChange={() => togglePhrase(cluster.phrase)}>
              <Card className="p-6 rounded-2xl border-2" style={{ 
                borderColor: dominantSentiment === 'positive' ? 'color-mix(in srgb, var(--sentiment-positive) 20%, transparent)' : dominantSentiment === 'negative' ? 'color-mix(in srgb, var(--sentiment-negative) 20%, transparent)' : 'color-mix(in srgb, var(--sentiment-neutral) 20%, transparent)',
                backgroundColor: dominantSentiment === 'positive' ? 'color-mix(in srgb, var(--sentiment-positive) 5%, transparent)' : dominantSentiment === 'negative' ? 'color-mix(in srgb, var(--sentiment-negative) 5%, transparent)' : 'color-mix(in srgb, var(--sentiment-neutral) 5%, transparent)'
              }}>
                <CollapsibleTrigger className="w-full text-left">
                  <div className="flex items-start gap-4">
                    <Quote size={24} className="text-muted-foreground flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-lg font-bold flex-1">"{cluster.phrase}"</p>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Repetições:</span>
                          <span className="text-lg font-bold">{cluster.count}×</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Nota Média:</span>
                          <span className="text-lg font-bold">{cluster.avgRating.toFixed(1)}★</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm" style={{ color: 'var(--sentiment-positive)' }}>{cluster.sentiment.positive} pos</span>
                          <span className="text-sm" style={{ color: 'var(--sentiment-neutral)' }}>{cluster.sentiment.neutral} neu</span>
                          <span className="text-sm" style={{ color: 'var(--sentiment-negative)' }}>{cluster.sentiment.negative} neg</span>
                        </div>
                      </div>

                      {/* Sentiment bar */}
                      <div className="flex h-2 rounded-full overflow-hidden mt-3">
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
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-4">
                  <div className="pt-4 border-t space-y-3 ml-10">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Reviews contendo esta frase:
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

      {/* No phrases found */}
      {phraseClusters.length === 0 && (
        <Card className="p-12 rounded-2xl text-center">
          <p className="text-muted-foreground">
            Nenhuma frase recorrente encontrada nos reviews selecionados.
          </p>
        </Card>
      )}
    </div>
  );
}
