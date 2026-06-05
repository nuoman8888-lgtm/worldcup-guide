'use client';

import { useState, useRef, memo, useCallback } from 'react';
import { Bracket, Seed, SeedItem, SeedTeam, SeedTime } from 'react-brackets';
import { getAllTeams } from '@/data/teams';
import type { Team } from '@/data/teams';

/* ═══════════════════════════════════
   Slot data: R32 → R16 → QF → SF → Final
   2026 World Cup: 32 teams in knockout
   ═══════════════════════════════════ */

interface Slot {
  id: string;
  date: string; time: string; city: string;
  feedsFrom: string[];
}

const R32: Slot[] = Array.from({ length: 16 }, (_, i) => ({
  id: `r32-${i + 1}`,
  date: ['6/29','6/30','6/30','6/30','7/1','7/1','7/1','7/2','7/2','7/2','7/3','7/3','7/3','7/4','7/4','7/4'][i],
  time: ['03:00','01:00','04:30','09:00','01:00','05:00','09:00','00:00','04:00','08:00','03:00','07:00','11:00','02:00','06:00','09:30'][i],
  city: ['墨西哥城','多伦多','洛杉矶','纽约','达拉斯','亚特兰大','费城','迈阿密','墨西哥城','多伦多','洛杉矶','纽约','达拉斯','亚特兰大','费城','迈阿密'][i],
  feedsFrom: [],
}));

function makeNext(from: Slot[], prefix: string, dates: string[], times: string[], cities: string[]): Slot[] {
  return Array.from({ length: from.length / 2 }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    date: dates[i], time: times[i], city: cities[i],
    feedsFrom: [from[i * 2].id, from[i * 2 + 1].id],
  }));
}

const R16 = makeNext(R32, 'r16',
  ['7/5','7/5','7/6','7/6','7/7','7/7','7/8','7/8'],
  ['01:00','05:00','04:00','08:00','03:00','08:00','00:00','04:00'],
  ['墨西哥城','多伦多','洛杉矶','纽约','达拉斯','亚特兰大','费城','迈阿密']);

const QF = makeNext(R16, 'qf',
  ['7/10','7/11','7/12','7/12'],
  ['04:00','03:00','05:00','09:00'],
  ['墨西哥城','多伦多','洛杉矶','纽约']);

const SF = makeNext(QF, 'sf',
  ['7/15','7/16'],
  ['03:00','03:00'],
  ['达拉斯','亚特兰大']);

const FINAL: Slot[] = [{
  id: 'final', date: '7/20', time: '03:00', city: '纽约',
  feedsFrom: ['sf-1', 'sf-2'],
}];

const ALL_SLOTS = [...R32, ...R16, ...QF, ...SF, ...FINAL];
type Picks = Record<string, string>;

/* ═══════════════════════════════════
   Elo win probability (returns true if team1 wins)
   ═══════════════════════════════════ */

function eloWin(eloA: number, eloB: number): boolean {
  const pA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  return Math.random() < pA;
}

/* ═══════════════════════════════════
   Memoized Match Card
   ═══════════════════════════════════ */

interface SeedData {
  id: string; date: string; city: string;
  teams: Array<{ id: string; name: string; flag: string; winner: boolean }>;
  winner: Team | null; canClick: boolean; isFinal: boolean;
}

