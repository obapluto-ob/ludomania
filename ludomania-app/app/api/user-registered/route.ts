import { NextRequest, NextResponse } from 'next/server';
import { sendNewUserNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { username, email, userId } = await request.json();

    if (!username || !email || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email notification to admin
    await sendNewUserNotification(username, email, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User registration notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

