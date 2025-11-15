-- ============================================
-- CREATE BOT PROFILE
-- ============================================
-- This SQL creates a special profile for bot players
-- Bot UUID: 00000000-0000-0000-0000-000000000000
-- ============================================

-- Create bot profile (if not exists)
INSERT INTO profiles (
  id,
  username,
  wallet_balance,
  locked_balance,
  penalty_count,
  total_fees_paid,
  email_verified,
  verified_at,
  created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Bot',
  0,
  0,
  0,
  0,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  username = 'Bot',
  email_verified = true;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check bot profile exists
SELECT * FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000';

-- Show bot profile details
SELECT
  id,
  username,
  wallet_balance,
  locked_balance,
  email_verified,
  created_at
FROM profiles
WHERE id = '00000000-0000-0000-0000-000000000000';

-- ============================================
-- DONE! ✅
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- Bot players will now show up correctly in rooms
-- ============================================

