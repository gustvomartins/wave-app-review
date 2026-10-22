const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseConfigError =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';

export const functionsBaseUrl = `${supabaseUrl}/functions/v1/make-server-f4aa3b54`;

export const supabaseHeaders: Record<string, string> = {
  Authorization: `Bearer ${supabaseAnonKey ?? ''}`,
};
