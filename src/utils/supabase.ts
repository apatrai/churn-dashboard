import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://snajjftlxekjvvdpptgx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuYWpqZnRseGVranZ2ZHBwdGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NzE3NTcsImV4cCI6MjA3MjI0Nzc1N30.ShiI3VwR-jAZm3uyjKIsBT5Qomh0LxfwNzhMF6tstf4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('Supabase client initialized:', supabase)

// Make supabase available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}