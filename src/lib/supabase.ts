// supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://ethpgxbsmazrouyrorlw.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0aHBneGJzbWF6cm91eXJvcmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MDAwNjksImV4cCI6MjA4MjE3NjA2OX0.ojodsKBbSYhHDOpo4kgkMlOy14Cv4br6IpTUyRQJLe8"; // Get from Supabase dashboard

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
