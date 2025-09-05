import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://qdtnrkxceuvtmtgwxaxz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkdG5ya3hjZXV2dG10Z3d4YXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTIwNDQsImV4cCI6MjA2NDgyODA0NH0.3gKRlNck21BLYUQAtBmgxT1MF_I4XDAolEGHaBU1uhg';

// CORRIJA: use supabaseKey em vez de supabaseAnonKey
export const supabase = createClient(supabaseUrl, supabaseKey);
