import { filterReviewsByDateRange, filterReviewsByVersion } from '@/components/filters';

const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

describe('filterReviewsByDateRange', () => {
  const reviews = [
    { id: 'recent', date: daysAgo(2) },
    { id: 'twoWeeks', date: daysAgo(14) },
    { id: 'old', date: daysAgo(400) },
  ];

  it('keeps only reviews within the last 7 days', () => {
    expect(filterReviewsByDateRange(reviews, '7days').map(r => r.id)).toEqual(['recent']);
  });

  it('keeps reviews within the last 15 days', () => {
    expect(filterReviewsByDateRange(reviews, '15days').map(r => r.id)).toEqual(['recent', 'twoWeeks']);
  });
});

describe('filterReviewsByVersion', () => {
  const reviews = [{ version: '1.0.0' }, { version: '2.0.0' }, { version: null }];

  it('returns every review for "all"', () => {
    expect(filterReviewsByVersion(reviews, 'all')).toHaveLength(3);
  });

  it('keeps only the selected version', () => {
    expect(filterReviewsByVersion(reviews, '2.0.0')).toEqual([{ version: '2.0.0' }]);
  });
});
