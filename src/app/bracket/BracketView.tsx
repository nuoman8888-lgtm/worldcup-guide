'use client';

import { useState, useRef, useCallback } from 'react';
import { Bracket, Seed, SeedItem, SeedTeam, SeedTime } from 'react-brackets';
import { getAllTeams } from '@/data/teams';
import type { Team } from '@/data/teams';

/* ═══════════════════════════════════
   Data: R16 → QF → SF → Final
   ═══════════════════════════════════ */

interface Slot {
  id: string;
  date: string;
  time: string;
  city: string;
  feedsFrom: string[];
}

const R16: Slot[] = [
  { id:'r16-1', date:'7/5', time:'01:00', city:'墨西哥城', feedsFrom:[] },
  { id:'r16-2', date:'7/5', time:'05:00', city:'多伦多', feedsFrom:[] },
  { id:'r16-3', date:'7/6', time:'04:00', city:'洛杉矶', feedsFrom:[] },
  { id:'r16-4', date:'7/6', time:'08:00', city:'纽约', feedsFrom:[] },
  { id:'r16-5', date:'7/7', time:'03:00', city:'达拉斯', feedsFrom:[] },
  { id:'r16-6', date:'7/7', time:'08:00', city:'亚特兰大', feedsFrom:[] },
  { id:'r16-7', date:'7/8', time:'00:00', city:'费城', feedsFrom:[] },
  { id:'r16-8', date:'7/8', time:'04:00', city:'迈阿密', feedsFrom:[] },
];

const QF: Slot[] = [
  { id:'qf-1', date:'7/10', time:'04:00', city:'墨西哥城', feedsFrom:['r16-1','r16-2'] },
  { id:'qf-2', date:'7/11', time:'03:00', city:'多伦多', feedsFrom:['r16-3','r16-4'] },
  { id:'qf-3', date:'7/12', time:'05:00', city:'洛杉矶', feedsFrom:['r16-5','r16-6'] },
  { id:'qf-4', date:'7/12', time:'09:00', city:'纽约', feedsFrom:['r16-7','r16-8'] },
];

const SF: Slot[] = [
  { id:'sf-1', date:'7/15', time:'03:00', city:'达拉斯', feedsFrom:['qf-1','qf-2'] },
  { id:'sf-2', date:'7/16', time:'03:00', city:'亚特兰大', feedsFrom:['qf-3','qf-4'] },
];

const F: Slot[] = [
  { id:'final', date:'7/20', time:'03:00', city:'纽约', feedsFrom:['sf-1','sf-2'] },
];

type Picks = Record<string, string>;

/* ═══════════════════════════════════
   Main Component
   ═══════════════════════════════════ */

