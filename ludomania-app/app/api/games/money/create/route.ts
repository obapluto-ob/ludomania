import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/games/money/create
 * Create a money game and lock the wager amount
 */
export async function POST(request: NextRequest) {
  try {
    const { wager, playerCount, withBot } = await request.json();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate wager amount
    if (!wager || wager <= 0) {
      return NextResponse.json({ error: 'Invalid wager amount' }, { status: 400 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance, locked_balance, banned_until, penalty_count')
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
    if (profile.wallet_balance < wager) {
      return NextResponse.json({ 
        error: `Insufficient balance. You have KSh ${profile.wallet_balance.toFixed(2)}, need KSh ${wager.toFixed(2)}` 
      }, { status: 400 });
    }

    // Generate unique room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Calculate platform fee (2% of total pot)
    const platformFee = parseFloat((wager * playerCount * 0.02).toFixed(2));

    // Start transaction: Lock wager and create game
    // 1. Deduct from wallet_balance
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

    // 2. Create game room
    const { data: gameRoom, error: gameError } = await supabase
      .from('game_rooms')
      .insert({
        room_code: roomCode,
        game_mode: 'money',
        wager: wager,
        max_players: playerCount,
        status: 'waiting',
        created_by: user.id,
        locked_wagers: { [user.id]: wager },
        platform_fee: platformFee,
        reconnection_allowed: true,
        last_activity: new Date().toISOString(),
      })
      .select()
      .single();

    if (gameError || !gameRoom) {
      // Rollback: Unlock wager
      await supabase
        .from('profiles')
        .update({
          wallet_balance: profile.wallet_balance,
          locked_balance: profile.locked_balance,
        })
        .eq('id', user.id);

      return NextResponse.json({ error: 'Failed to create game room' }, { status: 500 });
    }

    // 3. Add creator as first player
    const colors = ['red', 'blue', 'green', 'yellow'];
    const { error: playerError } = await supabase
      .from('game_players')
      .insert({
        room_id: gameRoom.id,
        user_id: user.id,
        color: colors[0],
        position: 1,
        is_ready: false,
      });

    if (playerError) {
      // Rollback: Delete game and unlock wager
      await supabase.from('game_rooms').delete().eq('id', gameRoom.id);
      await supabase
        .from('profiles')
        .update({
          wallet_balance: profile.wallet_balance,
          locked_balance: profile.locked_balance,
        })
        .eq('id', user.id);

      return NextResponse.json({ error: 'Failed to add player' }, { status: 500 });
    }

    // 4. Create transaction record
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
      platformFee: platformFee,
      newBalance: newWalletBalance,
      lockedBalance: newLockedBalance,
    });

  } catch (error) {
    console.error('Error creating money game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

