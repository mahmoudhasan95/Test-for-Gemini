/*
  # Fix tags_ar column data type

  1. Changes
    - Convert tags_ar from jsonb to text[] (PostgreSQL array) to match tags column
    - This ensures consistent filtering behavior for both English and Arabic tags
  
  2. Notes
    - The migration safely handles existing data by converting jsonb arrays to text arrays
    - Empty arrays and nulls are preserved
*/

-- Add temporary column with correct type
ALTER TABLE audio_entries ADD COLUMN tags_ar_temp text[];

-- Copy data from jsonb to text array
UPDATE audio_entries 
SET tags_ar_temp = CASE 
  WHEN tags_ar IS NULL THEN NULL
  WHEN jsonb_typeof(tags_ar) = 'array' THEN 
    (SELECT array_agg(value::text) FROM jsonb_array_elements_text(tags_ar) AS value)
  ELSE ARRAY[]::text[]
END;

-- Drop old column and rename new one
ALTER TABLE audio_entries DROP COLUMN tags_ar;
ALTER TABLE audio_entries RENAME COLUMN tags_ar_temp TO tags_ar;