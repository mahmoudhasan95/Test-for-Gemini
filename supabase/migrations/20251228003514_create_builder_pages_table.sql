/*
  # Create Builder.io Pages Management Table

  1. New Tables
    - `builder_pages`
      - `id` (uuid, primary key) - Unique identifier for the page
      - `slug` (text, unique) - URL-friendly slug for the page
      - `page_name` (text) - Display name of the page
      - `builder_id` (text) - Builder.io content ID reference
      - `page_type` (text) - Type of page (custom, home, about, contact, etc.)
      - `published` (boolean) - Publication status
      - `language` (text) - Language code (en, ar)
      - `meta_title` (text) - SEO meta title
      - `meta_description` (text) - SEO meta description
      - `og_image_url` (text) - Open Graph image URL
      - `custom_css` (text) - Optional custom CSS for the page
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_by` (uuid) - Reference to user who created the page

  2. Security
    - Enable RLS on `builder_pages` table
    - Add policy for public read access to published pages
    - Add policy for admin/super_admin to manage all pages
    - Add policy for authenticated users to read unpublished pages (preview mode)

  3. Indexes
    - Index on slug for fast lookups
    - Index on published status for filtering
    - Index on language for bilingual support
*/

CREATE TABLE IF NOT EXISTS builder_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  page_name TEXT NOT NULL,
  builder_id TEXT NOT NULL,
  page_type TEXT DEFAULT 'custom',
  published BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_builder_pages_slug ON builder_pages(slug);
CREATE INDEX IF NOT EXISTS idx_builder_pages_published ON builder_pages(published);
CREATE INDEX IF NOT EXISTS idx_builder_pages_language ON builder_pages(language);

ALTER TABLE builder_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages"
  ON builder_pages
  FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can view unpublished pages"
  ON builder_pages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert pages"
  ON builder_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'super_admin')
    )
  );

CREATE POLICY "Admins can update pages"
  ON builder_pages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'super_admin')
    )
  );

CREATE POLICY "Admins can delete pages"
  ON builder_pages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'super_admin')
    )
  );