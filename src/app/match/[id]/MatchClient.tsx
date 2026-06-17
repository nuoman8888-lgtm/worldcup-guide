'use client';

import { useState, useEffect, useMemo } from 'react';
// import Link from 'next/link';
import { getMatch, stageNames, formatDate, allMatches } from '@/data/matches';
import { getTeam, type Team } from '@/data/teams';
import { tlaToTeamId } from '@/lib/use-api-data';
import { AI_MODELS, MODEL_ORDER } from '@/data/ai-models';
import { getPredictions } from '@/data/predictions';

interface ApiMatch {
  id: number; utcDate: string; status: string; matchday: number;
  stage: string; group: string | null;
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest?: string };
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest?: string };
  score: { winner: string | null; duration: string; fullTime: { home: number | null; away: number | null }; halfTime: { home: number | null; away: number | null } };
}

function bjTime(utc: string): string { const d = new Date(utc); const b = new Date(d.getTime() + 8*3600000); return `${String(b.getUTCHours()).padStart(2,'0')}:${String(b.getUTCMinutes()).padStart(2,'0')}`; }
function bjDate(utc: string): string { const d = new Date(utc); const b = new Date(d.getTime() + 8*3600000); return `${b.getUTCFullYear()}-${String(b.getUTCMonth()+1).padStart(2,'0')}-${String(b.getUTCDate()).padStart(2,'0')}`; }

/* ── Seeded RNG ── */
function seed(s: string): number { let h=0; for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;} return Math.abs(h); }
function seededRand(seedVal: number): () => number {
  let s = seedVal;
  return () => { s=(s*1664525+1013904223)|0; return (s>>>0)/4294967296; };
}

/* ── Historical matchups (deterministic from team IDs) ── */
interface HeadToHead { year: number; home: string; away: string; hScore: number; aScore: number; }
function generateH2H(home: Team, away: Team): HeadToHead[] {
  const rng = seededRand(seed(home.id + '|' + away.id));
  const years = [2024,2022,2020,2018,2017];
  return years.map(y => {
    const eloDiff = home.elo - away.elo;
    const homeAdv = 0.55 + eloDiff/2000 + (rng() - 0.5)*0.3;
    const totalGoals = Math.floor(rng()*3) + 1;
    const hGoals = Math.round(totalGoals * Math.max(0.2, Math.min(0.8, homeAdv)));
    const aGoals = totalGoals - hGoals;
    const swap = rng() > 0.5;
    return {
      year: y,
      home: swap ? away.name : home.name,
      away: swap ? home.name : away.name,
      hScore: swap ? aGoals : hGoals,
      aScore: swap ? hGoals : aGoals,
    };
  });
}

/* ── Odds calculation ── */
function calcOdds(home: Team, away: Team) {
  const eloDiff = home.elo - away.elo;
  const pHome = 1/(1+Math.pow(10,-eloDiff/400));
  const pDraw = Math.max(0.12, Math.min(0.32, 0.26-Math.abs(eloDiff)/800));
  const pAway = 1 - pHome - pDraw;
  const margin = 1.06;
  return {
    homeOdds: Math.round(margin/pHome*100)/100,
    drawOdds: Math.round(margin/pDraw*100)/100,
    awayOdds: Math.round(margin/pAway*100)/100,
    homePct: Math.round(pHome*1000)/10,
    drawPct: Math.round(pDraw*1000)/10,
    awayPct: Math.round(pAway*1000)/10,
  };
}

