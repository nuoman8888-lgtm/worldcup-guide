import { getChampionOdds } from '@/data/odds';
import { getTeam } from '@/data/teams';
import Link from 'next/link';

export default function OddsPage() {
  const championOdds = getChampionOdds().slice(0, 20);
  const bookmakers = ['Bet365', 'Pinnacle', 'William Hill'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
                      <Link href={`/team/${team.id}`} className="flex items-center gap-2 hover:text-gold-dark transition-colors">
                        <span className="text-xl">{team.flag}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{team.name}</div>
                          <div className="text-xs text-gray-400">{team.nameEn}</div>
                        </div>
                      </Link>
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

      {/* How Odds Work */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-3">📖 赔率怎么看？</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>小数赔率</strong>（欧洲赔率）：表示每投入1元可获得的回报</p>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <p>例如：巴西赔率 <span className="font-bold text-gray-900">5.50</span></p>
              <p>→ 投注1元，获胜可得 <span className="font-bold text-gray-900">5.50</span> 元</p>
              <p>→ 隐含概率 ≈ <span className="font-bold text-qualify">{Math.round(100/5.5)}%</span></p>
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
                <Link
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
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
