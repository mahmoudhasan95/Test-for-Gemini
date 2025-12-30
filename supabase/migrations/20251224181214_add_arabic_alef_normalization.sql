/*
  # Arabic Search - Alef Normalization

  1. Function
    - `normalize_arabic_alef(text)`: Normalizes all alef variants to base alef
      - Converts أ, إ, آ to ا for search purposes

  2. Generated Columns
    - `title_ar_normalized`: Normalized version of title_ar for search
    - `description_ar_normalized`: Normalized version of description_ar for search
    - `category_ar_normalized`: Normalized version of category_ar for search
    - `location_ar_normalized`: Normalized version of location_ar for search

  3. Indexes
    - Adds GIN indexes on normalized columns for fast text search

  ## Why This Matters
  Arabic users frequently interchange alef forms (أ/إ/آ/ا) without meaning change.
  Without normalization, search for "الأردن" won't find "الاردن" even though
  they're the same word. This is critical for usable Arabic search.
*/

-- Enable pg_trgm extension if not already enabled (for trigram indexes)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create function to normalize Arabic alef variants
CREATE OR REPLACE FUNCTION normalize_arabic_alef(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Replace all alef variants with base alef
  -- أ (U+0623) -> ا (U+0627)
  -- إ (U+0625) -> ا (U+0627)
  -- آ (U+0622) -> ا (U+0627)
  RETURN REPLACE(REPLACE(REPLACE(input_text, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا');
END;
$$;

-- Add normalized columns for Arabic text fields
DO $$
BEGIN
  -- Add title_ar_normalized column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'title_ar_normalized'
  ) THEN
    ALTER TABLE audio_entries 
    ADD COLUMN title_ar_normalized text GENERATED ALWAYS AS (normalize_arabic_alef(title_ar)) STORED;
  END IF;

  -- Add description_ar_normalized column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'description_ar_normalized'
  ) THEN
    ALTER TABLE audio_entries 
    ADD COLUMN description_ar_normalized text GENERATED ALWAYS AS (normalize_arabic_alef(description_ar)) STORED;
  END IF;

  -- Add category_ar_normalized column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'category_ar_normalized'
  ) THEN
    ALTER TABLE audio_entries 
    ADD COLUMN category_ar_normalized text GENERATED ALWAYS AS (normalize_arabic_alef(category_ar)) STORED;
  END IF;

  -- Add location_ar_normalized column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries' AND column_name = 'location_ar_normalized'
  ) THEN
    ALTER TABLE audio_entries 
    ADD COLUMN location_ar_normalized text GENERATED ALWAYS AS (normalize_arabic_alef(location_ar)) STORED;
  END IF;
END $$;

-- Create indexes for fast text search on normalized columns
CREATE INDEX IF NOT EXISTS idx_audio_entries_title_ar_normalized 
  ON audio_entries USING gin(title_ar_normalized gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_audio_entries_description_ar_normalized 
  ON audio_entries USING gin(description_ar_normalized gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_audio_entries_category_ar_normalized 
  ON audio_entries USING gin(category_ar_normalized gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_audio_entries_location_ar_normalized 
  ON audio_entries USING gin(location_ar_normalized gin_trgm_ops);