import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// A helper to verify if a string is a valid URL format
const checkValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = 
  checkValidUrl(supabaseUrl) && 
  !!supabaseAnonKey && 
  supabaseUrl !== "YOUR_SUPABASE_URL_HERE";

// Initialize Supabase only if valid, otherwise export null to avoid construction crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

if (!isSupabaseConfigured) {
  console.warn(
    "Readify: Supabase URL is not set or is an invalid placeholder. Please check your root .env configuration."
  );
}
