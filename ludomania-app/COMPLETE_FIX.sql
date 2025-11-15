-- ============================================
-- LUDOMANIA - COMPLETE DATABASE FIX
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- 1. FIX VERIFICATION_CODES TABLE RLS
-- This allows emails to be sent to users
-- ============================================

ALTER TABLE verification_codes DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled (more secure):
DROP POLICY IF EXISTS "Allow all operations on verification codes" ON verification_codes;
CREATE POLICY "Allow all operations on verification codes"
ON verification_codes
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);


-- 2. CREATE GAME TABLES (if not exist)
-- ============================================

CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('free', 'money')),
  wager DECIMAL(10, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'cancelled')),
  winner_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  max_players INTEGER DEFAULT 4 CHECK (max_players BETWEEN 2 AND 4),
  has_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('red', 'yellow', 'green', 'blue')),
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 4),
  tokens JSONB DEFAULT '[0, 0, 0, 0]',
  is_ready BOOLEAN DEFAULT FALSE,
  is_bot BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id),
  UNIQUE(room_id, color),
  UNIQUE(room_id, position)
);

CREATE TABLE IF NOT EXISTS game_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  dice_roll INTEGER NOT NULL CHECK (dice_roll BETWEEN 1 AND 6),
  token_index INTEGER CHECK (token_index BETWEEN 0 AND 3),
  move_from INTEGER,
  move_to INTEGER,
  captured_opponent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_created_by ON game_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_game_players_room_id ON game_players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON game_players(user_id);
CREATE INDEX IF NOT EXISTS idx_game_moves_room_id ON game_moves(room_id);


-- 4. ENABLE RLS ON GAME TABLES
-- ============================================

ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_moves ENABLE ROW LEVEL SECURITY;


-- 5. CREATE RLS POLICIES FOR GAME TABLES
-- ============================================

-- game_rooms policies
DROP POLICY IF EXISTS "Anyone can view game rooms" ON game_rooms;
CREATE POLICY "Anyone can view game rooms"
ON game_rooms FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create game rooms" ON game_rooms;
CREATE POLICY "Users can create game rooms"
ON game_rooms FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Room creator can update room" ON game_rooms;
CREATE POLICY "Room creator can update room"
ON game_rooms FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- game_players policies
DROP POLICY IF EXISTS "Anyone can view game players" ON game_players;
CREATE POLICY "Anyone can view game players"
ON game_players FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can join games" ON game_players;
CREATE POLICY "Users can join games"
ON game_players FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR is_bot = true);

DROP POLICY IF EXISTS "Users can update their own player status" ON game_players;
CREATE POLICY "Users can update their own player status"
ON game_players FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- game_moves policies
DROP POLICY IF EXISTS "Anyone can view game moves" ON game_moves;
CREATE POLICY "Anyone can view game moves"
ON game_moves FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create moves" ON game_moves;
CREATE POLICY "Users can create moves"
ON game_moves FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);


-- 6. GRANT PERMISSIONS
-- ============================================

GRANT ALL ON game_rooms TO postgres, anon, authenticated, service_role;
GRANT ALL ON game_players TO postgres, anon, authenticated, service_role;
GRANT ALL ON game_moves TO postgres, anon, authenticated, service_role;
GRANT ALL ON verification_codes TO postgres, anon, authenticated, service_role;


-- ============================================
-- DONE! Now test:
-- 1. Register a new user
-- 2. Check if verification email arrives
-- 3. Try creating a free game
-- 4. Try creating a money game
-- ============================================

