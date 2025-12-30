/*
  # Add Display Order for Featured Entries

  1. Changes
    - Add `display_order` column to `audio_entries` table
      - Integer column for custom ordering
      - Nullable to allow null for non-featured entries
      - Default null for new entries
    
  2. Index
    - Add index on display_order for efficient sorting

  ## Purpose
  Allows admins to manually order featured entries on the home page
  through drag-and-drop interface. Featured entries with display_order
  will be sorted by this value, allowing precise control over presentation.
*/

-- Add display_order column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE audio_entries 
    ADD COLUMN display_order integer DEFAULT NULL;
  END IF;
END $$;

-- Create index for efficient sorting by display_order
CREATE INDEX IF NOT EXISTS idx_audio_entries_display_order 
  ON audio_entries(display_order) 
  WHERE display_order IS NOT NULL;

-- Initialize display_order for existing featured entries
-- Order by created_at descending to maintain current order
DO $$
DECLARE
  entry_record RECORD;
  order_counter INTEGER := 0;
BEGIN
  FOR entry_record IN 
    SELECT id FROM audio_entries 
    WHERE featured = true 
    ORDER BY created_at DESC
  LOOP
    UPDATE audio_entries 
    SET display_order = order_counter 
    WHERE id = entry_record.id;
    
    order_counter := order_counter + 1;
  END LOOP;
END $$;