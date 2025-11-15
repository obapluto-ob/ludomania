-- ============================================
-- FIX BOT PLAYERS - Remove Foreign Key Constraint
-- ============================================
-- This allows bot players to be added without a user profile
-- ============================================

-- Step 1: Drop the foreign key constraint on game_players.user_id
ALTER TABLE game_players 
DROP CONSTRAINT IF EXISTS game_players_user_id_fkey;

-- Step 2: Verify constraint is removed
SELECT 
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'game_players'::regclass
  AND conname LIKE '%user_id%';

-- Step 3: Test - Try to insert a bot player
-- This should now work without error
INSERT INTO game_players (
  room_id,
  user_id,
  color,
  position,
  is_ready,
  is_bot
)
SELECT 
  id,
  '00000000-0000-0000-0000-000000000000',
  'yellow',
  2,
  true,
  true
FROM game_rooms
WHERE room_code = 'TEST01'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Step 4: Clean up test data (optional)
DELETE FROM game_players 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
  AND room_id IN (
    SELECT id FROM game_rooms WHERE room_code = 'TEST01'
  );

-- ============================================
-- VERIFICATION
-- ============================================

-- Check game_players table constraints
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'game_players'
ORDER BY tc.constraint_type, kcu.column_name;

-- ============================================
-- DONE! ✅
-- ============================================
-- Now bot players can be added without needing a profile
-- The code will handle bot players separately
-- ============================================

