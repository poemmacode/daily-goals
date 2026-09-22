-- Migration: Add is_admin flag to profiles for admin access control

-- 1. Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Update SEO content policy to use is_admin instead of subscription_tier
DROP POLICY IF EXISTS "Admins can manage SEO content" ON seo_content;
CREATE POLICY "Admins can manage SEO content"
  ON seo_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- 3. Set your user as super admin
-- Replace 'YOUR_USER_ID_HERE' with your actual Supabase auth user ID
-- You can find it in Supabase Dashboard > Authentication > Users
-- UPDATE profiles SET is_admin = TRUE WHERE id = 'YOUR_USER_ID_HERE';
