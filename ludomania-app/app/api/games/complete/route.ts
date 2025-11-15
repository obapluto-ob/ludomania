import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/games/complete
 * Complete a game and distribute winnings with platform fees
 */
export async function POST(request: NextRequest) {
  try {
    const { gameId, winnerId } = await request.json();

    // Get game room
    const { data: gameRoom, error: roomError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', gameId)
      .single();

    if (roomError || !gameRoom) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if game is already completed
    if (gameRoom.status === 'completed') {
      return NextResponse.json({ error: 'Game already completed' }, { status: 400 });
    }

    // Get all players
    const { data: players, error: playersError } = await supabase
      .from('game_players')
      .select('user_id')
      .eq('room_id', gameId);

    if (playersError || !players) {
      return NextResponse.json({ error: 'Failed to get players' }, { status: 500 });
    }

    // Verify winner is a player
    const isValidWinner = players.some(p => p.user_id === winnerId);
    if (!isValidWinner) {
      return NextResponse.json({ error: 'Invalid winner' }, { status: 400 });
    }

    // Calculate payouts
    const lockedWagers = gameRoom.locked_wagers || {};
    const totalPot = Object.values(lockedWagers).reduce((sum: number, wager: any) => sum + parseFloat(wager), 0);
    const platformFee = gameRoom.platform_fee || parseFloat((totalPot * 0.02).toFixed(2));
    const winnerPayout = totalPot - platformFee;

    // Get winner profile
    const { data: winnerProfile, error: winnerError } = await supabase
      .from('profiles')
      .select('wallet_balance, locked_balance')
      .eq('id', winnerId)
      .single();

    if (winnerError || !winnerProfile) {
      return NextResponse.json({ error: 'Winner profile not found' }, { status: 404 });
    }

    // Update winner's balance
    const winnerWager = parseFloat(lockedWagers[winnerId] || 0);
    const newWinnerWalletBalance = winnerProfile.wallet_balance + winnerPayout;
    const newWinnerLockedBalance = winnerProfile.locked_balance - winnerWager;

    const { error: updateWinnerError } = await supabase
      .from('profiles')
      .update({
        wallet_balance: newWinnerWalletBalance,
        locked_balance: newWinnerLockedBalance,
      })
      .eq('id', winnerId);

    if (updateWinnerError) {
      return NextResponse.json({ error: 'Failed to update winner balance' }, { status: 500 });
    }

    // Unlock losers' balances (they lose their wager)
    for (const player of players) {
      if (player.user_id !== winnerId) {
        const loserWager = parseFloat(lockedWagers[player.user_id] || 0);
        
        const { data: loserProfile } = await supabase
          .from('profiles')
          .select('locked_balance')
          .eq('id', player.user_id)
          .single();

        if (loserProfile) {
          await supabase
            .from('profiles')
            .update({
              locked_balance: loserProfile.locked_balance - loserWager,
            })
            .eq('id', player.user_id);
        }
      }
    }

    // Update game room
    const { error: updateRoomError } = await supabase
      .from('game_rooms')
      .update({
        status: 'completed',
        winner_id: winnerId,
        winner_payout: winnerPayout,
        completed_at: new Date().toISOString(),
      })
      .eq('id', gameId);

    if (updateRoomError) {
      return NextResponse.json({ error: 'Failed to update game status' }, { status: 500 });
    }

    // Create winner transaction
    await supabase.from('transactions').insert({
      user_id: winnerId,
      type: 'game_win',
      amount: winnerPayout,
      status: 'completed',
      game_id: gameId,
      fee_amount: platformFee,
      mpesa_receipt_number: `WIN_${gameRoom.room_code}`,
      admin_notes: `Won game ${gameRoom.room_code}. Pot: KSh ${totalPot}, Fee: KSh ${platformFee}, Payout: KSh ${winnerPayout}`,
    });

    // Record platform revenue
    await supabase.from('platform_revenue').insert({
      revenue_type: 'game_fee',
      amount: platformFee,
      game_id: gameId,
      user_id: winnerId,
      description: `Game fee from room ${gameRoom.room_code} (${players.length} players, KSh ${gameRoom.wager} wager)`,
    });

    return NextResponse.json({
      success: true,
      winnerId: winnerId,
      totalPot: totalPot,
      platformFee: platformFee,
      winnerPayout: winnerPayout,
      newBalance: newWinnerWalletBalance,
    });

  } catch (error) {
    console.error('Error completing game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

