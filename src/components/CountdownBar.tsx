'use client';

import { useState, useEffect } from 'react';
import { worldCupCountdown } from '@/lib/utils';

/**
 * Compact status bar: single-line countdown + tournament info.
 * Replaces the old 4-large-block CountdownTimer in the hero.
 */
export function CountdownBar() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setTime(worldCupCountdown());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const total = time.days + time.hours + time.minutes + time.seconds;

  return (
    <div className="flex items-center justify-between text-sm">
      {/* Left: Logo + tournament name */}
      <div className="flex items-center gap-2 text-white font-semibold">
        <span>🏆</span>
        <span className="hidden sm:inline">FIFA World Cup 2026</span>
        <span className="sm:hidden">WC 2026</span>
        {mounted && total === 0 && (
          <span className="inline-flex items-center gap-1.5 text-gold text-xs animate-pulse ml-2">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            进行中
          </span>
        )}
      </div>

      {/* Right: countdown + dates */}
      <div className="flex items-center gap-4 text-white/80">
        <span className="hidden md:inline text-xs text-white/50">
          6.12 – 7.20 · 🇺🇸🇨🇦🇲🇽
        </span>
        {mounted ? (
          total === 0 ? (
            <span className="text-gold font-semibold text-xs">⚡ 比赛进行中</span>
          ) : (
            <div className="flex items-center gap-1 text-xs font-semibold">
              <span className="text-white/50">距揭幕战</span>
              <span className="font-mono tabular-nums text-white">{time.days}</span>
              <span className="text-white/40">天</span>
              <span className="font-mono tabular-nums text-white">{String(time.hours).padStart(2, '0')}</span>
              <span className="text-white/40">时</span>
              <span className="font-mono tabular-nums text-white">{String(time.minutes).padStart(2, '0')}</span>
              <span className="text-white/40">分</span>
            </div>
          )
        ) : (
          <span className="text-white/30 text-xs">加载中...</span>
        )}
      </div>
    </div>
  );
}
