import { supabase as realSupabase, isSupabaseConfigured as realIsSupabaseConfigured } from './supabase';

export const isSupabaseConfigured = realIsSupabaseConfigured;
export const supabase = realSupabase;

console.log('Readify Supabase client loaded. Configured:', isSupabaseConfigured);

