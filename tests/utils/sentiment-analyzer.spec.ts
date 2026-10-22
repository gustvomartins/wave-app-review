import { analyzeSentiment, calculateOverallSentiment } from '@/utils';

describe('analyzeSentiment', () => {
  it('classifies high ratings with positive keywords as positive', () => {
    const result = analyzeSentiment('Great app, I love it', 5);

    expect(result.sentiment).toBe('positive');
    expect(result.score).toBeCloseTo(0.9);
  });

  it('classifies low ratings with negative keywords as negative', () => {
    const result = analyzeSentiment('Terrible, keeps travando', 1);

    expect(result.sentiment).toBe('negative');
    expect(result.score).toBeLessThan(-0.7);
  });

  it('classifies a neutral rating without keywords as neutral', () => {
    expect(analyzeSentiment('Faz o que promete', 3)).toEqual({ sentiment: 'neutral', score: 0 });
  });

  it('caps the keyword contribution at 0.3', () => {
    const text = 'love great awesome excellent perfect amazing best fantastic wonderful good nice';

    expect(analyzeSentiment(text, 3).score).toBeCloseTo(0.3);
  });
});

describe('calculateOverallSentiment', () => {
  it('returns zeros for an empty list', () => {
    expect(calculateOverallSentiment([])).toEqual({
      positive: 0,
      neutral: 0,
      negative: 0,
      averageScore: 0,
    });
  });

  it('counts each sentiment bucket', () => {
    const result = calculateOverallSentiment([
      { text: 'Excelente', rating: 5 },
      { text: 'Ok', rating: 3 },
      { text: 'Péssimo', rating: 1 },
    ]);

    expect(result).toMatchObject({ positive: 1, neutral: 1, negative: 1 });
  });
});