const MatchCard = memo(function MatchCard({
  seed, onPick,
}: {
  seed: SeedData;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const s = seed;
  const isFinal = s.isFinal;

  return (
    <Seed mobileBreakpoint={0}>
      <SeedItem
        style={{
          background: isFinal
            ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
            : s.winner ? '#f1f5f9' : '#ffffff',
          border: isFinal
            ? '2.5px solid #D4AF37'
            : s.winner ? '1px solid #cbd5e1' : '1px solid #cbd5e1',
          borderRadius: 16,
          boxShadow: isFinal
            ? '0 8px 32px rgba(212,175,55,0.25)'
            : '0 2px 8px rgba(0,0,0,0.08)',
          padding: 0,
          minWidth: 150,
          transition: 'box-shadow 0.2s, transform 0.2s',
        }}
      >
        {/* Date + City bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px 0', fontSize: 10, color: '#64748b', fontFamily: 'monospace', fontWeight: 500 }}>
          <span>{s.date}</span>
          <span>{s.city}</span>
        </div>

        {/* Teams */}
        <div style={{ padding: '6px 12px 10px' }}>
          {s.teams.map((team: any, ti: number) => (
            <div
              key={ti}
              onClick={() => {
                if (s.canClick && team.id) onPick(s.id, team.id);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 10px', marginBottom: ti === 0 ? 4 : 0,
                cursor: s.canClick && team.id ? 'pointer' : 'default',
                borderRadius: 10,
                background: team.winner
                  ? 'linear-gradient(135deg, #fde68a, #fef3c7)'
                  : s.canClick && team.id ? '#f1f5f9' : 'transparent',
                fontWeight: team.winner ? 700 : 500,
                color: team.winner ? '#92400e' : team.name === '待定' ? '#94a3b8' : '#0f172a',
                transition: 'all 0.15s',
                border: team.winner ? '1.5px solid #D4AF37' : '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (s.canClick && team.id && !team.winner)
                  (e.currentTarget as HTMLElement).style.background = '#fef3c7';
              }}
              onMouseLeave={e => {
                if (!team.winner)
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 22, width: 30, textAlign: 'center', flexShrink: 0 }}>
                {team.flag}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SeedTeam style={{ fontSize: 13, fontWeight: team.winner ? 700 : 600, color: team.winner ? '#92400e' : team.name === '待定' ? '#94a3b8' : '#0f172a' }}>
                  {team.name}
                </SeedTeam>
              </div>
              {team.winner && <span style={{ fontSize: 16, color: '#D4AF37' }}>✓</span>}
              {s.canClick && !s.winner && team.id && !team.winner && (
                <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>选</span>
              )}
            </div>
          ))}
        </div>

        {/* Winner indicator */}
        {s.winner && (
          <div style={{ textAlign: 'center', padding: '0 12px 10px', fontSize: 11, fontWeight: 700, color: '#92400e' }}>
            {s.winner.flag} {s.winner.name} 晋级
          </div>
        )}
      </SeedItem>
      <SeedTime style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, textAlign: 'center' }}>
        {s.date}
      </SeedTime>
    </Seed>
  );
});

/* ═══════════════════════════════════
   Main Component
   ═══════════════════════════════════ */

