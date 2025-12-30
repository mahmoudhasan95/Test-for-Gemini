/*
  # Add Location Field to Audio Entries

  1. Changes
    - Add `location` column to `audio_entries` table
      - `location` (text) - Country/location where the audio was recorded
  
  2. Index
    - Create index on location for filtering
*/

-- Add location column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'location'
  ) THEN
    ALTER TABLE audio_entries ADD COLUMN location text DEFAULT '';
  END IF;
END $$;

-- Create index for location filtering
CREATE INDEX IF NOT EXISTS idx_audio_entries_location ON audio_entries(location) WHERE location != '';
