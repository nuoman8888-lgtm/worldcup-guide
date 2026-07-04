import type { Metadata } from 'next';
import { getChampionOdds, getPostGroupAnalysis } from '@/data/odds';
import { getTeam } from '@/data/teams';
import CountryCodeBadge from '@/components/CountryCodeBadge';

export const metadata: Metadata = {
  title: '夺冠赔率分析 | 世界杯 2026',
  description: '16强淘汰赛实时赔率。法国2.87领跑，阿根廷5.00紧随其后。Bet365/Pinnacle/William Hill市场共识。',
};

export default function OddsPage() {
  const championOdds = getChampionOdds();
  const analysis = getPostGroupAnalysis();
  const bookmakers = ['Bet365', 'Pinnacle', 'William Hill'];
  const advancing = championOdds.filter(o => o.advanced);
  const eliminated = championOdds.filter(o => !o.advanced);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">💰 夺冠赔率 · 16强阶段</h1>
        <p className="text-gray-500 text-sm">
          实时市场赔率 · 法国🇫🇷 2.87领跑 · Bet365 / Pinnacle / William Hill
        </p>
        <div className="mt-3 bg-gold-50 border border-gold-light rounded-lg p-3 text-sm text-navy">
          ⚠️ 赔率数据仅供赛事分析参考，我们不提供投注功能，不推荐任何博彩行为。理性观赛，远离赌博。
        </div>
      </div>

      {/* ═══════ Post-Group-Stage Summary ═══════ */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-3xl font-extrabold text-navy">{analysis.advancingCount}</div>
          <div className="text-xs text-gray-400 mt-1">晋级淘汰赛</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-3xl font-extrabold text-green-600">{analysis.byGroupRank.winners}</div>
          <div className="text-xs text-gray-400 mt-1">小组第一</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-3xl font-extrabold text-amber-600">{analysis.byGroupRank.runnersUp}</div>
          <div className="text-xs text-gray-400 mt-1">小组第二</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-3xl font-extrabold text-orange-600">{analysis.byGroupRank.thirdPlace}</div>
          <div className="text-xs text-gray-400 mt-1">小组第三</div>
        </div>
      </div>

      {/* ═══════ Champion Winner Odds ═══════ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-full mb-8">
        <div className="bg-navy px-6 py-4 text-white">
          <h2 className="font-bold text-lg">🏆 冠军赔率 Top 30</h2>
          <p className="text-sm text-gray-400">赔率越低，夺冠概率越高 · 已淘汰球队置底灰色</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">#</th>
                <th className="text-left px-3 py-3 font-medium text-gray-500 text-xs">球队</th>
                <th className="text-center px-3 py-3 font-medium text-gray-500 text-xs">小组</th>
                <th className="text-center px-3 py-3 font-medium text-gray-500 text-xs">趋势</th>
                {bookmakers.map(bm => (
                  <th key={bm} className="text-center px-3 py-3 font-medium text-gray-500 text-xs">{bm}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {advancing.slice(0, 30).map((item, idx) => {
                const team = getTeam(item.teamId);
                if (!team) return null;
                const implied = Math.round(100 / item.odds['Bet365']);
                return (
                  <tr key={item.teamId}
                    className={`border-b border-gray-50 transition-colors ${idx < 8 ? 'bg-gold-50/30 hover:bg-gold-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${idx < 8 ? 'text-gold' : 'text-gray-400'}`}>{idx + 1}</span>
                    </td>
                    <td className="px-3 py-3">
                      <a href={`/team/${team.id}`} className="flex items-center gap-2 hover:text-gold-dark transition-colors">
                        <CountryCodeBadge teamId={item.teamId} />
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">{team.name}</span>
                      </a>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        item.groupResult === '1st' ? 'bg-green-100 text-green-700' :
                        item.groupResult === '2nd' ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {team.group}组{item.groupResult === '1st' ? '第1' : item.groupResult === '2nd' ? '第2' : '第3'}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      {item.trend === 'up' ? <span className="text-green-500 text-xs">📈</span> :
                       item.trend === 'down' ? <span className="text-red-400 text-xs">📉</span> :
                       <span className="text-gray-300 text-xs">➡️</span>}
                    </td>
                    {bookmakers.map(bm => (
                      <td key={bm} className="text-center px-3 py-3">
                        <div className="font-mono font-bold text-gray-900">{item.odds[bm]}</div>
                        <div className="text-[10px] text-gray-400">~{implied}%</div>
                      </td>
                    ))}
                  </tr>
                );
              })}
              {eliminated.length > 0 && (
                <tr>
                  <td colSpan={2 + bookmakers.length + 2} className="px-4 py-2 bg-gray-100 text-xs text-gray-500 font-bold">
                    ⛔ 已淘汰球队
                  </td>
                </tr>
              )}
              {eliminated.map((item) => {
                const team = getTeam(item.teamId);
                if (!team) return null;
                return (
                  <tr key={item.teamId} className="border-b border-gray-50 bg-gray-50/30 text-gray-400 hover:bg-gray-100/50 transition-colors">
                    <td className="px-4 py-2 text-xs">—</td>
                    <td className="px-3 py-2">
                      <a href={`/team/${team.id}`} className="flex items-center gap-2">
                        <CountryCodeBadge teamId={item.teamId} />
                        <span className="text-xs">{team.name}</span>
                      </a>
                    </td>
                    <td className="text-center px-3 py-2 text-xs">
                      {team.group}组{item.groupResult === '4th' ? '第4' : '第3'}
                    </td>
                    <td className="text-center px-3 py-2">📉</td>
                    {bookmakers.map(bm => (
                      <td key={bm} className="text-center px-3 py-2">
                        <span className="font-mono text-xs text-gray-400">{item.odds[bm]}</span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ Model Predictions vs Market ═══════ */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🤖 模型预测 vs 市场赔率 · 淘汰赛阶段</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">高盛量化模型</h3>
            <p className="text-xs text-gray-400 mb-3">5万次蒙特卡洛模拟 · 小组赛后更新</p>
            <div className="space-y-1.5 text-sm">
              {[{ team: '西班牙', prob: 22 }, { team: '法国', prob: 18 }, { team: '阿根廷', prob: 14 }, { team: '巴西', prob: 10 }, { team: '英格兰', prob: 7 }].map(t => (
                <div key={t.team} className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-16 text-xs">{t.team}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-navy to-blue-500" style={{ width: `${Math.round((t.prob / 22) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-navy w-10 text-right tabular-nums">{t.prob}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">西班牙小组赛9分全胜，模型已上调至22%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">Opta 超级计算机</h3>
            <p className="text-xs text-gray-400 mb-3">AI预测 · xG+小组赛数据更新</p>
            <div className="space-y-1.5 text-sm">
              {[{ team: '西班牙', prob: 18 }, { team: '法国', prob: 15 }, { team: '阿根廷', prob: 13 }, { team: '巴西', prob: 11 }, { team: '荷兰', prob: 8 }].map(t => (
                <div key={t.team} className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-16 text-xs">{t.team}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold to-yellow-400" style={{ width: `${Math.round((t.prob / 18) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gold-dark w-10 text-right tabular-nums">{t.prob}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">荷兰3战全胜强势晋级，取代德国进入前5</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">博彩市场共识</h3>
            <p className="text-xs text-gray-400 mb-3">Bet365/Pinnacle/William Hill · 7月4日更新</p>
            <div className="space-y-1.5 text-sm">
              {[{ team: '法国', prob: 35 }, { team: '阿根廷', prob: 20 }, { team: '西班牙', prob: 14 }, { team: '英格兰', prob: 9 }, { team: '巴西', prob: 8 }].map(t => (
                <div key={t.team} className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-16 text-xs">{t.team}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500" style={{ width: `${Math.round((t.prob / 18) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-red-500 w-10 text-right tabular-nums">{t.prob}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">法国2.87断层领跑，阿根廷5.00紧随其后。巴拉圭爆冷淘汰德国后赔率仍垫底(401)</p>
          </div>
        </div>
      </div>

      {/* ═══════ Insights + How Odds Work ═══════ */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-navy/5 border border-navy/10 rounded-xl p-5 text-sm text-gray-600">
          <p className="font-semibold text-gray-900 mb-2">📊 16强阶段关键洞察</p>
          <ul className="space-y-1.5 list-disc list-inside text-xs leading-relaxed">
            <li><strong>法国</strong>赔率2.87断层领跑，市场强烈看好卫冕前景</li>
            <li><strong>阿根廷</strong>5.00位居第二，梅西最后一届世界杯备受关注</li>
            <li><strong>西班牙</strong>7.00排名第三，小组赛全胜表现获认可</li>
            <li><strong>巴拉圭</strong>虽爆冷淘汰德国(4-5)，仍以401赔率垫底</li>
            {analysis.surprises.length > 0 && (
              <li>黑马：{analysis.surprises.slice(0, 3).map((s, i) => (<span key={s.teamId}>{i > 0 && '、'}<strong>{s.name}</strong></span>))}以小组第一出线</li>
            )}
            {analysis.disappointments.length > 0 && (
              <li>出局热门：{analysis.disappointments.slice(0, 3).map((d, i) => (<span key={d.teamId}>{i > 0 && '、'}<strong>{d.name}</strong></span>))}等赛前热门被淘汰</li>
            )}
            <li className="text-gray-400 mt-1">⚠️ 赔率反映资金流向与市场情绪，不等于真实胜率；淘汰赛一场定胜负</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-3">📖 赔率怎么看？</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>小数赔率</strong>（欧洲赔率）：每投入1元可获得的回报</p>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <p>例如：赔率 <span className="font-bold text-gray-900">4.00</span></p>
              <p>→ 投注1元，获胜可得 <span className="font-bold text-gray-900">4.00</span> 元</p>
              <p>→ 隐含概率 ≈ <span className="font-bold text-qualify">{Math.round(100/4)}%</span></p>
            </div>
            <p>赔率越低 = 市场认为夺冠概率越高。淘汰赛阶段领跑球队赔率通常在3.5-5.0区间。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
