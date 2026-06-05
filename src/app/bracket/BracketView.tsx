'use client';

import { useState, useRef, useCallback } from 'react';
import { Bracket, Seed, SeedItem, SeedTeam, SeedTime } from 'react-brackets';
import { getAllTeams } from '@/data/teams';
import type { Team } from '@/data/teams';

const teams = getAllTeams();

/* ═══════════════════════════════════
   Elo win probability
   ═══════════════════════════════════ */

function eloWin(eloA: number, eloB: number): boolean {
  const pA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  return Math.random() < pA;
}

function eloProb(eloA: number, eloB: number): number {
  return Math.round((1 / (1 + Math.pow(10, (eloB - eloA) / 400))) * 100);
}

/* ═══════════════════════════════════
   Data: R32 → R16 → QF → SF → Final
   ═══════════════════════════════════ */

interface Slot {
  id: string; date: string; time: string; city: string; feedsFrom: string[];
}

const R32: Slot[] = Array.from({ length: 16 }, (_, i) => ({
  id: `r32-${i + 1}`, date: '', time: '', city: '', feedsFrom: [],
}));

function nextRound(from: Slot[], prefix: string, count: number): Slot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`, date: '', time: '', city: '',
    feedsFrom: [from[i * 2].id, from[i * 2 + 1].id],
  }));
}

const R16 = nextRound(R32, 'r16', 8);
const QF = nextRound(R16, 'qf', 4);
const SF = nextRound(QF, 'sf', 2);
const FINAL: Slot[] = [{ id: 'final', date: '', time: '', city: '', feedsFrom: ['sf-1', 'sf-2'] }];

type Picks = Record<string, string>;

/* ═══════════════════════════════════
   Simulate tournament N times for probabilities
   ═══════════════════════════════════ */

interface SimResult {
  champion: Team;
  runnerUp: Team;
  semiFinalists: Team[];  // 4
  quarterFinalists: Team[]; // 8
}

function simulateOnce(top32: Team[]): SimResult {
  const p: Picks = {};
  // R32
  R32.forEach((s, i) => {
    const t1 = top32[i * 2], t2 = top32[i * 2 + 1];
    p[s.id] = eloWin(t1.elo, t2.elo) ? t1.id : t2.id;
  });
  // Cascade
  [R16, QF, SF, FINAL].forEach(round => {
    round.forEach(s => {
      const t1 = teams.find(t => t.id === p[s.feedsFrom[0]]);
      const t2 = teams.find(t => t.id === p[s.feedsFrom[1]]);
      if (t1 && t2) p[s.id] = eloWin(t1.elo, t2.elo) ? t1.id : t2.id;
    });
  });
  // Gather results
  const champion = teams.find(t => t.id === p['final'])!;
  const sf1Loser = teams.find(t => t.id === p['sf-1'] && t.id !== p['final']) ||
                   teams.find(t => t.id === p[SF[0].feedsFrom[0]] && t.id !== p['sf-1']) ||
                   teams.find(t => t.id === p[SF[0].feedsFrom[1]] && t.id !== p['sf-1'])!;
  const sf2Loser = teams.find(t => t.id === p['sf-2'] && t.id !== p['final']) ||
                   teams.find(t => t.id === p[SF[1].feedsFrom[0]] && t.id !== p['sf-2']) ||
                   teams.find(t => t.id === p[SF[1].feedsFrom[1]] && t.id !== p['sf-2'])!;
  const runnerUp = teams.find(t => t.id === p['sf-1'] || t.id === p['sf-2'])!.id === champion.id
    ? (sf1Loser.elo > sf2Loser.elo ? sf1Loser : sf2Loser)
    : teams.find(t => (t.id === p['sf-1'] || t.id === p['sf-2']) && t.id !== champion.id)!;
  const semiFinalists = [champion, runnerUp, sf1Loser, sf2Loser];
  const qfWinners = QF.map(s => teams.find(t => t.id === p[s.id])!);
  const qfLosers = QF.map(s => {
    const f1 = teams.find(t => t.id === p[s.feedsFrom[0]] && t.id !== p[s.id]);
    const f2 = teams.find(t => t.id === p[s.feedsFrom[1]] && t.id !== p[s.id]);
    return f1 || f2;
  }).filter(Boolean) as Team[];
  const quarterFinalists = [...qfWinners, ...qfLosers].slice(0, 8);

  return { champion, runnerUp, semiFinalists, quarterFinalists };
}

function runSimulations(count: number) {
  const top32 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 32);
  const champCount: Record<string, number> = {};
  const runnerCount: Record<string, number> = {};
  const semiCount: Record<string, number> = {};
  const quartCount: Record<string, number> = {};
  let latestResult: SimResult | null = null;

  for (let n = 0; n < count; n++) {
    const r = simulateOnce(top32);
    latestResult = r;
    champCount[r.champion.id] = (champCount[r.champion.id] || 0) + 1;
    runnerCount[r.runnerUp.id] = (runnerCount[r.runnerUp.id] || 0) + 1;
    r.semiFinalists.forEach(t => { semiCount[t.id] = (semiCount[t.id] || 0) + 1; });
    r.quarterFinalists.forEach(t => { quartCount[t.id] = (quartCount[t.id] || 0) + 1; });
  }

  const pct = (c: number) => Math.round((c / count) * 1000) / 10;

  const rankTeams = (counter: Record<string, number>, limit: number) =>
    Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, c]) => ({ team: teams.find(t => t.id === id)!, prob: pct(c) }));

  return {
    champions: rankTeams(champCount, 8),
    runners: rankTeams(runnerCount, 4),
    semis: rankTeams(semiCount, 4),
    quarts: rankTeams(quartCount, 8),
    latest: latestResult!,
    totalSims: count,
  };
}

/* ═══════════════════════════════════
   AI Prediction Cards
   ═══════════════════════════════════ */

function AIPredictionView({ onManual }: { onManual: () => void }) {
  const [results, setResults] = useState(() => runSimulations(200));
  const [sharing, setSharing] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const rerun = () => setResults(runSimulations(200));

  const handleShare = useCallback(async () => {
    if (!bannerRef.current) return;
    setSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(bannerRef.current, { backgroundColor: '#f8fafc', scale: 2 });
      const a = document.createElement('a');
      a.download = 'worldcup-ai-prediction.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch { /* noop */ }
    setSharing(false);
  }, []);

  const champion = results.champions[0];
  const runnerUp = results.runners[0];

  return (
    <div ref={bannerRef} className="max-w-3xl mx-auto">
      {/* ── Champion ── */}
      <div className="text-center mb-8">
        <div className="text-sm text-gray-500 font-bold mb-2 tracking-widest uppercase">AI 预测冠军</div>
        {champion && (
          <div className="inline-block rounded-2xl p-6 shadow-xl" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%)', border: '2px solid #D4AF37', minWidth: 260 }}>
            <div className="text-5xl mb-3">{champion.team.flag}</div>
            <div className="text-2xl font-extrabold text-navy">{champion.team.name}</div>
            <div className="text-sm text-navy/60">{champion.team.nameEn}</div>
            <div className="mt-2 text-3xl font-extrabold text-navy">{champion.prob}%</div>
            <div className="text-xs text-navy/50">夺冠概率</div>
          </div>
        )}
      </div>

      {/* ── Runner-up ── */}
      {runnerUp && (
        <div className="text-center mb-8">
          <div className="text-sm text-gray-500 font-bold mb-3 tracking-widest uppercase">🥈 亚军预测</div>
          <div className="inline-block rounded-2xl p-5 shadow-md bg-white border border-gray-200" style={{ minWidth: 220 }}>
            <div className="text-4xl mb-2">{runnerUp.team.flag}</div>
            <div className="text-xl font-extrabold text-gray-900">{runnerUp.team.name}</div>
            <div className="text-sm text-gray-500">{runnerUp.team.nameEn}</div>
            <div className="mt-2 text-2xl font-extrabold text-navy">{runnerUp.prob}%</div>
            <div className="text-xs text-gray-400">亚军概率</div>
          </div>
        </div>
      )}

      {/* ── Semi-finalists ── */}
      <div className="mb-8">
        <div className="text-center text-sm text-gray-500 font-bold mb-4 tracking-widest uppercase">🥉 四强预测</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {results.semis.map(s => (
            <div key={s.team.id} className="rounded-xl p-4 text-center bg-white border border-gray-200 shadow-sm">
              <div className="text-3xl mb-1">{s.team.flag}</div>
              <div className="font-bold text-gray-900 text-sm">{s.team.name}</div>
              <div className="text-xs text-gray-400">{s.team.nameEn}</div>
              <div className="mt-1.5 text-lg font-extrabold text-navy">{s.prob}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quarter-finalists ── */}
      <div className="mb-8">
        <div className="text-center text-sm text-gray-500 font-bold mb-4 tracking-widest uppercase">⚽ 八强预测</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {results.quarts.map(q => (
            <div key={q.team.id} className="rounded-xl p-3 text-center bg-white border border-gray-100 shadow-sm">
              <div className="text-2xl mb-1">{q.team.flag}</div>
              <div className="font-semibold text-gray-900 text-xs">{q.team.name}</div>
              <div className="text-[11px] text-navy font-bold mt-1">{q.prob}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top 8 Champion Probabilities ── */}
      <div className="mb-8">
        <div className="text-center text-sm text-gray-500 font-bold mb-3 tracking-widest uppercase">📊 夺冠概率 TOP 8</div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-md mx-auto">
          {results.champions.slice(0, 8).map((c, i) => (
            <div key={c.team.id} className={`flex items-center gap-3 px-5 py-3 ${i < 7 ? 'border-b border-gray-100' : ''} ${i === 0 ? 'bg-gold-50' : ''}`}>
              <span className={`text-xs font-bold w-6 ${i === 0 ? 'text-gold' : 'text-gray-400'}`}>{i + 1}</span>
              <span className="text-xl">{c.team.flag}</span>
              <span className="font-semibold text-gray-900 text-sm flex-1">{c.team.name}</span>
              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${i === 0 ? 'bg-gold' : 'bg-navy'}`} style={{ width: `${Math.max(4, c.prob)}%` }} />
              </div>
              <span className="text-sm font-bold text-gray-700 w-14 text-right tabular-nums">{c.prob}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-center gap-3 mb-8">
        <button onClick={rerun} className="px-6 py-2.5 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy-light transition-colors shadow-sm">
          🔄 重新预测
        </button>
        <button onClick={handleShare} disabled={sharing} className="px-6 py-2.5 bg-white text-gray-700 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
          {sharing ? '生成中...' : '📸 分享'}
        </button>
        <button onClick={onManual} className="px-6 py-2.5 bg-white text-navy rounded-xl text-sm font-medium border border-navy/20 hover:bg-navy/5 transition-colors">
          ✋ 手动预测淘汰赛 →
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">基于 {results.totalSims} 次 ELO 概率模拟 · 每次结果可能不同</p>
    </div>
  );
}

