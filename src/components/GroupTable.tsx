import Link from 'next/link';
import { getTeam } from '@/data/teams';
import CountryCodeBadge from './CountryCodeBadge';
import type { GroupStandings } from '@/data/standings';

/** Compute qualification probability based on ELO + odds within group */
function computeQualProb(teamId: string, standings: { teamId: string }[], groupName: string): number {
  const groupTeams = standings.map(s => getTeam(s.teamId)).filter(Boolean);
  const team = getTeam(teamId);
  if (!team || groupTeams.length === 0) return 50;

  const totalElo = groupTeams.reduce((s, t) => s + (t?.elo || 1500), 0);
  const eloShare = team.elo / totalElo;
  const oddsBonus = Math.max(0.5, Math.min(3, 2 / (team.groupStageOdds || 2)));

  // Blend: ELO weight + odds weight, normalize to ~250% total (2 direct + potential 3rd)
  const raw = (eloShare * 180 + oddsBonus * 70);
  return Math.round(Math.min(98, Math.max(2, raw)));
}

export default function GroupTable({ data, compact = false }: { data: GroupStandings; compact?: boolean }) {
  // Sort by FIFA rules: points → goalDiff → goalsFor → elo
  const sorted = [...data.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return 0;
  });

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="bg-navy text-white px-3 py-2 font-bold text-sm">
          {data.groupName} 组
        </div>
        <div className="divide-y divide-gray-50">
          {sorted.map((row, i) => {
            const team = getTeam(row.teamId);
            const isQualify = i < 2;
            const isPlayoff = i === 2;
            return (
              <div
                key={row.teamId}
                className={`flex items-center justify-between px-3 py-2 ${
                  isQualify ? 'bg-qualify-light border-l-2 border-qualify' :
                  isPlayoff ? 'bg-playoff-light border-l-2 border-playoff' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4 tabular-nums">{i + 1}</span>
                  {team && <CountryCodeBadge teamId={team.id} />}
                  <span className="text-sm font-medium text-gray-900">{team?.name || row.teamId}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{row.played}场</span>
                  <span className="font-semibold text-gray-900 tabular-nums">{row.points}分</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full table
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-full">
      {/* Header */}
      <div className="bg-navy px-5 py-3 text-white">
        <h3 className="font-bold text-base">{data.groupName} 组</h3>
        <p className="text-xs text-gray-400 mt-0.5">前两名直接晋级32强，第3名仍有机会</p>
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
              <th className="text-center py-2.5 pr-3 w-14 font-semibold">出线%</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const team = getTeam(row.teamId);
              if (!team) return null;
              const isQualify = i < 2;
              const isPlayoff = i === 2;

              return (
                <tr
                  key={row.teamId}
                  className={`border-b border-gray-50 transition-colors ${
                    isQualify
                      ? 'bg-qualify-light/60'
                      : isPlayoff
                      ? 'bg-playoff-light/60'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-3 pl-5">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${
                        i === 0 ? 'bg-qualify text-white' :
                        i === 1 ? 'bg-qualify text-white' :
                        i === 2 ? 'bg-playoff text-white' : 'text-gray-400'
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/team/${row.teamId}`}
                      className="flex items-center gap-2 hover:text-gold-dark transition-colors"
                    >
                      <span className="text-lg">{team.flag}</span>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{team.name}</div>
                        <div className="text-[10px] text-gray-400">{team.nameEn}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="text-center py-3 text-gray-600 tabular-nums">{row.played}</td>
                  <td className="text-center py-3 text-gray-600 tabular-nums">{row.won}</td>
                  <td className="text-center py-3 text-gray-600 tabular-nums">{row.drawn}</td>
                  <td className="text-center py-3 text-gray-600 tabular-nums">{row.lost}</td>
                  <td className="text-center py-3 text-gray-500 text-xs hidden sm:table-cell tabular-nums">
                    {row.goalsFor}-{row.goalsAgainst}
                  </td>
                  <td className="text-center py-3 hidden sm:table-cell tabular-nums">
                    <span className={`font-semibold ${row.goalDiff > 0 ? 'text-qualify' : row.goalDiff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {row.goalDiff > 0 ? '+' : ''}{row.goalDiff}
                    </span>
                  </td>
                  <td className="text-center py-3 pr-5 font-bold text-gray-900 tabular-nums">{row.points}</td>
                  <td className="text-center py-3 pr-3">
                    {(() => {
                      const totalPts = data.standings.reduce((s, r) => s + r.points, 0);
                      if (totalPts === 0) {
                        return <span className="text-xs text-gray-400">赛前</span>;
                      }
                      const prob = computeQualProb(row.teamId, data.standings, data.groupName);
                      return (
                        <div className="flex items-center gap-1.5 justify-end">
                          <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                prob >= 80 ? 'bg-qualify' : prob >= 50 ? 'bg-playoff' : 'bg-gray-300'
                              }`}
                              style={{ width: `${prob}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold tabular-nums ${
                            prob >= 80 ? 'text-qualify' : prob >= 50 ? 'text-playoff' : 'text-gray-500'
                          }`}>
                            {prob}%
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-5 py-2.5 border-t border-gray-100 flex gap-4 text-[11px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-qualify" /> 晋级32强
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-playoff" /> 可能晋级（最佳第3名）
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-gray-200" /> 淘汰
        </span>
      </div>
    </div>
  );
}
