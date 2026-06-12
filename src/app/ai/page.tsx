'use client';

import { useState, useEffect } from 'react';
import { getTeam, teams } from '@/data/teams';
import { predictMatch, predictMatchAdvanced, aiChat, getChampionProbData } from '@/lib/ai';
import { trackAiPageView, trackPredictorStart, trackPredictorFinish, trackPredictorShare, trackEvent } from '@/lib/analytics';

export default function AIPage() {
  useEffect(() => { trackAiPageView(); }, []);
  const [chatInput, setChatInput] = useState('');
  const [chatResult, setChatResult] = useState<any>(null);
  const [simTeam, setSimTeam] = useState('');
  const [chatTeam, setChatTeam] = useState('');
  const [matchPrediction, setMatchPrediction] = useState<any>(null);
  const [opponent, setOpponent] = useState('');

  const champData = getChampionProbData();

  const handleChat = () => {
    if (!chatInput.trim()) return;
    const result = aiChat(chatInput, chatTeam || undefined);
    setChatResult(result);
  };

  const handleMatchPredict = () => {
    if (!simTeam || !opponent) return;
    trackPredictorStart();
    const home = getTeam(simTeam);
    const away = getTeam(opponent);
    if (!home || !away) return;
    const advanced = predictMatchAdvanced(simTeam, opponent);
    const basic = predictMatch(simTeam, opponent);
    setMatchPrediction({ home, away, ...basic, advanced });
    trackPredictorFinish();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🤖 AI 预测分析</h1>
        <p className="text-gray-500 text-sm">Claude + 千问 双模型融合 · ELO评分 · 近期状态 · 泊松分布比分预测</p>
      </div>

      {/* Championship Probability */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="font-bold text-lg text-gray-900 mb-5">🏆 冠军概率 Top 20</h2>
        <div className="space-y-3">
          {champData.slice(0, 20).map((item, idx) => {
            const maxProb = champData[0]?.probability || 20;
            const barWidth = (item.probability / maxProb) * 100;
            return (
              <div key={item.teamId} className="flex items-center gap-3">
                <span className={`text-xs font-bold w-5 ${idx < 3 ? 'text-yellow-500' : idx < 5 ? 'text-gray-500' : 'text-gray-400'}`}>
                  {idx + 1}
                </span>
                <span className="text-2xl">{item.team.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{item.team.name}</span>
                      <span className="text-xs text-gray-400">#{item.team.fifaRank}</span>
                    </div>
                    <span className="text-sm font-bold text-green-700">{item.probability}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match Simulator */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">⚔️ 比赛模拟器</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主队</label>
              <select
                value={simTeam}
                onChange={e => setSimTeam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">选择球队...</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.flag} {t.name} ({t.nameEn})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">客队</label>
              <select
                value={opponent}
                onChange={e => setOpponent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">选择球队...</option>
                {teams.filter(t => t.id !== simTeam).map(t => (
                  <option key={t.id} value={t.id}>{t.flag} {t.name} ({t.nameEn})</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleMatchPredict}
              disabled={!simTeam || !opponent}
              className="w-full py-2.5 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🤖 AI 预测胜负
            </button>
          </div>

          {matchPrediction && matchPrediction.advanced ? (
            <div className="mt-4 space-y-3">
              {/* Fusion Result */}
              <div className="p-4 bg-gradient-to-r from-navy to-navy-light rounded-xl text-white text-center">
                <div className="text-xs font-bold tracking-widest uppercase text-gold mb-2">🤖 AI 综合预测</div>
                <div className="text-3xl mb-2">{matchPrediction.home.flag} VS {matchPrediction.away.flag}</div>
                <div className="text-2xl font-extrabold text-gold mb-1">{matchPrediction.advanced.winner}胜</div>
                <div className="text-sm text-white/60">置信度 {matchPrediction.advanced.confidence}%</div>
              </div>

              {/* Top 3 Scores */}
              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">📊 最可能比分</div>
                <div className="space-y-2">
                  {matchPrediction.advanced.topScores.map((s: {home:number;away:number;probability:number}, i:number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5">{['①','②','③'][i]}</span>
                      <span className="text-sm font-bold text-gray-900 tabular-nums">{s.home}:{s.away}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${i===0?'bg-gold':i===1?'bg-navy-600':'bg-gray-300'}`} style={{width:`${Math.min(100,s.probability*3)}%`}} />
                      </div>
                      <span className="text-xs font-bold text-gray-500 w-12 text-right tabular-nums">{s.probability}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model comparison */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-purple-50 rounded-lg border border-purple-100 p-3 text-center">
                  <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wide mb-1">🧠 Claude</div>
                  <div className="text-lg font-extrabold text-gray-900 tabular-nums">{matchPrediction.advanced.claude.predictedScore}</div>
                  <div className="text-[10px] text-gray-400">{matchPrediction.advanced.claude.confidence}% · {matchPrediction.advanced.claude.reasoning}</div>
                </div>
                <div className="bg-blue-50 rounded-lg border border-blue-100 p-3 text-center">
                  <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1">🌊 千问</div>
                  <div className="text-lg font-extrabold text-gray-900 tabular-nums">{matchPrediction.advanced.qwen.predictedScore}</div>
                  <div className="text-[10px] text-gray-400">{matchPrediction.advanced.qwen.confidence}% · {matchPrediction.advanced.qwen.reasoning}</div>
                </div>
              </div>

              {/* Probabilities */}
              <div className="bg-white rounded-lg border border-gray-100 p-3">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">📈 胜平负概率</div>
                <div className="flex h-3 rounded-full overflow-hidden">
                  <div className="bg-green-500 transition-all" style={{width:`${matchPrediction.advanced.homeWinProb}%`}} />
                  <div className="bg-gray-300 transition-all" style={{width:`${matchPrediction.advanced.drawProb}%`}} />
                  <div className="bg-orange-500 transition-all" style={{width:`${matchPrediction.advanced.awayWinProb}%`}} />
                </div>
                <div className="flex justify-between text-[10px] mt-1.5 text-gray-500">
                  <span>{matchPrediction.home.name}胜 {matchPrediction.advanced.homeWinProb}%</span>
                  <span>平 {matchPrediction.advanced.drawProb}%</span>
                  <span>{matchPrediction.away.name}胜 {matchPrediction.advanced.awayWinProb}%</span>
                </div>
              </div>
            </div>
          ) : matchPrediction ? (
            /* Fallback to basic prediction */
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">{matchPrediction.home.flag} VS {matchPrediction.away.flag}</div>
                <div className="text-xs text-gray-500 mb-1">AI预测比分: <strong>{matchPrediction.predictedScore}</strong></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-lg p-2"><div className="text-xs text-gray-500">{matchPrediction.home.name}胜</div><div className="text-lg font-bold text-green-700">{matchPrediction.homeWinProb}%</div></div>
                <div className="bg-white rounded-lg p-2"><div className="text-xs text-gray-500">平局</div><div className="text-lg font-bold text-gray-600">{matchPrediction.drawProb}%</div></div>
                <div className="bg-white rounded-lg p-2"><div className="text-xs text-gray-500">{matchPrediction.away.name}胜</div><div className="text-lg font-bold text-orange-600">{matchPrediction.awayWinProb}%</div></div>
              </div>
            </div>
          ) : null}
        </div>

        {/* AI Chat */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">💬 AI 问答</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">关注球队（可选）</label>
              <select
                value={chatTeam}
                onChange={e => setChatTeam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">不指定球队</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">你的问题</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChat()}
                  placeholder='例如："巴西能夺冠吗？"'
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleChat}
                  className="px-4 py-2 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors"
                >
                  提问
                </button>
              </div>
            </div>
          </div>

          {chatResult && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700 mb-3">{chatResult.answer}</p>
              {chatResult.keyPoints.length > 0 && (
                <div className="space-y-1 mb-3">
                  {chatResult.keyPoints.map((point: string, i: number) => (
                    <div key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-blue-500">•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 italic">{chatResult.disclaimer}</p>
            </div>
          )}

          {/* Quick Questions */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">💡 试试这些问题：</p>
            <div className="flex flex-wrap gap-2">
              {['巴西能夺冠吗？', '阿根廷出线形势', '法国队实力分析', '谁是最大黑马？'].map(q => (
                <button
                  key={q}
                  onClick={() => { setChatInput(q); }}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How AI Works */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-3">🧠 AI预测模型说明</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">ELO评分系统</h4>
            <p>基于国际象棋ELO算法，综合球队历史战绩、对手强度等因素，动态评估球队实力评分。</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">近期状态权重</h4>
            <p>分析最近5场比赛的胜负趋势，状态火热的球队获得额外加成，状态低迷则相应减分。</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">多维度综合评估</h4>
            <p>考虑FIFA排名、世界杯历史战绩、球员阵容深度、主教练能力等多维度因素。</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">⚠️ AI预测基于数据模型，足球比赛充满不确定性，预测结果仅供参考，不构成任何建议。</p>
      </div>
    </div>
  );
}
