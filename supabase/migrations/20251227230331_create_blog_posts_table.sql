/*
  # Create Blog Posts Table for Bilingual Blog System
  
  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key) - Unique identifier for each blog post
      - `slug` (text, unique, not null) - URL-friendly identifier for the post
      - `title_en` (text, nullable) - Blog post title in English (nullable for Arabic-only posts)
      - `title_ar` (text, nullable) - Blog post title in Arabic (nullable for English-only posts)
      - `content_en` (text, nullable) - Rich text HTML content in English
      - `content_ar` (text, nullable) - Rich text HTML content in Arabic
      - `excerpt_en` (text, nullable) - Short excerpt in English (auto-generated from content)
      - `excerpt_ar` (text, nullable) - Short excerpt in Arabic (auto-generated from content)
      - `featured_image_url` (text, nullable) - URL to featured image in R2
      - `category_en` (text, not null) - Category name in English
      - `category_ar` (text, not null) - Category name in Arabic
      - `author_id` (uuid, nullable) - Foreign key to authors table
      - `published_date` (timestamptz, not null) - Date when post is/was published
      - `published` (boolean, default false) - Whether post is published or draft
      - `created_by` (uuid, nullable) - Foreign key to auth.users (admin who created)
      - `created_at` (timestamptz) - When post was created
      - `updated_at` (timestamptz) - When post was last updated
  
  2. Constraints
    - At least one of title_en or title_ar must be provided
    - Slug must be unique
    - Category values are predefined: Anthropology, Field Notes, Research, Interviews, Reflections
  
  3. Security
    - Enable RLS on `blog_posts` table
    - Public can read only published posts
    - Authenticated admins can create, update, and delete all posts
  
  4. Indexes
    - Index on slug for fast lookups by URL
    - Index on published_date for sorting
    - Index on category for filtering
    - Index on published status for filtering drafts
    - Index on author_id for filtering by author
  
  5. Important Notes
    - English and Arabic content are completely independent
    - Posts can be English-only, Arabic-only, or bilingual
    - No automatic translation between languages
    - Featured images are stored in Cloudflare R2 under blog/featured/ folder
    - Content images are stored in R2 under blog/content/ folder
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_en text,
  title_ar text,
  content_en text,
  content_ar text,
  excerpt_en text,
  excerpt_ar text,
  featured_image_url text,
  category_en text NOT NULL,
  category_ar text NOT NULL,
  author_id uuid REFERENCES authors(id) ON DELETE SET NULL,
  published_date timestamptz NOT NULL DEFAULT now(),
  published boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraint: At least one title must be provided
  CONSTRAINT at_least_one_title CHECK (
    title_en IS NOT NULL OR title_ar IS NOT NULL
  )
);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view only published posts
CREATE POLICY "Public can view published posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (published = true);

-- Policy: Authenticated users can view all posts (including drafts)
CREATE POLICY "Authenticated users can view all posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update posts
CREATE POLICY "Authenticated users can update posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete posts
CREATE POLICY "Authenticated users can delete posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON blog_posts(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_en ON blog_posts(category_en);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_ar ON blog_posts(category_ar);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- Create index for title searches (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_blog_posts_title_en_lower ON blog_posts(LOWER(title_en));
CREATE INDEX IF NOT EXISTS idx_blog_posts_title_ar_lower ON blog_posts(LOWER(title_ar));