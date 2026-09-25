import { extractPhraseClusters, extractTopicClusters, extractWordClusters } from '@/utils';

const reviews = [
  { id: '1', text: 'Excelente aplicativo, pagamento rápido', rating: 5 },
  { id: '2', text: 'Pagamento falhou várias vezes', rating: 1 },
  { id: '3', text: 'Pagamento rápido e fácil', rating: 4 },
];

describe('extractWordClusters', () => {
  it('ranks words by frequency and ignores stopwords and short words', () => {
    const clusters = extractWordClusters(reviews);

    expect(clusters[0]).toMatchObject({ word: 'pagamento', count: 3 });
    expect(clusters.map(c => c.word)).not.toContain('e');
  });

  it('tracks sentiment per word', () => {
    const pagamento = extractWordClusters(reviews).find(c => c.word === 'pagamento');

    expect(pagamento?.sentiment).toEqual({ positive: 2, neutral: 0, negative: 1 });
  });
});

describe('extractTopicClusters', () => {
  it('returns an empty list when there are no reviews', () => {
    expect(extractTopicClusters([])).toEqual([]);
  });
});

describe('extractPhraseClusters', () => {
  it('returns an empty list when there are no reviews', () => {
    expect(extractPhraseClusters([])).toEqual([]);
  });
});
