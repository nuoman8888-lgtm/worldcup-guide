'use client';

import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import PageTracker from '@/components/PageTracker';
import { AI_MODELS, MODEL_ORDER, type ModelId } from '@/data/ai-models';
import {
  getLeaderboard,
  getModelDetail,
  getRecentLabResults,
  seedHistoricalData,
  syncLabPredictions,
  type LeaderboardEntry,
  type ModelStats,
  type StoredPrediction,
} from '@/data/ai-leaderboard';
import { getPredictions } from '@/data/predictions';
import { getTeam } from '@/data/teams';
import { tlaToTeamId, apiMatchToInternalId } from '@/lib/use-api-data';

/* ── Helpers ── */
const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉', 4: '4️⃣' };
const RANK_BG: Record<number, string> = {
  1: 'bg-gradient-to-r from-yellow-900/30 to-transparent border-l-2 border-yellow-500',
  2: 'bg-gradient-to-r from-gray-800/30 to-transparent border-l-2 border-gray-400',
  3: 'bg-gradient-to-r from-amber-900/30 to-transparent border-l-2 border-amber-600',
};

/* ── Points breakdown component ── */
function PointsBreakdown({ stats }: { stats: ModelStats }) {
  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex justify-between">
        <span className="text-white/40">✓ 命中</span>
        <span className="text-green-400 font-mono">+{stats.exactHits * 3} ({stats.exactHits}场 × 3)</span>
      </div>
      <div className="flex justify-between">
        <span className="text-white/40">✓ 方向正确</span>
        <span className="text-amber-400 font-mono">+{stats.correctHits * 1} ({stats.correctHits}场 × 1)</span>
      </div>
      {stats.currentStreak > 1 && (
        <div className="flex justify-between">
          <span className="text-white/40">连续命中</span>
          <span className="text-green-400 font-mono">{stats.currentStreak}场</span>
        </div>
      )}
      <div className="border-t border-white/[0.08] pt-1.5 flex justify-between font-bold">
        <span className="text-white/60">综合得分</span>
        <span className="text-white font-mono text-sm">{stats.points}</span>
      </div>
    </div>
  );
}

