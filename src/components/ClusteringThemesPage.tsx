import { Card } from "./ui/card";
import { DateRangeFilter, filterReviewsByDateRange, DateRange } from "./DateRangeFilter";
import { VersionFilter, filterReviewsByVersion } from "./VersionFilter";
import { useState, useMemo, useEffect } from "react";
import type { AppDetails } from "../utils/api";
import { Badge } from "./ui/badge";
import { ChevronDown, ChevronUp, Loader2, AlertCircle, Download } from "lucide-react";
import { StarRating } from "./StarRating";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { extractThemeClusters, ThemeCluster } from "../utils/clusteringAnalyzer";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";

interface ClusteringThemesPageProps {
  appStoreData: AppDetails | null;
  playStoreData: AppDetails | null;
}

export function ClusteringThemesPage({ appStoreData, playStoreData }: ClusteringThemesPageProps) {
  const [dateRange, setDateRange] = useState<DateRange>("1year");
  const [versionFilter, setVersionFilter] = useState("all");
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set());
  const [themeClusters, setThemeClusters] = useState<ThemeCluster[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const currentData = appStoreData || playStoreData;

  const exportToCSV = () => {
    if (!themeClusters || themeClusters.length === 0 || !currentData) return;

    // Create CSV header
    const headers = [
      'Tema',
      'Descrição',
      'Total de Reviews',
      'Avaliação Média',
      'Sentimento Positivo',
      'Sentimento Neutro',
      'Sentimento Negativo',
      'Reviews'
    ];

    // Create CSV rows
    const rows = themeClusters.map(cluster => {
      const reviewsText = cluster.reviews
        .map(r => `"${r.author}: [${r.rating}★] ${r.text.replace(/"/g, '""')}"`)
        .join('; ');
      
      return [
        `"${cluster.theme}"`,
        `"${cluster.description}"`,
        cluster.count,
        cluster.avgRating.toFixed(2),
        cluster.sentiment.positive,
        cluster.sentiment.neutral,
        cluster.sentiment.negative,
        reviewsText
      ];
    });

    // Combine header and rows
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `temas-${currentData.app.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentData) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Análise por Temas</h1>
          <p className="text-muted-foreground mt-2">
            Adicione um app para ver análise de temas
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

  const allReviews = useMemo(() => 
    currentData?.reviews.map(r => ({
      ...r,
      date: new Date(r.date),
    })) || [],
    [currentData]
  );

  const filteredReviews = useMemo(() => {
    let reviews = filterReviewsByDateRange(allReviews, dateRange);
    reviews = filterReviewsByVersion(reviews, versionFilter);
    return reviews;
  }, [allReviews, dateRange, versionFilter]);

  const analyzeThemes = async () => {
    if (filteredReviews.length === 0) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const clusters = await extractThemeClusters(filteredReviews, projectId, publicAnonKey);
      setThemeClusters(clusters);
      setHasAnalyzed(true);
    } catch (err) {
      console.error('Failed to analyze themes:', err);
      
      // Check if it's an API key configuration error
      const errorMessage = err instanceof Error ? err.message : 'Erro ao analisar temas. Tente novamente.';
      
      if (errorMessage.includes('not configured') || errorMessage.includes('API key') || errorMessage.includes('GEMINI') || errorMessage.includes('OPENAI')) {
        setError('Configure GEMINI_API_KEY (gratuito) ou OPENAI_API_KEY nas variáveis de ambiente do Supabase para usar análise de temas com IA.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when filters change (after initial analysis)
  useEffect(() => {
    if (hasAnalyzed && filteredReviews.length > 0) {
      analyzeThemes();
    }
  }, [filteredReviews]);

  const toggleTheme = (theme: string) => {
    setExpandedThemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(theme)) {
        newSet.delete(theme);
      } else {
        newSet.add(theme);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Análise por Temas</h1>
        <p className="text-muted-foreground mt-2">
          Agrupamento de reviews por assunto principal em {currentData.app.name}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap gap-3">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <VersionFilter 
            reviews={allReviews}
            value={versionFilter}
            onChange={setVersionFilter}
          />
        </div>
        
        {!hasAnalyzed && (
          <Button 
            onClick={analyzeThemes}
            disabled={isAnalyzing || filteredReviews.length === 0}
            className="rounded-xl"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              'Analisar Temas com IA'
            )}
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2 flex flex-col gap-3">
            <div>{error}</div>
            {(error.includes('Cota') || error.includes('OpenAI') || error.includes('API key') || error.includes('not configured')) && (
              <div className="text-sm bg-accent p-4 rounded-lg border border-primary/20">
                <strong className="text-primary">✨ Solução: Use Gemini (GRATUITO)</strong>
                <div className="mt-3 space-y-3">
                  <div className="bg-background/80 p-3 rounded-md">
                    <p className="font-medium mb-2 flex items-center gap-2">
                      <span className="text-green-600">✓</span> Configure o Gemini em 3 passos:
                    </p>
                    <ol className="list-decimal ml-6 space-y-2 text-sm">
                      <li>
                        Obtenha chave gratuita em:{" "}
                        <a 
                          href="https://aistudio.google.com/app/apikey" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="underline font-medium text-primary hover:text-primary/80"
                        >
                          Google AI Studio
                        </a>
                      </li>
                      <li>
                        Acesse seu projeto Supabase:<br />
                        <span className="text-muted-foreground">Dashboard → Edge Functions → Environment Variables</span>
                      </li>
                      <li>
                        Adicione a variável:{" "}
                        <code className="bg-primary/10 px-2 py-1 rounded text-primary font-mono">
                          GEMINI_API_KEY
                        </code>
                      </li>
                    </ol>
                  </div>
                  
                  {error.includes('Cota') && (
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 p-3 rounded-md">
                      <p className="text-sm">
                        <strong>Nota:</strong> O Gemini tem limite gratuito de <strong>15 requests/minuto</strong> e <strong>1M tokens/dia</strong>, 
                        mais que suficiente para análise de reviews! 🎉
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {!error.includes('Cota') && !error.includes('OpenAI') && !error.includes('API key') && !error.includes('not configured') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={analyzeThemes}
                className="rounded-lg self-start"
              >
                Tentar Novamente
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="p-12 rounded-2xl text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="mb-2">Analisando reviews com IA...</h3>
          <p className="text-muted-foreground">
            Descobrindo temas automaticamente a partir de {filteredReviews.length} reviews
          </p>
        </Card>
      )}

      {/* Initial State - No Analysis Yet */}
      {!hasAnalyzed && !isAnalyzing && (
        <Card className="p-12 rounded-2xl text-center">
          <div className="max-w-lg mx-auto">
            <h3 className="mb-2">Análise Inteligente de Temas</h3>
            <p className="text-muted-foreground mb-6">
              Use IA para descobrir automaticamente os principais temas discutidos nos reviews. 
              Os temas são gerados dinamicamente com base no conteúdo real das avaliações.
            </p>
            <Button 
              onClick={analyzeThemes}
              disabled={filteredReviews.length === 0}
              size="lg"
              className="rounded-xl"
            >
              Iniciar Análise ({filteredReviews.length} reviews)
            </Button>
          </div>
        </Card>
      )}

      {/* Theme Cards */}
      {hasAnalyzed && !isAnalyzing && themeClusters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {themeClusters.length} temas identificados • {filteredReviews.length} reviews analisados
            </p>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        {themeClusters.map((cluster) => {
          const total = cluster.sentiment.positive + cluster.sentiment.neutral + cluster.sentiment.negative;
          const positivePercent = total > 0 ? (cluster.sentiment.positive / total) * 100 : 0;
          const neutralPercent = total > 0 ? (cluster.sentiment.neutral / total) * 100 : 0;
          const negativePercent = total > 0 ? (cluster.sentiment.negative / total) * 100 : 0;
          
          const dominantSentiment = 
            positivePercent > neutralPercent && positivePercent > negativePercent ? 'positive' :
            negativePercent > positivePercent && negativePercent > neutralPercent ? 'negative' : 'neutral';

          const isExpanded = expandedThemes.has(cluster.theme);

          return (
            <Card key={cluster.theme} className="rounded-2xl overflow-hidden">
              <Collapsible open={isExpanded} onOpenChange={() => toggleTheme(cluster.theme)}>
                <CollapsibleTrigger className="w-full">
                  <div className="p-6 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold">{cluster.theme}</h3>
                          <Badge 
                            variant="secondary" 
                            className="rounded-lg"
                            style={{
                              backgroundColor: dominantSentiment === 'positive' 
                                ? 'var(--sentiment-positive-bg)' 
                                : dominantSentiment === 'negative'
                                ? 'var(--sentiment-negative-bg)'
                                : 'var(--sentiment-neutral-bg)',
                              color: dominantSentiment === 'positive' 
                                ? 'var(--sentiment-positive)' 
                                : dominantSentiment === 'negative'
                                ? 'var(--sentiment-negative)'
                                : 'var(--sentiment-neutral)',
                            }}
                          >
                            {cluster.count} {cluster.count === 1 ? 'review' : 'reviews'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{cluster.description}</p>

                        {/* Sentiment Distribution Bar */}
                        <div className="mb-3">
                          <div className="flex h-3 rounded-full overflow-hidden">
                            {positivePercent > 0 && (
                              <div 
                                style={{ 
                                  width: `${positivePercent}%`, 
                                  backgroundColor: 'var(--sentiment-positive)' 
                                }}
                              />
                            )}
                            {neutralPercent > 0 && (
                              <div 
                                style={{ 
                                  width: `${neutralPercent}%`, 
                                  backgroundColor: 'var(--sentiment-neutral)' 
                                }}
                              />
                            )}
                            {negativePercent > 0 && (
                              <div 
                                style={{ 
                                  width: `${negativePercent}%`, 
                                  backgroundColor: 'var(--sentiment-negative)' 
                                }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <span style={{ color: 'var(--sentiment-positive)' }}>●</span>
                            <span className="text-muted-foreground">
                              {cluster.sentiment.positive} positivo{cluster.sentiment.positive !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ color: 'var(--sentiment-neutral)' }}>●</span>
                            <span className="text-muted-foreground">
                              {cluster.sentiment.neutral} neutro{cluster.sentiment.neutral !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ color: 'var(--sentiment-negative)' }}>●</span>
                            <span className="text-muted-foreground">
                              {cluster.sentiment.negative} negativo{cluster.sentiment.negative !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <StarRating rating={cluster.avgRating} size={16} />
                            <span className="font-medium">{cluster.avgRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent transition-colors">
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-muted-foreground" />
                        ) : (
                          <ChevronDown size={20} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-6 pb-6 pt-0 border-t border-border/50">
                    <div className="space-y-4 mt-4">
                      {cluster.reviews.slice(0, 10).map((review, idx) => (
                        <div 
                          key={`${review.id}-${idx}`}
                          className="p-4 rounded-xl bg-accent/30 border border-border/50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <StarRating rating={review.rating} size={14} />
                              <span className="text-sm font-medium">{review.rating}.0</span>
                            </div>
                            {review.version && (
                              <Badge variant="outline" className="text-xs">
                                v{review.version}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{review.text}</p>
                        </div>
                      ))}
                      
                      {cluster.reviews.length > 10 && (
                        <p className="text-center text-sm text-muted-foreground pt-2">
                          E mais {cluster.reviews.length - 10} review{cluster.reviews.length - 10 !== 1 ? 's' : ''} neste tema
                        </p>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
        </div>
      )}

      {/* No themes found after analysis */}
      {hasAnalyzed && !isAnalyzing && themeClusters.length === 0 && (
        <Card className="p-12 rounded-2xl text-center">
          <p className="text-muted-foreground">
            Nenhum tema encontrado nos reviews selecionados.
          </p>
        </Card>
      )}
    </div>
  );
}
