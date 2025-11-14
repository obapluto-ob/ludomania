import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendDepositNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, proofUrl } = await request.json();

    if (!userId || !amount || !proofUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        amount,
        status: 'pending',
        proof_url: proofUrl,
      })
      .select()
      .single();

    if (transactionError) {
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    // Send email notification to admin
    await sendDepositNotification(profile.username, amount, proofUrl, userId);

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Deposit request submitted. You will be notified once approved.',
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

