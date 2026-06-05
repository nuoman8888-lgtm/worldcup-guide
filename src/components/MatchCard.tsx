import Link from 'next/link';
import { getTeam } from '@/data/teams';
import type { Match } from '@/data/matches';

const stageLabels: Record<string, string> = {
  group: '',
  round32: '32强',
  round16: '16强',
  quarterfinal: '¼决赛',
  semifinal: '半决赛',
  thirdPlace: '三四名',
  final: '🏆 决赛',
};

/** Time tag for Chinese fans */
function timeTag(time: string): { label: string; className: string } {
  const h = parseInt(time.split(':')[0], 10);
  if (h >= 18 && h <= 23) return { label: '黄金', className: 'text-green-600 bg-green-50' };
  if (h >= 9 && h <= 17) return { label: '上午', className: 'text-blue-600 bg-blue-50' };
  if (h >= 0 && h <= 2) return { label: '深夜', className: 'text-yellow-600 bg-yellow-50' };
  return { label: '凌晨', className: 'text-red-600 bg-red-50' };
}

export default function MatchCard({ match }: { match: Match }) {
  const homeTeam = match.homeTeamId !== 'TBD' ? getTeam(match.homeTeamId) : null;
  const awayTeam = match.awayTeamId !== 'TBD' ? getTeam(match.awayTeamId) : null;
  const stageBadge = stageLabels[match.stage];
  const tag = timeTag(match.time);

  return (
    <Link
      href={`/match/${match.id}`}
      className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {match.group && (
            <span className="text-[11px] font-semibold bg-navy text-gold-light px-2 py-0.5 rounded">
              {match.group}组
            </span>
          )}
          {stageBadge && (
            <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {stageBadge}
            </span>
          )}
          {match.status === 'live' && (
            <span className="text-[11px] font-bold bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 font-mono">{match.time}</span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between">
        {/* Home */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          {homeTeam ? (
            <>
              <span className="text-3xl mb-1">{homeTeam.flag}</span>
              <span className="font-semibold text-gray-900 text-xs text-center truncate w-full">{homeTeam.name}</span>
            </>
          ) : (
            <>
              <span className="text-3xl mb-1">❓</span>
              <span className="font-semibold text-gray-400 text-xs">待定</span>
            </>
          )}
        </div>

        {/* Score / VS */}
        <div className="flex-shrink-0 mx-3">
          {match.status === 'finished' && match.homeScore !== undefined ? (
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900 tabular-nums">{match.homeScore} - {match.awayScore}</span>
              <div className="text-[10px] text-gray-400 mt-0.5">完赛</div>
            </div>
          ) : match.status === 'live' ? (
            <div className="text-center">
              <span className="text-2xl font-bold text-red-600 animate-pulse tabular-nums">{match.homeScore ?? 0} - {match.awayScore ?? 0}</span>
              <div className="text-[10px] text-red-500 font-medium mt-0.5">进行中</div>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-lg font-bold text-gray-300">VS</span>
              <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 ${tag.className}`}>
                {tag.label}
              </span>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          {awayTeam ? (
            <>
              <span className="text-3xl mb-1">{awayTeam.flag}</span>
              <span className="font-semibold text-gray-900 text-xs text-center truncate w-full">{awayTeam.name}</span>
            </>
          ) : (
            <>
              <span className="text-3xl mb-1">❓</span>
              <span className="font-semibold text-gray-400 text-xs">待定</span>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400 group-hover:text-gray-500 transition-colors">
        <span>📍 {match.city}</span>
        <span>🏟️ {match.venue}</span>
      </div>
    </Link>
  );
}
