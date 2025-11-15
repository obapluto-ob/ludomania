import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, generateVerificationCode } from '@/lib/email';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Send verification API called');
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASSWORD,
    });

    const { username, email, userId } = await request.json();
    console.log('User data:', { username, email, userId });

    // Generate verification code
    const verificationCode = generateVerificationCode();
    console.log('Generated code:', verificationCode);

    // Store verification code in database
    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: userId,
        email: email,
        code: verificationCode,
      });

    if (dbError) {
      console.error('❌ Error storing verification code:', dbError);
      return NextResponse.json(
        { error: 'Failed to create verification code' },
        { status: 500 }
      );
    }

    console.log('✅ Code stored in database');

    // Send welcome email with verification code
    console.log('📤 Attempting to send email...');
    await sendWelcomeEmail(username, email, verificationCode);
    console.log('✅ Email sent successfully');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error in send-verification:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

