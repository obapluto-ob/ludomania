import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWithdrawalNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, bankDetails } = await request.json();

    if (!userId || !amount || !bankDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, wallet_balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has sufficient balance
    if (profile.wallet_balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'withdrawal',
        amount,
        status: 'pending',
        notes: bankDetails,
      })
      .select()
      .single();

    if (transactionError) {
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    // Deduct from wallet (will be refunded if rejected)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_balance: profile.wallet_balance - amount })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update wallet' },
        { status: 500 }
      );
    }

    // Send email notification to admin
    await sendWithdrawalNotification(profile.username, amount, bankDetails, userId);

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Withdrawal request submitted. You will be notified once processed.',
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

