import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gmspkaqaasqqjprtukvo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdtc3BrYXFhYXNxcWpwcnR1a3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDYyNTAsImV4cCI6MjA5MzEyMjI1MH0.98urbMJg52D1OSTob6AWyKybZA0fuvEvML3rCwCBGAo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
