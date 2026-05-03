import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tgytcjecuwrtesyrenzv.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneXRjamVjdXdydGVzeXJlbnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjM5NjYsImV4cCI6MjA5MzM5OTk2Nn0.yMd4J5AuoQ190er73qzGy1gjybVnTS_v0rJ8grNfTdw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
