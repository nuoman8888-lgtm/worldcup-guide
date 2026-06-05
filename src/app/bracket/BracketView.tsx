'use client';

import { useState, useRef, useCallback } from 'react';
import { getAllTeams } from '@/data/teams';
import type { Team } from '@/data/teams';

/* ═══════════════════════════════════
   Bracket rounds: R16 → QF → SF → F
   Each match slot has a position for vertical alignment
   ═══════════════════════════════════ */

interface Slot {
  id: string;
  round: 'r16' | 'qf' | 'sf' | 'final';
  pos: number;  // vertical center position (px)
  feedsFrom: [string, string]; // slot IDs
  label: string; // match label
  date: string;
  time: string;
  city: string;
}

type Picks = Record<string, string>;

// R16 slots (8 matches, pos 40 to 600, step 80)
const R16: Slot[] = Array.from({ length: 8 }, (_, i) => ({
  id: `r16-${i + 1}`,
  round: 'r16' as const,
  pos: 40 + i * 80,
  feedsFrom: ['', ''],
  label: `16强 ${i + 1}`,
  date: ['7/5','7/5','7/6','7/6','7/7','7/7','7/8','7/8'][i],
  time: ['01:00','05:00','04:00','08:00','03:00','08:00','00:00','04:00'][i],
  city: ['墨西哥城','多伦多','洛杉矶','纽约','达拉斯','亚特兰大','费城','迈阿密'][i],
}));

// QF (4 matches, at centers of pairs)
function makeQF(r16: Slot[]): Slot[] {
  return [
    { id: 'qf-1', round: 'qf', pos: (r16[0].pos + r16[1].pos) / 2, feedsFrom: ['r16-1','r16-2'], label: '¼决赛 1', date: '7/10', time: '04:00', city: '墨西哥城' },
    { id: 'qf-2', round: 'qf', pos: (r16[2].pos + r16[3].pos) / 2, feedsFrom: ['r16-3','r16-4'], label: '¼决赛 2', date: '7/11', time: '03:00', city: '多伦多' },
    { id: 'qf-3', round: 'qf', pos: (r16[4].pos + r16[5].pos) / 2, feedsFrom: ['r16-5','r16-6'], label: '¼决赛 3', date: '7/12', time: '05:00', city: '洛杉矶' },
    { id: 'qf-4', round: 'qf', pos: (r16[6].pos + r16[7].pos) / 2, feedsFrom: ['r16-7','r16-8'], label: '¼决赛 4', date: '7/12', time: '09:00', city: '纽约' },
  ];
}

// SF (2 matches)
function makeSF(qf: Slot[]): Slot[] {
  return [
    { id: 'sf-1', round: 'sf', pos: (qf[0].pos + qf[1].pos) / 2, feedsFrom: ['qf-1','qf-2'], label: '半决赛 1', date: '7/15', time: '03:00', city: '达拉斯' },
    { id: 'sf-2', round: 'sf', pos: (qf[2].pos + qf[3].pos) / 2, feedsFrom: ['qf-3','qf-4'], label: '半决赛 2', date: '7/16', time: '03:00', city: '亚特兰大' },
  ];
}

// Final
function makeFinal(sf: Slot[]): Slot[] {
  return [
    { id: 'final', round: 'final', pos: (sf[0].pos + sf[1].pos) / 2, feedsFrom: ['sf-1','sf-2'], label: '决赛', date: '7/20', time: '03:00', city: '纽约' },
  ];
}

const allSlots = (() => {
  const r16 = R16;
  const qf = makeQF(r16);
  const sf = makeSF(qf);
  const final = makeFinal(sf);
  return { r16, qf, sf, final };
})();

const ROUNDS: { key: keyof typeof allSlots; title: string; width: number }[] = [
  { key: 'r16', title: '16强', width: 140 },
  { key: 'qf', title: '¼决赛', width: 140 },
  { key: 'sf', title: '半决赛', width: 140 },
  { key: 'final', title: '🏆 决赛', width: 160 },
];

const TOTAL_HEIGHT = 680; // enough for all slots

