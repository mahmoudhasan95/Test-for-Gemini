/*
  # Remove Unnecessary Fields from Audio Entries Table

  1. Changes
    - Remove latitude and longitude columns (location coordinates not used)
    - Remove normalized Arabic columns (title_ar_normalized, description_ar_normalized, category_ar_normalized, location_ar_normalized)
    - Remove display_order column (not implemented in UI)
    - Remove normalize_arabic_alef function (no longer needed)
  
  2. Rationale
    - Simplify database schema to only essential fields
    - Keep only fields actively used by the application
    - Improve maintainability and reduce complexity
*/

-- Drop normalized columns (generated columns must be dropped first)
ALTER TABLE audio_entries DROP COLUMN IF EXISTS title_ar_normalized;
ALTER TABLE audio_entries DROP COLUMN IF EXISTS description_ar_normalized;
ALTER TABLE audio_entries DROP COLUMN IF EXISTS category_ar_normalized;
ALTER TABLE audio_entries DROP COLUMN IF EXISTS location_ar_normalized;

-- Drop coordinate columns
ALTER TABLE audio_entries DROP COLUMN IF EXISTS latitude;
ALTER TABLE audio_entries DROP COLUMN IF EXISTS longitude;

-- Drop display_order column
ALTER TABLE audio_entries DROP COLUMN IF EXISTS display_order;

-- Drop the normalization function if it exists
DROP FUNCTION IF EXISTS normalize_arabic_alef(text);