/* ── Recent matches table ── */
function RecentResultsTable({ results, selectedModel }: { results: StoredPrediction[]; selectedModel: ModelId | 'all' }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-white/15 text-sm">
        暂无比赛结果<br />
        <span className="text-xs">比赛开始后数据将自动更新</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-white/25 border-b border-white/[0.06]">
            <th className="text-left py-2 pl-4">时间</th>
            <th className="text-left py-2">对阵</th>
            <th className="text-center py-2">比分</th>
            {selectedModel === 'all' ? (
              MODEL_ORDER.map(mid => (
                <th key={mid} className="text-center py-2">{AI_MODELS[mid].name}</th>
              ))
            ) : (
              <>
                <th className="text-center py-2">预测</th>
                <th className="text-center py-2">结果</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {results.map(entry => {
            const res = entry.result!;
            return (
              <tr key={entry.matchId} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                <td className="py-2.5 pl-4 text-white/40">{entry.date.slice(5)} {entry.time?.slice(0,5) || ''}</td>
                <td className="py-2.5">
                  <span className="text-white/70">{entry.homeTeam}</span>
                  <span className="text-white/20 mx-1">vs</span>
                  <span className="text-white/70">{entry.awayTeam}</span>
                </td>
                <td className="py-2.5 text-center">
                  <span className="text-white font-bold font-mono">{res.homeScore}-{res.awayScore}</span>
                </td>
                {selectedModel === 'all' ? (
                  MODEL_ORDER.map(mid => {
                    const pred = entry.predictions[mid];
                    const scores = pred.predictedScore.split(' / ');
                    const hasExact = scores.some(s => {
                      const [h, a] = s.split('-').map(Number);
                      return h === res.homeScore && a === res.awayScore;
                    });
                    const [ph, pa] = scores[0].split('-').map(Number);
                    const predDir = !isNaN(ph) && !isNaN(pa) ? (ph > pa ? 'HOME' : pa > ph ? 'AWAY' : 'DRAW') : null;
                    const actualDir = res.homeScore > res.awayScore ? 'HOME' : res.awayScore > res.homeScore ? 'AWAY' : 'DRAW';
                    const hasCorrect = !hasExact && predDir === actualDir;
                    const cellColor = hasExact ? '#22c55e' : hasCorrect ? '#facc15' : '#ef4444';
                    return (
                      <td key={mid} className="py-2.5 text-center">
                        <div className="font-mono text-[11px]">
                          {scores.map((s, i) => {
                            const [h, a] = s.split('-').map(Number);
                            const hit = h === res.homeScore && a === res.awayScore;
                            return (
                              <span key={i}>
                                {i > 0 && <span className="text-white/20"> / </span>}
                                <span style={{ color: hit ? '#22c55e' : '#6b7280', fontWeight: hit ? 'bold' : 'normal' }}>
                                  {s}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                        <div className="text-[9px] mt-0.5 font-bold" style={{ color: cellColor }}>
                          {hasExact ? '✓ 精准命中' : hasCorrect ? '✓ 方向正确' : '✗'}
                        </div>
                      </td>
                    );
                  })
                ) : (
                  <>
                    <td className="py-2.5 text-center">
                      {(() => {
                        const pred = entry.predictions[selectedModel];
                        const scores = pred.predictedScore.split(' / ');
                        return (
                          <div className="font-mono text-[11px]">
                            {scores.map((s, i) => {
                              const [h, a] = s.split('-').map(Number);
                              const hit = h === res.homeScore && a === res.awayScore;
                              return (
                                <span key={i}>
                                  {i > 0 && <span className="text-white/20"> / </span>}
                                  <span style={{ color: hit ? '#22c55e' : '#6b7280', fontWeight: hit ? 'bold' : 'normal' }}>
                                    {s}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-2.5 text-center">
                      {(() => {
                        const pred = entry.predictions[selectedModel];
                        const scores = pred.predictedScore.split(' / ');
                        const hasExact = scores.some(s => {
                          const [h, a] = s.split('-').map(Number);
                          return h === res.homeScore && a === res.awayScore;
                        });
                        const [ph, pa] = scores[0].split('-').map(Number);
                        const predDir = !isNaN(ph) && !isNaN(pa) ? (ph > pa ? 'HOME' : pa > ph ? 'AWAY' : 'DRAW') : null;
                        const actualDir = res.homeScore > res.awayScore ? 'HOME' : res.awayScore > res.homeScore ? 'AWAY' : 'DRAW';
                        const hasCorrect = !hasExact && predDir === actualDir;
                        const cellColor = hasExact ? '#22c55e' : hasCorrect ? '#facc15' : '#ef4444';
                        if (hasExact) return <span className="font-bold" style={{ color: '#22c55e' }}>✓ 精准命中</span>;
                        if (hasCorrect) return <span className="font-bold" style={{ color: '#facc15' }}>✓ 方向正确</span>;
                        return <span className="font-bold" style={{ color: '#ef4444' }}>✗</span>;
                      })()}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AiLabPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelId | 'all'>('all');
  const [modelDetail, setModelDetail] = useState<ModelStats | null>(null);
  const [allResults, setAllResults] = useState<StoredPrediction[]>([]);
  const [mounted, setMounted] = useState(false);
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);

  useEffect(() => {
    seedHistoricalData();

    // Fetch API matches and sync results — same as homepage does
    fetch('/api/matches')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.matches) return;
        const apiMatches = json.matches as any[];

        // Record predictions for all matches (upcoming + finished)
        const newPreds: Array<{
          matchId: string; homeTeam: string; awayTeam: string;
          date?: string; time?: string;
          predictions: Record<ModelId, { predictedScore: string; winner: string }>;
        }> = [];

        for (const m of apiMatches) {
          const hi = tlaToTeamId(m.homeTeam?.tla || ''), ai = tlaToTeamId(m.awayTeam?.tla || '');
          const h = getTeam(hi), a = getTeam(ai);
          if (!h || !a) continue;
          const matchId = apiMatchToInternalId(m, apiMatches);
          const predSet = getPredictions(matchId, { homeTeamId: h.id, awayTeamId: a.id });
          if (!predSet) continue;

          const bjDate = (() => {
            const d = new Date(m.utcDate);
            const b = new Date(d.getTime() + 8 * 3600000);
            return {
              date: `${b.getUTCFullYear()}-${String(b.getUTCMonth()+1).padStart(2,'0')}-${String(b.getUTCDate()).padStart(2,'0')}`,
              time: `${String(b.getUTCHours()).padStart(2,'0')}:${String(b.getUTCMinutes()).padStart(2,'0')}`,
            };
          })();

          const entry = {
            matchId,
            homeTeam: h.name,
            awayTeam: a.name,
            date: bjDate.date,
            time: bjDate.time,
            predictions: {} as Record<ModelId, { predictedScore: string; winner: string }>,
          };
          for (const mid of MODEL_ORDER) {
            entry.predictions[mid] = {
              predictedScore: predSet.predictions[mid].predictedScore,
              winner: predSet.predictions[mid].winner,
            };
          }
          newPreds.push(entry);
        }

        syncLabPredictions(apiMatches, newPreds);
      })
      .catch(() => {})
      .finally(() => {
        setMounted(true);
        setLeaderboard(getLeaderboard());
        setAllResults(getRecentLabResults(200));
      });
  }, []);

  useEffect(() => {
    if (selectedModel !== 'all') {
      setModelDetail(getModelDetail(selectedModel));
    }
    setPage(0); // reset pagination when filter changes
  }, [selectedModel]);

  const totalPages = Math.max(1, Math.ceil(allResults.length / PAGE_SIZE));
  const recentResults = allResults.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #081224 0%, #0b1730 40%, #0d1b3d 100%)' }}>
      {/* <PageTracker event="ai_lab_view" /> */}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">🤖 AI世界杯实验室</h1>
          <p className="text-white/40 text-sm">
            四大AI模型同台竞技 · 每日更新预测 · 精确追踪准确率
          </p>
        </div>

        {/* ═══════ Leaderboard ═══════ */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-white mb-3">🏆 AI排行榜</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {leaderboard.map((entry) => (
              <button
                key={entry.modelId}
                onClick={() => setSelectedModel(selectedModel === entry.modelId ? 'all' : entry.modelId)}
                className={`text-left backdrop-blur-sm rounded-xl border p-4 transition-all ${
                  selectedModel === entry.modelId
                    ? 'ring-2 ring-gold/60 border-gold/30 scale-[1.02]'
                    : 'border-white/[0.08] hover:border-white/[0.15]'
                }`}
                style={{
                  background: selectedModel === entry.modelId
                    ? `linear-gradient(135deg, ${entry.color}15 0%, ${entry.color}05 100%)`
                    : 'rgba(255,255,255,0.02)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{MEDAL[entry.rank] || `#${entry.rank}`}</span>
                  <span className="text-lg">{entry.icon}</span>
                  <span className="text-white font-bold text-sm">{entry.name}</span>
                </div>

                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-3xl font-extrabold" style={{ color: entry.color }}>
                    {entry.points}
                  </span>
                  <span className="text-[10px] text-white/30">分</span>
                </div>

                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-white/30">命中率</span>
                    <span className="text-white/50 font-mono">{Math.round(entry.accuracy * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">命中/方向</span>
                    <span className="text-white/50 font-mono">{entry.exactHits}/{entry.correctHits}</span>
                  </div>
                  {entry.streak > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/30">连续命中</span>
                      <span className="text-green-400 font-mono">{entry.streak}场</span>
                    </div>
                  )}
                  {entry.total > 0 && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, entry.points / Math.max(1, entry.total * 25) * 100)}%`, backgroundColor: entry.color }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
            {leaderboard.length === 0 && (
              <div className="col-span-full text-center py-12 text-white/15 text-sm">
                🤖 比赛开始后<br />AI模型将自动预测并排名
              </div>
            )}
          </div>
        </section>

        {/* ═══════ Model Detail (when selected) ═══════ */}
        {selectedModel !== 'all' && modelDetail && (
          <section className="mb-6">
            <div
              className="backdrop-blur-sm rounded-xl border p-5"
              style={{
                background: `linear-gradient(135deg, ${AI_MODELS[selectedModel].color}10 0%, rgba(8,18,36,0.8) 100%)`,
                borderColor: `${AI_MODELS[selectedModel].color}30`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{AI_MODELS[selectedModel].icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{AI_MODELS[selectedModel].name}</h3>
                  <p className="text-xs text-white/40">{AI_MODELS[selectedModel].personality}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-3xl font-extrabold" style={{ color: AI_MODELS[selectedModel].color }}>
                    {modelDetail.points}
                  </div>
                  <div className="text-[10px] text-white/30">总积分</div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {/* Points breakdown */}
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <div className="text-[10px] text-white/30 uppercase tracking-wide mb-2">📐 积分明细</div>
                  <PointsBreakdown stats={modelDetail} />
                </div>

                {/* Stats grid */}
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <div className="text-[10px] text-white/30 uppercase tracking-wide mb-2">📊 核心数据</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: '总预测', value: modelDetail.total },
                      { label: '综合得分', value: modelDetail.points },
                      { label: '命中率', value: `${Math.round(modelDetail.accuracy * 100)}%` },
                      { label: '✓ 命中', value: `${modelDetail.exactHits}场` },
                      { label: '✓ 方向正确', value: `${modelDetail.correctHits}场` },
                      { label: '连续命中', value: `${modelDetail.currentStreak}场` },
                      { label: '最佳连胜', value: `${modelDetail.bestStreak}场` },
                      { label: '总命中', value: `${modelDetail.totalHits}/${modelDetail.total}场` },
                    ].map(s => (
                      <div key={s.label} className="bg-white/[0.02] rounded p-2">
                        <div className="text-white/30 text-[10px]">{s.label}</div>
                        <div className="text-white font-bold font-mono">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent form dots */}
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <div className="text-[10px] text-white/30 uppercase tracking-wide mb-2">📈 最近10场</div>
                  {modelDetail.recentResults.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {modelDetail.recentResults.map((cat, i) => (
                          <span key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            cat === 'exact' ? 'bg-green-500/20 text-green-400' :
                            cat === 'correct' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`} title={cat === 'exact' ? '✓ 命中' : cat === 'correct' ? '✓ 方向正确' : '✗'}>
                            {cat === 'exact' ? '✓' : cat === 'correct' ? '~' : '✗'}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-white/40">
                        近{modelDetail.recentResults.length}场命中率：<span className="text-white font-bold">
                          {modelDetail.recentResults.length > 0
                            ? Math.round(modelDetail.recentResults.filter(c => c !== 'miss').length / modelDetail.recentResults.length * 100)
                            : 0}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-white/15 text-xs">暂无数据</div>
                  )}
                </div>
              </div>

              {/* Prediction style */}
              <div className="bg-white/[0.02] rounded-lg p-3">
                <div className="text-[10px] text-white/30 uppercase tracking-wide mb-1">🎭 预测风格</div>
                <p className="text-xs text-white/50 leading-relaxed">{AI_MODELS[selectedModel].personality}</p>
              </div>
            </div>
          </section>
        )}

        {/* ═══════ Recent Results ═══════ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">📋 最近结算</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedModel('all')}
                className={`text-[10px] px-2 py-1 rounded ${selectedModel === 'all' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
              >
                全部
              </button>
              {MODEL_ORDER.map(mid => (
                <button
                  key={mid}
                  onClick={() => setSelectedModel(mid)}
                  className={`text-[10px] px-2 py-1 rounded ${selectedModel === mid ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
                >
                  {AI_MODELS[mid].name}
                </button>
              ))}
            </div>
          </div>

          <div className="backdrop-blur-sm rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <RecentResultsTable
              results={recentResults}
              selectedModel={selectedModel}
            />

            {/* Pagination — inside the table container for visual cohesion */}
            {mounted && allResults.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
                <span className="text-xs text-white/30">
                  共 {allResults.length} 场比赛 · 第 {page + 1}/{totalPages} 页
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="text-[10px] px-2 py-1 rounded text-white/40 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    ««
                  </button>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="text-[10px] px-2 py-1 rounded text-white/40 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    « 上一页
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="text-[10px] px-2 py-1 rounded text-white/40 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页 »
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    className="text-[10px] px-2 py-1 rounded text-white/40 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    »»
                  </button>
                </div>
              </div>
            )}
          </div>

          {mounted && allResults.length === 0 && (
            <div className="text-center py-12 text-white/20 text-sm">
              <div className="text-4xl mb-3">🤖</div>
              <p className="font-bold text-white/30">比赛开始后，四大AI模型将自动预测</p>
              <p className="text-xs mt-1 text-white/15">每场比赛赛前生成预测，赛后自动结算排名</p>
              <a href="/schedule" className="inline-block mt-4 text-gold text-xs hover:underline">
                查看赛程 →
              </a>
            </div>
          )}
        </section>

        {/* ═══════ How it works ═══════ */}
        <section className="mt-8">
          <div className="backdrop-blur-sm rounded-xl border border-white/[0.06] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="text-sm font-bold text-white mb-3">🧪 实验室规则</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-xs text-white/40">
              <div>
                <div className="text-white/60 font-bold mb-1">🤖 四大AI模型</div>
                <p className="leading-relaxed">
                  Claude（ELO保守派）、ChatGPT（数据均衡派）、DeepSeek（状态激进派）、千问（攻击倾向派）。
                  每个模型拥有不同的预测风格和权重偏好。
                </p>
              </div>
              <div>
                <div className="text-white/60 font-bold mb-1">📐 靠谱指数</div>
                <p className="leading-relaxed">
                  综合准确率（30%权重）+ 连续命中奖励 + 爆冷命中奖励 − 连续翻车惩罚。
                  不是简单的胜负统计，而是对AI"靠谱程度"的综合评估。
                </p>
              </div>
              <div>
                <div className="text-white/60 font-bold mb-1">🔄 每日更新</div>
                <p className="leading-relaxed">
                  每场比赛赛前，四大模型同时生成预测。赛后根据真实赛果自动结算，更新排行榜。
                  预测永久存储，可回溯验证。
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="pb-8" />
      </div>
    </div>
  );
}
