import { NextRequest, NextResponse } from 'next/server';

/**
 * Keep-alive endpoint to prevent Render backend from sleeping
 * This endpoint pings the Python backend every 10 minutes
 */
export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: 'Backend URL not configured' },
        { status: 500 }
      );
    }

    // Ping the backend ping endpoint (keeps Render awake)
    const response = await fetch(`${backendUrl}/ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Backend is alive',
        backend_status: data,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Backend responded with error',
          status: response.status,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Keep-alive ping failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to ping backend',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual pings
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

