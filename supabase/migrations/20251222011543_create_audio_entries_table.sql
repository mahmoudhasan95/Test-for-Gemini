/*
  # Create Audio Archive Database

  1. New Tables
    - `audio_entries`
      - `id` (uuid, primary key) - Unique identifier for each audio entry
      - `title` (text, not null) - Title of the audio entry
      - `description` (text) - Short description of the audio content
      - `soundcloud_url` (text, not null) - SoundCloud track URL or embed code
      - `category` (text) - Category like podcast, interview, lecture, archive
      - `tags` (text array) - Array of tags for filtering
      - `date` (date) - Date of the recording or publication
      - `featured` (boolean, default false) - Flag to pin important entries
      - `created_at` (timestamptz) - When the entry was created
      - `updated_at` (timestamptz) - When the entry was last updated

  2. Security
    - Enable RLS on `audio_entries` table
    - Add policy for public read access (SELECT)
    - Add policies for authenticated users to INSERT, UPDATE, DELETE
    
  3. Indexes
    - Create index on featured flag for quick filtering
    - Create index on category for filtering
    - Create GIN index on tags for array searches
    - Create index on date for sorting
*/

-- Create audio_entries table
CREATE TABLE IF NOT EXISTS audio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  soundcloud_url text NOT NULL,
  category text DEFAULT '',
  tags text[] DEFAULT '{}',
  date date DEFAULT CURRENT_DATE,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE audio_entries ENABLE ROW LEVEL SECURITY;

-- Public can read all entries
CREATE POLICY "Anyone can view audio entries"
  ON audio_entries
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can insert entries
CREATE POLICY "Authenticated users can create audio entries"
  ON audio_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update entries
CREATE POLICY "Authenticated users can update audio entries"
  ON audio_entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete entries
CREATE POLICY "Authenticated users can delete audio entries"
  ON audio_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_entries_featured ON audio_entries(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_audio_entries_category ON audio_entries(category);
CREATE INDEX IF NOT EXISTS idx_audio_entries_tags ON audio_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_audio_entries_date ON audio_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_audio_entries_created_at ON audio_entries(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_audio_entries_updated_at ON audio_entries;
CREATE TRIGGER update_audio_entries_updated_at
  BEFORE UPDATE ON audio_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();