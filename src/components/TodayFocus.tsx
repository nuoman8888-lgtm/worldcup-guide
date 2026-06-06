'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { allMatches, formatDate } from '@/data/matches';
import { getTeam } from '@/data/teams';
import CountryCodeBadge from './CountryCodeBadge';
import type { Match } from '@/data/matches';

function getBeijingToday(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

function timeTag(time: string) {
  const h = parseInt(time.split(':')[0], 10);
  if (h >= 18 && h <= 23) return { label: '黄金', className: 'text-qualify bg-qualify-light' };
  if (h >= 9 && h <= 17) return { label: '上午', className: 'text-blue-600 bg-blue-50' };
  if (h >= 0 && h <= 2) return { label: '深夜', className: 'text-yellow-600 bg-yellow-50' };
  return { label: '凌晨', className: 'text-red-600 bg-red-50' };
}

/**
 * Today's focus matches. If tournament hasn't started, show opening day.
 * Replaces the old TodayMatches component.
 */
export function TodayFocus() {
  const [mounted, setMounted] = useState(false);
  const [today] = useState(() => getBeijingToday());
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournamentStarted, setTournamentStarted] = useState(false);

  useEffect(() => {
    const start = '2026-06-12';
    setTournamentStarted(today >= start);

    const todayMs = allMatches.filter(m => m.date === today);
    if (todayMs.length > 0) {
      setMatches(todayMs);
    } else {
      // Show opening day matches if before tournament
      setMatches(allMatches.filter(m => m.date === start && m.stage === 'group'));
    }
    setMounted(true);
  }, [today]);

  if (!mounted) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-8 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <div className="text-3xl mb-3">⚽</div>
        <p className="text-gray-500 font-medium">暂无焦点比赛</p>
        <Link href="/schedule" className="inline-block mt-3 text-sm text-gold-dark hover:underline font-medium">
          浏览完整赛程 →
        </Link>
      </div>
    );
  }

  const isToday = matches[0]?.date === today;

  return (
    <div className="space-y-3">
      {matches.map(m => {
        const h = getTeam(m.homeTeamId);
        const a = getTeam(m.awayTeamId);
        const tag = timeTag(m.time);
        const isLive = m.status === 'live';

        return (
          <Link
            key={m.id}
            href={`/match/${m.id}`}
            className={`block rounded-xl border transition-all group overflow-hidden ${
              isLive
                ? 'border-red-200 bg-red-50/50 hover:shadow-md'
                : 'border-gray-100 bg-white hover:shadow-md hover:border-navy-600'
            }`}
          >
            <div className="flex items-stretch">
              {/* Time sidebar */}
              <div className={`flex flex-col items-center justify-center px-4 py-4 min-w-[80px] ${
                isLive ? 'bg-red-500 text-white' : 'bg-navy text-white'
              }`}>
                <div className="text-xl font-bold tabular-nums">{m.time}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{m.date.slice(5)}</div>
                {isLive ? (
                  <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded mt-1 animate-pulse">LIVE</span>
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 ${tag.className}`}>
                    {tag.label}
                  </span>
                )}
              </div>

              {/* Match content */}
              <div className="flex-1 flex items-center justify-between px-5 py-4">
                {/* Home */}
                <div className="flex flex-col items-center min-w-0 w-[120px]">
                  {h ? <CountryCodeBadge teamId={h.id} size="lg" /> : <span className="text-3xl mb-1">❓</span>}
                  <span className="font-semibold text-gray-900 text-sm text-center leading-tight">{h?.name || 'TBD'}</span>
                  <span className="text-[10px] text-gray-400">{h?.nameEn}</span>
                </div>

                {/* VS / Score */}
                <div className="text-center mx-4">
                  {isLive ? (
                    <div>
                      <span className="text-2xl font-extrabold text-red-600 animate-pulse tabular-nums">
                        {m.homeScore ?? 0} - {m.awayScore ?? 0}
                      </span>
                      <div className="text-[10px] text-red-500 font-medium mt-0.5">进行中</div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xl font-extrabold text-gray-300">VS</span>
                      {m.group && <div className="text-[10px] text-gray-400 mt-0.5">{m.group}组</div>}
                    </div>
                  )}
                </div>

                {/* Away */}
                <div className="flex flex-col items-center min-w-0 w-[120px]">
                  {a ? <CountryCodeBadge teamId={a.id} size="lg" /> : <span className="text-3xl mb-1">❓</span>}
                  <span className="font-semibold text-gray-900 text-sm text-center leading-tight">{a?.name || 'TBD'}</span>
                  <span className="text-[10px] text-gray-400">{a?.nameEn}</span>
                </div>

                {/* Arrow */}
                <span className="text-gray-300 group-hover:text-gold transition-colors ml-2 shrink-0">→</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-50 flex items-center gap-4 text-[11px] text-gray-400">
              <span>📍 {m.city}</span>
              <span>🏟️ {m.venue}</span>
            </div>
          </Link>
        );
      })}

      {!isToday && tournamentStarted === false && (
        <p className="text-center text-xs text-gray-400 mt-3">
          开幕日：6月12日 · 赛季开始后将自动显示当天比赛
        </p>
      )}

      <Link
        href="/schedule"
        className="flex items-center justify-center gap-1 text-sm text-gold-dark hover:underline font-medium pt-2"
      >
        📅 查看完整赛程（104场）→
      </Link>
    </div>
  );
}
