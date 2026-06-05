'use client';

import { useState, useEffect } from 'react';
import { worldCupCountdown } from '@/lib/utils';

/**
 * Compact countdown — single row instead of 4 large blocks.
 * Used in the homepage status bar.
 */
export default function CountdownTimer() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setTime(worldCupCountdown());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-3 text-white/70 text-sm">
        <span className="font-mono tabular-nums">--</span>天
        <span className="font-mono tabular-nums">--</span>时
        <span className="font-mono tabular-nums">--</span>分
      </div>
    );
  }

  const total = time.days + time.hours + time.minutes + time.seconds;
  if (total === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-gold font-bold text-sm animate-pulse">
        <span className="w-1.5 h-1.5 bg-gold rounded-full" />
        世界杯已开幕
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 text-white text-sm font-semibold">
      <span className="font-mono tabular-nums text-base">{time.days}</span>
      <span className="text-white/60 text-xs">天</span>
      <span className="text-white/30 mx-0.5">·</span>
      <span className="font-mono tabular-nums">{String(time.hours).padStart(2, '0')}</span>
      <span className="text-white/60 text-xs">时</span>
      <span className="text-white/30 mx-0.5">·</span>
      <span className="font-mono tabular-nums">{String(time.minutes).padStart(2, '0')}</span>
      <span className="text-white/60 text-xs">分</span>
      {/* Only show seconds on mobile or when < 1 hour remains */}
      {time.days === 0 && time.hours < 2 && (
        <>
          <span className="text-white/30 mx-0.5">·</span>
          <span className="font-mono tabular-nums">{String(time.seconds).padStart(2, '0')}</span>
          <span className="text-white/60 text-xs">秒</span>
        </>
      )}
    </div>
  );
}
