export interface AppResult {
  id: string;
  name: string;
  developer: string;
  icon: string;
  store: 'App Store' | 'Google Play';
  storeUrl: string;
  bundleId?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  version?: string;
}

export interface AppDetails {
  app: {
    id: string;
    name: string;
    developer: string;
    icon: string;
    store: 'App Store' | 'Google Play';
    storeUrl: string;
    averageRating: number;
    totalReviews: number;
  };
  reviews: Review[];
  distribution: {
    stars: number;
    count: number;
  }[];
}
