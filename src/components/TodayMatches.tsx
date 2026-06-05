'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { allMatches, formatDate } from '@/data/matches';
import { getTeam } from '@/data/teams';
import type { Match } from '@/data/matches';

/**
 * Get current date string in Beijing time (Asia/Shanghai).
 * Uses Intl API for reliable timezone handling.
 */
function getBeijingToday(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Days between two date strings (YYYY-MM-DD).
 */
function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00+08:00');
  const db = new Date(b + 'T00:00:00+08:00');
  return Math.ceil((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Classify match time for Chinese fans.
 */
function getTimeTag(time: string): { label: string; className: string } {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour >= 18 && hour <= 23) return { label: '黄金', className: 'bg-green-100 text-green-700' };
  if (hour >= 9 && hour <= 17) return { label: '上午', className: 'bg-blue-100 text-blue-700' };
  if (hour >= 0 && hour <= 2) return { label: '深夜', className: 'bg-yellow-100 text-yellow-700' };
  return { label: '凌晨', className: 'bg-red-100 text-red-700' };
}

export default function TodayMatches() {
  const [mounted, setMounted] = useState(false);
  const [today] = useState<string>(() => getBeijingToday());
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [nearbyDates, setNearbyDates] = useState<string[]>([]);
  const [tournamentStarted, setTournamentStarted] = useState(false);

  useEffect(() => {
    const tournamentStart = '2026-06-12';
    setTournamentStarted(today >= tournamentStart);

    const matches = allMatches.filter(m => m.date === today);
    setTodayMatches(matches);

    // Upcoming dates that have matches (next 10 days)
    const allDates = [...new Set(allMatches.map(m => m.date))].sort();
    const upcoming = allDates.filter(d => d >= today).slice(0, 10);
    setNearbyDates(upcoming);

    setMounted(true);
  }, [today]);

  // ---- Pre-tournament state ----
  if (!mounted) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4" />
          <div className="h-4 bg-gray-100 rounded w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (!tournamentStarted) {
    const openingDate = '2026-06-12';
    const openingMatches = allMatches.filter(m => m.date === openingDate && m.stage === 'group');
    const daysLeft = daysBetween(today, openingDate);

    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-5 py-4 md:px-6 md:py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">⏳ 等待开赛</h2>
              <p className="text-green-100 text-xs md:text-sm mt-0.5">
                2026年6月12日 · 美国 / 加拿大 / 墨西哥
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className="text-3xl md:text-4xl font-extrabold tabular-nums">{Math.max(0, daysLeft)}</div>
              <div className="text-xs text-green-200">天后开幕</div>
            </div>
          </div>
        </div>

        {/* Opening day preview */}
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-900">📅 开幕日比赛</span>
            <span className="text-xs text-gray-400">6月12日 周五</span>
          </div>
          <div className="space-y-2">
            {openingMatches.map(m => {
              const h = getTeam(m.homeTeamId);
              const a = getTeam(m.awayTeamId);
              const tag = getTimeTag(m.time);
              return (
                <Link
                  key={m.id}
                  href={`/match/${m.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                >
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${tag.className}`}>
                    {tag.label}
                  </span>
                  <span className="text-sm font-mono text-gray-500 w-12 shrink-0">{m.time}</span>
                  <span className="text-xl shrink-0">{h?.flag}</span>
                  <span className="font-medium text-gray-900 text-sm truncate">{h?.name}</span>
                  <span className="text-gray-300 text-xs font-bold shrink-0">VS</span>
                  <span className="font-medium text-gray-900 text-sm truncate">{a?.name}</span>
                  <span className="text-xl shrink-0">{a?.flag}</span>
                  <span className="text-xs text-gray-400 ml-auto hidden sm:block shrink-0">{m.city}</span>
                </Link>
              );
            })}
          </div>
          <Link
            href="/schedule"
            className="inline-flex items-center gap-1 mt-4 text-sm text-green-700 hover:text-green-800 font-medium transition-colors"
          >
            📅 查看完整赛程（104场） →
          </Link>
        </div>
      </div>
    );
  }

  // ---- Tournament started ----
  const hasLive = todayMatches.some(m => m.status === 'live');

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-3 md:px-6 md:py-4 text-white flex items-center justify-between ${
        hasLive ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-r from-gray-900 to-gray-800'
      }`}>
        <h2 className="text-lg font-bold">
          {hasLive ? '⚡ 比赛进行中' : `📅 ${formatDate(today)}`}
          {todayMatches.length > 0 && (
            <span className="ml-2 text-sm font-normal opacity-70">{todayMatches.length}场</span>
          )}
        </h2>
        <Link href="/schedule" className="text-sm opacity-80 hover:opacity-100 hover:underline transition-opacity">
          完整赛程 →
        </Link>
      </div>

      {/* Match list or empty state */}
      <div className="p-4 md:p-5">
        {todayMatches.length > 0 ? (
          <div className="space-y-2">
            {todayMatches.map(m => {
              const h = getTeam(m.homeTeamId);
              const a = getTeam(m.awayTeamId);
              const tag = getTimeTag(m.time);
              const isLive = m.status === 'live';
              const isFinished = m.status === 'finished';

              return (
                <Link
                  key={m.id}
                  href={`/match/${m.id}`}
                  className={`flex items-center gap-3 p-4 rounded-lg transition-all border ${
                    isLive
                      ? 'bg-red-50 border-red-200 hover:border-red-300'
                      : 'border-gray-100 hover:border-green-200 hover:shadow-sm'
                  }`}
                >
                  {/* Time tag */}
                  {isLive ? (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-500 text-white animate-pulse shrink-0">
                      LIVE
                    </span>
                  ) : isFinished ? (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-500 shrink-0">
                      完赛
                    </span>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${tag.className}`}>
                      {tag.label}
                    </span>
                  )}

                  {/* Time */}
                  <span className="text-sm font-mono text-gray-500 w-12 shrink-0">{m.time}</span>

                  {/* Teams + score */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl shrink-0">{h?.flag || '❓'}</span>
                    <span className="font-semibold text-gray-900 text-sm truncate">
                      {h?.name || '待定'}
                    </span>

                    {isLive || isFinished ? (
                      <span className={`text-lg font-bold shrink-0 ${isLive ? 'text-red-600' : 'text-gray-900'}`}>
                        {m.homeScore ?? 0} - {m.awayScore ?? 0}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs font-bold shrink-0">VS</span>
                    )}

                    <span className="font-semibold text-gray-900 text-sm truncate">
                      {a?.name || '待定'}
                    </span>
                    <span className="text-xl shrink-0">{a?.flag || '❓'}</span>
                  </div>

                  {/* Venue (desktop only) */}
                  <div className="text-xs text-gray-400 text-right hidden md:block shrink-0">
                    <div>{m.city}</div>
                    <div className="text-gray-300 text-[10px]">{m.venue}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">⚽</div>
            <p className="text-gray-600 font-medium">今天没有比赛</p>
            <p className="text-sm text-gray-400 mt-1">
              最近比赛日：{nearbyDates.slice(0, 3).map(d => formatDate(d)).join(' · ')}
            </p>
            <Link
              href="/schedule"
              className="inline-block mt-4 px-5 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
            >
              浏览完整赛程
            </Link>
          </div>
        )}

        {/* Date quick-jump pills */}
        {nearbyDates.length > 1 && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-2 font-medium">快速跳转日期</div>
            <div className="flex gap-1.5 flex-wrap">
              {nearbyDates.slice(0, 8).map(d => {
                const isToday = d === today;
                return (
                  <Link
                    key={d}
                    href={`/schedule`}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                      isToday
                        ? 'bg-green-700 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isToday ? '今天' : formatDate(d).replace(/周[一二三四五六日]/, '').trim()}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
