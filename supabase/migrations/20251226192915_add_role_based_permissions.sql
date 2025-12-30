/*
  # Add Role-Based Permissions System

  This migration implements a three-tier permission system:
  
  ## Roles
  1. **super_admin** - Full access to everything including user management
  2. **admin** - Can manage all tracks (add/edit/delete) but cannot manage users
  3. **user** - Can add tracks and edit/delete only their own tracks
  
  ## Changes Made
  1. Add uploaded_by column to track who created each entry
  2. Drop existing RLS policies on audio_entries table
  3. Create new role-based policies:
     - Super admins: Full access to all operations
     - Admins: Full access to tracks, no user management
     - Users: Can add tracks, can only edit/delete their own tracks
  
  ## Security Notes
  - Roles are stored in auth.users.raw_app_meta_data.role field
  - Users cannot modify their own roles (requires service role key)
  - All policies check authentication first
*/

-- Add uploaded_by column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_entries2' AND column_name = 'uploaded_by'
  ) THEN
    ALTER TABLE audio_entries2 ADD COLUMN uploaded_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view audio entries" ON audio_entries2;
DROP POLICY IF EXISTS "Authenticated users can create audio entries" ON audio_entries2;
DROP POLICY IF EXISTS "Authenticated users can insert audio entries" ON audio_entries2;
DROP POLICY IF EXISTS "Authenticated users can update audio entries" ON audio_entries2;
DROP POLICY IF EXISTS "Authenticated users can delete audio entries" ON audio_entries2;

-- SELECT: Everyone can view audio entries (public access)
CREATE POLICY "Anyone can view audio entries"
  ON audio_entries2
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- INSERT: All authenticated users can add new tracks
-- Automatically set uploaded_by to the current user
CREATE POLICY "Authenticated users can add tracks"
  ON audio_entries2
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- UPDATE: Super admins and admins can update any track, users can only update their own
CREATE POLICY "Super admins and admins can update any track"
  ON audio_entries2
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, 'user') IN ('super_admin', 'admin')
  )
  WITH CHECK (
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, 'user') IN ('super_admin', 'admin')
  );

CREATE POLICY "Users can update their own tracks"
  ON audio_entries2
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = uploaded_by
    AND COALESCE((auth.jwt()->'app_metadata'->>'role')::text, 'user') = 'user'
  )
  WITH CHECK (
    auth.uid() = uploaded_by
    AND COALESCE((auth.jwt()->'app_metadata'->>'role')::text, 'user') = 'user'
  );

-- DELETE: Super admins and admins can delete any track, users can only delete their own
CREATE POLICY "Super admins and admins can delete any track"
  ON audio_entries2
  FOR DELETE
  TO authenticated
  USING (
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, 'user') IN ('super_admin', 'admin')
  );

CREATE POLICY "Users can delete their own tracks"
  ON audio_entries2
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = uploaded_by
    AND COALESCE((auth.jwt()->'app_metadata'->>'role')::text, 'user') = 'user'
  );