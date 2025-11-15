'use client';

import { useEffect } from 'react';
import { startKeepAlive, stopKeepAlive } from '@/lib/keep-alive';

/**
 * KeepAliveProvider Component
 * Automatically starts the keep-alive service when the app loads
 * Prevents Render backend from sleeping
 */
export default function KeepAliveProvider() {
  useEffect(() => {
    // Start keep-alive service when component mounts
    startKeepAlive();

    // Cleanup: Stop keep-alive service when component unmounts
    return () => {
      stopKeepAlive();
    };
  }, []);

  // This component doesn't render anything
  return null;
}

