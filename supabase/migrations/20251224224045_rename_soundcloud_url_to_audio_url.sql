/*
  # Rename soundcloud_url to audio_url

  1. Changes
    - Rename `soundcloud_url` column to `audio_url` in `audio_entries` table
    - This allows the column to be used for any audio URL, including R2 storage URLs

  2. Notes
    - Existing data is preserved during the rename
    - No data is lost in this migration
*/

ALTER TABLE audio_entries 
RENAME COLUMN soundcloud_url TO audio_url;
