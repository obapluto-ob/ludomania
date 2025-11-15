import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/games/abandon
 * Handle game abandonment - apply penalties and forfeit wager
 */
export async function POST(request: NextRequest) {
  try {
    const { gameId, userId, reason } = await request.json();

    // Get game room
    const { data: gameRoom, error: roomError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', gameId)
      .single();

    if (roomError || !gameRoom) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Only allow abandonment for money games that are in progress
    if (gameRoom.game_mode !== 'money') {
      return NextResponse.json({ error: 'Can only abandon money games' }, { status: 400 });
    }

    if (gameRoom.status !== 'playing') {
      return NextResponse.json({ error: 'Game not in progress' }, { status: 400 });
    }

    // Get all players
    const { data: players, error: playersError } = await supabase
      .from('game_players')
      .select('user_id')
      .eq('room_id', gameId);

    if (playersError || !players) {
      return NextResponse.json({ error: 'Failed to get players' }, { status: 500 });
    }

    // Verify user is in the game
    const isPlayer = players.some(p => p.user_id === userId);
    if (!isPlayer) {
      return NextResponse.json({ error: 'User not in this game' }, { status: 400 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('locked_balance, penalty_count, wallet_balance, total_fees_paid')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Calculate penalty (10% of wager)
    const lockedWagers = gameRoom.locked_wagers || {};
    const userWager = parseFloat(lockedWagers[userId] || 0);
    const penaltyAmount = parseFloat((userWager * 0.10).toFixed(2));

    // Unlock user's balance (they lose the wager)
    const newLockedBalance = profile.locked_balance - userWager;
    const newPenaltyCount = profile.penalty_count + 1;

    // Deduct penalty from wallet if they have balance
    let newWalletBalance = profile.wallet_balance;
    let actualPenalty = 0;
    
    if (profile.wallet_balance >= penaltyAmount) {
      newWalletBalance = profile.wallet_balance - penaltyAmount;
      actualPenalty = penaltyAmount;
    } else {
      // Take whatever they have
      actualPenalty = profile.wallet_balance;
      newWalletBalance = 0;
    }

    // Check if user should be banned (3 penalties = 24-hour ban)
    let bannedUntil = null;
    if (newPenaltyCount >= 3) {
      const banDate = new Date();
      banDate.setHours(banDate.getHours() + 24);
      bannedUntil = banDate.toISOString();
    }

    // Update user profile
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        locked_balance: newLockedBalance,
        wallet_balance: newWalletBalance,
        penalty_count: newPenaltyCount,
        banned_until: bannedUntil,
        total_fees_paid: profile.total_fees_paid + actualPenalty,
      })
      .eq('id', userId);

    if (updateProfileError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Record penalty
    await supabase.from('user_penalties').insert({
      user_id: userId,
      game_id: gameId,
      penalty_type: 'abandon',
      penalty_amount: actualPenalty,
      wager_amount: userWager,
      reason: reason || 'User abandoned game',
    });

    // Record platform revenue from forfeited wager and penalty
    const totalRevenue = userWager + actualPenalty;
    await supabase.from('platform_revenue').insert({
      revenue_type: 'abandoned_wager',
      amount: totalRevenue,
      game_id: gameId,
      user_id: userId,
      description: `User abandoned game ${gameRoom.room_code}. Wager: KSh ${userWager}, Penalty: KSh ${actualPenalty}`,
    });

    // Update game room
    await supabase
      .from('game_rooms')
      .update({
        abandoned_by: userId,
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
      .eq('id', gameId);

    // Find remaining players and refund their wagers
    const remainingPlayers = players.filter(p => p.user_id !== userId);
    
    for (const player of remainingPlayers) {
      const playerWager = parseFloat(lockedWagers[player.user_id] || 0);
      
      const { data: playerProfile } = await supabase
        .from('profiles')
        .select('wallet_balance, locked_balance')
        .eq('id', player.user_id)
        .single();

      if (playerProfile) {
        // Refund their wager
        await supabase
          .from('profiles')
          .update({
            wallet_balance: playerProfile.wallet_balance + playerWager,
            locked_balance: playerProfile.locked_balance - playerWager,
          })
          .eq('id', player.user_id);

        // Create refund transaction
        await supabase.from('transactions').insert({
          user_id: player.user_id,
          type: 'game_unlock',
          amount: playerWager,
          status: 'completed',
          game_id: gameId,
          mpesa_receipt_number: `REFUND_${gameRoom.room_code}`,
          admin_notes: `Wager refunded - opponent abandoned game ${gameRoom.room_code}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      penaltyAmount: actualPenalty,
      forfeitedWager: userWager,
      newPenaltyCount: newPenaltyCount,
      banned: bannedUntil !== null,
      bannedUntil: bannedUntil,
      message: bannedUntil 
        ? `You have been banned until ${new Date(bannedUntil).toLocaleString()} for abandoning games.`
        : `Penalty applied. You have ${newPenaltyCount} penalties. 3 penalties = 24-hour ban.`,
    });

  } catch (error) {
    console.error('Error abandoning game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

