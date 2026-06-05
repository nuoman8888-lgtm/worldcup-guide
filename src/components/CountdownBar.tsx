'use client';

import { useState, useEffect } from 'react';
import { allMatches } from '@/data/matches';

function getBeijingToday(): string {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });
  return f.format(new Date());
}

/**
 * Countdown bar: shows countdown to NEXT upcoming match.
 * Before tournament: countdown to opening match.
 * During tournament: countdown to next match.
 */
export function CountdownBar() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [nextMatchLabel, setNextMatchLabel] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      const today = getBeijingToday();

      // Find next upcoming match
      const upcoming = allMatches
        .filter(m => m.date >= today && m.status !== 'finished')
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

      const next = upcoming[0];
      if (!next) {
        setTimeLeft({ h: 0, m: 0, s: 0 });
        setNextMatchLabel('全部比赛已结束');
        return;
      }

      // Parse match time (Beijing)
      const [h, m] = next.time.split(':').map(Number);
      const matchDate = new Date(next.date + 'T00:00:00+08:00');
      matchDate.setHours(h, m, 0, 0);

      const diff = matchDate.getTime() - now.getTime();

      if (diff <= 0 && diff > -7200000) {
        // Match is ongoing (within 2 hours of start)
        setIsLive(true);
        setNextMatchLabel(`${next.homeTeamId} vs ${next.awayTeamId} 进行中`);
        setTimeLeft({ h: 0, m: 0, s: 0 });
        return;
      }

      setIsLive(false);
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      setTimeLeft({ h: hours, m: mins, s: secs });
      // Label: show the next match info
      const d = next.date.slice(5);
      setNextMatchLabel(`${d} ${next.time}  ${next.homeTeamId} vs ${next.awayTeamId}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between text-sm">
      {/* Left: brand */}
      <div className="flex items-center gap-2 text-white font-semibold shrink-0">
        <span>🏆</span>
        <span className="hidden sm:inline">FIFA World Cup 2026</span>
        <span className="sm:hidden">WC 2026</span>
      </div>

      {/* Center: next match label (hidden on mobile) */}
      <div className="hidden md:block text-white/50 text-xs truncate mx-4 max-w-xs">
        {mounted && nextMatchLabel}
      </div>

      {/* Right: countdown */}
      <div className="flex items-center gap-1.5 shrink-0">
        {!mounted ? (
          <span className="text-white/30 text-xs">加载中...</span>
        ) : isLive ? (
          <span className="inline-flex items-center gap-1.5 text-gold font-semibold text-xs animate-pulse">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            比赛进行中
          </span>
        ) : (
          <div className="flex items-center gap-0.5 text-xs">
            <span className="text-white/50 text-[10px]">距下一场</span>
            <span className="font-mono tabular-nums text-white font-bold">{String(timeLeft.h).padStart(2, '0')}</span>
            <span className="text-white/40">:</span>
            <span className="font-mono tabular-nums text-white font-bold">{String(timeLeft.m).padStart(2, '0')}</span>
            <span className="text-white/40">:</span>
            <span className="font-mono tabular-nums text-white font-bold">{String(timeLeft.s).padStart(2, '0')}</span>
          </div>
        )}
        <span className="text-white/30 text-[10px] hidden sm:inline ml-2">6.12 – 7.20</span>
      </div>
    </div>
  );
}
