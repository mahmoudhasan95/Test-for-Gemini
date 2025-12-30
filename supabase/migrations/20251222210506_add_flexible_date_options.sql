/*
  # Add flexible date options to audio entries

  1. Changes
    - Add `date_precision` enum column with values: 'unknown', 'year', 'full'
    - Add `year` integer column for year-only entries
    - Make existing `date` column nullable
    - Set default date_precision to 'full' for existing entries with dates
    
  2. Purpose
    - Allow entries with unknown dates
    - Allow entries with only year information (e.g., "1995")
    - Keep full date functionality for entries with complete date information
    
  3. Migration Safety
    - Existing entries will default to 'full' precision
    - Date column remains unchanged for existing data
    - All changes are backward compatible
*/

-- Create enum type for date precision
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'date_precision_type') THEN
    CREATE TYPE date_precision_type AS ENUM ('unknown', 'year', 'full');
  END IF;
END $$;

-- Add date_precision column with default 'full' for existing entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audio_entries' AND column_name = 'date_precision'
  ) THEN
    ALTER TABLE audio_entries 
    ADD COLUMN date_precision date_precision_type DEFAULT 'full' NOT NULL;
  END IF;
END $$;

-- Add year column for year-only entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audio_entries' AND column_name = 'year'
  ) THEN
    ALTER TABLE audio_entries 
    ADD COLUMN year integer;
  END IF;
END $$;

-- Make date column nullable
DO $$
BEGIN
  ALTER TABLE audio_entries 
  ALTER COLUMN date DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;