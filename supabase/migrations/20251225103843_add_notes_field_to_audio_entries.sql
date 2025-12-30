/*
  # Add internal notes field to audio entries

  1. Changes
    - Add `notes` column to `audio_entries2` table
      - Type: text
      - Nullable: true (notes are optional)
      - For internal admin use only
  
  2. Notes
    - This field will NOT be displayed on the public website
    - Only visible in admin dashboard for internal reference
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries2' AND column_name = 'notes'
  ) THEN
    ALTER TABLE audio_entries2 ADD COLUMN notes text DEFAULT '';
  END IF;
END $$;