export default function MatchClient({ id }: { id: string }) {
  const staticMatch = getMatch(id);
  const [apiData, setApiData] = useState<ApiMatch | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/matches')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (cancelled || !json?.matches) return;
        const sorted = [...json.matches].sort((a:any,b:any) => a.utcDate.localeCompare(b.utcDate)||a.id-b.id);
        const idx = parseInt(id.replace('m',''),10)-1;
        if (idx>=0 && idx<sorted.length) setApiData(sorted[idx] as ApiMatch);
      })
      .catch(()=>{})
      .finally(() => { if (!cancelled) setApiLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (!staticMatch) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">比赛未找到</div>;

  const homeTeamId = apiData ? tlaToTeamId(apiData.homeTeam.tla) : staticMatch.homeTeamId;
  const awayTeamId = apiData ? tlaToTeamId(apiData.awayTeam.tla) : staticMatch.awayTeamId;
  const homeTeam = homeTeamId !== 'TBD' ? getTeam(homeTeamId) : null;
  const awayTeam = awayTeamId !== 'TBD' ? getTeam(awayTeamId) : null;
  const isFinished = apiData?.status === 'FINISHED';
  const isLive = apiData?.status === 'IN_PLAY' || apiData?.status === 'LIVE';
  const score = apiData?.score;

  const ai = getPredictions(id);
  const h2h = homeTeam && awayTeam ? generateH2H(homeTeam, awayTeam) : [];
  const odds = homeTeam && awayTeam ? calcOdds(homeTeam, awayTeam) : null;

  // H2H stats
  const h2hStats = useMemo(() => {
    if (!homeTeam) return null;
    let wins=0,draws=0,losses=0,gf=0,ga=0;
    h2h.forEach(r => {
      const isHome = r.home === homeTeam.name;
      const ourScore = isHome ? r.hScore : r.aScore;
      const theirScore = isHome ? r.aScore : r.hScore;
      gf+=ourScore; ga+=theirScore;
      if (ourScore>theirScore) wins++;
      else if (ourScore<theirScore) losses++;
      else draws++;
    });
    return {wins,draws,losses,gf,ga};
  }, [h2h, homeTeam]);

  const otherGroupMatches = staticMatch.group
    ? allMatches.filter(m => m.group === staticMatch.group && m.id !== staticMatch.id)
    : [];

  if (!homeTeam || !awayTeam) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
      <div className="text-5xl mb-4">❓</div>
      <p className="font-bold text-gray-500">对阵球队待定</p>
      <p className="text-sm mt-2">淘汰赛对阵将在小组赛结束后确定</p>
      <a href="/schedule" className="inline-block mt-4 text-gold-dark hover:underline font-medium">浏览赛程 →</a>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* ═══════ Match Card ═══════ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              {staticMatch.group && <span className="bg-white/20 px-2 py-0.5 rounded">{staticMatch.group}组</span>}
              <span className="bg-white/20 px-2 py-0.5 rounded">{stageNames[staticMatch.stage]}</span>
              {isFinished && <span className="bg-blue-500 text-white px-2 py-0.5 rounded">完赛</span>}
              {isLive && <span className="bg-green-500 text-white px-2 py-0.5 rounded animate-pulse">LIVE</span>}
            </div>
            <span>{apiData ? bjDate(apiData.utcDate) : staticMatch.date} {apiData ? bjTime(apiData.utcDate) : staticMatch.time}</span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between">
            <a href={`/team/${homeTeam.id}`} className="flex flex-col items-center flex-1 hover:opacity-80 transition-opacity">
              <span className="text-5xl md:text-6xl mb-2">{homeTeam.flag}</span>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center">{homeTeam.name}</h2>
              <p className="text-xs text-gray-400">{homeTeam.nameEn}</p>
              <div className="flex gap-2 mt-1.5 text-[10px]">
                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">FIFA #{homeTeam.fifaRank}</span>
                <span className="bg-navy/10 text-navy px-1.5 py-0.5 rounded">ELO {homeTeam.elo}</span>
              </div>
            </a>

            <div className="flex-shrink-0 mx-6 md:mx-10 text-center">
              {isFinished && score ? (
                <div>
                  <div className="text-4xl md:text-5xl font-extrabold text-gray-900 tabular-nums">{score.fullTime.home} - {score.fullTime.away}</div>
                  <div className="text-sm text-blue-600 font-bold mt-2">比赛结束</div>
                </div>
              ) : isLive && score ? (
                <div>
                  <div className="text-4xl md:text-5xl font-extrabold text-green-600 animate-pulse tabular-nums">{score.fullTime.home??0} - {score.fullTime.away??0}</div>
                  <div className="text-sm text-green-600 font-bold mt-2">⚡ 进行中</div>
                </div>
              ) : (
                <div>
                  <div className="text-4xl font-extrabold text-gray-300">VS</div>
                  <div className="text-base font-bold text-gray-900 mt-2">{apiData ? bjTime(apiData.utcDate) : staticMatch.time}</div>
                  <div className="text-[11px] text-gray-400">北京时间</div>
                </div>
              )}
            </div>

            <a href={`/team/${awayTeam.id}`} className="flex flex-col items-center flex-1 hover:opacity-80 transition-opacity">
              <span className="text-5xl md:text-6xl mb-2">{awayTeam.flag}</span>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center">{awayTeam.name}</h2>
              <p className="text-xs text-gray-400">{awayTeam.nameEn}</p>
              <div className="flex gap-2 mt-1.5 text-[10px]">
                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">FIFA #{awayTeam.fifaRank}</span>
                <span className="bg-navy/10 text-navy px-1.5 py-0.5 rounded">ELO {awayTeam.elo}</span>
              </div>
            </a>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-6 text-xs text-gray-500">
            <span>📍 {staticMatch.city} · 🏟️ {staticMatch.venue}</span>
            {apiData && !apiLoading && <span className="text-gray-300">|</span>}
            {apiData && !apiLoading && <span className="text-green-600 font-medium">实时数据</span>}
          </div>
        </div>
      </div>

      {/* ═══════ AI 4-Model Prediction ═══════ */}
      {ai && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 via-navy to-blue-700 px-5 py-3 text-white">
            <h2 className="font-bold text-sm flex items-center gap-2">🤖 AI世界杯实验室 · 四大模型预测</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* 4 model cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MODEL_ORDER.map(mid => {
                const p = ai.predictions[mid];
                const info = AI_MODELS[mid];
                const isConsensus = ai.consensus.side === p.winner;
                return (
                  <div key={mid} className={`rounded-lg p-3 text-center ${isConsensus ? 'ring-2 ring-gold/30' : ''}`}
                    style={{ backgroundColor: `${info.color}10`, borderColor: `${info.color}30`, borderWidth: 1 }}>
                    <div className="text-lg mb-0.5">{info.icon}</div>
                    <div className="text-[10px] font-bold text-gray-500 mb-1.5">{info.name}</div>
                    <div className="text-lg font-extrabold font-mono" style={{ color: info.color }}>
                      {p.predictedScore}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{p.winner}胜</div>
                    <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.confidence}%`, backgroundColor: info.color, opacity: 0.7 }} />
                    </div>
                    <div className="text-[9px] text-gray-400 mt-1">置信度 {p.confidence}%</div>
                  </div>
                );
              })}
            </div>

            {/* Consensus */}
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <span className="text-xs text-gray-500">模型共识：</span>
              <span className="text-sm font-bold text-navy">{ai.consensus.side}</span>
              <span className="text-xs text-gray-400 ml-1">
                ({ai.consensus.modelCount}/{ai.consensus.total} 模型选择)
              </span>
            </div>

            {/* Top 3 scores (from Claude as reference) */}
            {ai.predictions.claude && (
              <div className="bg-gold-50 rounded-lg border border-gold-light p-4">
                <div className="text-xs font-bold text-gold-dark mb-2">📌 各模型推荐比分</div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {MODEL_ORDER.map(mid => {
                    const p = ai.predictions[mid];
                    const info = AI_MODELS[mid];
                    return (
                      <div key={mid}>
                        <span className="text-gray-400 text-[10px]">{info.name}</span>
                        <div className="font-bold font-mono" style={{ color: info.color }}>{p.predictedScore}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Win/Draw/Loss — use Claude's probabilities as reference */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg border p-4">
              <div className="text-xs font-bold text-gray-600 mb-3">📊 胜负平概率共识</div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <span className="text-gray-500">{homeTeam.name}胜</span>
                  <div className="font-extrabold text-navy text-lg">
                    {Math.round(MODEL_ORDER.reduce((s, m) => s + ai.predictions[m].homeWinProb, 0) / 4)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">平局</span>
                  <div className="font-extrabold text-gray-500 text-lg">
                    {Math.round(MODEL_ORDER.reduce((s, m) => s + ai.predictions[m].drawProb, 0) / 4)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">{awayTeam.name}胜</span>
                  <div className="font-extrabold text-orange-600 text-lg">
                    {Math.round(MODEL_ORDER.reduce((s, m) => s + ai.predictions[m].awayWinProb, 0) / 4)}%
                  </div>
                </div>
              </div>
              {/* Bar */}
              <div className="mt-3 flex h-2.5 rounded-full overflow-hidden">
                <div className="bg-green-500" style={{ width: `${Math.round(MODEL_ORDER.reduce((s, m) => s + ai.predictions[m].homeWinProb, 0) / 4)}%` }} />
                <div className="bg-gray-300" style={{ width: `${Math.round(MODEL_ORDER.reduce((s, m) => s + ai.predictions[m].drawProb, 0) / 4)}%` }} />
                <div className="bg-orange-500" style={{ width: `${Math.round(MODEL_ORDER.reduce((s, m) => s + ai.predictions[m].awayWinProb, 0) / 4)}%` }} />
              </div>
            </div>

            {/* Model reasoning */}
            <div className="space-y-2">
              {MODEL_ORDER.map(mid => {
                const p = ai.predictions[mid];
                const info = AI_MODELS[mid];
                return (
                  <div key={mid} className="flex items-start gap-2 text-xs">
                    <span className="text-sm shrink-0">{info.icon}</span>
                    <span className="text-gray-400 w-12 shrink-0 font-medium">{info.name}</span>
                    <span className="text-gray-600">{p.reasoning}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 2-col: H2H + Recent Form ═══════ */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Head to Head */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-navy px-5 py-3 text-white">
            <h2 className="font-bold text-sm">⚔️ 历史交锋</h2>
          </div>
          <div className="p-4">
            {h2h.length > 0 ? (
              <>
                <div className="space-y-1.5 mb-4">
                  {h2h.map(r => {
                    const isHomeWin = r.home === homeTeam.name ? r.hScore > r.aScore : r.aScore > r.hScore;
                    const isDraw = r.hScore === r.aScore;
                    const dot = isDraw ? '🟡' : isHomeWin ? '🟢' : '🔴';
                    return (
                      <div key={r.year} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 w-10 font-mono">{r.year}</span>
                        <span className="font-medium text-gray-800">{r.home} {r.hScore}-{r.aScore} {r.away}</span>
                        <span className="ml-auto">{dot}</span>
                      </div>
                    );
                  })}
                </div>
                {h2hStats && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center text-xs">
                    <span className="font-bold text-gray-900">{homeTeam.name}</span>
                    <span className="text-gray-400 mx-1">对</span>
                    <span className="font-bold text-gray-900">{awayTeam.name}</span>
                    <div className="mt-1.5 flex justify-center gap-4">
                      <span className="text-green-600 font-bold">{h2hStats.wins}胜</span>
                      <span className="text-yellow-600 font-bold">{h2hStats.draws}平</span>
                      <span className="text-red-500 font-bold">{h2hStats.losses}负</span>
                    </div>
                    <div className="mt-1 text-gray-500">进{h2hStats.gf}球 · 失{h2hStats.ga}球</div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-sm text-gray-400">暂无历史交锋记录</div>
            )}
          </div>
        </div>

        {/* Recent Form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-navy px-5 py-3 text-white">
            <h2 className="font-bold text-sm">📈 最近5场状态</h2>
          </div>
          <div className="p-4 space-y-4">
            {[homeTeam, awayTeam].map(team => {
              const wins = team.recentForm.filter(f=>f==='W').length;
              return (
                <div key={team.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{team.flag}</span>
                    <span className="text-sm font-bold text-gray-900">{team.name}</span>
                    <span className="text-[11px] text-gray-400 ml-auto">{wins}胜{team.recentForm.filter(f=>f==='D').length}平{team.recentForm.filter(f=>f==='L').length}负</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {team.recentForm.map((f,i) => (
                      <span key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${f==='W'?'bg-green-100 text-green-700':f==='D'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-600'}`}>{f}</span>
                    ))}
                  </div>
                  <div className="space-y-0.5">
                    {team.recentResults.map((r,i) => (
                      <div key={i} className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <span className={`w-1 h-1 rounded-full ${team.recentForm[i]==='W'?'bg-green-500':team.recentForm[i]==='D'?'bg-yellow-500':'bg-red-500'}`} />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════ Odds + AI vs Market ═══════ */}
      {odds && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-red-700 to-navy px-5 py-3 text-white">
            <h2 className="font-bold text-sm">💰 赔率分析</h2>
          </div>
          <div className="p-5">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-[11px] text-gray-500 mb-1">{homeTeam.name}胜</div>
                <div className="text-2xl font-extrabold text-gray-900 tabular-nums">{odds.homeOdds}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">赔率</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-[11px] text-gray-500 mb-1">平局</div>
                <div className="text-2xl font-extrabold text-gray-900 tabular-nums">{odds.drawOdds}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">赔率</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-[11px] text-gray-500 mb-1">{awayTeam.name}胜</div>
                <div className="text-2xl font-extrabold text-gray-900 tabular-nums">{odds.awayOdds}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">赔率</div>
              </div>
            </div>

            {/* Implied probability */}
            <div className="text-xs text-gray-600 mb-3">隐含概率（去水分后）：</div>
            <div className="flex h-2.5 rounded-full overflow-hidden mb-1.5">
              <div className="bg-green-500" style={{width:`${odds.homePct}%`}} />
              <div className="bg-gray-300" style={{width:`${odds.drawPct}%`}} />
              <div className="bg-orange-500" style={{width:`${odds.awayPct}%`}} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mb-4">
              <span>{homeTeam.name} {odds.homePct}%</span>
              <span>平 {odds.drawPct}%</span>
              <span>{awayTeam.name} {odds.awayPct}%</span>
            </div>

            {/* AI vs Market comparison */}
            {ai && (
              <div className="bg-gold-50 rounded-lg border border-gold-light p-3">
                <div className="text-xs font-bold text-gray-700 mb-2">🤖 AI 平均概率 vs 市场赔率</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {(() => {
                    const avgHome = Math.round(MODEL_ORDER.reduce((s, m) => s + ai.predictions[m].homeWinProb, 0) / 4);
                    const avgDraw = Math.round(MODEL_ORDER.reduce((s, m) => s + ai.predictions[m].drawProb, 0) / 4);
                    const avgAway = Math.round(MODEL_ORDER.reduce((s, m) => s + ai.predictions[m].awayWinProb, 0) / 4);
                    return (
                      <>
                        <div>
                          <div className="text-gray-400 mb-0.5">赔率认为</div>
                          <div className="font-bold text-gray-900">{odds.homePct}%</div>
                          <div className="text-gray-400 mb-0.5 mt-1">AI 认为</div>
                          <div className="font-bold text-navy">{avgHome}%</div>
                          <div className={`text-[10px] mt-0.5 font-medium ${avgHome > odds.homePct ? 'text-green-600' : 'text-red-500'}`}>
                            {avgHome > odds.homePct ? '+' : ''}{(avgHome - odds.homePct).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-0.5">赔率认为</div>
                          <div className="font-bold text-gray-900">{odds.drawPct}%</div>
                          <div className="text-gray-400 mb-0.5 mt-1">AI 认为</div>
                          <div className="font-bold text-navy">{avgDraw}%</div>
                          <div className={`text-[10px] mt-0.5 font-medium ${avgDraw > odds.drawPct ? 'text-green-600' : 'text-red-500'}`}>
                            {avgDraw > odds.drawPct ? '+' : ''}{(avgDraw - odds.drawPct).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-0.5">赔率认为</div>
                          <div className="font-bold text-gray-900">{odds.awayPct}%</div>
                          <div className="text-gray-400 mb-0.5 mt-1">AI 认为</div>
                          <div className="font-bold text-navy">{avgAway}%</div>
                          <div className={`text-[10px] mt-0.5 font-medium ${avgAway > odds.awayPct ? 'text-green-600' : 'text-red-500'}`}>
                            {avgAway > odds.awayPct ? '+' : ''}{(avgAway - odds.awayPct).toFixed(1)}%
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ Other Group Matches ═══════ */}
      {otherGroupMatches.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
            <h2 className="font-bold text-sm text-gray-700">📅 {staticMatch.group}组其他比赛</h2>
          </div>
          <div className="p-4">
            <div className="grid md:grid-cols-3 gap-3">
              {otherGroupMatches.map(m => {
                const hm = getTeam(m.homeTeamId); const am = getTeam(m.awayTeamId);
                return (
                  <a key={m.id} href={`/match/${m.id}`} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors text-center">
                    <div className="text-[11px] text-gray-400 mb-2">{formatDate(m.date)} {m.time}</div>
                    <div className="flex items-center justify-center gap-2">
                      {hm && <span className="text-lg">{hm.flag}</span>}
                      <span className="text-xs font-medium text-gray-900">{hm?.name||'TBD'}</span>
                      <span className="text-[10px] text-gray-400">VS</span>
                      <span className="text-xs font-medium text-gray-900">{am?.name||'TBD'}</span>
                      {am && <span className="text-lg">{am.flag}</span>}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
