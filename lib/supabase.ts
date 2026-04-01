import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://usvwwzsobykscakdgvvq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdnd3enNvYnlrc2Nha2RndnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjc4MjQsImV4cCI6MjA5MDY0MzgyNH0.lVHIJ2QqgRjcncrFJrzMyeImY_M86vx00mT8Ij7-5J8";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
