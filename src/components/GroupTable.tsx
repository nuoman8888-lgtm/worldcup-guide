import { getTeam } from '@/data/teams';
import type { GroupStandings } from '@/data/standings';
import TeamBadge from './TeamBadge';

export default function GroupTable({ data, compact = false }: { data: GroupStandings; compact?: boolean }) {
  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 text-white px-3 py-2 font-bold text-sm">
          {data.groupName} 组
        </div>
        <div className="divide-y divide-gray-50">
          {data.standings.map((row, i) => {
            const team = getTeam(row.teamId);
            return (
              <div key={row.teamId} className={`flex items-center justify-between px-3 py-2 ${i < 2 ? 'bg-green-50/50' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  {team && <span className="text-lg">{team.flag}</span>}
                  <span className="text-sm font-medium text-gray-900">{team?.name || row.teamId}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{row.played}场</span>
                  <span className="font-semibold text-gray-900">{row.points}分</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-3">
        <h3 className="font-bold text-lg">{data.groupName} 组</h3>
        <p className="text-xs text-gray-400 mt-0.5">前两名直接晋级，小组第三仍有机会</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs">
              <th className="text-left px-4 py-2 font-medium">球队</th>
              <th className="text-center px-2 py-2 font-medium">场</th>
              <th className="text-center px-2 py-2 font-medium">胜</th>
              <th className="text-center px-2 py-2 font-medium">平</th>
              <th className="text-center px-2 py-2 font-medium">负</th>
              <th className="text-center px-2 py-2 font-medium">进/失</th>
              <th className="text-center px-2 py-2 font-medium">净胜</th>
              <th className="text-center px-4 py-2 font-medium">分</th>
            </tr>
          </thead>
          <tbody>
            {data.standings.map((row, i) => {
              const team = getTeam(row.teamId);
              return (
                <tr key={row.teamId} className={`border-b border-gray-50 ${i < 2 ? 'bg-green-50/30' : ''} hover:bg-gray-50 transition-colors`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold w-5 ${i < 2 ? 'text-green-600' : 'text-gray-400'}`}>
                        {i + 1}
                      </span>
                      {team && <span className="text-xl">{team.flag}</span>}
                      <div>
                        <div className="font-semibold text-gray-900">{team?.name || row.teamId}</div>
                        <div className="text-[10px] text-gray-400">{team?.nameEn || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center px-2 py-3 text-gray-600">{row.played}</td>
                  <td className="text-center px-2 py-3 text-gray-600">{row.won}</td>
                  <td className="text-center px-2 py-3 text-gray-600">{row.drawn}</td>
                  <td className="text-center px-2 py-3 text-gray-600">{row.lost}</td>
                  <td className="text-center px-2 py-3 text-gray-600">{row.goalsFor}-{row.goalsAgainst}</td>
                  <td className={`text-center px-2 py-3 font-medium ${row.goalDiff > 0 ? 'text-green-600' : row.goalDiff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {row.goalDiff > 0 ? '+' : ''}{row.goalDiff}
                  </td>
                  <td className="text-center px-4 py-3 font-bold text-gray-900">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
