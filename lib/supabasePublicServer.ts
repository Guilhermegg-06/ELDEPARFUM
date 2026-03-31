import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabasePublicServer: SupabaseClient | null = null;

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  _supabasePublicServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
} else {
  console.warn('Supabase public server client was not created; environment variables missing');
}

export const supabasePublicServer = _supabasePublicServer;
