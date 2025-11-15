-- Add max_players and has_bot columns to game_rooms table
ALTER TABLE game_rooms ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 4 CHECK (max_players BETWEEN 2 AND 4);
ALTER TABLE game_rooms ADD COLUMN IF NOT EXISTS has_bot BOOLEAN DEFAULT FALSE;

-- Add is_bot column to game_players table
ALTER TABLE game_players ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE;

