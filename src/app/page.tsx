import Link from 'next/link';
import PageTracker from '@/components/PageTracker';
import { CountdownBar } from '@/components/CountdownBar';
import { TodayFocus } from '@/components/TodayFocus';
import { TodayMustWatch } from '@/components/TodayMustWatch';
import { ChampionFavorites } from '@/components/ChampionFavorites';
import CountryCodeBadge from '@/components/CountryCodeBadge';
import { MyTeamWidget } from '@/components/MyTeamWidget';
import MyTeamModal from '@/components/MyTeamModal';
import { getSimulatedStandings } from '@/data/standings';
import { getTeam } from '@/data/teams';
import { getChampionOdds } from '@/data/odds';
import { getUpcomingMatches } from '@/data/matches';

// ── Homepage: compact above-fold, dual-column, match-first ──
export default function HomePage() {
  const champOdds = getChampionOdds().slice(0, 5);
  const upcoming = getUpcomingMatches().slice(0, 6);

  return (
    <div className="min-h-screen">
      <PageTracker event="home_view" />
      {/* MyTeam modal (first visit) */}
      <MyTeamModal />

      {/* ═══════════ Status bar — compact ═══════════ */}
      <section className="bg-navy border-b border-navy-600">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <CountdownBar />
        </div>
      </section>

      {/* ═══════════ Main: dual-column ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: must-watch + focus matches (3/5) */}
          <div className="lg:col-span-3 space-y-5">
            <TodayMustWatch />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">📅 焦点比赛</h2>
                <Link href="/schedule" className="text-sm text-gold-dark hover:underline font-medium">
                  完整赛程 →
                </Link>
              </div>
              <TodayFocus />
            </div>
          </div>

          {/* Right: my team + champion favorites (2/5) */}
          <div className="lg:col-span-2 space-y-5">
            <MyTeamWidget />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">🏆 冠军热门</h2>
                <Link href="/odds" className="text-sm text-gold-dark hover:underline font-medium">
                  完整赔率 →
                </Link>
              </div>
              <ChampionFavorites teams={champOdds} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ Upcoming matches ═══════════ */}
      {upcoming.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">📅 即将到来</h2>
            <Link href="/schedule" className="text-sm text-gold-dark hover:underline font-medium">
              全部 →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.map(m => {
              const h = getTeam(m.homeTeamId);
              const a = getTeam(m.awayTeamId);
              const hour = parseInt(m.time.split(':')[0], 10);
              const tag = hour >= 18 && hour <= 23 ? '🟢' : hour >= 9 && hour <= 17 ? '🔵' : hour >= 0 && hour <= 2 ? '🟡' : '🔴';

              return (
                <Link
                  key={m.id}
                  href={`/match/${m.id}`}
                  className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-3 hover:shadow-md hover:border-navy-600 transition-all"
                >
                  <div className="text-center shrink-0 w-12">
                    <div className="text-[10px] text-gray-400">{m.date.slice(5)}</div>
                    <div className="text-sm font-bold text-gray-900 font-mono">{m.time}</div>
                  </div>
                  <div className="flex-1 min-w-0 text-center">
                    <span className="text-xs font-medium text-gray-900">{h?.name || 'TBD'}</span>
                    <span className="text-gray-300 mx-1 text-[10px]">vs</span>
                    <span className="text-xs font-medium text-gray-900">{a?.name || 'TBD'}</span>
                  </div>
                  <span className="text-[10px]">{tag}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════ Bottom: Standings + Odds ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Group Standings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">📊 小组积分榜</h2>
              <Link href="/standings" className="text-sm text-gold-dark hover:underline font-medium">
                全部12组 →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {getSimulatedStandings().slice(0, 6).map(group => (
                <Link
                  key={group.groupName}
                  href="/standings"
                  className="bg-white rounded-lg border border-gray-100 p-3 hover:shadow-md hover:border-navy-600 transition-all"
                >
                  <div className="font-bold text-sm text-gray-900 mb-2">{group.groupName} 组</div>
                  {group.standings.slice(0, 2).map((row, i) => {
                    const team = getTeam(row.teamId);
                    if (!team) return null;
                    return (
                      <div
                        key={row.teamId}
                        className={`flex items-center gap-1.5 text-xs rounded px-1 py-0.5 ${
                          i === 0 ? 'bg-qualify-light' : ''
                        }`}
                      >
                        <span className="text-gray-400 w-3 tabular-nums">{i + 1}</span>
                        <CountryCodeBadge teamId={team.id} size="sm" />
                        <span className="font-medium text-gray-700 truncate flex-1">{team.name}</span>
                        <span className="text-gray-400 tabular-nums text-[10px]">#{team.fifaRank}</span>
                      </div>
                    );
                  })}
                  <div className="text-[10px] text-gray-400 mt-1.5 text-center">
                    赛前预览 · 查看详情 →
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Champion Odds */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">💰 夺冠赔率 TOP6</h2>
              <Link href="/odds" className="text-sm text-gold-dark hover:underline font-medium">
                完整赔率 →
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {champOdds.slice(0, 6).map((item, i) => {
                  const team = getTeam(item.teamId);
                  if (!team) return null;
                  return (
                    <Link
                      key={item.teamId}
                      href={`/team/${item.teamId}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      <span className={`text-xs font-bold w-5 tabular-nums ${
                        i === 0 ? 'text-gold' : i <= 2 ? 'text-navy' : 'text-gray-400'
                      }`}>
                        {i + 1}
                      </span>
                      <CountryCodeBadge teamId={item.teamId} />
                      <span className="font-semibold text-gray-900 text-sm flex-1 truncate">{team.name}</span>
                      <span className="font-bold text-sm text-gray-900 tabular-nums">{item.odds['Bet365']}</span>
                      <span className="text-gray-300 text-xs group-hover:text-gold transition-colors">→</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
