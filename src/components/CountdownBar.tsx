'use client';

import { useState, useEffect } from 'react';
import { allMatches as staticMatches } from '@/data/matches';
import { getTeam, getCountryCode } from '@/data/teams';
import { getBeijingToday } from '@/lib/utils';

interface ApiMatch {
  id: number; utcDate: string; status: string;
  homeTeam: { tla: string; shortName: string };
  awayTeam: { tla: string; shortName: string };
}

function bjDate(utc: string): string { const d = new Date(utc); if (isNaN(d.getTime())) return ''; const b = new Date(d.getTime() + 8*3600000); return `${String(b.getUTCFullYear())}-${String(b.getUTCMonth()+1).padStart(2,'0')}-${String(b.getUTCDate()).padStart(2,'0')}`; }
function bjTime(utc: string): string { const d = new Date(utc); if (isNaN(d.getTime())) return ''; const b = new Date(d.getTime() + 8*3600000); return `${String(b.getUTCHours()).padStart(2,'0')}:${String(b.getUTCMinutes()).padStart(2,'0')}`; }

/**
 * Countdown bar: countdown to next upcoming match.
 * Accepts API matches for live status detection.
 */
export function CountdownBar({ apiMatches }: { apiMatches?: ApiMatch[] | null }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [nextMatchLabel, setNextMatchLabel] = useState('FIFA World Cup 2026');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const today = getBeijingToday();

      // Use API data for live status, static data for schedule
      const liveApiMatch = apiMatches?.find(m => m.status === 'IN_PLAY' || m.status === 'LIVE');
      if (liveApiMatch) {
        setIsLive(true);
        const ht = liveApiMatch.homeTeam.shortName;
        const at = liveApiMatch.awayTeam.shortName;
        setNextMatchLabel(`${ht} vs ${at} 进行中`);
        setTimeLeft({ h: 0, m: 0, s: 0 });
        return;
      }

      // Find next upcoming match from static schedule (exclude expired >2h)
      const nowTs = Date.now();
      const upcoming = staticMatches
        .filter(m => m.date >= today && m.status !== 'finished')
        .filter(m => {
          const [th, tm] = m.time.split(':').map(Number);
          const md = new Date(m.date + 'T00:00:00+08:00');
          md.setHours(th, tm, 0, 0);
          return md.getTime() - nowTs > -7200000; // skip matches started >2h ago
        })
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
        const ht = getTeam(next.homeTeamId);
        const at = getTeam(next.awayTeamId);
        const hCode = ht ? getCountryCode(ht.id) : next.homeTeamId;
        const aCode = at ? getCountryCode(at.id) : next.awayTeamId;
        setNextMatchLabel(`[${hCode}] ${ht?.name || next.homeTeamId} vs [${aCode}] ${at?.name || next.awayTeamId} 进行中`);
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
      const ht = getTeam(next.homeTeamId);
      const at = getTeam(next.awayTeamId);
      const hCode2 = ht ? getCountryCode(ht.id) : next.homeTeamId;
      const aCode2 = at ? getCountryCode(at.id) : next.awayTeamId;
      setNextMatchLabel(`${d} ${next.time}  [${hCode2}] ${ht?.name || next.homeTeamId} vs [${aCode2}] ${at?.name || next.awayTeamId}`);
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
      <div className="hidden md:block text-white/50 text-xs truncate mx-4 max-w-[180px] lg:max-w-xs">
        {nextMatchLabel}
      </div>

      {/* Right: countdown */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isLive ? (
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