export default function BracketView() {
  const [picks, setPicks] = useState<Picks>({});
  const [started, setStarted] = useState(false);
  const [sharing, setSharing] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const teams = getAllTeams();

  const allSlots = [...R16, ...QF, ...SF, ...F];
  const championId = picks['final'] || null;
  const champion = championId ? teams.find(t => t.id === championId) : null;

  // Pick a winner
  function pick(slotId: string, teamId: string) {
    setPicks(prev => ({ ...prev, [slotId]: teamId }));
    setStarted(true);
  }

  // Get winner for a slot
  function winnerOf(slotId: string): Team | null {
    const wid = picks[slotId];
    return wid ? teams.find(t => t.id === wid) || null : null;
  }

  // Quick AI predict
  function quickPredict() {
    const p: Picks = {};
    const top16 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 16);
    R16.forEach((s, i) => {
      const t1 = top16[i * 2], t2 = top16[i * 2 + 1];
      p[s.id] = t1.elo > t2.elo ? t1.id : t2.id;
    });
    QF.forEach(s => { const w1 = p[s.feedsFrom[0]], w2 = p[s.feedsFrom[1]]; if (w1 && w2) { const t1 = teams.find(t => t.id === w1)!, t2 = teams.find(t => t.id === w2)!; p[s.id] = t1.elo > t2.elo ? t1.id : t2.id; } });
    SF.forEach(s => { const w1 = p[s.feedsFrom[0]], w2 = p[s.feedsFrom[1]]; if (w1 && w2) { const t1 = teams.find(t => t.id === w1)!, t2 = teams.find(t => t.id === w2)!; p[s.id] = t1.elo > t2.elo ? t1.id : t2.id; } });
    F.forEach(s => { const w1 = p[s.feedsFrom[0]], w2 = p[s.feedsFrom[1]]; if (w1 && w2) { const t1 = teams.find(t => t.id === w1)!, t2 = teams.find(t => t.id === w2)!; p[s.id] = t1.elo > t2.elo ? t1.id : t2.id; } });
    setPicks(p);
    setStarted(true);
  }

  function reset() { setPicks({}); setStarted(false); }

  // Share
  const handleShare = useCallback(async () => {
    if (!bannerRef.current) return;
    setSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(bannerRef.current, { backgroundColor: '#ffffff', scale: 2 });
      const a = document.createElement('a');
      a.download = 'worldcup-2026-prediction.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch { /* noop */ }
    setSharing(false);
  }, []);

  // Build rounds data for react-brackets
  const top16 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 16);

  function buildSeed(slot: Slot, isFinal: boolean) {
    const w = winnerOf(slot.id);
    // Get the two teams
    let t1: Team | null = null;
    let t2: Team | null = null;

    if (slot.feedsFrom.length === 2) {
      t1 = winnerOf(slot.feedsFrom[0]);
      t2 = winnerOf(slot.feedsFrom[1]);
    } else {
      // R16: use ELO seeding
      const idx = R16.indexOf(slot);
      t1 = top16[idx * 2] || null;
      t2 = top16[idx * 2 + 1] || null;
    }

    const canClick = !w && t1 !== null && t2 !== null;

    return {
      id: slot.id,
      date: `${slot.date} ${slot.time}`,
      city: slot.city,
      teams: [
        { id: t1?.id || '', name: t1?.name || '待定', flag: t1?.flag || '?', winner: w?.id === t1?.id },
        { id: t2?.id || '', name: t2?.name || '待定', flag: t2?.flag || '?', winner: w?.id === t2?.id },
      ],
      winner: w,
      canClick,
      isFinal,
    };
  }

  const rounds = [
    { title: '16 强', seeds: R16.map(s => buildSeed(s, false)) },
    { title: '¼ 决赛', seeds: QF.map(s => buildSeed(s, false)) },
    { title: '半决赛', seeds: SF.map(s => buildSeed(s, false)) },
    { title: '决赛', seeds: F.map(s => buildSeed(s, true)) },
  ];

  // Progress
  const filled = allSlots.filter(s => picks[s.id]).length;
  const progress = Math.round((filled / allSlots.length) * 100);

  return (
    <div>
      {/* ═══════ Header ═══════ */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">🏆 淘汰赛预测器</h1>
        <p className="text-gray-500 text-sm">逐场选择晋级球队 · 自动生成冠军预测</p>
      </div>

      {/* ═══════ Controls ═══════ */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <button onClick={quickPredict} className="px-6 py-2.5 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy-light transition-colors shadow-sm">
          ⚡ AI 预测
        </button>
        <button className="px-6 py-2.5 bg-white text-gray-700 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm" onClick={() => {}}>
          ✋ 手动预测
        </button>
        <button onClick={reset} className="px-6 py-2.5 bg-white text-gray-700 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
          🔄 重置
        </button>

        {/* Progress */}
        <div className="hidden sm:flex items-center gap-2 ml-4">
          <div className="flex items-center gap-3 text-xs text-gray-500 whitespace-nowrap">
            {rounds.map(r => {
              const c = r.seeds.filter((s: any) => s.winner).length;
              return <span key={r.title} className={c === r.seeds.length ? 'text-qualify font-semibold' : ''}>{r.title} {c}/{r.seeds.length}</span>;
            })}
          </div>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-600 tabular-nums">{progress}%</span>
        </div>
      </div>

      {/* ═══════ Champion Banner ═══════ */}
      {champion && (
        <div ref={bannerRef} className="mb-8 rounded-2xl p-6 text-center shadow-md max-w-md mx-auto" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #C8A951' }}>
          <div className="text-xs text-navy font-bold mb-1 tracking-widest">FIFA WORLD CUP 2026</div>
          <div className="text-3xl mb-2">🏆</div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-5xl">{champion.flag}</span>
            <div className="text-left">
              <div className="text-2xl font-extrabold text-navy">{champion.name}</div>
              <div className="text-sm text-navy/60">{champion.nameEn}</div>
              <div className="text-xs text-navy/40 mt-0.5">FIFA #{champion.fifaRank} · ELO {champion.elo}</div>
            </div>
          </div>
          <div className="text-xs text-navy/50">我的世界杯预测冠军</div>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={reset} className="px-4 py-2 bg-white text-navy rounded-lg text-sm font-medium border border-gold hover:bg-yellow-50 transition-colors">🔄 重新预测</button>
            <button onClick={handleShare} disabled={sharing} className="px-5 py-2 bg-navy text-white rounded-lg text-sm font-bold hover:bg-navy-light transition-colors disabled:opacity-50">{sharing ? '生成中...' : '📸 分享'}</button>
          </div>
        </div>
      )}

      {/* ═══════ Bracket ═══════ */}
      <div className="overflow-x-auto scrollbar-hide pb-4">
        <div style={{ minWidth: 900 }}>
          <Bracket
            rounds={rounds as any}
            renderSeedComponent={({ seed, roundIndex }: any) => {
              const s = seed as ReturnType<typeof buildSeed>;
              const isFinal = s.isFinal;
              return (
                <Seed mobileBreakpoint={0}>
                  <SeedItem style={{ background: isFinal ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : s.winner ? '#f9fafb' : '#ffffff', border: isFinal ? '2px solid #C8A951' : s.winner ? '1px solid #e5e7eb' : '1px solid #e5e7eb', borderRadius: 12, padding: 0, minWidth: 140 }}>
                    {/* Match info bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px 0', fontSize: 10, color: '#9ca3af' }}>
                      <span>{s.date}</span>
                      <span>{s.city}</span>
                    </div>

                    {/* Teams */}
                    <div style={{ padding: '4px 10px 8px' }}>
                      {s.teams.map((team: any, ti: number) => (
                        <div
                          key={ti}
                          onClick={() => {
                            if (s.canClick && team.id) {
                              // Need to find the correct slot ID
                              const slotId = s.id;
                              pick(slotId, team.id);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '5px 8px',
                            cursor: s.canClick && team.id ? 'pointer' : 'default',
                            borderRadius: 8,
                            background: team.winner ? '#fef3c7' : s.canClick && team.id ? '#f9fafb' : 'transparent',
                            fontWeight: team.winner ? 700 : 400,
                            color: team.winner ? '#C8A951' : team.name === '待定' ? '#d1d5db' : '#1f2937',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => { if (s.canClick && team.id) (e.currentTarget as HTMLElement).style.background = '#fef3c7'; }}
                          onMouseLeave={e => { if (!team.winner) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{team.flag}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <SeedTeam style={{ fontSize: 12, fontWeight: team.winner ? 700 : 500 }}>{team.name}</SeedTeam>
                          </div>
                          {team.winner && <span style={{ fontSize: 14 }}>✓</span>}
                          {s.canClick && !s.winner && team.id && !team.winner && <span style={{ fontSize: 10, color: '#9ca3af' }}>选</span>}
                        </div>
                      ))}
                    </div>

                    {/* Winner indicator */}
                    {s.winner && (
                      <div style={{ textAlign: 'center', padding: '0 10px 8px', fontSize: 10, fontWeight: 700, color: '#C8A951' }}>
                        {s.winner.flag} {s.winner.name} 晋级
                      </div>
                    )}
                  </SeedItem>
                  <SeedTime style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>{s.date}</SeedTime>
                </Seed>
              );
            }}
          />
        </div>
      </div>

      {/* ═══════ Empty state ═══════ */}
      {!started && (
        <div className="text-center mt-6 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm max-w-md mx-auto">
          <div className="text-3xl mb-2">👆</div>
          <p className="text-gray-700 font-semibold text-sm">点击任意一场比赛中的球队开始预测</p>
          <p className="text-gray-400 text-xs mt-1">或点击「⚡ AI 预测」一键生成全部结果</p>
        </div>
      )}
    </div>
  );
}
