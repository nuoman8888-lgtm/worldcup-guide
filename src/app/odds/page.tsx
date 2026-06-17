import type { Metadata } from 'next';
import { getChampionOdds } from '@/data/odds';
import { getTeam } from '@/data/teams';
import CountryCodeBadge from '@/components/CountryCodeBadge';
// import PageTracker from '@/components/PageTracker';
// import Link from 'next/link';

export const metadata: Metadata = {
  title: '夺冠赔率分析 | 世界杯 2026',
  description: '2026世界杯夺冠赔率对比分析。Bet365、Pinnacle、William Hill三大博彩公司最新赔率数据，仅供赛事分析参考。',
};

export default function OddsPage() {
  const championOdds = getChampionOdds().slice(0, 20);
  const bookmakers = ['Bet365', 'Pinnacle', 'William Hill'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* <PageTracker event="odds_view" /> */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">💰 赔率分析</h1>
        <p className="text-gray-500 text-sm">
          数据来源于Bet365、Pinnacle、William Hill · 仅供参考 · 不构成投注建议
        </p>
        <div className="mt-3 bg-gold-50 border border-gold-light rounded-lg p-3 text-sm text-navy">
          ⚠️ 赔率数据仅供赛事分析参考，我们不提供投注功能，不推荐任何博彩行为。理性观赛，远离赌博。
        </div>
      </div>

      {/* Champion Winner Odds */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-full">
        <div className="bg-navy px-6 py-4 text-white">
          <h2 className="font-bold text-lg">🏆 冠军赔率 Top 20</h2>
          <p className="text-sm text-gray-400">赔率越低，夺冠概率越高</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">球队</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs">FIFA排名</th>
                {bookmakers.map(bm => (
                  <th key={bm} className="text-center px-4 py-3 font-medium text-gray-500 text-xs">{bm}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {championOdds.map((item, idx) => {
                const team = getTeam(item.teamId);
                if (!team) return null;
                return (
                  <tr key={item.teamId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold ${idx < 5 ? 'text-gold' : 'text-gray-400'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <a href={`/team/${team.id}`} className="flex items-center gap-2 hover:text-gold-dark transition-colors">
                        <CountryCodeBadge teamId={item.teamId} />
                        <div>
                          <div className="font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-none">{team.name}</div>
                          <div className="text-xs text-gray-400">{team.nameEn}</div>
                        </div>
                      </a>
                    </td>
                    <td className="text-center px-4 py-4 text-gray-600">{team.fifaRank}</td>
                    {bookmakers.map(bm => (
                      <td key={bm} className="text-center px-4 py-4">
                        <span className="font-mono font-bold text-gray-900">
                          {item.odds[bm]}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Predictions vs Market */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🤖 模型预测 vs 市场赔率</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Goldman Sachs */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">高盛量化模型</h3>
            <p className="text-xs text-gray-400 mb-3">5万次蒙特卡洛模拟 · Elo+历史数据</p>
            <div className="space-y-1.5 text-sm">
              {[
                { team: '西班牙', prob: 26 },
                { team: '法国', prob: 19 },
                { team: '阿根廷', prob: 14 },
                { team: '巴西', prob: 8 },
                { team: '英格兰', prob: 5 },
              ].map((t) => (
                <div key={t.team} className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-16 text-xs">{t.team}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-navy to-blue-500"
                      style={{ width: `${Math.round((t.prob / 26) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-navy w-10 text-right tabular-nums">{t.prob}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">显著高配西班牙，低配英格兰/葡萄牙</p>
          </div>

          {/* Opta */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">Opta 超级计算机</h3>
            <p className="text-xs text-gray-400 mb-3">AI预测 · xG+阵容深度+近期状态</p>
            <div className="space-y-1.5 text-sm">
              {[
                { team: '西班牙', prob: 16.1 },
                { team: '法国', prob: 13 },
                { team: '阿根廷', prob: 11 },
                { team: '巴西', prob: 10 },
                { team: '德国', prob: 8 },
              ].map((t) => (
                <div key={t.team} className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-16 text-xs">{t.team}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold to-yellow-400"
                      style={{ width: `${Math.round((t.prob / 16.1) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gold-dark w-10 text-right tabular-nums">{t.prob}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">强调近期状态，西班牙欧洲杯冠军加持</p>
          </div>

          {/* Market Consensus */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">博彩市场共识</h3>
            <p className="text-xs text-gray-400 mb-3">Bet365/威廉希尔/Pinnacle · 6月初</p>
            <div className="space-y-1.5 text-sm">
              {[
                { team: '西班牙', prob: 18 },
                { team: '法国', prob: 18 },
                { team: '英格兰', prob: 15 },
                { team: '葡萄牙', prob: 14 },
                { team: '阿根廷', prob: 12 },
              ].map((t) => (
                <div key={t.team} className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-16 text-xs">{t.team}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500"
                      style={{ width: `${Math.round((t.prob / 18) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-red-500 w-10 text-right tabular-nums">{t.prob}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">西法并列第一，市场未明确分出热门</p>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-4 bg-navy/5 border border-navy/10 rounded-xl p-4 text-sm text-gray-600">
          <p className="font-semibold text-gray-900 mb-2">📊 关键认知差</p>
          <ul className="space-y-1.5 list-disc list-inside text-xs leading-relaxed">
            <li>高盛模型<strong>显著高配西班牙（26%）</strong>，远高于市场隐含概率（~18%），与博彩赔率存在明显认知差</li>
            <li>市场赔率<strong>西班牙与法国几乎无差别</strong>，反映资金流向与市场情绪的高度均衡</li>
            <li>Opta等数据机构更关注<strong>xG（预期进球）与阵容深度</strong>，西班牙因2024欧洲杯冠军获得更高权重</li>
            <li className="text-gray-400">⚠️ 赔率反映资金流向与市场情绪，不等于真实胜率；模型无法预判伤病、临场发挥或偶然事件（点球、红牌）</li>
          </ul>
        </div>
      </div>

      {/* How Odds Work */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-3">📖 赔率怎么看？</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>小数赔率</strong>（欧洲赔率）：表示每投入1元可获得的回报</p>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <p>例如：西班牙赔率 <span className="font-bold text-gray-900">5.00</span></p>
              <p>→ 投注1元，获胜可得 <span className="font-bold text-gray-900">5.00</span> 元</p>
              <p>→ 隐含概率 ≈ <span className="font-bold text-qualify">{Math.round(100/5)}%</span></p>
            </div>
            <p>赔率越低 = 市场认为夺冠概率越高</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-3">🏅 夺冠热门分析</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {championOdds.slice(0, 6).map((item, idx) => {
              const team = getTeam(item.teamId);
              if (!team) return null;
              const implied = Math.round(100 / item.odds['Bet365']);
              return (
                <a
                  key={item.teamId}
                  href={`/team/${team.id}`}
                  className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 hover:text-gold-dark transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold w-4 ${idx < 3 ? 'text-gold' : 'text-gray-400'}`}>
                      {idx + 1}
                    </span>
                    <span>{team.flag}</span>
                    <span className="font-medium text-gray-900">{team.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold">{item.odds['Bet365']}</span>
                    <span className="text-xs text-gray-400 ml-1">(~{implied}%)</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
