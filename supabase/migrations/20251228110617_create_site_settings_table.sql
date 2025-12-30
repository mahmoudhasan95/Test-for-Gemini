/*
  # Create Site Settings Table

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key (e.g., 'site_name', 'tagline')
      - `value_en` (text) - English value
      - `value_ar` (text) - Arabic value
      - `category` (text) - Category for grouping (general, social, seo, appearance)
      - `updated_at` (timestamptz)
      - `updated_by` (uuid) - User who last updated the setting

  2. Security
    - Enable RLS on `site_settings` table
    - Add policies for public read access
    - Add policies for authenticated users to manage settings

  3. Initial Data
    - Insert default site settings
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value_en text DEFAULT '',
  value_ar text DEFAULT '',
  category text DEFAULT 'general',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON site_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

-- Insert default site settings
INSERT INTO site_settings (key, value_en, value_ar, category) VALUES
  ('site_name', 'مشمَع', 'مشمَع', 'general'),
  ('site_tagline_en', 'An anthropological platform for understanding life through sound', 'منصة أنثروبولوجية لفهم الحياة عبر الصوت', 'general'),
  ('site_tagline_ar', 'منصة أنثروبولوجية لفهم الحياة عبر الصوت', 'An anthropological platform for understanding life through sound', 'general'),
  ('facebook_url', '', '', 'social'),
  ('twitter_url', '', '', 'social'),
  ('instagram_url', '', '', 'social'),
  ('youtube_url', '', '', 'social'),
  ('contact_email', '', '', 'general'),
  ('google_analytics_id', '', '', 'seo'),
  ('primary_color', '#2563eb', '#2563eb', 'appearance'),
  ('show_latest_articles', 'true', 'true', 'homepage'),
  ('homepage_hero_title_en', 'An anthropological platform for understanding life through sound', '', 'homepage'),
  ('homepage_hero_title_ar', 'منصة أنثروبولوجية لفهم الحياة عبر الصوت', '', 'homepage'),
  ('homepage_hero_subtitle_en', 'Explore our curated collection of sounds that tell stories from around the world', '', 'homepage'),
  ('homepage_hero_subtitle_ar', 'استكشف مجموعتنا المنتقاة من الأصوات التي تروي قصصًا من جميع أنحاء العالم', '', 'homepage')
ON CONFLICT (key) DO NOTHING;