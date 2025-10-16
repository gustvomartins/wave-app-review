import { projectId, publicAnonKey } from './supabase/info.tsx';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-f4aa3b54`;

// Test server connectivity
export async function testServerConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE}/health`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return { ok: false, error: `Server returned ${response.status}` };
    }
    
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { ok: false, error: 'Server timeout - please try again' };
      }
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Unknown error' };
  }
}

export interface AppResult {
  id: string;
  name: string;
  developer: string;
  icon: string;
  store: "App Store" | "Google Play";
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
    store: "App Store" | "Google Play";
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

export async function searchApps(query: string, store: string = "both"): Promise<AppResult[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&store=${store}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Failed to search apps';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Search API error:', error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - the server took too long to respond. Please try again.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check if the Supabase Edge Function is deployed and running.');
      }
      throw error;
    }
    throw new Error('Network error: Unable to connect to the server');
  }
}

export async function getAppDetails(store: string, id: string): Promise<AppDetails> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for details
    
    const storeParam = store === "App Store" ? "appstore" : "playstore";
    const response = await fetch(`${API_BASE}/app/${storeParam}/${id}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch app details';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('App details API error:', error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - fetching app details took too long. Please try again.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check if the Supabase Edge Function is deployed and running.');
      }
      throw error;
    }
    throw new Error('Network error: Unable to connect to the server');
  }
}
