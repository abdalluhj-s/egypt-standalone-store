import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iafbgxyvuxlqjhhznseg.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_188JcMuPJanJBhk4LpsZFg__yb99T2a';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
