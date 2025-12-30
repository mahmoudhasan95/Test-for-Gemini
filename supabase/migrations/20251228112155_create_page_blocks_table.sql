/*
  # Create Page Blocks Table for Drag-and-Drop Page Builder

  1. New Tables
    - `page_blocks`
      - `id` (uuid, primary key) - Unique identifier for the block
      - `page_id` (uuid) - Foreign key to cms_pages table
      - `block_type` (text) - Type of block (text, image, video, embed, etc.)
      - `position` (integer) - Order position on the page
      - `content_en` (jsonb) - English content and settings stored as JSON
      - `content_ar` (jsonb) - Arabic content and settings stored as JSON
      - `settings` (jsonb) - Block-specific display settings (colors, padding, etc.)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `page_blocks` table
    - Add policies for public read access to blocks of published pages
    - Add policies for authenticated users to manage blocks

  3. Important Notes
    - Supports all block types: text, heading, image, video, audio, embed, button, spacer, divider, gallery, columns, hero, card
    - Each block stores separate content for English and Arabic
    - Position determines display order on the page
    - Settings control appearance (background, padding, margins, borders, alignment)
*/

CREATE TABLE IF NOT EXISTS page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  block_type text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  content_en jsonb DEFAULT '{}'::jsonb,
  content_ar jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blocks of published pages"
  ON page_blocks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cms_pages
      WHERE cms_pages.id = page_blocks.page_id
      AND cms_pages.published = true
    )
  );

CREATE POLICY "Authenticated users can view all blocks"
  ON page_blocks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create blocks"
  ON page_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blocks"
  ON page_blocks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blocks"
  ON page_blocks
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_page_blocks_page_id ON page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_position ON page_blocks(page_id, position);
CREATE INDEX IF NOT EXISTS idx_page_blocks_type ON page_blocks(block_type);
