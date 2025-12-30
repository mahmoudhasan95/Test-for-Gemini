/*
  # Add Slug Field to Authors Table

  1. Changes to `authors` table
    - Add `slug` column (text, unique, not null with default)
    - Generate slugs for existing authors based on their English names
    - Create unique index on slug for better performance
  
  2. Important Notes
    - Existing authors will get auto-generated slugs from name_en
    - Slug format: lowercase, hyphens for spaces, URL-safe
    - Unique constraint ensures no duplicate slugs
*/

-- Add slug column (nullable first for existing data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'authors' AND column_name = 'slug'
  ) THEN
    ALTER TABLE authors ADD COLUMN slug text;
  END IF;
END $$;

-- Generate slugs for existing authors
UPDATE authors
SET slug = lower(regexp_replace(
  regexp_replace(name_en, '[^a-zA-Z0-9\s-]', '', 'g'),
  '\s+', '-', 'g'
))
WHERE slug IS NULL OR slug = '';

-- Handle potential duplicates by appending numbers
DO $$
DECLARE
  author_record RECORD;
  new_slug text;
  counter integer;
BEGIN
  FOR author_record IN 
    SELECT id, slug
    FROM authors
    WHERE slug IS NOT NULL
    ORDER BY created_at
  LOOP
    counter := 1;
    new_slug := author_record.slug;
    
    WHILE EXISTS (
      SELECT 1 FROM authors
      WHERE slug = new_slug AND id != author_record.id
    ) LOOP
      new_slug := author_record.slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    IF new_slug != author_record.slug THEN
      UPDATE authors SET slug = new_slug WHERE id = author_record.id;
    END IF;
  END LOOP;
END $$;

-- Make slug NOT NULL and UNIQUE
ALTER TABLE authors ALTER COLUMN slug SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'authors_slug_key'
  ) THEN
    ALTER TABLE authors ADD CONSTRAINT authors_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);