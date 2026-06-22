import { supabase as realSupabase } from './supabase';

export const isSupabaseConfigured = true;
export const supabase = realSupabase;

console.log('Readify connected to Supabase Database Client.');
