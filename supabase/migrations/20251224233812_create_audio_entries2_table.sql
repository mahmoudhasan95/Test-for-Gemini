/*
  # Create audio_entries2 Table

  1. New Tables
    - `audio_entries2`
      - `id` (uuid, primary key) - Unique identifier for each audio entry
      - `title` (text, not null) - Title of the audio entry
      - `description` (text) - Short description of the audio content
      - `audio_url` (text, not null) - Audio track URL (SoundCloud, R2 storage, etc.)
      - `category` (text) - Category like podcast, interview, lecture, archive
      - `tags` (text array) - Array of tags for filtering
      - `date` (date, nullable) - Date of the recording or publication
      - `featured` (boolean, default false) - Flag to pin important entries
      - `created_at` (timestamptz) - When the entry was created
      - `updated_at` (timestamptz) - When the entry was last updated
      - `location` (text) - Country/location where the audio was recorded
      - `title_ar` (text) - Arabic title
      - `description_ar` (text) - Arabic description
      - `category_ar` (text) - Arabic category
      - `location_ar` (text) - Arabic location
      - `tags_ar` (jsonb) - Arabic tags as JSONB array
      - `licence` (text, nullable) - Licence and credit information
      - `date_precision` (date_precision_type) - Date precision: 'unknown', 'year', or 'full'
      - `year` (integer, nullable) - Year for year-only entries
      - `display_order` (integer, nullable) - Manual ordering for featured tracks

  2. Security
    - Enable RLS on `audio_entries2` table
    - Add policy for public read access (SELECT)
    - Add policies for authenticated users to INSERT, UPDATE, DELETE
    
  3. Indexes
    - Create index on featured flag for quick filtering
    - Create index on category for filtering
    - Create GIN index on tags for array searches
    - Create index on date for sorting
    - Create index on location for filtering
    - Create index on category_ar for filtering
    - Create index on location_ar for filtering
    - Create index on created_at for sorting

  4. Triggers
    - Automatically update updated_at timestamp on UPDATE
*/

-- Create audio_entries2 table
CREATE TABLE IF NOT EXISTS audio_entries2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  audio_url text NOT NULL,
  category text DEFAULT '',
  tags text[] DEFAULT '{}',
  date date,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  location text DEFAULT '',
  title_ar text DEFAULT '',
  description_ar text DEFAULT '',
  category_ar text DEFAULT '',
  location_ar text DEFAULT '',
  tags_ar jsonb DEFAULT '[]'::jsonb,
  licence text,
  date_precision date_precision_type DEFAULT 'full' NOT NULL,
  year integer,
  display_order integer
);

-- Enable RLS
ALTER TABLE audio_entries2 ENABLE ROW LEVEL SECURITY;

-- Public can read all entries
CREATE POLICY "Anyone can view audio entries"
  ON audio_entries2
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can insert entries
CREATE POLICY "Authenticated users can create audio entries"
  ON audio_entries2
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update entries
CREATE POLICY "Authenticated users can update audio entries"
  ON audio_entries2
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete entries
CREATE POLICY "Authenticated users can delete audio entries"
  ON audio_entries2
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_entries2_featured ON audio_entries2(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_audio_entries2_category ON audio_entries2(category);
CREATE INDEX IF NOT EXISTS idx_audio_entries2_tags ON audio_entries2 USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_audio_entries2_date ON audio_entries2(date DESC);
CREATE INDEX IF NOT EXISTS idx_audio_entries2_created_at ON audio_entries2(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_entries2_location ON audio_entries2(location) WHERE location != '';
CREATE INDEX IF NOT EXISTS idx_audio_entries2_category_ar ON audio_entries2(category_ar) WHERE category_ar != '';
CREATE INDEX IF NOT EXISTS idx_audio_entries2_location_ar ON audio_entries2(location_ar) WHERE location_ar != '';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_audio_entries2_updated_at ON audio_entries2;
CREATE TRIGGER update_audio_entries2_updated_at
  BEFORE UPDATE ON audio_entries2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();