/*
  # Add Arabic tags support

  1. Changes
    - Add `tags_ar` column to `audio_entries` table to store Arabic tags
    - Column is JSONB array type to match the existing `tags` column structure
    - Defaults to empty array
  
  2. Notes
    - This allows separate tag lists for English and Arabic content
    - Maintains backward compatibility with existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'tags_ar'
  ) THEN
    ALTER TABLE audio_entries ADD COLUMN tags_ar jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;