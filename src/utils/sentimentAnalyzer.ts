export type Sentiment = "positive" | "neutral" | "negative";

export interface SentimentResult {
  sentiment: Sentiment;
  score: number; // -1 to 1
}

const positiveKeywords = [
  'love', 'great', 'awesome', 'excellent', 'perfect', 'amazing', 'best', 
  'fantastic', 'wonderful', 'good', 'nice', 'helpful', 'easy', 'beautiful',
  'amo', 'ótimo', 'excelente', 'perfeito', 'maravilhoso', 'melhor', 'bom',
  'incrível', 'fantástico', 'útil', 'fácil', 'lindo', 'adorei', 'amei'
];

const negativeKeywords = [
  'hate', 'bad', 'terrible', 'awful', 'horrible', 'worst', 'poor', 'crash',
  'bug', 'broken', 'slow', 'useless', 'waste', 'disappointed', 'frustrated',
  'odeio', 'ruim', 'péssimo', 'horrível', 'pior', 'lixo', 'travando', 
  'bug', 'quebrado', 'lento', 'inútil', 'decepcionado', 'frustrado'
];

export function analyzeSentiment(text: string, rating: number): SentimentResult {
  const lowerText = text.toLowerCase();
  
  // Count keyword matches
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const keyword of positiveKeywords) {
    if (lowerText.includes(keyword)) positiveCount++;
  }
  
  for (const keyword of negativeKeywords) {
    if (lowerText.includes(keyword)) negativeCount++;
  }
  
  // Calculate score based on rating and keywords
  let score = 0;
  
  // Rating contributes 70% to sentiment
  if (rating >= 4) {
    score += 0.7;
  } else if (rating === 3) {
    score += 0;
  } else {
    score -= 0.7;
  }
  
  // Keywords contribute 30%
  const keywordScore = (positiveCount - negativeCount) / 10;
  score += Math.max(-0.3, Math.min(0.3, keywordScore));
  
  // Determine sentiment
  let sentiment: Sentiment;
  if (score > 0.2) {
    sentiment = "positive";
  } else if (score < -0.2) {
    sentiment = "negative";
  } else {
    sentiment = "neutral";
  }
  
  return { sentiment, score };
}

export function calculateOverallSentiment(reviews: Array<{ text: string; rating: number }>): {
  positive: number;
  neutral: number;
  negative: number;
  averageScore: number;
} {
  if (reviews.length === 0) {
    return { positive: 0, neutral: 0, negative: 0, averageScore: 0 };
  }
  
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let totalScore = 0;
  
  for (const review of reviews) {
    const result = analyzeSentiment(review.text, review.rating);
    totalScore += result.score;
    
    if (result.sentiment === "positive") positive++;
    else if (result.sentiment === "neutral") neutral++;
    else negative++;
  }
  
  return {
    positive,
    neutral,
    negative,
    averageScore: totalScore / reviews.length,
  };
}