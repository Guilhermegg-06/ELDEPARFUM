import { createClient, SupabaseClient } from '@supabase/supabase-js';

// server-side client with service role key (use only in trusted code)
// only initialize if env vars are provided; otherwise leave as null
let _supabase: SupabaseClient | null = null;

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  _supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
} else {
  // avoid runtime errors when building/starting without db config
  console.warn('Supabase server client was not created; environment variables missing');
}

export const supabaseServer = _supabase;
