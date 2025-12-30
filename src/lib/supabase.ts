import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AudioEntry = {
  id: string;
  title: string;
  description: string;
  title_ar: string;
  description_ar: string;
  audio_url: string;
  licence: string;
  category: string;
  category_ar: string;
  location: string;
  location_ar: string;
  tags: string[];
  tags_ar: string[];
  date: string | null;
  date_precision: 'unknown' | 'year' | 'full';
  year: number | null;
  featured: boolean;
  display_order: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
};
