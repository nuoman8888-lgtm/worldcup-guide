'use client';

import { useState, useEffect } from 'react';
// import Link from 'next/link'; — using <a> to avoid RSC nav issues
// import PageTracker from '@/components/PageTracker';
import { CountdownBar } from '@/components/CountdownBar';
import CountryCodeBadge from '@/components/CountryCodeBadge';
import { MyTeamWidget } from '@/components/MyTeamWidget';
// import MyTeamModal from '@/components/MyTeamModal';
import { getTeam } from '@/data/teams';
import { allMatches as staticMatches, getExpertPrediction, applyCompletedResults } from '@/data/matches';
import { generateStaticStandings } from '@/data/standings';
import { AI_MODELS, MODEL_ORDER, type ModelId } from '@/data/ai-models';
import { getPredictions } from '@/data/predictions';
import { tlaToTeamId, apiMatchToInternalId } from '@/lib/use-api-data';
import {
  getLeaderboard,
  syncLabPredictions,
  getLabSummary,
  seedHistoricalData,
  type LeaderboardEntry,
} from '@/data/ai-leaderboard';

/* ── Helpers ── */
function bj(u: string) {
  try {
    const d = new Date(u), b = new Date(d.getTime() + 8 * 3600000);
    return { date: `${b.getUTCFullYear()}-${String(b.getUTCMonth() + 1).padStart(2, '0')}-${String(b.getUTCDate()).padStart(2, '0')}`, time: `${String(b.getUTCHours()).padStart(2, '0')}:${String(b.getUTCMinutes()).padStart(2, '0')}` };
  } catch { return { date: '', time: '' }; }
}
function ng(r: string | null) { return r ? r.replace(/^(GROUP_|Group\s)/i, '').trim() : ''; }
function tb() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
const TL: Record<string, string> = { MEX: 'mexico', KOR: 'south-korea', CZE: 'czech', RSA: 'south-africa', CAN: 'canada', QAT: 'qatar', SUI: 'switzerland', BIH: 'bosnia', BRA: 'brazil', HAI: 'haiti', SCO: 'scotland', MAR: 'morocco', USA: 'usa', AUS: 'australia', TUR: 'turkey', PAR: 'paraguay', GER: 'germany', CIV: 'ivory-coast', ECU: 'ecuador', CUW: 'curacao', NED: 'netherlands', SWE: 'sweden', TUN: 'tunisia', JPN: 'japan', BEL: 'belgium', IRN: 'iran', NZL: 'new-zealand', EGY: 'egypt', ESP: 'spain', KSA: 'saudi-arabia', URY: 'uruguay', CPV: 'cape-verde', FRA: 'france', IRQ: 'iraq', NOR: 'norway', SEN: 'senegal', ARG: 'argentina', AUT: 'austria', JOR: 'jordan', ALG: 'algeria', POR: 'portugal', UZB: 'uzbekistan', COL: 'colombia', COD: 'dr-congo', ENG: 'england', GHA: 'ghana', PAN: 'panama', CRO: 'croatia' };
/* ── Medal colors ── */
const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉', 4: '🏅' };
const MEDAL_BG: Record<number, string> = {
  1: 'bg-gradient-to-br from-yellow-900/40 via-yellow-950/30 to-navy/80 border-yellow-500/30',
  2: 'bg-gradient-to-br from-gray-700/40 via-gray-800/30 to-navy/80 border-gray-400/30',
  3: 'bg-gradient-to-br from-amber-800/40 via-amber-950/30 to-navy/80 border-amber-600/30',
  4: 'bg-navy/60 border-white/[0.06]',
};

