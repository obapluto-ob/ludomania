import { NextRequest, NextResponse } from 'next/server';

/**
 * Keep-alive endpoint to prevent Render backend from sleeping
 * This endpoint pings the Python backend every 10 minutes
 */
export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;

    if (!backendUrl) {
      console.warn('⚠️ Backend URL not configured - skipping ping');
      return NextResponse.json(
        {
          success: false,
          message: 'Backend URL not configured',
          timestamp: new Date().toISOString(),
        },
        { status: 200 } // Return 200 to avoid console errors
      );
    }

    // Check if backend is localhost and might not be running
    const isLocalhost = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');

    // Ping the backend ping endpoint (keeps Render awake)
    const response = await fetch(`${backendUrl}/ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for localhost
      signal: isLocalhost ? AbortSignal.timeout(2000) : undefined,
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
      console.warn(`⚠️ Backend ping failed with status ${response.status}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Backend responded with error',
          status: response.status,
          timestamp: new Date().toISOString(),
        },
        { status: 200 } // Return 200 to avoid console errors
      );
    }
  } catch (error: any) {
    // Don't log error if it's just localhost not running
    const backendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || '';
    const isLocalhost = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');

    if (!isLocalhost) {
      console.error('Keep-alive ping failed:', error);
    }

    return NextResponse.json(
      {
        success: false,
        message: isLocalhost ? 'Backend not running (localhost)' : 'Failed to ping backend',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 200 } // Return 200 to avoid console errors
    );
  }
}

/**
 * POST endpoint for manual pings
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

