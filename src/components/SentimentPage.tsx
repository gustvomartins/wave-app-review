import { Card } from "./ui/card";
import { ChartContainer, ChartConfig } from "./ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { DateRangeFilter, filterReviewsByDateRange, DateRange } from "./DateRangeFilter";
import { VersionFilter, filterReviewsByVersion } from "./VersionFilter";
import { useState, useMemo } from "react";
import { analyzeSentiment, calculateOverallSentiment } from "../utils/sentimentAnalyzer";
import { Smile, Meh, Frown } from "lucide-react";
import type { AppDetails } from "../utils/api";

interface SentimentPageProps {
  appStoreData: AppDetails | null;
  playStoreData: AppDetails | null;
}

const chartConfig = {
  positive: {
    label: "Positivo",
    color: "hsl(var(--sentiment-positive))",
  },
  neutral: {
    label: "Neutro",
    color: "hsl(var(--sentiment-neutral))",
  },
  negative: {
    label: "Negativo",
    color: "hsl(var(--sentiment-negative))",
  },
} satisfies ChartConfig;

const COLORS = {
  positive: "var(--sentiment-positive)",
  neutral: "var(--sentiment-neutral)",
  negative: "var(--sentiment-negative)",
};

export function SentimentPage({ appStoreData, playStoreData }: SentimentPageProps) {
  const [dateRange, setDateRange] = useState<DateRange>("1year");
  const [versionFilter, setVersionFilter] = useState("all");
  const currentData = appStoreData || playStoreData;

  if (!currentData) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Análise de Sentimento</h1>
          <p className="text-muted-foreground mt-2">
            Adicione um app para ver análise de sentimento
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

  // Calculate overall sentiment
  const overallSentiment = useMemo(() => calculateOverallSentiment(reviews), [reviews]);

  // Sentiment timeline - group by month for "all time", by week for shorter periods
  const timelineData = useMemo(() => {
    const grouped = new Map<string, { positive: number; neutral: number; negative: number; dateObj: Date }>();
    
    // Determine grouping strategy based on date range
    const shouldGroupByMonth = dateRange === "all" || dateRange === "1year" || dateRange === "6months";
    
    reviews.forEach(review => {
      let groupKey: string;
      let displayDate: Date;
      
      if (shouldGroupByMonth) {
        // Group by month
        const monthStart = new Date(review.date);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        groupKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
        displayDate = monthStart;
      } else {
        // Group by week
        const weekStart = new Date(review.date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        groupKey = weekStart.toISOString().split('T')[0];
        displayDate = weekStart;
      }
      
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, { positive: 0, neutral: 0, negative: 0, dateObj: displayDate });
      }
      
      const result = analyzeSentiment(review.text, review.rating);
      const group = grouped.get(groupKey)!;
      group[result.sentiment]++;
    });
    
    return Array.from(grouped.entries())
      .map(([key, data]) => ({
        date: shouldGroupByMonth 
          ? data.dateObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
          : data.dateObj.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        positive: data.positive,
        neutral: data.neutral,
        negative: data.negative,
        sortKey: data.dateObj.getTime(),
      }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ date, positive, neutral, negative }) => ({ date, positive, neutral, negative }));
  }, [reviews, dateRange]);

  // Sentiment breakdown by rating
  const sentimentByRating = useMemo(() => {
    const breakdown = [1, 2, 3, 4, 5].map(rating => {
      const ratingReviews = reviews.filter(r => r.rating === rating);
      const sentiment = calculateOverallSentiment(ratingReviews);
      
      return {
        rating: `${rating}★`,
        positive: sentiment.positive,
        neutral: sentiment.neutral,
        negative: sentiment.negative,
      };
    });
    
    return breakdown;
  }, [reviews]);

  // Sentiment volume over time
  const volumeData = useMemo(() => {
    return [
      { name: 'Positive', value: overallSentiment.positive, color: COLORS.positive },
      { name: 'Neutral', value: overallSentiment.neutral, color: COLORS.neutral },
      { name: 'Negative', value: overallSentiment.negative, color: COLORS.negative },
    ];
  }, [overallSentiment]);

  const totalReviews = reviews.length;
  const positivePercent = totalReviews > 0 ? (overallSentiment.positive / totalReviews) * 100 : 0;
  const neutralPercent = totalReviews > 0 ? (overallSentiment.neutral / totalReviews) * 100 : 0;
  const negativePercent = totalReviews > 0 ? (overallSentiment.negative / totalReviews) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1>Análise de Sentimento</h1>
        <p className="text-muted-foreground mt-2">
          Análise de sentimento com IA para {currentData.app.name}
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

      {/* Overall Sentiment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl border-2 border-[var(--sentiment-positive)]/20 bg-[var(--sentiment-positive)]/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Positivo</p>
              <p className="text-4xl mb-1">{overallSentiment.positive}</p>
              <p className="text-muted-foreground">{positivePercent.toFixed(1)}%</p>
            </div>
            <Smile size={32} style={{ color: 'var(--sentiment-positive)' }} />
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-2 border-[var(--sentiment-neutral)]/20 bg-[var(--sentiment-neutral)]/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Neutro</p>
              <p className="text-4xl mb-1">{overallSentiment.neutral}</p>
              <p className="text-muted-foreground">{neutralPercent.toFixed(1)}%</p>
            </div>
            <Meh size={32} style={{ color: 'var(--sentiment-neutral)' }} />
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-2 border-[var(--sentiment-negative)]/20 bg-[var(--sentiment-negative)]/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Negativo</p>
              <p className="text-4xl mb-1">{overallSentiment.negative}</p>
              <p className="text-muted-foreground">{negativePercent.toFixed(1)}%</p>
            </div>
            <Frown size={32} style={{ color: 'var(--sentiment-negative)' }} />
          </div>
        </Card>
      </div>

      {/* Sentiment Timeline */}
      <Card className="p-6 rounded-2xl">
        <h3 className="mb-4 font-bold">Linha do Tempo de Sentimento</h3>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Quantidade', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '8px' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    positive: 'Positivo',
                    neutral: 'Neutro',
                    negative: 'Negativo'
                  };
                  return labels[value] || value;
                }}
              />
              <Line type="monotone" dataKey="positive" stroke={COLORS.positive} strokeWidth={2} name="Positivo" />
              <Line type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={2} name="Neutro" />
              <Line type="monotone" dataKey="negative" stroke={COLORS.negative} strokeWidth={2} name="Negativo" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Sentiment Pie Chart */}
        <Card className="p-6 rounded-2xl">
          <h3 className="mb-4 font-bold">Distribuição Geral de Sentimento</h3>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={volumeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {volumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
        {/* Sentiment Breakdown by Rating */}
        <Card className="p-6 rounded-2xl">
          <h3 className="mb-4 font-bold">Sentimento por Avaliação</h3>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentByRating}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="rating" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="positive" stackId="a" fill={COLORS.positive} radius={[8, 8, 0, 0]} />
                <Bar dataKey="neutral" stackId="a" fill={COLORS.neutral} />
                <Bar dataKey="negative" stackId="a" fill={COLORS.negative} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </div>
    </div>
  );
}