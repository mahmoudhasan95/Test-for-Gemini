/*
  # Restore display_order Column

  1. Changes
    - Add back display_order column for organizing featured tracks
  
  2. Purpose
    - Allows manual ordering of featured audio entries on homepage
    - Essential for content curation
*/

-- Add display_order column back
ALTER TABLE audio_entries ADD COLUMN IF NOT EXISTS display_order integer;