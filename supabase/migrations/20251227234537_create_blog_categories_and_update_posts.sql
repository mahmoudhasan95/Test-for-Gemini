/*
  # Create Blog Categories Table and Update Blog Posts

  1. New Tables
    - `blog_categories`
      - `id` (uuid, primary key) - Unique identifier for each category
      - `name_en` (text, unique, not null) - Category name in English
      - `name_ar` (text, unique, not null) - Category name in Arabic
      - `created_at` (timestamptz) - When category was created
  
  2. Changes to blog_posts table
    - Add `category_id` (uuid, nullable) - Foreign key to blog_categories.id
    - Keep `category_en` and `category_ar` temporarily for migration
    - After data migration, these will be removed in a future step
  
  3. Security
    - Enable RLS on `blog_categories` table
    - Public can read categories
    - Only authenticated users can create/update/delete categories
  
  4. Migrate Existing Data
    - Insert predefined categories into blog_categories table
    - Update existing blog_posts to reference category_id based on category_en
  
  5. Categories to Migrate
    - Anthropology / أنثروبولوجيا
    - Field Notes / ملاحظات ميدانية
    - Research / بحث
    - Interviews / مقابلات
    - Reflections / تأملات
*/

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text UNIQUE NOT NULL,
  name_ar text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view categories
CREATE POLICY "Public can view categories"
  ON blog_categories
  FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can create categories
CREATE POLICY "Authenticated users can create categories"
  ON blog_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update categories
CREATE POLICY "Authenticated users can update categories"
  ON blog_categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete categories
CREATE POLICY "Authenticated users can delete categories"
  ON blog_categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert predefined categories
INSERT INTO blog_categories (name_en, name_ar) VALUES
  ('Anthropology', 'أنثروبولوجيا'),
  ('Field Notes', 'ملاحظات ميدانية'),
  ('Research', 'بحث'),
  ('Interviews', 'مقابلات'),
  ('Reflections', 'تأملات')
ON CONFLICT (name_en) DO NOTHING;

-- Add category_id column to blog_posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Migrate existing blog posts to use category_id
UPDATE blog_posts
SET category_id = (
  SELECT id FROM blog_categories WHERE name_en = blog_posts.category_en
)
WHERE category_id IS NULL AND category_en IS NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_name_en ON blog_categories(name_en);
CREATE INDEX IF NOT EXISTS idx_blog_categories_name_ar ON blog_categories(name_ar);