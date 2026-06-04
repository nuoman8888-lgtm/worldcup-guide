import Link from 'next/link';
import { getTeam } from '@/data/teams';
import type { Match } from '@/data/matches';

export default function MatchCard({ match }: { match: Match }) {
  const homeTeam = match.homeTeamId !== 'TBD' ? getTeam(match.homeTeamId) : null;
  const awayTeam = match.awayTeamId !== 'TBD' ? getTeam(match.awayTeamId) : null;

  const stageLabels: Record<string, string> = {
    group: '',
    round32: '32强',
    round16: '16强',
    quarterfinal: '¼决赛',
    semifinal: '半决赛',
    thirdPlace: '三四名',
    final: '🏆 决赛',
  };

  const stageBadge = stageLabels[match.stage];

  return (
    <Link
      href={`/match/${match.id}`}
      className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {match.group && (
            <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded">
              {match.group}组
            </span>
          )}
          {stageBadge && (
            <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
              {stageBadge}
            </span>
          )}
          {match.status === 'live' && (
            <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">{match.time} (UTC+8)</span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between">
        {/* Home team */}
        <div className="flex flex-col items-center flex-1">
          {homeTeam ? (
            <>
              <span className="text-3xl mb-1">{homeTeam.flag}</span>
              <span className="font-semibold text-gray-900 text-sm text-center">{homeTeam.name}</span>
              <span className="text-xs text-gray-400">{homeTeam.nameEn}</span>
            </>
          ) : (
            <>
              <span className="text-3xl mb-1">❓</span>
              <span className="font-semibold text-gray-400 text-sm">待定</span>
            </>
          )}
        </div>

        {/* Score / VS */}
        <div className="flex-shrink-0 mx-4">
          {match.status === 'finished' && match.homeScore !== undefined ? (
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-900">{match.homeScore} - {match.awayScore}</span>
              <div className="text-xs text-gray-500 mt-1">完赛</div>
            </div>
          ) : match.status === 'live' ? (
            <div className="text-center">
              <span className="text-3xl font-bold text-red-600 animate-pulse">{match.homeScore ?? 0} - {match.awayScore ?? 0}</span>
              <div className="text-xs text-red-500 mt-1">进行中</div>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-xl font-bold text-gray-400">VS</span>
              <div className="text-xs text-gray-400 mt-1">未开始</div>
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center flex-1">
          {awayTeam ? (
            <>
              <span className="text-3xl mb-1">{awayTeam.flag}</span>
              <span className="font-semibold text-gray-900 text-sm text-center">{awayTeam.name}</span>
              <span className="text-xs text-gray-400">{awayTeam.nameEn}</span>
            </>
          ) : (
            <>
              <span className="text-3xl mb-1">❓</span>
              <span className="font-semibold text-gray-400 text-sm">待定</span>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
        <span>📍 {match.city}</span>
        <span>🏟️ {match.venue}</span>
      </div>
    </Link>
  );
}
