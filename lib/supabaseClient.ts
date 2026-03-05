import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseBrowser: SupabaseClient | null = null;

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  _supabaseBrowser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
} else {
  console.warn('Supabase browser client was not created; environment variables missing');
}

export const supabaseBrowser = _supabaseBrowser;
