'use client';

import { useEffect } from 'react';

/**
 * Client component that runs on app mount to process
 * any scheduled emails that are due for sending.
 */
export default function ScheduledEmailProcessor() {
  useEffect(() => {
    const processScheduled = async () => {
      try {
        await fetch('/api/process-scheduled', { method: 'POST' });
      } catch {
        // silently ignore — the user will see results on the /scheduled page
      }
    };
    processScheduled();
  }, []);

  return null; // invisible component
}
