/**
 * Keep-Alive Service
 * Prevents Render free tier backend from sleeping by pinging it every 10 minutes
 */

let keepAliveInterval: NodeJS.Timeout | null = null;

/**
 * Start the keep-alive service
 * Pings the backend every 10 minutes (600,000 ms)
 */
export function startKeepAlive() {
  // Don't start if already running
  if (keepAliveInterval) {
    console.log('⏰ Keep-alive service already running');
    return;
  }

  console.log('🚀 Starting keep-alive service...');

  // Ping immediately on start
  pingBackend();

  // Then ping every 10 minutes
  keepAliveInterval = setInterval(() => {
    pingBackend();
  }, 10 * 60 * 1000); // 10 minutes

  console.log('✅ Keep-alive service started (pinging every 10 minutes)');
}

/**
 * Stop the keep-alive service
 */
export function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('🛑 Keep-alive service stopped');
  }
}

/**
 * Ping the backend to keep it awake
 */
async function pingBackend() {
  try {
    const response = await fetch('/api/keep-alive', {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend ping successful:', data.timestamp);
    } else {
      console.warn('⚠️ Backend ping failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Backend ping error:', error);
  }
}

/**
 * Check if keep-alive is running
 */
export function isKeepAliveRunning(): boolean {
  return keepAliveInterval !== null;
}

