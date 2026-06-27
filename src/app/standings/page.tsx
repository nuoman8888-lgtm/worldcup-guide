'use client';

import { useState, useMemo } from 'react';
// import Link from 'next/link';
// import PageTracker from '@/components/PageTracker';
import { useApiStandings, tlaToTeamId, normalizeGroup } from '@/lib/use-api-data';
import { getTeam, groups as staticGroups } from '@/data/teams';
import { allMatches } from '@/data/matches';
import CountryCodeBadge from '@/components/CountryCodeBadge';

/** Generate static standings from completed match results */
function generateStaticStandings(): Array<{
  group: string; type: string;
  table: Array<{ position: number; team: { id: number; name: string; shortName: string; tla: string }; playedGames: number; won: number; draw: number; lost: number; goalsFor: number; goalsAgainst: number; goalDifference: number; points: number }>;
}> {
  const result: any[] = [];
  for (const g of staticGroups) {
    const teamStats: Record<string, { played: number; won: number; draw: number; lost: number; gf: number; ga: number; pts: number }> = {};
    // Initialize
    for (const tid of g.teams) {
      teamStats[tid] = { played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
    }
    // Process completed matches
    for (const m of allMatches) {
      if (m.group !== g.name || m.status !== 'finished') continue;
      if (m.homeScore == null || m.awayScore == null) continue;
      const h = teamStats[m.homeTeamId], a = teamStats[m.awayTeamId];
      if (!h || !a) continue;
      h.played++; a.played++;
      h.gf += m.homeScore; h.ga += m.awayScore;
      a.gf += m.awayScore; a.ga += m.homeScore;
      if (m.homeScore > m.awayScore) { h.won++; a.lost++; h.pts += 3; }
      else if (m.homeScore < m.awayScore) { a.won++; h.lost++; a.pts += 3; }
      else { h.draw++; a.draw++; h.pts += 1; a.pts += 1; }
    }
    // Build table
    const table = Object.entries(teamStats)
      .map(([tid, s]) => {
        const t = getTeam(tid);
        return {
          position: 0,
          team: { id: 0, name: t?.name || tid, shortName: t?.name || tid, tla: tid.toUpperCase() },
          playedGames: s.played, won: s.won, draw: s.draw, lost: s.lost,
          goalsFor: s.gf, goalsAgainst: s.ga, goalDifference: s.gf - s.ga, points: s.pts,
        };
      })
      .sort((a, b) => b.points - a.points || (b.goalDifference - a.goalDifference) || (b.goalsFor - a.goalsFor));
    table.forEach((row, i) => { row.position = i + 1; });
    result.push({ group: `GROUP_${g.name}`, type: 'TOTAL', table });
  }
  return result;
}

export default function StandingsPage() {
  const { data, error, loading } = useApiStandings();
  // Always show static data as baseline, API data overrides when available
  const staticData = useMemo(() => generateStaticStandings(), []);
  const effectiveData = data && data.length > 0 ? data : staticData;
  const groups = (effectiveData || []).filter(s => s.type === 'TOTAL' && s.group);
  const [activeGroup, setActiveGroup] = useState('A');

  const hasLiveData = data && data.length > 0;
  const showLoading = loading && groups.length === 0;

  const currentGroup = groups.find(g => normalizeGroup(g.group || '') === activeGroup);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* <PageTracker event="standings_view" /> */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 小组积分榜</h1>
        <p className="text-gray-500 text-sm">
          12个小组 · 每组前2名直接晋级32强 · 8个最佳第3名晋级
        </p>
      </div>


      {/* Loading */}
      {showLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin text-4xl">⚽</div>
        </div>
      )}

      {!showLoading && groups.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-bold text-gray-500">暂无积分榜数据</p>
          <p className="text-sm mt-1">赛事开始后数据将自动更新</p>
        </div>
      )}

      {!showLoading && groups.length > 0 && (
        <>
          {/* Group tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
            {groups.map(g => {
              const name = normalizeGroup(g.group || '');
              return (
                <button
                  key={g.group}
                  onClick={() => setActiveGroup(name)}
                  className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeGroup === name
                      ? 'bg-navy text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {name} 组
                </button>
              );
            })}
          </div>

          {/* Current group table */}
          {currentGroup && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              <div className="bg-navy px-5 py-3 text-white">
                <h3 className="font-bold text-base">{activeGroup} 组</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500">
                      <th className="text-left py-2.5 pl-5 w-8">#</th>
                      <th className="text-left py-2.5">球队</th>
                      <th className="text-center py-2.5 w-8">赛</th>
                      <th className="text-center py-2.5 w-8">胜</th>
                      <th className="text-center py-2.5 w-8">平</th>
                      <th className="text-center py-2.5 w-8">负</th>
                      <th className="text-center py-2.5 hidden sm:table-cell">进/失</th>
                      <th className="text-center py-2.5 hidden sm:table-cell w-10">净胜</th>
                      <th className="text-center py-2.5 pr-5 w-10 font-semibold">分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGroup.table.map((row, i) => {
                      const teamId = tlaToTeamId(row.team.tla);
                      const team = getTeam(teamId);
                      const isQualify = i < 2;
                      const isPlayoff = i === 2;
                      return (
                        <tr key={row.team.id} className={`border-b border-gray-50 ${isQualify ? 'bg-qualify-light/60' : isPlayoff ? 'bg-playoff-light/60' : 'hover:bg-gray-50'}`}>
                          <td className="py-3 pl-5">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${i < 2 ? 'bg-qualify text-white' : i === 2 ? 'bg-playoff text-white' : 'text-gray-400'}`}>
                              {row.position}
                            </span>
                          </td>
                          <td className="py-3">
                            <a href={`/team/${teamId}`} className="flex items-center gap-2 hover:text-gold-dark transition-colors">
                              <span className="text-lg">{team?.flag || ''}</span>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">{team?.name || row.team.shortName}</div>
                                <div className="text-[10px] text-gray-400">{team?.nameEn || row.team.name}</div>
                              </div>
                            </a>
                          </td>
                          <td className="text-center py-3 text-gray-600 tabular-nums">{row.playedGames}</td>
                          <td className="text-center py-3 text-gray-600 tabular-nums">{row.won}</td>
                          <td className="text-center py-3 text-gray-600 tabular-nums">{row.draw}</td>
                          <td className="text-center py-3 text-gray-600 tabular-nums">{row.lost}</td>
                          <td className="text-center py-3 text-gray-500 text-xs hidden sm:table-cell tabular-nums">{row.goalsFor}-{row.goalsAgainst}</td>
                          <td className="text-center py-3 hidden sm:table-cell tabular-nums">
                            <span className={`font-semibold ${row.goalDifference > 0 ? 'text-qualify' : row.goalDifference < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                              {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                            </span>
                          </td>
                          <td className="text-center py-3 pr-5 font-bold text-gray-900 tabular-nums">{row.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick grid: all groups */}
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">全部小组一览</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {groups.map(g => {
                const name = normalizeGroup(g.group || '');
                return (
                  <button
                    key={g.group}
                    onClick={() => setActiveGroup(name)}
                    className={`text-left p-3 rounded-lg border transition-all ${activeGroup === name ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-navy-600'}`}
                  >
                    <div className={`font-bold text-sm mb-1.5 ${activeGroup === name ? 'text-gold' : ''}`}>{name} 组</div>
                    {g.table.slice(0, 2).map(row => {
                      const teamId = tlaToTeamId(row.team.tla);
                      const team = getTeam(teamId);
                      return (
                        <div key={row.team.id} className="flex items-center justify-between text-xs py-0.5">
                          <span className={activeGroup === name ? 'text-white/80' : 'text-gray-600'}>
                            {row.position}. {team?.flag || ''} {team?.name || row.team.shortName}
                          </span>
                          <span className={`font-semibold tabular-nums ${activeGroup === name ? 'text-gold-light' : 'text-gray-500'}`}>
                            {row.points}
                          </span>
                        </div>
                      );
                    })}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Rules */}
      <div className="mt-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">📋 晋级规则</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-qualify mt-1.5 shrink-0" />
              <span><strong>直接晋级</strong>：12个小组前2名（共24队）直接进入32强</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-playoff mt-1.5 shrink-0" />
              <span><strong>最佳第3名</strong>：8个成绩最好的小组第3名晋级32强</span>
            </div>
          </div>
          <div className="space-y-2">
            <p>• <strong>排名规则</strong>：积分 → 净胜球 → 进球数 → 相互战绩</p>
            <p>• <strong>淘汰赛</strong>：单场淘汰制，平局 → 加时 → 点球</p>
          </div>
        </div>
      </div>
    </div>
  );
}