export default function BracketView() {
  const [picks, setPicks] = useState<Picks>({});
  const [started, setStarted] = useState(false);
  const [sharing, setSharing] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const teams = getAllTeams();

  const championId = picks['final'] || null;
  const champion = championId ? teams.find(t => t.id === championId) : null;

  // Pick a winner — only this one slot updates
  const pick = useCallback((slotId: string, teamId: string) => {
    setPicks(prev => ({ ...prev, [slotId]: teamId }));
    setStarted(true);
  }, []);

  // What team won a slot (from picks only, no auto-advance)
  function winnerOf(slotId: string): Team | null {
    const wid = picks[slotId];
    return wid ? teams.find(t => t.id === wid) || null : null;
  }

  // AI predict — uses Elo probability with randomness
  function quickPredict() {
    const p: Picks = {};
    const top32 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 32);

    // R32: pair top32 and use Elo probability
    R32.forEach((s, i) => {
      const t1 = top32[i * 2], t2 = top32[i * 2 + 1];
      if (t1 && t2) p[s.id] = eloWin(t1.elo, t2.elo) ? t1.id : t2.id;
    });

    // Cascade with randomness
    function cascade(slots: Slot[]) {
      slots.forEach(s => {
        const t1 = teams.find(t => t.id === p[s.feedsFrom[0]]);
        const t2 = teams.find(t => t.id === p[s.feedsFrom[1]]);
        if (t1 && t2) p[s.id] = eloWin(t1.elo, t2.elo) ? t1.id : t2.id;
      });
    }
    cascade(R16);
    cascade(QF);
    cascade(SF);
    cascade(FINAL);

    setPicks(p);
    setStarted(true);
  }

  function reset() { setPicks({}); setStarted(false); }

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

  // Build rounds data
  const top32 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 32);

  function buildSeedFn(slot: Slot, isFinal: boolean, roundSlots: Slot[]): SeedData {
    const w = winnerOf(slot.id);
    let t1: Team | null = null;
    let t2: Team | null = null;

    if (slot.feedsFrom.length === 2) {
      t1 = winnerOf(slot.feedsFrom[0]);
      t2 = winnerOf(slot.feedsFrom[1]);
    } else {
      const idx = roundSlots.indexOf(slot);
      t1 = top32[idx * 2] || null;
      t2 = top32[idx * 2 + 1] || null;
    }

    const canClick = !w && t1 !== null && t2 !== null;

    return {
      id: slot.id, date: `${slot.date} ${slot.time}`, city: slot.city,
      teams: [
        { id: t1?.id || '', name: t1?.name || '待定', flag: t1?.flag || '?', winner: !!w && w.id === t1?.id },
        { id: t2?.id || '', name: t2?.name || '待定', flag: t2?.flag || '?', winner: !!w && w.id === t2?.id },
      ],
      winner: w, canClick, isFinal,
    };
  }

  const rounds = [
    { title: '32 强', seeds: R32.map(s => buildSeedFn(s, false, R32)) },
    { title: '16 强', seeds: R16.map(s => buildSeedFn(s, false, R16)) },
    { title: '¼ 决赛', seeds: QF.map(s => buildSeedFn(s, false, QF)) },
    { title: '半决赛', seeds: SF.map(s => buildSeedFn(s, false, SF)) },
    { title: '决赛', seeds: FINAL.map(s => buildSeedFn(s, true, FINAL)) },
  ];

  const filled = ALL_SLOTS.filter(s => picks[s.id]).length;
  const progress = Math.round((filled / ALL_SLOTS.length) * 100);

  return (
    <div className="flex flex-col items-center">
      {/* ═══════ Header ═══════ */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">🏆 淘汰赛预测器</h1>
        <p className="text-gray-500 text-sm">逐场选择晋级球队 · 自动生成冠军预测</p>
      </div>

      {/* ═══════ Controls ═══════ */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <button onClick={quickPredict} className="px-6 py-2.5 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy-light transition-colors shadow-sm">
          ⚡ AI 预测
        </button>
        <button onClick={reset} className="px-6 py-2.5 bg-white text-gray-700 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
          🔄 重置
        </button>
        <div className="hidden sm:flex items-center gap-2 ml-4">
          {rounds.map(r => {
            const c = r.seeds.filter((s) => (s as SeedData).winner).length;
            return (
              <span key={r.title} className={`text-xs whitespace-nowrap ${c === r.seeds.length ? 'text-qualify font-semibold' : 'text-gray-500'}`}>
                {r.title} {c}/{r.seeds.length}
              </span>
            );
          })}
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-600 tabular-nums">{progress}%</span>
        </div>
      </div>

      {/* ═══════ Champion Banner ═══════ */}
      {champion ? (
        <div ref={bannerRef} className="mb-8 rounded-2xl p-6 text-center shadow-lg max-w-md" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #D4AF37' }}>
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
      ) : started ? (
        <div className="mb-8 p-4 text-center text-gray-400 text-sm">
          🏆 继续选择，看看谁会是你的冠军...
        </div>
      ) : null}

      {/* ═══════ Bracket ═══════ */}
      <div className="overflow-x-auto scrollbar-hide pb-4 w-full flex justify-center">
        <div className="inline-block">
          <Bracket
            rounds={rounds as any}
            roundTitleComponent={(title: string, _idx: number) => (
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <span style={{
                  fontSize: 14, fontWeight: 800, color: '#0f172a',
                  letterSpacing: '0.05em',
                  padding: '4px 14px',
                  borderRadius: 20,
                  background: title === '决赛' ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : '#e2e8f0',
                  border: title === '决赛' ? '1px solid #D4AF37' : 'none',
                }}>
                  {title === '决赛' ? '🏆 ' : ''}{title}
                </span>
              </div>
            )}
            renderSeedComponent={({ seed }: any) => (
              <MatchCard seed={seed as SeedData} onPick={pick} />
            )}
          />
        </div>
      </div>

      {/* ═══════ Empty state ═══════ */}
      {!started && (
        <div className="text-center mt-6 p-8 rounded-2xl bg-white border border-gray-200 shadow-sm max-w-md">
          <div className="text-4xl mb-3">👆</div>
          <p className="text-gray-700 font-semibold">点击任意一场比赛中的球队开始预测</p>
          <p className="text-gray-400 text-sm mt-1">选择晋级球队后对应位置自动更新</p>
          <p className="text-gray-400 text-sm">或点击「⚡ AI 预测」一键生成</p>
        </div>
      )}
    </div>
  );
}
