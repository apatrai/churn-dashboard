import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://snajjftlxekjvvdpptgx.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuYWpqZnRseGVranZ2ZHBwdGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NzE3NTcsImV4cCI6MjA3MjI0Nzc1N30.ShiI3VwR-jAZm3uyjKIsBT5Qomh0LxfwNzhMF6tstf4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)