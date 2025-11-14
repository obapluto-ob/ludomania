import { NextRequest, NextResponse } from 'next/server';
import { sendNewUserNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { username, email, userId, registeredAt } = await request.json();

    if (!username || !email || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's IP address
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'Unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Send detailed email notification to admin
    await sendNewUserNotification(username, email, userId, {
      registeredAt: registeredAt || new Date().toISOString(),
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User registration notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