export default function BracketView() {
  const [picks, setPicks] = useState<Picks>({});
  const [selectingSlot, setSelectingSlot] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const teams = getAllTeams();

  // Get winner for a slot
  function getWinner(slotId: string): string | null {
    if (picks[slotId]) return picks[slotId];
    const slot = [...allSlots.r16, ...allSlots.qf, ...allSlots.sf, ...allSlots.final].find(s => s.id === slotId);
    if (!slot || !slot.feedsFrom[0]) return null;
    const w1 = getWinner(slot.feedsFrom[0]);
    const w2 = getWinner(slot.feedsFrom[1]);
    // Auto-advance: if both feeders have winners, pick by ELO
    if (w1 && w2 && !picks[slotId]) {
      const t1 = teams.find(t => t.id === w1);
      const t2 = teams.find(t => t.id === w2);
      if (t1 && t2) {
        const winner = t1.elo > t2.elo ? w1 : w2;
        setPicks(prev => ({ ...prev, [slotId]: winner }));
        return winner;
      }
    }
    return null;
  }

  function getWinnerTeam(slotId: string): Team | null {
    const wid = getWinner(slotId);
    return wid ? teams.find(t => t.id === wid) || null : null;
  }

  function getTeamById(id: string): Team | null {
    if (!id) return null;
    // Check if it's a pick first
    if (picks[id]) return teams.find(t => t.id === picks[id]) || null;
    const winner = getWinner(id);
    if (winner) return teams.find(t => t.id === winner) || null;
    return null;
  }

  function handlePick(teamId: string) {
    if (!selectingSlot) return;
    setPicks(prev => ({ ...prev, [selectingSlot]: teamId }));
    setSelectingSlot(null);
  }

  const champion = getWinnerTeam('final');
  const hasChampion = champion != null;

  const handleShare = useCallback(async () => {
    if (!bannerRef.current) return;
    setSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(bannerRef.current, {
        backgroundColor: '#0F1B2D',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'my-worldcup-2026-prediction.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch { /* ignore */ }
    setSharing(false);
  }, []);

  // Compute connector line positions
  function getConnectors(fromSlot: Slot, toSlot: Slot) {
    const x1 = 0;
    const x2 = 0;
    const y1 = fromSlot.pos;
    const y2 = toSlot.pos;
    const midY = (y1 + y2) / 2;
    return { y1, y2, midY };
  }

  return (
    <div className="relative">
      {/* Team picker modal */}
      {selectingSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectingSlot(null)} />
          <div className="relative bg-navy-light border border-navy-600 rounded-2xl shadow-2xl max-w-lg w-full max-h-[70vh] overflow-y-auto p-5">
            <h3 className="font-bold text-white text-center mb-3">选择胜者</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {teams.map(t => (
                <button
                  key={t.id}
                  onClick={() => handlePick(t.id)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-navy-600 transition-all border border-navy-600"
                >
                  <span className="text-2xl">{t.flag}</span>
                  <span className="text-[10px] font-medium text-gray-300">{t.name}</span>
                  <span className="text-[9px] text-gray-500">#{t.fifaRank}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Champion banner */}
      {hasChampion && champion && (
        <div ref={bannerRef} className="mb-8 p-8 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
          <div className="text-gold text-sm font-bold mb-2 tracking-widest">FIFA WORLD CUP 2026</div>
          <div className="text-4xl mb-4">🏆</div>
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className="text-6xl drop-shadow-lg">{champion.flag}</span>
            <div className="text-left">
              <div className="text-4xl font-extrabold text-gold">{champion.name}</div>
              <div className="text-xl text-white/60">{champion.nameEn}</div>
              <div className="text-sm text-gray-400 mt-1">FIFA #{champion.fifaRank} · ELO {champion.elo}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">我的世界杯预测</div>
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => setPicks({})} className="px-5 py-2.5 bg-navy-600 text-white rounded-lg text-sm font-medium hover:bg-navy-600/70 transition-colors">
              🔄 重新预测
            </button>
            <button onClick={handleShare} disabled={sharing} className="px-6 py-2.5 bg-gold text-navy rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50">
              {sharing ? '生成中...' : '📸 保存图片分享'}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ Bracket tree ═══════════ */}
      <div className="overflow-x-auto scrollbar-hide pb-6">
        <div style={{ minWidth: 800, height: TOTAL_HEIGHT + 40 }} className="relative mx-auto max-w-4xl">
          {ROUNDS.map((round, ri) => {
            const slots = allSlots[round.key];
            const nextRound = ri < ROUNDS.length - 1 ? ROUNDS[ri + 1] : null;
            const nextSlots = nextRound ? allSlots[nextRound.key] : [];

            // Calculate x position
            const prevWidths = ROUNDS.slice(0, ri).reduce((s, r) => s + r.width + 60, 0);
            const x = prevWidths;

            return (
              <div key={round.key} style={{ position: 'absolute', left: x, top: 0, width: round.width }}>
                {/* Round title */}
                <div className="text-center mb-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{round.title}</div>
                </div>

                {/* Slots */}
                <div style={{ position: 'relative', height: TOTAL_HEIGHT }}>
                  {slots.map(slot => {
                    const winner = getWinnerTeam(slot.id);
                    const feed1 = slot.feedsFrom[0] ? getTeamById(slot.feedsFrom[0]) : null;
                    const feed2 = slot.feedsFrom[1] ? getTeamById(slot.feedsFrom[1]) : null;
                    const isFinal = slot.round === 'final';
                    const hasFeeds = slot.feedsFrom[0] !== '';

                    return (
                      <div
                        key={slot.id}
                        style={{ position: 'absolute', top: slot.pos - 30, width: '100%' }}
                      >
                        <MatchCard
                          slot={slot}
                          team1={feed1}
                          team2={feed2}
                          winner={winner}
                          isFinal={isFinal}
                          hasFeeds={hasFeeds}
                          onClick={() => {
                            if (!winner && hasFeeds && feed1 && feed2) {
                              setSelectingSlot(slot.id);
                            }
                          }}
                        />

                        {/* Connector lines to next round */}
                        {nextRound && nextSlots.length > 0 && (
                          <BracketConnector
                            fromPos={slot.pos}
                            toSlots={nextSlots.filter(ns => ns.feedsFrom.includes(slot.id))}
                            fromWidth={round.width}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help text */}
      {!hasChampion && (
        <div className="text-center mt-8 p-8 rounded-2xl border border-navy-600" style={{ background: 'rgba(26,39,64,0.5)' }}>
          <div className="text-3xl mb-3">👆</div>
          <p className="text-white font-medium">点击每场比赛选择你认为会晋级的球队</p>
          <p className="text-gray-400 text-sm mt-1">胜者自动进入下一轮，一路选择直到冠军</p>
          <button
            onClick={() => {
              // Quick-pick: ELO-based
              const newPicks: Picks = {};
              // Fill R16 with top 32 ELO teams
              const top32 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 32);
              allSlots.r16.forEach((slot, i) => {
                const t1 = top32[i * 2];
                const t2 = top32[i * 2 + 1];
                if (t1 && t2) newPicks[slot.id] = t1.elo > t2.elo ? t1.id : t2.id;
              });
              // Auto rest via getWinner cascade
              setPicks(newPicks);
              // Trigger cascade
              setTimeout(() => {
                const cascade = (slots: Slot[]) => {
                  slots.forEach(s => {
                    if (s.feedsFrom[0] && !newPicks[s.id]) {
                      const w1 = newPicks[s.feedsFrom[0]];
                      const w2 = newPicks[s.feedsFrom[1]];
                      if (w1 && w2) {
                        const t1 = teams.find(t => t.id === w1);
                        const t2 = teams.find(t => t.id === w2);
                        if (t1 && t2) {
                          newPicks[s.id] = t1.elo > t2.elo ? t1.id : t2.id;
                        }
                      }
                    }
                  });
                };
                cascade(allSlots.qf);
                cascade(allSlots.sf);
                cascade(allSlots.final);
                setPicks({ ...newPicks });
              }, 100);
            }}
            className="mt-5 px-6 py-3 bg-gold text-navy rounded-xl text-sm font-bold hover:bg-yellow-400 transition-colors"
          >
            ⚡ 快速预测（基于ELO）
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   Match Card — single bracket slot
   ═══════════════════════════════════ */

function MatchCard({
  slot, team1, team2, winner, isFinal, hasFeeds, onClick,
}: {
  slot: Slot;
  team1: Team | null;
  team2: Team | null;
  winner: Team | null;
  isFinal: boolean;
  hasFeeds: boolean;
  onClick: () => void;
}) {
  const clickable = hasFeeds && !winner && team1 && team2;

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-lg border px-3 py-2.5 text-center transition-all
        ${isFinal
          ? 'border-gold bg-navy-light ring-1 ring-gold/50 shadow-lg shadow-gold/10'
          : winner
            ? 'border-navy-600 bg-navy-light'
            : clickable
              ? 'border-navy-600 bg-navy-light cursor-pointer hover:border-navy-400 hover:shadow-md'
              : 'border-navy-700 bg-navy-light/50'
        }
      `}
      style={{ minHeight: 60 }}
    >
      {/* Trophy for final */}
      {isFinal && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl drop-shadow-lg">🏆</div>
      )}

      {/* Date */}
      <div className="text-[10px] text-gray-500 font-mono mb-1.5">
        {slot.date} {slot.time}
      </div>

      {/* Teams */}
      <div className="flex items-center gap-2">
        <TeamLine team={team1} isWinner={winner ? team1?.id === winner.id : false} />
        <span className="text-[10px] text-gray-600 font-bold shrink-0">VS</span>
        <TeamLine team={team2} isWinner={winner ? team2?.id === winner.id : false} />
      </div>

      {/* Winner highlight */}
      {winner && (
        <div className="mt-1.5 text-[10px] font-bold text-gold">
          {winner.flag} {winner.name} 晋级
        </div>
      )}

      {/* City */}
      <div className="text-[9px] text-gray-600 mt-1">{slot.city}</div>
    </div>
  );
}

function TeamLine({ team, isWinner }: { team: Team | null; isWinner: boolean }) {
  if (!team) {
    return (
      <div className="flex-1 text-center">
        <div className="text-lg text-gray-700">?</div>
        <div className="text-[9px] text-gray-600">待定</div>
      </div>
    );
  }

  return (
    <div className={`flex-1 text-center ${isWinner ? '' : ''}`}>
      <div className={`text-xl ${isWinner ? 'drop-shadow-md' : ''}`}>{team.flag}</div>
      <div className={`text-[10px] font-semibold truncate ${isWinner ? 'text-gold' : 'text-gray-300'}`}>
        {team.name}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   Bracket Connector Lines
   ═══════════════════════════════════ */

function BracketConnector({
  fromPos, toSlots, fromWidth,
}: {
  fromPos: number;
  toSlots: Slot[];
  fromWidth: number;
}) {
  if (toSlots.length === 0) return null;

  const toSlot = toSlots[0];
  const y1 = fromPos;
  const y2 = toSlot.pos;
  const midY = (y1 + y2) / 2;
  const gap = 30; // half of the gap between columns

  const x1 = fromWidth;
  const x2 = x1 + gap;

  if (y1 === y2) {
    // Straight line
    return (
      <svg style={{ position: 'absolute', left: fromWidth, top: 0, width: gap + 10, height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
        <line x1={0} y1={y1} x2={gap} y2={y2} stroke="#334155" strokeWidth={1} />
      </svg>
    );
  }

  // Elbow connector: horizontal → vertical → horizontal
  return (
    <svg style={{ position: 'absolute', left: fromWidth, top: 0, width: gap + 10, height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
      <path
        d={`M 0 ${y1} L ${gap / 2} ${y1} L ${gap / 2} ${y2} L ${gap} ${y2}`}
        fill="none"
        stroke="#334155"
        strokeWidth={1}
      />
      {/* Dot at each end */}
      <circle cx={0} cy={y1} r={2} fill="#475569" />
      <circle cx={gap} cy={y2} r={2} fill="#475569" />
    </svg>
  );
}
