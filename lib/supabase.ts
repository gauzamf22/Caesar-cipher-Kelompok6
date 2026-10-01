import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fbjxvlrozqwwryumpore.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZianh2bHJvenF3d3J5dW1wb3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTg1NzgsImV4cCI6MjEwNjQzNDU3OH0.j2Q6bKUxP3u8nj5PS__RfgWRG53dvqxVyX4lv-X7yHM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
