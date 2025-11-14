import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, generateVerificationCode } from '@/lib/email';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { username, email, userId } = await request.json();

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Store verification code in database
    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: userId,
        email: email,
        code: verificationCode,
      });

    if (dbError) {
      console.error('Error storing verification code:', dbError);
      return NextResponse.json(
        { error: 'Failed to create verification code' },
        { status: 500 }
      );
    }

    // Send welcome email with verification code
    await sendWelcomeEmail(username, email, verificationCode);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in send-verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

