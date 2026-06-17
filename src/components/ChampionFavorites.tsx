// import Link from 'next/link';
import { getTeam } from '@/data/teams';
import CountryCodeBadge from './CountryCodeBadge';
import type { WinnerOdd } from '@/data/odds';

interface ChampionFavoritesProps {
  teams: WinnerOdd[];
}

/** Implied probability from decimal odds */
function impliedProb(odds: number): number {
  return Math.round((1 / odds) * 100);
}

/**
 * Champion favorites widget: ranked list with odds and visual bars.
 * Used on homepage right column.
 */
export function ChampionFavorites({ teams }: ChampionFavoritesProps) {
  if (teams.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
        暂无赔率数据
      </div>
    );
  }

  // Use first team's implied probability as max for bar scaling
  const maxProb = impliedProb(teams[0]?.odds['Bet365'] ?? 1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-50">
        {teams.map((item, idx) => {
          const team = getTeam(item.teamId);
          if (!team) return null;
          const prob = impliedProb(item.odds['Bet365']);
          const barWidth = Math.max(4, (prob / maxProb) * 100);

          return (
            <a
              key={item.teamId}
              href={`/team/${item.teamId}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
            >
              {/* Rank */}
              <span className={`text-xs font-bold w-5 tabular-nums shrink-0 ${
                idx === 0 ? 'text-gold' :
                idx <= 2 ? 'text-navy' : 'text-gray-400'
              }`}>
                {idx + 1}
              </span>

              {/* Flag + Name */}
              <CountryCodeBadge teamId={item.teamId} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-gray-900 text-sm truncate">{team.name}</span>
                  <span className="text-xs font-bold text-gray-500 tabular-nums">{prob}%</span>
                </div>
                {/* Bar */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      idx === 0
                        ? 'bg-gradient-to-r from-gold to-yellow-400'
                        : idx <= 2
                        ? 'bg-gradient-to-r from-navy to-navy-600'
                        : 'bg-gray-300'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>

              {/* Odds number */}
              <span className="text-xs font-mono font-bold text-gray-900 tabular-nums shrink-0 w-12 text-right">
                {item.odds['Bet365']}
              </span>
              <span className="text-gray-300 text-xs group-hover:text-gold transition-colors shrink-0">→</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
