/*
  # Create Authors Table for Blog System
  
  1. New Tables
    - `authors`
      - `id` (uuid, primary key) - Unique identifier for each author
      - `name_en` (text, not null) - Author's name in English
      - `name_ar` (text, not null) - Author's name in Arabic
      - `bio_en` (text, nullable) - Short biography in English (recommended max 300 chars)
      - `bio_ar` (text, nullable) - Short biography in Arabic (recommended max 300 chars)
      - `profile_image_url` (text, nullable) - URL to author's profile photo stored in R2
      - `email` (text, nullable) - Optional contact email for the author
      - `created_at` (timestamptz) - When the author profile was created
      - `updated_at` (timestamptz) - When the author profile was last updated
  
  2. Security
    - Enable RLS on `authors` table
    - Add policy for public read access (anyone can view author profiles)
    - Add policy for authenticated admins to create, update, and delete authors
  
  3. Important Notes
    - Author profiles are separate from admin user accounts
    - One author can write multiple blog posts
    - Profile photos are stored in Cloudflare R2 under blog/authors/ folder
    - Bios should be kept concise for display on blog post pages
*/

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_ar text NOT NULL,
  bio_en text,
  bio_ar text,
  profile_image_url text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view author profiles (public read access)
CREATE POLICY "Public can view authors"
  ON authors
  FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can create authors
CREATE POLICY "Authenticated users can create authors"
  ON authors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update authors
CREATE POLICY "Authenticated users can update authors"
  ON authors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete authors
CREATE POLICY "Authenticated users can delete authors"
  ON authors
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_authors_created_at ON authors(created_at DESC);