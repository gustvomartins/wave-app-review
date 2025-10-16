import { Card } from "./ui/card";
import { ChartContainer, ChartConfig } from "./ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { StarRating } from "./StarRating";

interface RatingsDistributionCardProps {
  distribution: {
    stars: number;
    count: number;
  }[];
}

const chartConfig = {
  count: {
    label: "Reviews",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RatingsDistributionCard({ distribution }: RatingsDistributionCardProps) {
  // Sort distribution by stars (5-1, descending)
  const sortedDistribution = [...distribution].sort((a, b) => b.stars - a.stars);
  
  const chartData = sortedDistribution.map(d => ({
    stars: `${d.stars}★`,
    count: d.count,
  }));

  const totalReviews = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3>Distribuição de Avaliações</h3>
        <p className="text-muted-foreground">
          {totalReviews.toLocaleString()} reviews analisados
        </p>
      </div>

      {/* Bar visualization */}
      <div className="space-y-3 mb-6">
        {sortedDistribution.map((item) => {
          const percentage = totalReviews > 0 ? (item.count / totalReviews) * 100 : 0;
          return (
            <div key={item.stars} className="flex items-center gap-3">
              <div className="w-12 flex items-center justify-end">
                <span className="text-muted-foreground">{item.stars}★</span>
              </div>
              <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-chart-1 transition-all duration-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-20 text-right">
                <span className="text-muted-foreground">{item.count.toLocaleString()}</span>
              </div>
              <div className="w-12 text-right">
                <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart visualization */}

    </Card>
  );
}