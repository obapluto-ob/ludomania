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
      .select('username, wallet_balance, locked_balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate withdrawal fee (5%)
    const withdrawalFee = parseFloat((amount * 0.05).toFixed(2));
    const totalDeduction = amount; // User requests amount, we deduct fee from it
    const netAmount = amount - withdrawalFee; // Amount user actually receives

    // Check if user has sufficient balance (including locked balance check)
    if (profile.wallet_balance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. You have KSh ${profile.wallet_balance.toFixed(2)} available (KSh ${profile.locked_balance.toFixed(2)} locked in active games)` },
        { status: 400 }
      );
    }

    // Minimum withdrawal check (to make fees worthwhile)
    if (amount < 50) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is KSh 50' },
        { status: 400 }
      );
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'withdrawal',
        amount: netAmount, // Amount user receives
        status: 'pending',
        notes: bankDetails,
        fee_amount: withdrawalFee,
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
    const newBalance = profile.wallet_balance - amount;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        wallet_balance: newBalance,
        total_fees_paid: (profile.total_fees_paid || 0) + withdrawalFee,
      })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update wallet' },
        { status: 500 }
      );
    }

    // Record platform revenue
    await supabase.from('platform_revenue').insert({
      revenue_type: 'withdrawal_fee',
      amount: withdrawalFee,
      user_id: userId,
      transaction_id: transaction.id,
      description: `Withdrawal fee (5% of KSh ${amount})`,
    });

    // Send email notification to admin
    await sendWithdrawalNotification(
      profile.username,
      netAmount,
      `${bankDetails}\n\nWithdrawal Fee: KSh ${withdrawalFee}\nNet Amount: KSh ${netAmount}`,
      userId
    );

    return NextResponse.json({
      success: true,
      transaction,
      requestedAmount: amount,
      withdrawalFee: withdrawalFee,
      netAmount: netAmount,
      newBalance: newBalance,
      message: `Withdrawal request submitted. You will receive KSh ${netAmount.toFixed(2)} (KSh ${withdrawalFee.toFixed(2)} fee deducted). You will be notified once processed.`,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

