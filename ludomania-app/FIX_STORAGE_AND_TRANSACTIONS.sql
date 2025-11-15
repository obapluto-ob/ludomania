-- ============================================
-- FIX STORAGE AND TRANSACTION ERRORS
-- ============================================
-- This SQL fixes:
-- 1. Storage upload RLS policy errors
-- 2. Transaction insert RLS policy errors
-- ============================================

-- ============================================
-- 1. FIX STORAGE BUCKET POLICIES
-- ============================================

-- Create storage bucket if not exists (for transaction proofs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('transaction-proofs', 'transaction-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to upload transaction proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view transaction proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload their own transaction proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own transaction proofs" ON storage.objects;

-- Create new policies for transaction-proofs bucket
CREATE POLICY "Allow authenticated users to upload transaction proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'transaction-proofs');

CREATE POLICY "Allow users to view transaction proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'transaction-proofs');

CREATE POLICY "Allow users to update their own transaction proofs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'transaction-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own transaction proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'transaction-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 2. FIX TRANSACTIONS TABLE RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Service role can do anything" ON transactions;

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own transactions
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to insert their own transactions
CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow service role to do anything (for admin operations)
CREATE POLICY "Service role can do anything"
ON transactions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 3. FIX PROFILES TABLE RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can do anything on profiles" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow service role to do anything (for admin operations)
CREATE POLICY "Service role can do anything on profiles"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 4. GRANT PERMISSIONS
-- ============================================

-- Grant storage permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT ON transactions TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================

-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'transaction-proofs';

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check transaction policies
SELECT * FROM pg_policies WHERE tablename = 'transactions';

-- Check profiles policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- ============================================
-- DONE! ✅
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- Then test uploading transaction proofs
-- ============================================

