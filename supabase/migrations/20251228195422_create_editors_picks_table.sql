/*
  # Create Editors' Choice Feature Tables

  1. New Tables
    - `editors_picks`
      - `id` (uuid, primary key) - Unique identifier for each pick
      - `blog_post_id` (uuid, not null) - Foreign key to blog_posts.id
      - `display_order` (integer, not null) - Order in which picks appear (0-based)
      - `selected_at` (timestamptz) - When the article was selected
      - `selected_by` (uuid) - Foreign key to auth.users (admin who selected it)
      - `scheduled_start` (timestamptz, not null) - When article should start appearing
      - `scheduled_end` (timestamptz, nullable) - When article should stop appearing (null = no end date)
      - `created_at` (timestamptz) - When record was created
      - `updated_at` (timestamptz) - When record was last updated

  2. Constraints
    - Each blog post can only be selected once (unique constraint on blog_post_id)
    - Display order must be non-negative
    - Scheduled start must be before scheduled end (if end is set)

  3. Changes to blog_categories table
    - Insert special "Editors' Choice" category
    - Set display_order to -1 to appear first by default (can be reordered by admin)

  4. Security
    - Enable RLS on `editors_picks` table
    - Public can read active picks (scheduled_start <= now AND (scheduled_end IS NULL OR scheduled_end > now))
    - Only authenticated users can create/update/delete picks

  5. Indexes
    - Index on blog_post_id for fast lookups
    - Index on scheduled_start and scheduled_end for efficient date range queries
    - Index on display_order for sorting
    - Composite index on scheduled dates for active picks query

  6. Important Notes
    - The "Editors' Choice" category is virtual - posts don't belong to it, they're just displayed there
    - Max picks limit (2-6) will be enforced in application logic
    - Expired picks are kept for historical reference but hidden from public
    - Schedule times use UTC timezone
*/

-- Create editors_picks table
CREATE TABLE IF NOT EXISTS editors_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  selected_at timestamptz DEFAULT now(),
  selected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_start timestamptz NOT NULL DEFAULT now(),
  scheduled_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_blog_post_pick UNIQUE (blog_post_id),
  CONSTRAINT positive_display_order CHECK (display_order >= 0),
  CONSTRAINT valid_schedule_dates CHECK (
    scheduled_end IS NULL OR scheduled_end > scheduled_start
  )
);

-- Enable Row Level Security
ALTER TABLE editors_picks ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active picks
CREATE POLICY "Public can view active editors picks"
  ON editors_picks
  FOR SELECT
  TO public
  USING (
    scheduled_start <= now() 
    AND (scheduled_end IS NULL OR scheduled_end > now())
  );

-- Policy: Authenticated users can view all picks (including scheduled/expired)
CREATE POLICY "Authenticated users can view all editors picks"
  ON editors_picks
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create picks
CREATE POLICY "Authenticated users can create editors picks"
  ON editors_picks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update picks
CREATE POLICY "Authenticated users can update editors picks"
  ON editors_picks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete picks
CREATE POLICY "Authenticated users can delete editors picks"
  ON editors_picks
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_editors_picks_blog_post_id ON editors_picks(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_editors_picks_display_order ON editors_picks(display_order);
CREATE INDEX IF NOT EXISTS idx_editors_picks_scheduled_start ON editors_picks(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_editors_picks_scheduled_end ON editors_picks(scheduled_end);

-- Composite index for active picks query (most common query)
CREATE INDEX IF NOT EXISTS idx_editors_picks_active ON editors_picks(scheduled_start, scheduled_end, display_order);

-- Insert "Editors' Choice" special category with display_order -1 to appear first
INSERT INTO blog_categories (name_en, name_ar, display_order) VALUES
  ('Editors'' Choice', 'اختيار المحررين', -1)
ON CONFLICT (name_en) DO NOTHING;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_editors_picks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on editors_picks
DROP TRIGGER IF EXISTS editors_picks_updated_at_trigger ON editors_picks;
CREATE TRIGGER editors_picks_updated_at_trigger
  BEFORE UPDATE ON editors_picks
  FOR EACH ROW
  EXECUTE FUNCTION update_editors_picks_updated_at();