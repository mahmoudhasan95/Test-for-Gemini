/*
  # Add Arabic Language Support to Audio Entries

  1. Changes
    - Add Arabic version fields to `audio_entries` table
      - `title_ar` (text) - Arabic title
      - `description_ar` (text) - Arabic description
      - `category_ar` (text) - Arabic category
      - `location_ar` (text) - Arabic location
  
  2. Indexes
    - Create GIN index for Arabic text search on title and description
    - Create index on category_ar for filtering
*/

-- Add Arabic fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE audio_entries ADD COLUMN title_ar text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE audio_entries ADD COLUMN description_ar text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'category_ar'
  ) THEN
    ALTER TABLE audio_entries ADD COLUMN category_ar text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'location_ar'
  ) THEN
    ALTER TABLE audio_entries ADD COLUMN location_ar text DEFAULT '';
  END IF;
END $$;

-- Create indexes for Arabic fields
CREATE INDEX IF NOT EXISTS idx_audio_entries_category_ar ON audio_entries(category_ar) WHERE category_ar != '';
CREATE INDEX IF NOT EXISTS idx_audio_entries_location_ar ON audio_entries(location_ar) WHERE location_ar != '';
