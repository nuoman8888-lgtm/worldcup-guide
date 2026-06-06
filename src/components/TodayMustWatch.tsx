'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { allMatches } from '@/data/matches';
import { getTeam } from '@/data/teams';
import CountryCodeBadge from './CountryCodeBadge';

function getBeijingToday(): string {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });
  return f.format(new Date());
}

/** Star rating based on combined team strength */
function getStars(eloA: number, eloB: number): number {
  const combined = eloA + eloB;
  if (combined > 4100) return 5;
  if (combined > 3950) return 4;
  if (combined > 3750) return 3;
  return 2;
}

function getReason(eloA: number, eloB: number, rankA: number, rankB: number): string {
  if (eloA > 2000 && eloB > 2000) return '顶级强队直接对话';
  if (rankA <= 10 || rankB <= 10) return '夺冠热门出战';
  if (Math.abs(eloA - eloB) < 30) return '实力接近，悬念丛生';
  return '小组出线关键战';
}

export function TodayMustWatch() {
  const [mounted, setMounted] = useState(false);
  const [today] = useState(() => getBeijingToday());

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />;
  }

  // Find best 3 matches: today's matches first, then upcoming
  const todayMatches = allMatches.filter(m => m.date === today && m.stage === 'group');
  const upcoming = allMatches.filter(m => m.date >= today && m.stage === 'group');

  // Score each match and pick top 3
  const scored = upcoming.map(m => {
    const h = getTeam(m.homeTeamId);
    const a = getTeam(m.awayTeamId);
    if (!h || !a) return { match: m, home: h, away: a, score: 0 };
    const score = h.elo + a.elo - Math.abs(m.date > today ? (new Date(m.date).getTime() - new Date(today).getTime()) / 86400000 * 200 : 0);
    return { match: m, home: h, away: a, score };
  });

  const top3 = scored
    .filter(s => s.home && s.away)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (top3.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 text-white">
        <h2 className="font-bold text-sm flex items-center gap-2">
          🔥 今日必看
        </h2>
      </div>
      <div className="divide-y divide-gray-50">
        {top3.map(({ match, home, away }) => {
          const stars = getStars(home?.elo || 0, away?.elo || 0);
          const reason = getReason(home?.elo || 0, away?.elo || 0, home?.fifaRank || 50, away?.fifaRank || 50);
          const isToday = match.date === today;

          return (
            <Link
              key={match.id}
              href={`/match/${match.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
            >
              {/* Stars + date */}
              <div className="text-center shrink-0 w-16">
                <div className="flex justify-center text-xs">
                  {Array.from({ length: stars }, (_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <div className={`text-[10px] mt-0.5 font-medium ${isToday ? 'text-red-500' : 'text-gray-400'}`}>
                  {isToday ? '今天' : match.date.slice(5)} {match.time}
                </div>
              </div>

              {/* Teams */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {home ? <CountryCodeBadge teamId={home.id} /> : null}
                <span className="text-xs font-medium text-gray-900 truncate">{home?.name}</span>
                <span className="text-gray-300 text-[10px] shrink-0">vs</span>
                <span className="text-xs font-medium text-gray-900 truncate">{away?.name}</span>
                {away ? <CountryCodeBadge teamId={away.id} /> : null}
              </div>

              {/* Reason */}
              <div className="text-right shrink-0">
                <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                  {reason}
                </span>
              </div>

              <span className="text-gray-300 group-hover:text-gold transition-colors shrink-0">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
