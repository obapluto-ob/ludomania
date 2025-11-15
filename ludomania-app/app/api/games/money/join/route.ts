import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/games/money/join
 * Join a money game and lock the wager amount
 */
export async function POST(request: NextRequest) {
  try {
    const { roomCode } = await request.json();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get game room
    const { data: gameRoom, error: roomError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('room_code', roomCode)
      .eq('game_mode', 'money')
      .single();

    if (roomError || !gameRoom) {
      return NextResponse.json({ error: 'Game room not found' }, { status: 404 });
    }

    // Check if game is still waiting
    if (gameRoom.status !== 'waiting') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }

    // Check if room is full
    const { data: existingPlayers, error: playersError } = await supabase
      .from('game_players')
      .select('*')
      .eq('room_id', gameRoom.id);

    if (playersError) {
      return NextResponse.json({ error: 'Failed to check players' }, { status: 500 });
    }

    if (existingPlayers && existingPlayers.length >= gameRoom.max_players) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    // Check if user already in game
    const alreadyJoined = existingPlayers?.some(p => p.user_id === user.id);
    if (alreadyJoined) {
      return NextResponse.json({ error: 'You already joined this game' }, { status: 400 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance, locked_balance, banned_until')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user is banned
    if (profile.banned_until && new Date(profile.banned_until) > new Date()) {
      return NextResponse.json({ 
        error: `You are banned until ${new Date(profile.banned_until).toLocaleString()}` 
      }, { status: 403 });
    }

    // Check if user has sufficient balance
    const wager = gameRoom.wager;
    if (profile.wallet_balance < wager) {
      return NextResponse.json({ 
        error: `Insufficient balance. You have KSh ${profile.wallet_balance.toFixed(2)}, need KSh ${wager.toFixed(2)}` 
      }, { status: 400 });
    }

    // Lock wager
    const newWalletBalance = profile.wallet_balance - wager;
    const newLockedBalance = profile.locked_balance + wager;

    const { error: updateBalanceError } = await supabase
      .from('profiles')
      .update({
        wallet_balance: newWalletBalance,
        locked_balance: newLockedBalance,
      })
      .eq('id', user.id);

    if (updateBalanceError) {
      return NextResponse.json({ error: 'Failed to lock wager' }, { status: 500 });
    }

    // Update game room locked_wagers
    const lockedWagers = gameRoom.locked_wagers || {};
    lockedWagers[user.id] = wager;

    const { error: updateRoomError } = await supabase
      .from('game_rooms')
      .update({
        locked_wagers: lockedWagers,
        last_activity: new Date().toISOString(),
      })
      .eq('id', gameRoom.id);

    if (updateRoomError) {
      // Rollback
      await supabase
        .from('profiles')
        .update({
          wallet_balance: profile.wallet_balance,
          locked_balance: profile.locked_balance,
        })
        .eq('id', user.id);

      return NextResponse.json({ error: 'Failed to update game room' }, { status: 500 });
    }

    // Add player to game
    const colors = ['red', 'blue', 'green', 'yellow'];
    const usedColors = existingPlayers?.map(p => p.color) || [];
    const availableColor = colors.find(c => !usedColors.includes(c)) || colors[0];

    const { error: playerError } = await supabase
      .from('game_players')
      .insert({
        room_id: gameRoom.id,
        user_id: user.id,
        color: availableColor,
        position: (existingPlayers?.length || 0) + 1,
        is_ready: false,
      });

    if (playerError) {
      // Rollback
      await supabase
        .from('profiles')
        .update({
          wallet_balance: profile.wallet_balance,
          locked_balance: profile.locked_balance,
        })
        .eq('id', user.id);

      return NextResponse.json({ error: 'Failed to join game' }, { status: 500 });
    }

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'game_lock',
      amount: wager,
      status: 'completed',
      game_id: gameRoom.id,
      mpesa_receipt_number: `GAME_${roomCode}`,
      admin_notes: `Wager locked for money game (Room: ${roomCode})`,
    });

    return NextResponse.json({
      success: true,
      roomId: gameRoom.id,
      roomCode: gameRoom.room_code,
      wager: wager,
      newBalance: newWalletBalance,
      lockedBalance: newLockedBalance,
    });

  } catch (error) {
    console.error('Error joining money game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

