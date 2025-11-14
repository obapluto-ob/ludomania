-- Create game_rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('free', 'money')),
  wager DECIMAL(10, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'cancelled')),
  winner_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Create game_players table
CREATE TABLE IF NOT EXISTS game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('red', 'yellow', 'green', 'blue')),
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 4),
  tokens JSONB DEFAULT '[0, 0, 0, 0]', -- positions of 4 tokens (0 = home)
  is_ready BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id),
  UNIQUE(room_id, color),
  UNIQUE(room_id, position)
);

-- Create game_moves table
CREATE TABLE IF NOT EXISTS game_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  dice_roll INTEGER NOT NULL CHECK (dice_roll BETWEEN 1 AND 6),
  token_index INTEGER CHECK (token_index BETWEEN 0 AND 3), -- which token (0-3), NULL if no move
  move_from INTEGER,
  move_to INTEGER,
  captured_opponent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_created_by ON game_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_game_players_room_id ON game_players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON game_players(user_id);
CREATE INDEX IF NOT EXISTS idx_game_moves_room_id ON game_moves(room_id);

-- Enable Row Level Security
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_moves ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_rooms
CREATE POLICY "Anyone can view game rooms"
ON game_rooms FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create game rooms"
ON game_rooms FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creator can update room"
ON game_rooms FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- RLS Policies for game_players
CREATE POLICY "Anyone can view game players"
ON game_players FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can join games"
ON game_players FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player status"
ON game_players FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for game_moves
CREATE POLICY "Anyone can view game moves"
ON game_moves FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Players can create moves in their games"
ON game_moves FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM game_players
    WHERE game_players.room_id = game_moves.room_id
    AND game_players.user_id = auth.uid()
  )
);

