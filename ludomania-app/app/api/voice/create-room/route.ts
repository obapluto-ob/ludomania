import { NextRequest, NextResponse } from 'next/server';

/**
 * Create a Daily.co room for voice chat
 * 
 * This endpoint creates a temporary Daily.co room for a game session.
 * The room is configured for audio-only communication.
 */
export async function POST(request: NextRequest) {
  try {
    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_DAILY_API_KEY;

    if (!apiKey) {
      console.error('NEXT_PUBLIC_DAILY_API_KEY is not set');
      return NextResponse.json(
        { error: 'Voice chat is not configured' },
        { status: 500 }
      );
    }

    const roomName = `ludomania-${gameId}`;

    // First, try to get existing room
    const getResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    let roomData;

    if (getResponse.ok) {
      // Room already exists, use it
      roomData = await getResponse.json();
      console.log('✅ Using existing Daily.co room:', roomName);
    } else {
      // Room doesn't exist, create it
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          name: roomName,
          privacy: 'private',
          properties: {
            enable_chat: false,
            enable_screenshare: false,
            enable_recording: false,
            start_video_off: true,
            start_audio_off: true,
            max_participants: 4, // Max 4 players in Ludo
            exp: Math.floor(Date.now() / 1000) + 3600, // Expire in 1 hour
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Daily.co API error:', errorData);
        return NextResponse.json(
          { error: 'Failed to create voice room' },
          { status: 500 }
        );
      }

      roomData = await response.json();
      console.log('✅ Created new Daily.co room:', roomName);
    }

    return NextResponse.json({
      roomUrl: roomData.url,
      roomName: roomData.name,
      expiresAt: roomData.config.exp,
    });
  } catch (error: any) {
    console.error('Error creating voice room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Delete a Daily.co room
 * 
 * This endpoint deletes a Daily.co room when a game ends.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('roomName');

    if (!roomName) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_DAILY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Voice chat is not configured' },
        { status: 500 }
      );
    }

    // Delete the Daily.co room
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Daily.co API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to delete voice room' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting voice room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

