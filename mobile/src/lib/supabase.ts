import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzwovrzquofdsqrzphlq.supabase.co';
const supabasePublishableKey = 'sb_publishable_5sfQ4SzcyvW2rS-SN_Gydw_Dh4Yy9pg';

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
}

export const supabase = createClient(
  supabaseUrl || 'https://uzwovrzquofdsqrzphlq.supabase.co',
  supabasePublishableKey || 'sb_publishable_5sfQ4SzcyvW2rS-SN_Gydw_Dh4Yy9pg',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
