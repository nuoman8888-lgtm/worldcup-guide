import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';
import MatchCard from '@/components/MatchCard';
import { allMatches } from '@/data/matches';
import { getSimulatedStandings, getChampionshipProbabilities } from '@/data/standings';
import { getTeam } from '@/data/teams';

export default function HomePage() {
  const today = '2026-06-12'; // Opening day — Mexico vs South Africa
  const todayMatches = allMatches.filter(m => m.date === today && m.stage === 'group');
  const tomorrowMatches = allMatches.filter(m => m.date === '2026-06-12' && m.stage === 'group');

  const champProbs = getChampionshipProbabilities().slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl select-none">⚽</div>
          <div className="absolute bottom-10 right-10 text-9xl select-none">🏟️</div>
          <div className="absolute top-1/2 left-1/3 text-8xl select-none">🏆</div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>2026 FIFA World Cup · 6月12日 - 7月20日 · 美国/加拿大/墨西哥</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
              🏆 世界杯观赛指南
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              AI驱动的全方位世界杯数据平台 · 48支球队 · 104场比赛
            </p>

            <div className="flex justify-center mb-8">
              <CountdownTimer />
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/schedule" className="px-6 py-3 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition-colors shadow-lg">
                📅 查看全部赛程
              </Link>
              <Link href="/standings" className="px-6 py-3 bg-white/10 backdrop-blur text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                📊 积分榜
              </Link>
              <Link href="/ai" className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition-colors shadow-lg">
                🤖 AI 预测
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '📅', title: '完整赛程', desc: '104场比赛一览', href: '/schedule', color: 'from-blue-500 to-blue-600' },
            { icon: '📊', title: '积分榜', desc: '12个小组排名', href: '/standings', color: 'from-purple-500 to-purple-600' },
            { icon: '💰', title: '赔率分析', desc: '四大博彩对比', href: '/odds', color: 'from-orange-500 to-orange-600' },
            { icon: '🤖', title: 'AI预测', desc: '胜率分析', href: '/ai', color: 'from-pink-500 to-pink-600' },
          ].map(card => (
            <Link
              key={card.href}
              href={card.href}
              className={`bg-gradient-to-br ${card.color} text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5`}
            >
              <div className="text-2xl mb-2">{card.icon}</div>
              <div className="font-bold text-sm">{card.title}</div>
              <div className="text-xs text-white/70">{card.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Opening Day Matches */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            📅 开幕日 <span className="text-sm font-normal text-gray-500">6月12日（周五）</span>
          </h2>
          <Link href="/schedule" className="text-sm text-green-700 hover:underline font-medium">查看全部 →</Link>
        </div>
        {todayMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {todayMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white rounded-xl border">比赛即将开始！</div>
        )}
      </section>

      {/* Championship Probability */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          🏆 冠军概率预测
          <span className="text-sm font-normal text-gray-500 ml-2">AI动态计算</span>
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3">
            {champProbs.map((item, idx) => {
              const team = getTeam(item.teamId);
              if (!team) return null;
              const maxProb = champProbs[0]?.probability || 20;
              const barWidth = (item.probability / maxProb) * 100;
              return (
                <div key={item.teamId} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
                  <span className="text-2xl">{team.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-gray-900">{team.name}</span>
                      <span className="text-sm font-bold text-green-700">{item.probability}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <Link href="/ai" className="text-sm text-green-700 hover:underline font-medium">🤖 查看完整AI预测 →</Link>
          </div>
        </div>
      </section>

      {/* Group Overview */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">📊 12个小组一览</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {getSimulatedStandings().map(group => (
            <div key={group.groupName} className="bg-white rounded-lg border border-gray-100 p-3">
              <div className="font-bold text-sm text-gray-900 mb-2">{group.groupName} 组</div>
              <div className="space-y-1.5">
                {group.standings.map((row, i) => {
                  const team = getTeam(row.teamId);
                  if (!team) return null;
                  return (
                    <Link
                      key={row.teamId}
                      href={`/team/${row.teamId}`}
                      className={`flex items-center gap-2 text-xs rounded px-1.5 py-1 hover:bg-gray-50 transition-colors ${i < 2 ? 'bg-green-50/50' : ''}`}
                    >
                      <span className="text-gray-400 w-3">{i + 1}</span>
                      <span>{team.flag}</span>
                      <span className="font-medium text-gray-900 truncate flex-1">{team.name}</span>
                      <span className="font-semibold text-gray-600">{row.points}分</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-6xl mx-auto px-4 py-10 text-center">
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">🤖 AI世界杯问答</h2>
          <p className="text-green-100 mb-5 max-w-md mx-auto">
            问AI：&quot;巴西能夺冠吗？&quot; &quot;阿根廷出线概率？&quot;
          </p>
          <Link href="/ai" className="inline-block px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition-colors shadow-lg">
            开始提问 →
          </Link>
        </div>
      </section>
    </div>
  );
}
