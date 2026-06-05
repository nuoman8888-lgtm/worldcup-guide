'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { allMatches, formatDate } from '@/data/matches';
import { getTeam } from '@/data/teams';
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

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00+08:00');
  const db = new Date(b + 'T00:00:00+08:00');
  return Math.ceil((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

function getTimeTag(time: string): { label: string; className: string } {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour >= 18 && hour <= 23) return { label: '黄金', className: 'bg-green-100 text-green-700 border-green-200' };
  if (hour >= 9 && hour <= 17) return { label: '上午', className: 'bg-blue-100 text-blue-700 border-blue-200' };
  if (hour >= 0 && hour <= 2) return { label: '深夜', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  return { label: '凌晨', className: 'bg-red-100 text-red-700 border-red-200' };
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

    const allDates = [...new Set(allMatches.map(m => m.date))].sort();
    const upcoming = allDates.filter(d => d >= today).slice(0, 10);
    setNearbyDates(upcoming);

    setMounted(true);
  }, [today]);

  // ── SSR placeholder ──
  if (!mounted) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
          <div className="h-4 bg-gray-100 rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  // ── Pre-tournament: countdown + opening day preview ──
  if (!tournamentStarted) {
    const openingMatches = allMatches.filter(m => m.date === '2026-06-12' && m.stage === 'group');
    const daysLeft = daysBetween(today, '2026-06-12');

    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">📅 开幕日倒计时</h2>
              <p className="text-green-100 text-sm mt-0.5">6月12日 星期五 · 墨西哥城 Azteca 球场</p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className="text-4xl font-extrabold tabular-nums">{Math.max(0, daysLeft)}</div>
              <div className="text-xs text-green-200">天后开幕</div>
            </div>
          </div>
        </div>

        {/* Opening matches */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🔥</span>
            <span className="font-semibold text-gray-900">开幕日焦点战</span>
          </div>
          <div className="space-y-3">
            {openingMatches.map(m => {
              const h = getTeam(m.homeTeamId);
              const a = getTeam(m.awayTeamId);
              const tag = getTimeTag(m.time);
              return (
                <Link
                  key={m.id}
                  href={`/match/${m.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-green-300 hover:shadow-md transition-all bg-white group"
                >
                  {/* Time block */}
                  <div className="text-center shrink-0 w-14">
                    <div className="text-lg font-bold text-gray-900">{m.time}</div>
                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 border ${tag.className}`}>
                      {tag.label}
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-3xl">{h?.flag}</span>
                      <span className="font-semibold text-gray-900 text-sm mt-0.5">{h?.name}</span>
                    </div>

                    <div className="flex-1 text-center">
                      <span className="text-xl font-extrabold text-gray-300">VS</span>
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-3xl">{a?.flag}</span>
                      <span className="font-semibold text-gray-900 text-sm mt-0.5">{a?.name}</span>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="text-right shrink-0 hidden md:block">
                    <div className="text-sm font-medium text-gray-700">{m.city}</div>
                    <div className="text-xs text-gray-400">{m.venue}</div>
                  </div>

                  {/* Arrow */}
                  <span className="text-gray-300 group-hover:text-green-500 transition-colors text-lg shrink-0">→</span>
                </Link>
              );
            })}
          </div>

          <Link
            href="/schedule"
            className="inline-flex items-center gap-1 mt-5 text-sm text-green-700 hover:text-green-800 font-semibold transition-colors"
          >
            📅 查看全部104场比赛 →
          </Link>
        </div>
      </div>
    );
  }

  // ── Tournament started ──
  const hasLive = todayMatches.some(m => m.status === 'live');

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className={`px-6 py-4 text-white flex items-center justify-between ${
          hasLive
            ? 'bg-red-600'
            : 'bg-gradient-to-r from-gray-900 to-gray-800'
        }`}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          {hasLive ? (
            <>
              <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              ⚡ 比赛进行中
            </>
          ) : (
            <>📅 {formatDate(today)}</>
          )}
          <span className="text-sm font-normal opacity-60">
            {todayMatches.length}场
          </span>
        </h2>
        <Link href="/schedule" className="text-sm opacity-80 hover:opacity-100 hover:underline transition-opacity">
          完整赛程 →
        </Link>
      </div>

      <div className="p-4 md:p-5">
        {todayMatches.length > 0 ? (
          <div className="space-y-3">
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
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${
                    isLive
                      ? 'bg-red-50 border-red-200 hover:border-red-300 hover:shadow-md'
                      : isFinished
                      ? 'bg-gray-50 border-gray-100 hover:border-gray-200'
                      : 'border-gray-100 hover:border-green-300 hover:shadow-md bg-white'
                  }`}
                >
                  {/* Time block */}
                  <div className="text-center shrink-0 w-14">
                    <div className="text-lg font-bold text-gray-900">{m.time}</div>
                    {isLive ? (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500 text-white animate-pulse mt-1">
                        LIVE
                      </span>
                    ) : isFinished ? (
                      <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-200 text-gray-500 mt-1">
                        完赛
                      </span>
                    ) : (
                      <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 border ${tag.className}`}>
                        {tag.label}
                      </span>
                    )}
                  </div>

                  {/* Teams + score */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Home */}
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-3xl">{h?.flag || '❓'}</span>
                      <span className="font-semibold text-gray-900 text-sm mt-0.5 text-center leading-tight">
                        {h?.name || '待定'}
                      </span>
                    </div>

                    {/* Score / VS */}
                    <div className="flex-1 text-center">
                      {isLive ? (
                        <div>
                          <span className="text-2xl font-extrabold text-red-600 animate-pulse tabular-nums">
                            {m.homeScore ?? 0} - {m.awayScore ?? 0}
                          </span>
                          <div className="text-[11px] text-red-500 font-medium mt-0.5">进行中</div>
                        </div>
                      ) : isFinished ? (
                        <div>
                          <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
                            {m.homeScore} - {m.awayScore}
                          </span>
                          <div className="text-[11px] text-gray-400 mt-0.5">已结束</div>
                        </div>
                      ) : (
                        <span className="text-xl font-extrabold text-gray-300">VS</span>
                      )}
                    </div>

                    {/* Away */}
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-3xl">{a?.flag || '❓'}</span>
                      <span className="font-semibold text-gray-900 text-sm mt-0.5 text-center leading-tight">
                        {a?.name || '待定'}
                      </span>
                    </div>
                  </div>

                  {/* Venue (desktop) */}
                  <div className="text-right shrink-0 hidden md:block">
                    <div className="text-sm font-medium text-gray-700">{m.city}</div>
                    <div className="text-xs text-gray-400">{m.venue}</div>
                  </div>

                  <span className="text-gray-300 group-hover:text-green-500 transition-colors text-lg shrink-0">→</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">⚽</div>
            <p className="text-gray-700 font-semibold text-lg">今天没有比赛</p>
            <p className="text-gray-400 text-sm mt-1">
              最近比赛日：{nearbyDates.slice(0, 3).map(d => formatDate(d)).join(' · ')}
            </p>
            <Link
              href="/schedule"
              className="inline-block mt-5 px-6 py-3 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-colors shadow-md hover:shadow-lg"
            >
              📅 浏览完整赛程
            </Link>
          </div>
        )}

        {/* Date quick-jump */}
        {nearbyDates.length > 1 && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-2 font-medium">快速跳转</div>
            <div className="flex gap-1.5 flex-wrap">
              {nearbyDates.slice(0, 8).map(d => {
                const isToday = d === today;
                return (
                  <Link
                    key={d}
                    href={`/schedule`}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
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
