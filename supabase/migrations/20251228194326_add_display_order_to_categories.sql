/*
  # Add Display Order to Blog Categories

  1. Changes
    - Add `display_order` column to `blog_categories` table
    - Set default values for existing categories
    
  2. Purpose
    - Allow admins to reorder categories via drag-and-drop
    - Control the order categories appear on the homepage
*/

-- Add display_order column to blog_categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_categories' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE blog_categories ADD COLUMN display_order integer;
    
    -- Set default display_order for existing categories based on creation order
    WITH numbered_categories AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS rn
      FROM blog_categories
    )
    UPDATE blog_categories
    SET display_order = numbered_categories.rn
    FROM numbered_categories
    WHERE blog_categories.id = numbered_categories.id;
  END IF;
END $$;