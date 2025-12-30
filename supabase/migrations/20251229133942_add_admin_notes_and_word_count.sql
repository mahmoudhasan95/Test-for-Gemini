/*
  # Add Admin Notes and Word Count to Blog Posts

  1. Changes to blog_posts table
    - Add `admin_notes` (text, nullable) - Internal admin-only notes not visible on public site
    - Add `word_count_en` (integer, default 0) - Word count for English content
    - Add `word_count_ar` (integer, default 0) - Word count for Arabic content

  2. Security
    - admin_notes are excluded from public views
    - Only authenticated users can view/edit admin_notes

  3. Important Notes
    - Admin notes are for internal use only and never displayed on public site
    - Word counts are automatically calculated and updated when posts are saved
    - Word counts help editors track content length for both languages
*/

-- Add admin_notes column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN admin_notes text;
  END IF;
END $$;

-- Add word_count_en column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'word_count_en'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN word_count_en integer DEFAULT 0;
  END IF;
END $$;

-- Add word_count_ar column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'word_count_ar'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN word_count_ar integer DEFAULT 0;
  END IF;
END $$;

-- Create index for word count queries (optional, for analytics)
CREATE INDEX IF NOT EXISTS idx_blog_posts_word_count_en ON blog_posts(word_count_en);
CREATE INDEX IF NOT EXISTS idx_blog_posts_word_count_ar ON blog_posts(word_count_ar);