// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { User, UserSettings } from '@/types/auth';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
// Helper function to map Supabase user to your User type
export const mapSupabaseUser = (supabaseUser: any, userSettings?: UserSettings): User => {
  return {
    id: supabaseUser.id,
    name: `${supabaseUser.first_name} ${supabaseUser.last_name}`.trim(),
    firstName: supabaseUser.first_name || '',
    lastName: supabaseUser.last_name || '',
    email: supabaseUser.email || '',
    phone: supabaseUser.phone || '',
    photo: supabaseUser.profile_photo_url,
    joinDate: supabaseUser.created_at,
    digitalID: supabaseUser.digital_id,
    verified: supabaseUser.verification_status === 'verified',
    averageSafetyScore: supabaseUser.average_safety_score || 0,
    checkinsCount: supabaseUser.checkins_count || 0,
    recentTrips: [], // Will be loaded separately
    settings: userSettings || {
      locationEnabled: true,
      emergencyAlerts: true,
      biometricEnabled: false,
      language: 'English',
      languageName: 'English',
      darkMode: false,
      soundEnabled: true,
      locationTracking: true,
      dataSharing: false,
      analyticsCollection: false,
      emergencySharing: true,
      thirdPartyIntegration: false,
    },
  };
};