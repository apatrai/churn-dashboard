import { supabase } from './supabase';

console.log('Supabase client:', supabase);
console.log('Supabase type:', typeof supabase);

export const testSupabase = () => {
  console.log('Testing supabase client...');
  if (supabase) {
    console.log('Supabase client is defined');
    return true;
  } else {
    console.log('Supabase client is undefined!');
    return false;
  }
};