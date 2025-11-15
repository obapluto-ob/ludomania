import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/games/reconnect
 * Reconnect to a disconnected game
 */
export async function POST(request: NextRequest) {
  try {
    const { gameId } = await request.json();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get game room
    const { data: gameRoom, error: roomError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', gameId)
      .single();

    if (roomError || !gameRoom) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if reconnection is allowed
    if (!gameRoom.reconnection_allowed) {
      return NextResponse.json({ error: 'Reconnection not allowed for this game' }, { status: 403 });
    }

    // Check if game is still in progress
    if (gameRoom.status !== 'playing') {
      return NextResponse.json({ error: 'Game is not in progress' }, { status: 400 });
    }

    // Verify user is a player in this game
    const { data: player, error: playerError } = await supabase
      .from('game_players')
      .select('*')
      .eq('room_id', gameId)
      .eq('user_id', user.id)
      .single();

    if (playerError || !player) {
      return NextResponse.json({ error: 'You are not a player in this game' }, { status: 403 });
    }

    // Get all game moves to restore state
    const { data: moves, error: movesError } = await supabase
      .from('game_moves')
      .select('*')
      .eq('room_id', gameId)
      .order('created_at', { ascending: true });

    if (movesError) {
      return NextResponse.json({ error: 'Failed to load game state' }, { status: 500 });
    }

    // Get all players
    const { data: allPlayers, error: allPlayersError } = await supabase
      .from('game_players')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .eq('room_id', gameId)
      .order('position');

    if (allPlayersError) {
      return NextResponse.json({ error: 'Failed to load players' }, { status: 500 });
    }

    // Record reconnection
    await supabase.from('game_reconnections').insert({
      game_id: gameId,
      user_id: user.id,
      disconnected_at: new Date().toISOString(),
      reconnected_at: new Date().toISOString(),
      reconnection_successful: true,
      disconnect_reason: 'Network issue or browser closed',
    });

    // Update last activity
    await supabase
      .from('game_rooms')
      .update({
        last_activity: new Date().toISOString(),
      })
      .eq('id', gameId);

    return NextResponse.json({
      success: true,
      gameRoom: gameRoom,
      players: allPlayers,
      moves: moves || [],
      yourColor: player.color,
      yourPosition: player.position,
      message: 'Successfully reconnected to game',
    });

  } catch (error) {
    console.error('Error reconnecting to game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/games/reconnect?userId=xxx
 * Get user's active games for reconnection
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Find active games where user is a player
    const { data: playerGames, error: playerError } = await supabase
      .from('game_players')
      .select('room_id')
      .eq('user_id', userId);

    if (playerError) {
      return NextResponse.json({ error: 'Failed to find games' }, { status: 500 });
    }

    if (!playerGames || playerGames.length === 0) {
      return NextResponse.json({ activeGames: [] });
    }

    const roomIds = playerGames.map(p => p.room_id);

    // Get active game rooms
    const { data: activeGames, error: gamesError } = await supabase
      .from('game_rooms')
      .select('*')
      .in('id', roomIds)
      .eq('status', 'playing')
      .eq('reconnection_allowed', true);

    if (gamesError) {
      return NextResponse.json({ error: 'Failed to load games' }, { status: 500 });
    }

    return NextResponse.json({
      activeGames: activeGames || [],
      count: activeGames?.length || 0,
    });

  } catch (error) {
    console.error('Error getting active games:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