/* ═══════════════════════════════════
   Manual Bracket View (unchanged logic)
   ═══════════════════════════════════ */

interface SeedData {
  id: string; date: string; city: string;
  teams: Array<{ id: string; name: string; flag: string; winner: boolean }>;
  winner: Team | null; canClick: boolean; isFinal: boolean;
}

function ManualBracketView({ onBack }: { onBack: () => void }) {
  const [picks, setPicks] = useState<Picks>({});
  const [started, setStarted] = useState(false);

  const championId = picks['final'] || null;
  const champion = championId ? teams.find(t => t.id === championId) : null;

  const pick = useCallback((slotId: string, teamId: string) => {
    setPicks(prev => ({ ...prev, [slotId]: teamId }));
    setStarted(true);
  }, []);

  function winnerOf(slotId: string): Team | null {
    const wid = picks[slotId];
    return wid ? teams.find(t => t.id === wid) || null : null;
  }

  function quickPredict() {
    const p: Picks = {};
    const top32 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 32);
    R32.forEach((s, i) => {
      const t1 = top32[i * 2], t2 = top32[i * 2 + 1];
      if (t1 && t2) p[s.id] = eloWin(t1.elo, t2.elo) ? t1.id : t2.id;
    });
    [R16, QF, SF, FINAL].forEach(round => {
      round.forEach(s => {
        const t1 = teams.find(t => t.id === p[s.feedsFrom[0]]);
        const t2 = teams.find(t => t.id === p[s.feedsFrom[1]]);
        if (t1 && t2) p[s.id] = eloWin(t1.elo, t2.elo) ? t1.id : t2.id;
      });
    });
    setPicks(p); setStarted(true);
  }

  function reset() { setPicks({}); setStarted(false); }

  const top32 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 32);

  function buildSeed(slot: Slot, isFinal: boolean, roundSlots: Slot[]): SeedData {
    const w = winnerOf(slot.id);
    let t1: Team | null = null, t2: Team | null = null;
    if (slot.feedsFrom.length === 2) {
      t1 = winnerOf(slot.feedsFrom[0]);
      t2 = winnerOf(slot.feedsFrom[1]);
    } else {
      const idx = roundSlots.indexOf(slot);
      t1 = top32[idx * 2] || null;
      t2 = top32[idx * 2 + 1] || null;
    }
    return {
      id: slot.id, date: '', city: '',
      teams: [
        { id: t1?.id || '', name: t1?.name || '待定', flag: t1?.flag || '?', winner: !!w && w.id === t1?.id },
        { id: t2?.id || '', name: t2?.name || '待定', flag: t2?.flag || '?', winner: !!w && w.id === t2?.id },
      ],
      winner: w, canClick: !w && !!t1 && !!t2, isFinal,
    };
  }

  const rounds = [
    { title: '32 强', seeds: R32.map(s => buildSeed(s, false, R32)) },
    { title: '16 强', seeds: R16.map(s => buildSeed(s, false, R16)) },
    { title: '¼ 决赛', seeds: QF.map(s => buildSeed(s, false, QF)) },
    { title: '半决赛', seeds: SF.map(s => buildSeed(s, false, SF)) },
    { title: '决赛', seeds: FINAL.map(s => buildSeed(s, true, FINAL)) },
  ];

  const filled = [...R32, ...R16, ...QF, ...SF, ...FINAL].filter(s => picks[s.id]).length;
  const total = 31;
  const progress = Math.round((filled / total) * 100);

  return (
    <div className="max-w-full">
      {/* Back + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← 返回 AI 预测</button>
        <div className="flex items-center gap-2">
          <button onClick={quickPredict} className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-bold hover:bg-navy-light transition-colors">⚡ AI 填充</button>
          <button onClick={reset} className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">🔄 重置</button>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="tabular-nums font-bold">{progress}%</span>
        </div>
      </div>

      {/* Champion */}
      {champion && (
        <div className="mb-6 rounded-xl p-4 text-center max-w-sm mx-auto" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #D4AF37' }}>
          <div className="text-lg font-extrabold text-navy">🏆 {champion.flag} {champion.name}</div>
        </div>
      )}

      {/* Bracket Tree */}
      <div className="overflow-x-auto scrollbar-hide pb-6">
        <div className="inline-block min-w-[900px] w-full">
          <Bracket
            rounds={rounds as any}
            roundTitleComponent={(title: string) => (
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', background: title === '决赛' ? 'linear-gradient(135deg,#fef3c7,#fde68a)' : '#e2e8f0', padding: '4px 12px', borderRadius: 16, border: title === '决赛' ? '1px solid #D4AF37' : 'none' }}>
                  {title === '决赛' ? '🏆 ' : ''}{title}
                </span>
              </div>
            )}
            renderSeedComponent={({ seed }: any) => {
              const s = seed as SeedData;
              return (
                <Seed mobileBreakpoint={0}>
                  <SeedItem style={{
                    background: s.isFinal ? 'linear-gradient(135deg,#fef3c7,#fde68a)' : s.winner ? '#f1f5f9' : '#fff',
                    border: s.isFinal ? '2px solid #D4AF37' : '1px solid #cbd5e1',
                    borderRadius: 12, padding: 0, minWidth: 140,
                    boxShadow: s.isFinal ? '0 4px 16px rgba(212,175,55,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ padding: '4px 10px 6px' }}>
                      {s.teams.map((team: any, ti: number) => (
                        <div key={ti} onClick={() => { if (s.canClick && team.id) pick(s.id, team.id); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px',
                            cursor: s.canClick && team.id ? 'pointer' : 'default',
                            borderRadius: 8, marginBottom: ti === 0 ? 2 : 0,
                            background: team.winner ? 'linear-gradient(135deg,#fde68a,#fef3c7)' : s.canClick && team.id ? '#f1f5f9' : 'transparent',
                            border: team.winner ? '1px solid #D4AF37' : '1px solid transparent',
                            fontWeight: team.winner ? 700 : 500,
                            color: team.winner ? '#92400e' : team.name === '待定' ? '#94a3b8' : '#0f172a',
                          }}
                        >
                          <span style={{ fontSize: 18, width: 26, textAlign: 'center' }}>{team.flag}</span>
                          <span style={{ flex: 1, fontSize: 11, fontWeight: team.winner ? 700 : 600 }}>{team.name}</span>
                          {team.winner && <span style={{ color: '#D4AF37' }}>✓</span>}
                        </div>
                      ))}
                    </div>
                    {s.winner && <div style={{ textAlign: 'center', padding: '0 10px 6px', fontSize: 10, fontWeight: 700, color: '#92400e' }}>{s.winner.flag} 晋级</div>}
                  </SeedItem>
                </Seed>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   Main Page — toggles between views
   ═══════════════════════════════════ */

export default function BracketView() {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">🏆 淘汰赛预测器</h1>
        <p className="text-gray-500 text-sm">
          {mode === 'ai' ? 'ELO 概率模拟 · 100次推演' : '逐场手动选择 · 32场淘汰赛'}
        </p>
      </div>

      {mode === 'ai' ? (
        <AIPredictionView onManual={() => setMode('manual')} />
      ) : (
        <ManualBracketView onBack={() => setMode('ai')} />
      )}
    </div>
  );
}
