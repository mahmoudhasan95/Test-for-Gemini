/*
  # Create CMS Pages Table

  1. New Tables
    - `cms_pages`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL slug for the page
      - `title_en` (text) - English title
      - `title_ar` (text) - Arabic title
      - `content_en` (text) - English content in HTML
      - `content_ar` (text) - Arabic content in HTML
      - `meta_description_en` (text) - English meta description for SEO
      - `meta_description_ar` (text) - Arabic meta description for SEO
      - `published` (boolean) - Whether the page is published
      - `show_in_nav` (boolean) - Whether to show in navigation menu
      - `nav_order` (integer) - Order in navigation menu
      - `is_system_page` (boolean) - Whether it's a system page (about, contact, etc.)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid) - User who created the page

  2. Security
    - Enable RLS on `cms_pages` table
    - Add policies for public read access to published pages
    - Add policies for authenticated users to manage pages
*/

CREATE TABLE IF NOT EXISTS cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_en text,
  title_ar text,
  content_en text DEFAULT '',
  content_ar text DEFAULT '',
  meta_description_en text DEFAULT '',
  meta_description_ar text DEFAULT '',
  published boolean DEFAULT false,
  show_in_nav boolean DEFAULT false,
  nav_order integer DEFAULT 0,
  is_system_page boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages"
  ON cms_pages
  FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can view all pages"
  ON cms_pages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create pages"
  ON cms_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pages"
  ON cms_pages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete pages"
  ON cms_pages
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_published ON cms_pages(published);
CREATE INDEX IF NOT EXISTS idx_cms_pages_show_in_nav ON cms_pages(show_in_nav);
CREATE INDEX IF NOT EXISTS idx_cms_pages_nav_order ON cms_pages(nav_order);