'use client';

import { useEffect } from 'react';
import { initFirstVisit, trackEvent } from '@/lib/analytics';

export default function PageTracker({ event, data }: { event: string; data?: Record<string, unknown> }) {
  useEffect(() => {
    initFirstVisit();
    trackEvent(event, data);
  }, [event, data]);
  return null;
}
