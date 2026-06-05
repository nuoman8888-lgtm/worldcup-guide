import Link from 'next/link';
import SearchBox from '@/components/SearchBox';
import TodayMatches from '@/components/TodayMatches';
import { getSimulatedStandings } from '@/data/standings';
import { getTeam } from '@/data/teams';

const hotTeamIds = [
  'argentina', 'brazil', 'germany', 'france',
  'japan', 'south-korea', 'portugal', 'england',
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero: Search-first ── */}
      <section className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-14 md:py-20 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
            🏆 世界杯观赛指南
          </h1>
          <p className="text-green-100 mb-8 text-sm md:text-base">
            2026 美加墨世界杯 · 48 支球队 · 104 场比赛
          </p>

          {/* Search */}
          <SearchBox variant="hero" />

          {/* Hot teams quick links */}
          <div className="mt-5 flex justify-center gap-1.5 flex-wrap">
            {hotTeamIds.map(id => {
              const team = getTeam(id);
              if (!team) return null;
              return (
                <Link
                  key={id}
                  href={`/team/${id}`}
                  className="inline-flex items-center gap-1 text-xs bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full transition-colors"
                >
                  <span>{team.flag}</span>
                  <span>{team.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Today's Matches ── */}
      <section className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <TodayMatches />
      </section>

      {/* ── Quick nav ── */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/schedule"
            className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md hover:border-green-200 transition-all"
          >
            <div className="text-2xl mb-1">📅</div>
            <div className="font-semibold text-sm text-gray-900">完整赛程</div>
            <div className="text-xs text-gray-400">104 场比赛</div>
          </Link>
          <Link
            href="/standings"
            className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md hover:border-green-200 transition-all"
          >
            <div className="text-2xl mb-1">📊</div>
            <div className="font-semibold text-sm text-gray-900">积分榜</div>
            <div className="text-xs text-gray-400">12 个小组</div>
          </Link>
          <Link
            href="/odds"
            className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md hover:border-green-200 transition-all"
          >
            <div className="text-2xl mb-1">💰</div>
            <div className="font-semibold text-sm text-gray-900">赔率分析</div>
            <div className="text-xs text-gray-400">四大博彩</div>
          </Link>
        </div>
      </section>

      {/* ── Group overview ── */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">📊 小组积分榜速览</h2>
          <Link href="/standings" className="text-sm text-green-700 hover:underline font-medium">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {getSimulatedStandings().map(group => (
            <Link
              key={group.groupName}
              href="/standings"
              className="bg-white rounded-lg border border-gray-100 p-3 hover:shadow-md hover:border-green-200 transition-all"
            >
              <div className="font-bold text-sm text-gray-900 mb-2">
                {group.groupName} 组
              </div>
              <div className="space-y-1">
                {group.standings.slice(0, 3).map((row, i) => {
                  const team = getTeam(row.teamId);
                  if (!team) return null;
                  return (
                    <div
                      key={row.teamId}
                      className={`flex items-center gap-1.5 text-xs rounded px-1 py-0.5 ${
                        i < 2 ? 'bg-green-50/60' : ''
                      }`}
                    >
                      <span className="text-gray-400 w-3 tabular-nums">{i + 1}</span>
                      <span className="text-sm">{team.flag}</span>
                      <span className="font-medium text-gray-700 truncate flex-1">
                        {team.name}
                      </span>
                      <span className="font-semibold text-gray-500 tabular-nums">
                        {row.points}
                      </span>
                    </div>
                  );
                })}
              </div>
              {group.standings.length > 3 && (
                <div className="text-[10px] text-gray-400 mt-1.5 text-center">
                  +{group.standings.length - 3} 队
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
