/*
  # Add Licence Field to Audio Entries

  1. Changes
    - Add `licence` column to `audio_entries` table
      - Type: text
      - Nullable: true (optional field)
      - Description: Stores licence and credit information for the audio track

  2. Notes
    - This field allows admins to specify licence information and credits
    - The field is optional to maintain compatibility with existing entries
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'licence'
  ) THEN
    ALTER TABLE audio_entries ADD COLUMN licence text;
  END IF;
END $$;