export default function HomePage() {
  const [raw, setRaw] = useState<any[]>([]);
  const [st, setSt] = useState<any[]>([]);
  const [ag, setAg] = useState('A');
  const [as, setAs] = useState<'loading' | 'ok' | 'err'>('loading');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [labSummary, setLabSummary] = useState<ReturnType<typeof getLabSummary> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/matches').then(r => r.ok ? r.json() : null),
      fetch('/api/standings').then(r => r.ok ? r.json() : null),
    ]).then(([mj, sj]) => {
      if (mj?.matches) setRaw(mj.matches);
      if (sj?.standings) setSt(sj.standings);
      setAs('ok');
    }).catch(() => setAs('err'));
  }, []);

  // Apply real completed results to static data before merge
  if (raw.length === 0) applyCompletedResults();

  // Merge static + API data
  const all = raw.length > 0 ? raw : staticMatches.map((m: any) => ({
    id: m.id, utcDate: `${m.date}T${m.time}:00+08:00`,
    status: m.status === 'finished' ? 'FINISHED' : 'SCHEDULED', matchday: 1, stage: m.stage === 'group' ? 'GROUP_STAGE' : m.stage?.toUpperCase(),
    group: m.group ? `GROUP_${m.group}` : null,
    homeTeam: { tla: m.homeTeamId === 'TBD' ? 'TBD' : Object.entries(TL).find(([k]) => TL[k] === m.homeTeamId)?.[0] || m.homeTeamId.toUpperCase(), shortName: m.homeTeamId, name: m.homeTeamId },
    awayTeam: { tla: m.awayTeamId === 'TBD' ? 'TBD' : Object.entries(TL).find(([k]) => TL[k] === m.awayTeamId)?.[0] || m.awayTeamId.toUpperCase(), shortName: m.awayTeamId, name: m.awayTeamId },
    score: { winner: null, fullTime: { home: null, away: null } },
  }));
  const today = tb();
  const todayAll = all.filter((m: any) => bj(m.utcDate).date === today);
  const upcoming = todayAll.filter((m: any) => m.status !== 'FINISHED');
  const finished = todayAll.filter((m: any) => m.status === 'FINISHED');

  /** Map API numeric ID → internal match ID (m1-m104) — uses shared utility */
  const resolveMatchId = (m: any) => apiMatchToInternalId(m, all);

  // ── AI Lab: seed history + sync predictions ──
  useEffect(() => {
    seedHistoricalData(); // pre-fill past matches on first visit
    if (raw.length === 0) {
      // Still show leaderboard from localStorage even when API is down
      setLeaderboard(getLeaderboard());
      setLabSummary(getLabSummary());
      return;
    }

    // Record predictions for all today's matches (upcoming + finished)
    // This ensures finished matches get synced to localStorage so checkLabResults can update them
    const todayMatches = [...upcoming, ...finished];
    const newPreds: Array<{
      matchId: string;
      homeTeam: string;
      awayTeam: string;
      predictions: Record<ModelId, { predictedScore: string; winner: string }>;
    }> = [];

    for (const m of todayMatches) {
      const hi = tlaToTeamId(m.homeTeam?.tla), ai = tlaToTeamId(m.awayTeam?.tla);
      const h = getTeam(hi), a = getTeam(ai);
      if (!h || !a) continue;
      const matchId = resolveMatchId(m);
      const predSet = getPredictions(matchId, { homeTeamId: h.id, awayTeamId: a.id });
      if (!predSet) continue;

      // Extract Beijing date/time from API UTC date (e.g. "2026-06-17T03:00:00+08:00")
      const bjDate = bj(m.utcDate);
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

    syncLabPredictions(raw, newPreds);
    setLeaderboard(getLeaderboard());
    setLabSummary(getLabSummary());
  }, [raw, upcoming, finished]);

  // ── Hero: today's focus match ──
  const allFutureUpcoming = all.filter((m: any) => m.status !== 'FINISHED')
    .sort((a: any, b: any) => a.utcDate.localeCompare(b.utcDate));
  const hero = upcoming.length > 0 ? upcoming[0] : (allFutureUpcoming[0] ?? null);
  const heroDate = hero ? bj(hero.utcDate).date : '';
  const isTodayHero = heroDate === today;

  const heroPredSet = hero ? (() => {
    const hi = tlaToTeamId(hero.homeTeam?.tla), ai = tlaToTeamId(hero.awayTeam?.tla);
    const h = getTeam(hi), a = getTeam(ai);
    if (!h || !a) return null;
    return getPredictions(resolveMatchId(hero), { homeTeamId: h.id, awayTeamId: a.id });
  })() : null;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #081224 0%, #0b1730 40%, #0d1b3d 100%)' }}>
      {/* <PageTracker event="home_view" /> */}
      {/* <MyTeamModal /> */}
      <section className="bg-[#040810] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-3 py-2"><CountdownBar /></div>
      </section>

      {/* ═══════ Hero — 4-Model Prediction ═══════ */}
      <section className="max-w-7xl mx-auto px-3 py-4 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(59,130,246,0.08) 0%, transparent 60%)' }} />
        {(() => {
          if (!hero || !heroPredSet) return (
            <div className="bg-navy/80 backdrop-blur-xl rounded-2xl border border-white/10 p-16 text-center text-white/20">
              <div className="text-5xl mb-4">⚽</div>
              <p className="text-lg">暂无比赛数据</p>
              <a href="/schedule" className="text-gold text-sm hover:underline mt-3 inline-block">浏览赛程 →</a>
            </div>
          );

          const m = hero;
          const hi = tlaToTeamId(m.homeTeam?.tla), ai = tlaToTeamId(m.awayTeam?.tla);
          const h = getTeam(hi), a = getTeam(ai);
          const isLive = m.status === 'IN_PLAY' || m.status === 'LIVE' || m.status === 'PAUSED';
          const isFinished = m.status === 'FINISHED';
          const scoreH = m.score?.fullTime?.home ?? null;
          const scoreA = m.score?.fullTime?.away ?? null;
          const hasScore = scoreH !== null && scoreA !== null;

          // Check prediction accuracy for finished matches
          const predChecks = isFinished && hasScore ? MODEL_ORDER.map(mid => {
            const p = heroPredSet.predictions[mid];
            const [ph, pa] = p.predictedScore.split('-').map(Number);
            const hit = ph === scoreH && pa === scoreA;
            const resultHit = (ph > pa ? 1 : pa > ph ? -1 : 0) === (scoreH! > scoreA! ? 1 : scoreA! > scoreH! ? -1 : 0);
            return { mid, hit, resultHit, score: p.predictedScore };
          }) : null;

          const hitCount = predChecks?.filter(p => p.resultHit).length ?? 0;

          return (
            <div className="relative bg-navy/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
              <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${isLive ? 'bg-red-500/20 text-red-400' : isFinished ? 'bg-blue-500/20 text-blue-400' : 'bg-gold/20 text-gold'}`}>
                    {isLive ? '🔴 正在进行' : isFinished ? '✅ 比赛结束' : isTodayHero ? '🔥 今日焦点' : '⏭ 下一场焦点'}
                  </span>
                  {isLive && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                  {m.group && <span className="text-[11px] bg-white/10 text-white/60 px-2 py-0.5 rounded">{ng(m.group)}组</span>}
                  <span className="text-[11px] text-white/30 ml-auto">{bj(m.utcDate).date} {bj(m.utcDate).time}</span>
                </div>

                {/* Teams + Score */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-4xl sm:text-5xl mb-1.5">{h?.flag}</span>
                    <h2 className="text-white font-extrabold text-base sm:text-lg">{h?.name || m.homeTeam?.shortName}</h2>
                    {!isLive && !isFinished && h && (
                      <p className="text-white/30 text-[11px] mt-0.5">FIFA #{h.fifaRank} · ELO {h.elo}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 mx-5 text-center">
                    {isLive && hasScore ? (
                      <>
                        <div className="text-4xl sm:text-5xl font-extrabold text-green-400 tabular-nums">{scoreH} - {scoreA}</div>
                        <div className="text-sm text-green-400/80 font-bold mt-1.5">
                          {typeof m.score?.duration === 'string' && m.score.duration.includes("'") ? m.score.duration : 'LIVE'}
                        </div>
                      </>
                    ) : isFinished && hasScore ? (
                      <>
                        <div className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums">{scoreH} - {scoreA}</div>
                        <div className="inline-block text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold mt-2">FT</div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl sm:text-4xl font-extrabold text-white/10 mb-1">VS</div>
                        <div className="text-xs text-white/20">AI 联合预测</div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-4xl sm:text-5xl mb-1.5">{a?.flag}</span>
                    <h2 className="text-white font-extrabold text-base sm:text-lg">{a?.name || m.awayTeam?.shortName}</h2>
                    {!isLive && !isFinished && a && (
                      <p className="text-white/30 text-[11px] mt-0.5">FIFA #{a.fifaRank} · ELO {a.elo}</p>
                    )}
                  </div>
                </div>

                {/* ═══ 4-Model Predictions (pre-match) ═══ */}
                {!isLive && !isFinished && (
                  <div className="border-t border-white/[0.06] pt-3 mt-1">
                    <div className="text-[10px] text-white/20 uppercase tracking-wide mb-2 text-center">🤖 四大AI模型预测</div>
                    <div className="grid grid-cols-4 gap-2">
                      {MODEL_ORDER.map(mid => {
                        const p = heroPredSet.predictions[mid];
                        const info = AI_MODELS[mid];
                        const isConsensus = heroPredSet.consensus.side === p.winner;
                        return (
                          <div key={mid} className={`rounded-lg p-2 text-center ${isConsensus ? 'ring-1 ring-gold/40' : ''}`} style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                            <div className="text-sm mb-0.5">{info.icon}</div>
                            <div className="text-[10px] font-bold text-white/70 mb-1">{info.name}</div>
                            <div className="text-sm font-extrabold font-mono" style={{ color: info.color }}>{p.predictedScore}</div>
                            <div className="text-[9px] text-white/30 mt-0.5">{p.winner}胜</div>
                            <div className="mt-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${p.confidence}%`, backgroundColor: info.color, opacity: 0.6 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Consensus bar */}
                    <div className="flex items-center justify-center gap-2 mt-2.5 text-[10px] text-white/40">
                      <span>共识：</span>
                      <span className="text-gold font-bold">{heroPredSet.consensus.side}</span>
                      <span>{heroPredSet.consensus.modelCount}/{heroPredSet.consensus.total} 模型选择</span>
                    </div>
                  </div>
                )}

                {/* ═══ Post-match accuracy ═══ */}
                {isFinished && predChecks && (
                  <div className="border-t border-white/[0.06] pt-3 mt-1">
                    <div className="text-[10px] text-white/20 uppercase tracking-wide mb-2 text-center">🎯 AI预测验证 — {hitCount}/4 命中</div>
                    <div className="grid grid-cols-4 gap-2">
                      {predChecks.map(({ mid, hit, resultHit, score }) => {
                        const info = AI_MODELS[mid];
                        return (
                          <div key={mid} className="rounded-lg p-2 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                            <div className="text-sm mb-0.5">{info.icon}</div>
                            <div className="text-[10px] font-bold text-white/70 mb-1">{info.name}</div>
                            <div className="text-xs font-mono text-white/50">{score}</div>
                            <div className={`text-[10px] font-bold mt-0.5 ${hit ? 'text-green-400' : resultHit ? 'text-yellow-400' : 'text-red-400'}`}>
                              {hit ? '✓ 命中' : resultHit ? '✓ 胜负对' : '✗'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <a href={`/match/${resolveMatchId(m)}`} className="block text-center py-2.5 bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-gold text-xs font-medium transition-colors">
                查看完整比赛分析 →
              </a>
            </div>
          );
        })()}
      </section>

      {/* ═══════ 📅 明日专家预测 ═══════ */}
      {(() => {
        const tomorrow = all.filter((m: any) => {
          const d = bj(m.utcDate).date;
          return d > today && getExpertPrediction(resolveMatchId(m));
        }).slice(0, 4);
        if (tomorrow.length === 0) return null;
        return (
          <section className="max-w-7xl mx-auto px-3 py-2">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              🔮 明日专家预测
              <span className="text-[10px] text-white/30 font-normal">{tomorrow[0] && bj(tomorrow[0].utcDate).date}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tomorrow.map((m: any) => {
                const hi = tlaToTeamId(m.homeTeam?.tla), ai = tlaToTeamId(m.awayTeam?.tla);
                const h = getTeam(hi), a = getTeam(ai);
                const pred = getExpertPrediction(resolveMatchId(m));
                return (
                  <div key={m.id} className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] p-3 text-center">
                    <div className="text-[10px] text-white/30 mb-2">{bj(m.utcDate).time}</div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-white/80 text-xs font-medium">{h?.name || m.homeTeam?.shortName}</span>
                      <span className="text-white/15 text-[10px]">VS</span>
                      <span className="text-white/80 text-xs font-medium">{a?.name || m.awayTeam?.shortName}</span>
                    </div>
                    <div className="text-xl font-extrabold font-mono text-gold">{pred}</div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* ═══════ 🤖 AI世界杯实验室 ═══════ */}
      <section className="max-w-7xl mx-auto px-3 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            🤖 AI世界杯实验室
            <span className="text-[10px] text-white/30 font-normal">哪个AI最懂足球？</span>
          </h2>
          <a href="/ai-lab" className="text-[10px] text-gold hover:underline">
            完整实验室 →
          </a>
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {leaderboard.map((entry) => (
              <a
                key={entry.modelId}
                href="/ai-lab"
                className={`backdrop-blur-sm rounded-xl border p-4 hover:border-opacity-50 transition-all group ${MEDAL_BG[entry.rank] || MEDAL_BG[4]}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{MEDAL[entry.rank] || '🏅'}</span>
                  <span className="text-lg">{entry.icon}</span>
                  <span className="text-white font-bold text-sm">{entry.name}</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl font-extrabold" style={{ color: entry.color }}>
                    {entry.points}
                  </span>
                  <span className="text-[10px] text-white/30">分</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between text-white/40">
                    <span>命中率</span>
                    <span className="text-white/60 font-mono">{Math.round(entry.accuracy * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>命中</span>
                    <span className="text-white/60 font-mono">{entry.totalHits}/{entry.total}场</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>精确/方向</span>
                    <span className="text-white/60 font-mono"><span className="text-green-400">{entry.exactHits}</span>/{entry.correctHits}</span>
                  </div>
                  {entry.streak > 1 && (
                    <div className="flex justify-between text-white/40">
                      <span>连续命中</span>
                      <span className="text-green-400 font-mono">{entry.streak}场 🔥</span>
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-white/15 text-xs bg-navy/40 rounded-xl border border-white/[0.04] mb-3">
            🤖 比赛开始后<br />AI模型将自动预测并排名
          </div>
        )}

        {/* Recent results strip */}
        {labSummary && labSummary.totalJudged > 0 && (
          <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-white/[0.06] p-3">
            <div className="text-[10px] text-white/20 uppercase tracking-wide mb-2">📊 最近命中</div>
            <div className="grid grid-cols-4 gap-3">
              {labSummary.models.map(m => {
                const info = AI_MODELS[m.modelId];
                const last5 = m.recentResults.slice(-5);
                const hitCount = last5.filter(c => c !== 'miss').length;
                return (
                  <div key={m.modelId} className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-sm">{info.icon}</span>
                      <span className="text-[10px] text-white/50 font-medium">{info.name}</span>
                    </div>
                    <div className="flex items-center justify-center gap-0.5">
                      {last5.map((cat, i) => (
                        <span key={i} className={`w-2 h-2 rounded-full ${
                          cat === 'exact' ? 'bg-green-400' : cat === 'correct' ? 'bg-amber-400' : 'bg-red-400/60'
                        }`} title={cat === 'exact' ? '✓ 命中' : cat === 'correct' ? '✓ 方向正确' : '✗'} />
                      ))}
                    </div>
                    <div className="text-[10px] text-white/40 mt-1">
                      {last5.length > 0 ? `${hitCount}/${last5.length} ${m.points}分` : '等待中'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ═══════ 今日赛程 ═══════ */}
      {upcoming.length > (hero ? 1 : 0) && (
        <section className="max-w-7xl mx-auto px-3 py-3">
          <h2 className="text-sm font-bold text-white mb-3">📅 今日赛程</h2>
          <div className="space-y-1.5">
            {upcoming.filter((m: any) => m.id !== hero?.id).map((m: any) => {
              const hi = tlaToTeamId(m.homeTeam?.tla), ai = tlaToTeamId(m.awayTeam?.tla);
              const h = getTeam(hi), a = getTeam(ai);
              const predSet = h && a ? getPredictions(resolveMatchId(m), { homeTeamId: h.id, awayTeamId: a.id }) : null;
              const live = m.status === 'IN_PLAY' || m.status === 'LIVE';
              return (
                <a key={m.id} href={`/match/${resolveMatchId(m)}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${live ? 'bg-green-500/5 border border-green-500/20' : 'hover:bg-white/[0.04]'}`}>
                  <div className="w-11 text-center shrink-0">
                    <div className="text-xs font-bold text-white/70 font-mono">{bj(m.utcDate).time}</div>
                    {live && <div className="text-[9px] text-green-400 font-bold animate-pulse mt-0.5">LIVE</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">
                    <span className="text-white/80 text-xs font-medium truncate max-w-[80px] text-right">{h?.name || m.homeTeam?.shortName}</span>
                    {h && <CountryCodeBadge teamId={h.id} size="sm" />}
                    <span className="text-white/15 text-[10px] font-bold shrink-0 mx-0.5">VS</span>
                    {a && <CountryCodeBadge teamId={a.id} size="sm" />}
                    <span className="text-white/80 text-xs font-medium truncate max-w-[80px]">{a?.name || m.awayTeam?.shortName}</span>
                  </div>
                  {/* AI consensus indicator */}
                  {predSet && (
                    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                      {MODEL_ORDER.slice(0, 3).map(mid => {
                        const p = predSet.predictions[mid];
                        const info = AI_MODELS[mid];
                        const agreed = predSet.consensus.side === p.winner;
                        return (
                          <span key={mid} className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${agreed ? 'bg-white/[0.08] text-white/60' : 'text-white/20'}`}>
                            {info.icon} {p.predictedScore}
                          </span>
                        );
                      })}
                      <span className="text-[9px] text-gold/60 font-medium ml-1">
                        → {predSet.consensus.side}
                      </span>
                    </div>
                  )}
                  <span className="text-white/10 group-hover:text-gold transition-colors text-sm shrink-0">→</span>
                </a>
              );
            })}
          </div>
          {upcoming.length === 0 && (
            <div className="text-white/20 text-sm text-center py-6">今日暂无比赛</div>
          )}
        </section>
      )}

      {/* ═══════ 今日赛果 ═══════ */}
      {finished.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 py-3">
          <h2 className="text-sm font-bold text-white mb-3">✅ 今日赛果</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {finished.map((m: any) => {
              const hi = tlaToTeamId(m.homeTeam?.tla), ai = tlaToTeamId(m.awayTeam?.tla);
              const h = getTeam(hi), a = getTeam(ai);
              return (
                <a key={m.id} href={`/match/${resolveMatchId(m)}`} className="bg-white/[0.04] rounded-lg p-3 text-center hover:bg-white/[0.06] border border-white/[0.02] transition-colors">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-white/70 text-xs truncate max-w-[60px]">{h?.name || m.homeTeam?.shortName}</span>
                    {h && <CountryCodeBadge teamId={h.id} size="sm" />}
                  </div>
                  <div className="text-xl font-extrabold text-white tabular-nums mb-1.5">
                    {m.score?.fullTime?.home}-{m.score?.fullTime?.away}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {a && <CountryCodeBadge teamId={a.id} size="sm" />}
                    <span className="text-white/70 text-xs truncate max-w-[60px]">{a?.name || m.awayTeam?.shortName}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════ 积分榜 + MyTeam + AI战绩 ═══════ */}
      <section className="max-w-7xl mx-auto px-3 py-3">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Standings */}
          <div className="lg:col-span-2">
            <div className="bg-navy/80 backdrop-blur-xl rounded-xl border border-white/[0.06]">
              <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">📊 小组积分榜</h2>
                <a href="/standings" className="text-[10px] text-gold hover:underline">全部 →</a>
              </div>
              <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-hide border-b border-white/[0.06]">
                {(st.length > 0 ? st : generateStaticStandings()).filter((s: any) => s.type === 'TOTAL' && s.group).map((g: any) => {
                  const n = ng(g.group);
                  return <button key={g.group} onClick={() => setAg(n)} className={`shrink-0 w-8 h-8 rounded-lg text-xs font-bold ${ag === n ? 'bg-gold text-[#080c14]' : 'text-white/40 hover:text-white/70'}`}>{n}</button>;
                })}
              </div>
              {(() => {
                const source = st.length > 0 ? st : generateStaticStandings();
                const ags = source.filter((s: any) => s.type === 'TOTAL' && s.group).find((g: any) => ng(g.group) === ag);
                if (!ags) return <div className="p-4 text-center text-white/20 text-xs">暂无数据</div>;
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-white/25 border-b border-white/[0.06]">
                          <th className="text-left py-2 pl-4 w-6">#</th>
                          <th className="text-left py-2">球队</th>
                          <th className="text-center py-2 w-7">赛</th>
                          <th className="text-center py-2 w-7">胜</th>
                          <th className="text-center py-2 w-7">平</th>
                          <th className="text-center py-2 w-7">负</th>
                          <th className="text-center py-2 w-12 hidden sm:table-cell">进/失</th>
                          <th className="text-center py-2 w-7 hidden sm:table-cell">净胜</th>
                          <th className="text-center py-2 pr-4 w-7 font-bold text-white/50">分</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ags.table.map((row: any, i: number) => {
                          const tid = tlaToTeamId(row.team?.tla);
                          const t = getTeam(tid);
                          return (
                            <tr key={row.team?.tla} className={`border-b border-white/[0.02] ${i < 2 ? 'bg-white/[0.04]' : ''}`}>
                              <td className="py-2 pl-4">
                                <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${i < 2 ? 'bg-green-500/20 text-green-400' : i === 2 ? 'bg-blue-500/20 text-blue-400' : 'text-white/25'}`}>{row.position}</span>
                              </td>
                              <td className="py-2">
                                <a href={`/team/${tid}`} className="flex items-center gap-1.5 hover:text-gold">
                                  <span className="text-sm">{t?.flag}</span>
                                  <span className="text-white/80 font-medium">{t?.name || row.team?.shortName}</span>
                                </a>
                              </td>
                              <td className="text-center py-2 text-white/45">{row.playedGames}</td>
                              <td className="text-center py-2 text-white/45">{row.won}</td>
                              <td className="text-center py-2 text-white/45">{row.draw}</td>
                              <td className="text-center py-2 text-white/45">{row.lost}</td>
                              <td className="text-center py-2 text-white/35 hidden sm:table-cell">{row.goalsFor}-{row.goalsAgainst}</td>
                              <td className="text-center py-2 hidden sm:table-cell">
                                <span className={row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-white/25'}>
                                  {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                                </span>
                              </td>
                              <td className="text-center py-2 pr-4 font-bold text-white">{row.points}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Right sidebar: MyTeam + AI Lab mini */}
          <div className="space-y-4">
            <MyTeamWidget />

            {/* AI Lab Mini Dashboard */}
            <div className="bg-navy/80 backdrop-blur-xl rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">🤖 AI实验室</h3>
                <a href="/ai-lab" className="text-[10px] text-gold hover:underline">详情 →</a>
              </div>

              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 3).map((entry) => (
                    <div key={entry.modelId} className="flex items-center gap-2">
                      <span className="text-sm">{MEDAL[entry.rank]}</span>
                      <span className="text-sm">{entry.icon}</span>
                      <span className="text-[11px] text-white/70 font-medium flex-1">{entry.name}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: entry.color }}>
                        {entry.points}分
                      </span>
                    </div>
                  ))}

                  {labSummary && labSummary.totalJudged > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/[0.04] rounded-lg p-2 text-center">
                          <div className="text-lg font-extrabold text-white tabular-nums">{labSummary.totalJudged}</div>
                          <div className="text-[9px] text-white/30">已结算场次</div>
                        </div>
                        <div className="bg-white/[0.04] rounded-lg p-2 text-center">
                          <div className="text-lg font-extrabold text-gold tabular-nums">
                            {labSummary.models.reduce((s, m) => s + m.points, 0)}
                          </div>
                          <div className="text-[9px] text-white/30">累计积分</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-white/15 text-xs">
                  赛程开始后<br />四大AI模型将自动PK
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="pb-6" />
    </div>
  );
}
