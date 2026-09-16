import { createClient } from '@supabase/supabase-js';

// Same Supabase project as mobile/ - keep prototype simple, no hosting differences
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uzwovrzquofdsqrzphlq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5sfQ4SzcyvW2rS-SN_Gydw_Dh4Yy9pg';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Using fallback for prototype.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isUuid = (value: string | undefined | null): boolean =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
