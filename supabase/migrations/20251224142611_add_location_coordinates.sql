/*
  # Add Location Coordinates

  1. Changes
    - Add `latitude` column to store geographic latitude
    - Add `longitude` column to store geographic longitude
  
  2. Notes
    - These fields will be populated by Google Places Autocomplete
    - Nullable fields to support existing entries
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE audio_entries ADD COLUMN latitude double precision;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE audio_entries ADD COLUMN longitude double precision;
  END IF;
END $$;