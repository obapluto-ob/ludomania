-- ============================================
-- MONEY GAME PROTECTION SYSTEM - DATABASE SETUP
-- ============================================
-- Run this in Supabase SQL Editor
-- This adds anti-cheat, reconnection, and platform fees

-- ============================================
-- 1. ADD NEW COLUMNS TO PROFILES TABLE
-- ============================================

-- Add locked balance (for active game wagers)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS locked_balance DECIMAL(10,2) DEFAULT 0 CHECK (locked_balance >= 0);

-- Add penalty tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS penalty_count INTEGER DEFAULT 0;

-- Add ban system
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE;

-- Add total platform fees paid (for transparency)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_fees_paid DECIMAL(10,2) DEFAULT 0;

-- ============================================
-- 2. ADD NEW COLUMNS TO GAME_ROOMS TABLE
-- ============================================

-- Track locked wagers per player
ALTER TABLE game_rooms 
ADD COLUMN IF NOT EXISTS locked_wagers JSONB DEFAULT '{}';

-- Platform fee for this game
ALTER TABLE game_rooms 
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2) DEFAULT 0;

-- Allow reconnection
ALTER TABLE game_rooms 
ADD COLUMN IF NOT EXISTS reconnection_allowed BOOLEAN DEFAULT TRUE;

-- Track last activity (for timeout detection)
ALTER TABLE game_rooms 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Winner payout amount (after fees)
ALTER TABLE game_rooms 
ADD COLUMN IF NOT EXISTS winner_payout DECIMAL(10,2) DEFAULT 0;

-- Game abandonment tracking
ALTER TABLE game_rooms 
ADD COLUMN IF NOT EXISTS abandoned_by UUID REFERENCES auth.users(id);

-- ============================================
-- 3. CREATE USER_PENALTIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES game_rooms(id) ON DELETE SET NULL,
  penalty_type TEXT NOT NULL CHECK (penalty_type IN ('quit', 'disconnect', 'timeout', 'abandon')),
  penalty_amount DECIMAL(10,2) NOT NULL CHECK (penalty_amount >= 0),
  wager_amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user penalty lookups
CREATE INDEX IF NOT EXISTS idx_user_penalties_user_id ON user_penalties(user_id);
CREATE INDEX IF NOT EXISTS idx_user_penalties_created_at ON user_penalties(created_at DESC);

-- ============================================
-- 4. CREATE GAME_RECONNECTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS game_reconnections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  disconnected_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reconnected_at TIMESTAMP WITH TIME ZONE,
  disconnect_reason TEXT,
  reconnection_successful BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast game reconnection lookups
CREATE INDEX IF NOT EXISTS idx_game_reconnections_game_id ON game_reconnections(game_id);
CREATE INDEX IF NOT EXISTS idx_game_reconnections_user_id ON game_reconnections(user_id);

-- ============================================
-- 5. CREATE PLATFORM_REVENUE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS platform_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revenue_type TEXT NOT NULL CHECK (revenue_type IN ('game_fee', 'withdrawal_fee', 'penalty_fee', 'abandoned_wager')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  game_id UUID REFERENCES game_rooms(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for revenue analytics
CREATE INDEX IF NOT EXISTS idx_platform_revenue_type ON platform_revenue(revenue_type);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_created_at ON platform_revenue(created_at DESC);

-- ============================================
-- 6. UPDATE TRANSACTIONS TABLE
-- ============================================

-- Add new transaction types for game locking
DO $$ 
BEGIN
  -- Check if the constraint exists before trying to drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_type_check' 
    AND table_name = 'transactions'
  ) THEN
    ALTER TABLE transactions DROP CONSTRAINT transactions_type_check;
  END IF;
END $$;

-- Add new constraint with additional types
ALTER TABLE transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('deposit', 'withdrawal', 'game_lock', 'game_unlock', 'game_win', 'penalty', 'fee'));

-- Add game reference
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS game_id UUID REFERENCES game_rooms(id) ON DELETE SET NULL;

-- Add fee amount tracking
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(10,2) DEFAULT 0;

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE user_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_reconnections ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_revenue ENABLE ROW LEVEL SECURITY;

-- Users can view their own penalties
CREATE POLICY "Users can view own penalties"
ON user_penalties FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can view their own reconnections
CREATE POLICY "Users can view own reconnections"
ON game_reconnections FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can view platform revenue
CREATE POLICY "Only admins can view revenue"
ON platform_revenue FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'michealbyers750@gmail.com'
  )
);

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid
    AND banned_until IS NOT NULL
    AND banned_until > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate platform fee (2% of pot)
CREATE OR REPLACE FUNCTION calculate_game_fee(wager_amount DECIMAL, player_count INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ROUND((wager_amount * player_count * 0.02), 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate withdrawal fee (5%)
CREATE OR REPLACE FUNCTION calculate_withdrawal_fee(withdrawal_amount DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ROUND((withdrawal_amount * 0.05), 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ✅ SETUP COMPLETE!
-- ============================================

-- Verify tables were created
SELECT 'user_penalties' as table_name, COUNT(*) as row_count FROM user_penalties
UNION ALL
SELECT 'game_reconnections', COUNT(*) FROM game_reconnections
UNION ALL
SELECT 'platform_revenue', COUNT(*) FROM platform_revenue;

-- Show updated profiles columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('locked_balance', 'penalty_count', 'banned_until', 'total_fees_paid')
ORDER BY column_name;

