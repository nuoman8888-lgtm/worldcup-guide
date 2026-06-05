import Link from 'next/link';
import SearchBox from '@/components/SearchBox';
import TodayMatches from '@/components/TodayMatches';
import CountdownTimer from '@/components/CountdownTimer';
import { getSimulatedStandings } from '@/data/standings';
import { getTeam } from '@/data/teams';

const hotTeamIds = [
  'argentina', 'brazil', 'france', 'germany',
  'england', 'spain', 'portugal', 'netherlands',
  'japan', 'south-korea',
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ═══════════════════════════════════════════
          HERO — 视觉冲击 + 搜索优先
          ═══════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white overflow-hidden">
        {/* Floating emoji background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 text-9xl select-none">⚽</div>
          <div className="absolute bottom-10 right-10 text-9xl select-none">🏟️</div>
          <div className="absolute top-1/3 right-1/4 text-8xl select-none">🏆</div>
          <div className="absolute bottom-1/4 left-1/4 text-7xl select-none">🌟</div>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-16 md:py-24 text-center">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>2026 FIFA World Cup · 6月12日 - 7月20日 · 美国/加拿大/墨西哥</span>
          </div>

          {/* Big title */}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-3 tracking-tight">
            🏆 世界杯观赛指南
          </h1>
          <p className="text-lg md:text-xl text-green-100 mb-10">
            48支球队 · 104场比赛 · 全方位数据平台
          </p>

          {/* ── Search: 核心交互 ── */}
          <div className="mb-5">
            <SearchBox variant="hero" />
          </div>

          {/* Hot teams */}
          <div className="flex justify-center gap-1.5 flex-wrap mb-10">
            {hotTeamIds.map(id => {
              const team = getTeam(id);
              if (!team) return null;
              return (
                <Link
                  key={id}
                  href={`/team/${id}`}
                  className="inline-flex items-center gap-1 text-xs bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full transition-all hover:scale-105"
                >
                  <span>{team.flag}</span>
                  <span className="hidden sm:inline">{team.name}</span>
                </Link>
              );
            })}
          </div>

          {/* ── Countdown: 制造紧迫感 ── */}
          <CountdownTimer />

          {/* Quick CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Link
              href="/schedule"
              className="px-6 py-3 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              📅 完整赛程
            </Link>
            <Link
              href="/standings"
              className="px-6 py-3 bg-white/10 backdrop-blur text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              📊 积分榜
            </Link>
            <Link
              href="/odds"
              className="px-6 py-3 bg-white/10 backdrop-blur text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              💰 赔率分析
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TODAY'S MATCHES
          ═══════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <TodayMatches />
      </section>

      {/* ═══════════════════════════════════════════
          GROUP OVERVIEW
          ═══════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">📊 12个小组一览</h2>
          <Link href="/standings" className="text-sm text-green-700 hover:underline font-medium">
            查看完整积分榜 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {getSimulatedStandings().map(group => (
            <Link
              key={group.groupName}
              href="/standings"
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-green-200 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900">{group.groupName} 组</span>
                <span className="text-xs text-gray-300 group-hover:text-green-500 transition-colors">→</span>
              </div>
              <div className="space-y-1.5">
                {group.standings.map((row, i) => {
                  const team = getTeam(row.teamId);
                  if (!team) return null;
                  return (
                    <div
                      key={row.teamId}
                      className={`flex items-center gap-2 text-xs rounded px-1.5 py-1 ${
                        i < 2 ? 'bg-green-50/70' : ''
                      }`}
                    >
                      <span className="text-gray-400 w-3 tabular-nums font-medium">{i + 1}</span>
                      <span className="text-base">{team.flag}</span>
                      <span className="font-medium text-gray-700 truncate flex-1">{team.name}</span>
                      <span className="font-bold text-gray-500 tabular-nums">{row.points}</span>
                    </div>
                  );
                })}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
