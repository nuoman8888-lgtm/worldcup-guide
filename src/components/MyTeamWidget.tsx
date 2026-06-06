'use client';

import { useMyTeam } from './MyTeamModal';
import { getTeam } from '@/data/teams';
import { getMatchesByTeam } from '@/data/matches';
import { getChampionshipProbabilities } from '@/data/standings';
import CountryCodeBadge from './CountryCodeBadge';
import Link from 'next/link';

export function MyTeamWidget() {
  const { teamId, mounted } = useMyTeam();

  if (!mounted || !teamId) return null;

  const team = getTeam(teamId);
  if (!team) return null;

  const matches = getMatchesByTeam(teamId);
  const nextMatch = matches
    .filter(m => m.status !== 'finished')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0];

  const probs = getChampionshipProbabilities();
  const prob = probs.find(p => p.teamId === teamId)?.probability || 0;
  const rank = probs.findIndex(p => p.teamId === teamId) + 1;

  const wins = team.recentForm.filter(f => f === 'W').length;

  // Find opponent for next match
  const opponentId = nextMatch
    ? (nextMatch.homeTeamId === teamId ? nextMatch.awayTeamId : nextMatch.homeTeamId)
    : null;
  const opponent = opponentId && opponentId !== 'TBD' ? getTeam(opponentId) : null;

  return (
    <div className="bg-white rounded-xl border border-gold shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-navy px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CountryCodeBadge teamId={team.id} />
          <div>
            <div className="font-bold text-sm">我的主队 · {team.name}</div>
            <div className="text-[10px] text-gray-400">{team.group}组 · FIFA #{team.fifaRank}</div>
          </div>
        </div>
        <Link
          href={`/team/${team.id}`}
          className="text-xs text-gold hover:underline"
        >
          详情 →
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 divide-x divide-gray-100">
        {/* Next match */}
        <div className="p-3 text-center">
          <div className="text-[10px] text-gray-400 mb-1">下一场</div>
          {nextMatch ? (
            <Link href={`/match/${nextMatch.id}`} className="block hover:text-gold-dark transition-colors">
              <div className="text-xs font-bold text-gray-900">
                {nextMatch.date.slice(5)} {nextMatch.time}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                vs {opponent?.name || 'TBD'}
              </div>
            </Link>
          ) : (
            <span className="text-xs text-gray-400">暂无</span>
          )}
        </div>

        {/* Group rank */}
        <div className="p-3 text-center">
          <div className="text-[10px] text-gray-400 mb-1">小组</div>
          <div className="text-sm font-bold text-gray-900">{team.group}组</div>
          <div className="text-[10px] text-gray-500">出线赔率 {team.groupStageOdds}</div>
        </div>

        {/* Champ prob */}
        <div className="p-3 text-center">
          <div className="text-[10px] text-gray-400 mb-1">夺冠</div>
          <div className="text-sm font-bold text-gold-dark">{prob}%</div>
          <div className="text-[10px] text-gray-500">第{rank}名</div>
        </div>

        {/* Recent form */}
        <div className="p-3 text-center">
          <div className="text-[10px] text-gray-400 mb-1">近5场</div>
          <div className="flex justify-center gap-0.5">
            {team.recentForm.map((f, i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  f === 'W' ? 'bg-qualify-light text-qualify' :
                  f === 'D' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'
                }`}
              >
                {f}
              </span>
            ))}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">{wins}胜</div>
        </div>
      </div>
    </div>
  );
}
