/*
  # Create Plasmic Pages Table

  1. New Tables
    - `plasmic_pages`
      - `id` (uuid, primary key)
      - `page_identifier` (text, unique per language) - e.g., 'home', 'about', 'contact'
      - `language` (text) - 'en' or 'ar'
      - `plasmic_data` (jsonb) - stores Plasmic component data
      - `published` (boolean) - whether page is live
      - `version` (integer) - version number for content
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `updated_by` (uuid) - reference to auth.users
  
  2. Security
    - Enable RLS on `plasmic_pages` table
    - Add policy for authenticated users to read published pages
    - Add policy for admins to manage all pages
    - Add unique constraint on (page_identifier, language)
  
  3. Indexes
    - Add index on page_identifier for fast lookups
    - Add index on published status for filtering
*/

-- Create plasmic_pages table
CREATE TABLE IF NOT EXISTS plasmic_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_identifier text NOT NULL,
  language text NOT NULL CHECK (language IN ('en', 'ar')),
  plasmic_data jsonb DEFAULT '{}'::jsonb,
  published boolean DEFAULT false,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  CONSTRAINT unique_page_language UNIQUE (page_identifier, language)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_plasmic_pages_identifier ON plasmic_pages(page_identifier);
CREATE INDEX IF NOT EXISTS idx_plasmic_pages_published ON plasmic_pages(published);
CREATE INDEX IF NOT EXISTS idx_plasmic_pages_language ON plasmic_pages(language);

-- Enable Row Level Security
ALTER TABLE plasmic_pages ENABLE ROW LEVEL SECURITY;

-- Policy for anyone to read published pages
CREATE POLICY "Anyone can view published pages"
  ON plasmic_pages FOR SELECT
  USING (published = true);

-- Policy for authenticated users to view all pages (for preview)
CREATE POLICY "Authenticated users can view all pages"
  ON plasmic_pages FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users with admin role to insert pages
CREATE POLICY "Admins can insert pages"
  ON plasmic_pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_app_meta_data->>'role' = 'admin' OR
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
      )
    )
  );

-- Policy for authenticated users with admin role to update pages
CREATE POLICY "Admins can update pages"
  ON plasmic_pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_app_meta_data->>'role' = 'admin' OR
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_app_meta_data->>'role' = 'admin' OR
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
      )
    )
  );

-- Policy for authenticated users with admin role to delete pages
CREATE POLICY "Admins can delete pages"
  ON plasmic_pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_app_meta_data->>'role' = 'admin' OR
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
      )
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_plasmic_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_plasmic_pages_updated_at_trigger
  BEFORE UPDATE ON plasmic_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_plasmic_pages_updated_at();