'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { getAllTeams } from '@/data/teams';
import type { Team } from '@/data/teams';

/* ═══════════════════════════════════
   Bracket data: R16 → QF → SF → Final
   ═══════════════════════════════════ */

interface Slot {
  id: string;
  round: 'r16' | 'qf' | 'sf' | 'final';
  matchIndex: number; // 0-based within round
  feedsFrom: string[]; // feeder slot IDs (empty for R16)
  date: string;
  time: string;
  city: string;
}

const R16_MATCHES: Slot[] = [
  { id:'r16-1', round:'r16', matchIndex:0, feedsFrom:[], date:'7/5', time:'01:00', city:'墨西哥城' },
  { id:'r16-2', round:'r16', matchIndex:1, feedsFrom:[], date:'7/5', time:'05:00', city:'多伦多' },
  { id:'r16-3', round:'r16', matchIndex:2, feedsFrom:[], date:'7/6', time:'04:00', city:'洛杉矶' },
  { id:'r16-4', round:'r16', matchIndex:3, feedsFrom:[], date:'7/6', time:'08:00', city:'纽约' },
  { id:'r16-5', round:'r16', matchIndex:4, feedsFrom:[], date:'7/7', time:'03:00', city:'达拉斯' },
  { id:'r16-6', round:'r16', matchIndex:5, feedsFrom:[], date:'7/7', time:'08:00', city:'亚特兰大' },
  { id:'r16-7', round:'r16', matchIndex:6, feedsFrom:[], date:'7/8', time:'00:00', city:'费城' },
  { id:'r16-8', round:'r16', matchIndex:7, feedsFrom:[], date:'7/8', time:'04:00', city:'迈阿密' },
];

const QF_MATCHES: Slot[] = [
  { id:'qf-1', round:'qf', matchIndex:0, feedsFrom:['r16-1','r16-2'], date:'7/10', time:'04:00', city:'墨西哥城' },
  { id:'qf-2', round:'qf', matchIndex:1, feedsFrom:['r16-3','r16-4'], date:'7/11', time:'03:00', city:'多伦多' },
  { id:'qf-3', round:'qf', matchIndex:2, feedsFrom:['r16-5','r16-6'], date:'7/12', time:'05:00', city:'洛杉矶' },
  { id:'qf-4', round:'qf', matchIndex:3, feedsFrom:['r16-7','r16-8'], date:'7/12', time:'09:00', city:'纽约' },
];

const SF_MATCHES: Slot[] = [
  { id:'sf-1', round:'sf', matchIndex:0, feedsFrom:['qf-1','qf-2'], date:'7/15', time:'03:00', city:'达拉斯' },
  { id:'sf-2', round:'sf', matchIndex:1, feedsFrom:['qf-3','qf-4'], date:'7/16', time:'03:00', city:'亚特兰大' },
];

const FINAL_MATCH: Slot[] = [
  { id:'final', round:'final', matchIndex:0, feedsFrom:['sf-1','sf-2'], date:'7/20', time:'03:00', city:'纽约' },
];

const ROUNDS: { key: string; title: string; slots: Slot[] }[] = [
  { key: 'r16', title: '16强', slots: R16_MATCHES },
  { key: 'qf', title: '¼决赛', slots: QF_MATCHES },
  { key: 'sf', title: '半决赛', slots: SF_MATCHES },
  { key: 'final', title: '决赛', slots: FINAL_MATCH },
];

type Picks = Record<string, string>;

export default function BracketView() {
  const [picks, setPicks] = useState<Picks>({});
  const [selectingSlot, setSelectingSlot] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [started, setStarted] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const teams = getAllTeams();

  // Reset on mount — never auto-predict
  useEffect(() => { setPicks({}); setStarted(false); }, []);

  // Get winner for a slot (from picks or auto-advance)
  const getWinner = useCallback((slotId: string): string | null => {
    if (picks[slotId]) return picks[slotId];
    // R16 slots: user must pick
    const allSlots = [...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, ...FINAL_MATCH];
    const slot = allSlots.find(s => s.id === slotId);
    if (!slot || slot.feedsFrom.length === 0) return null;
    // For later rounds: if both feeders picked, return higher ELO (but don't save — user should pick)
    return null; // Only explicit picks count
  }, [picks]);

  const getWinnerTeam = useCallback((slotId: string): Team | null => {
    const wid = getWinner(slotId);
    return wid ? teams.find(t => t.id === wid) || null : null;
  }, [getWinner, teams]);

  function handlePick(teamId: string) {
    if (!selectingSlot) return;
    setPicks(prev => ({ ...prev, [selectingSlot]: teamId }));
    setSelectingSlot(null);
    setStarted(true);
  }

  // Quick ELO predict
  function quickPredict() {
    const newPicks: Picks = {};
    const top32 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 16);
    // Assign top 16 ELO teams to R16 (pair them)
    R16_MATCHES.forEach((slot, i) => {
      const t1 = top32[i * 2];
      const t2 = top32[i * 2 + 1];
      if (t1 && t2) newPicks[slot.id] = t1.elo > t2.elo ? t1.id : t2.id;
    });
    // Cascade through rounds
    QF_MATCHES.forEach(s => {
      const w1 = newPicks[s.feedsFrom[0]];
      const w2 = newPicks[s.feedsFrom[1]];
      if (w1 && w2) {
        const t1 = teams.find(t => t.id === w1)!;
        const t2 = teams.find(t => t.id === w2)!;
        newPicks[s.id] = t1.elo > t2.elo ? t1.id : t2.id;
      }
    });
    SF_MATCHES.forEach(s => {
      const w1 = newPicks[s.feedsFrom[0]];
      const w2 = newPicks[s.feedsFrom[1]];
      if (w1 && w2) {
        const t1 = teams.find(t => t.id === w1)!;
        const t2 = teams.find(t => t.id === w2)!;
        newPicks[s.id] = t1.elo > t2.elo ? t1.id : t2.id;
      }
    });
    FINAL_MATCH.forEach(s => {
      const w1 = newPicks[s.feedsFrom[0]];
      const w2 = newPicks[s.feedsFrom[1]];
      if (w1 && w2) {
        const t1 = teams.find(t => t.id === w1)!;
        const t2 = teams.find(t => t.id === w2)!;
        newPicks[s.id] = t1.elo > t2.elo ? t1.id : t2.id;
      }
    });
    setPicks(newPicks);
    setStarted(true);
  }

  function resetAll() {
    setPicks({});
    setStarted(false);
  }

  // Progress
  const allSlots = [...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, ...FINAL_MATCH];
  const totalSlots = allSlots.length;
  const filledSlots = allSlots.filter(s => picks[s.id]).length;
  const progress = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

  const champion = getWinnerTeam('final');

  // Share
  const handleShare = useCallback(async () => {
    if (!bannerRef.current) return;
    setSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(bannerRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'worldcup-2026-prediction.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch { /* ignore */ }
    setSharing(false);
  }, []);

  // Compute team for a feeder slot
  function getTeamForSlot(slotId: string): Team | null {
    if (!slotId) return null;
    // For R16, we show the ELO-based seed since there's no real data yet
    const topTeams = [...teams].sort((a, b) => b.elo - a.elo);
    const slot = allSlots.find(s => s.id === slotId);
    if (!slot) return null;
    if (slot.round === 'r16') {
      const picksSoFar = R16_MATCHES.filter(s => s.id < slotId).length * 2;
      return topTeams[picksSoFar + slot.matchIndex * 2] || null;
    }
    // For later rounds, show picked winner
    const winner = getWinner(slotId);
    return winner ? teams.find(t => t.id === winner) || null : null;
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* ═══════ Top Controls ═══════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={quickPredict}
            className="px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy-light transition-colors shadow-sm"
          >
            ⚡ 快速预测（ELO）
          </button>
          <button
            onClick={resetAll}
            className="px-5 py-2.5 bg-white text-gray-700 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            🔄 重置预测
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
            {ROUNDS.map(r => {
              const count = r.slots.filter(s => picks[s.id]).length;
              return (
                <span key={r.key} className={count === r.slots.length ? 'text-qualify font-semibold' : ''}>
                  {r.title} {count}/{r.slots.length}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-600 tabular-nums">{progress}%</span>
          </div>
        </div>
      </div>

      {/* ═══════ Champion Banner ═══════ */}
      {champion && (
        <div
          ref={bannerRef}
          className="mb-8 rounded-2xl p-6 text-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%)', border: '2px solid #C8A951' }}
        >
          <div className="text-xs text-navy font-bold mb-1 tracking-widest">FIFA WORLD CUP 2026</div>
          <div className="text-3xl mb-2">🏆</div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-5xl">{champion.flag}</span>
            <div>
              <div className="text-2xl font-extrabold text-navy">{champion.name}</div>
              <div className="text-sm text-navy/60">{champion.nameEn}</div>
            </div>
          </div>
          <div className="text-xs text-navy/50">我的世界杯预测冠军</div>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={resetAll} className="px-4 py-2 bg-white text-navy rounded-lg text-sm font-medium border border-gold hover:bg-yellow-50 transition-colors">
              🔄 重新预测
            </button>
            <button onClick={handleShare} disabled={sharing} className="px-5 py-2 bg-navy text-white rounded-lg text-sm font-bold hover:bg-navy-light transition-colors disabled:opacity-50">
              {sharing ? '生成中...' : '📸 保存图片分享'}
            </button>
          </div>
        </div>
      )}

      {/* ═══════ Team Picker Modal ═══════ */}
      {selectingSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectingSlot(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[70vh] overflow-y-auto p-5 border border-gray-200">
            <h3 className="font-bold text-gray-900 text-center mb-1">选择晋级球队</h3>
            <p className="text-xs text-gray-400 text-center mb-4">点击球队选择胜者</p>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {teams.map(t => (
                <button
                  key={t.id}
                  onClick={() => handlePick(t.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gold-50 hover:border-gold border border-gray-100 transition-all"
                >
                  <span className="text-3xl">{t.flag}</span>
                  <span className="text-[11px] font-semibold text-gray-700">{t.name}</span>
                  <span className="text-[9px] text-gray-400">#{t.fifaRank} ELO{t.elo}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Bracket Tree ═══════ */}
      <div className="overflow-x-auto scrollbar-hide pb-8">
        <div className="flex justify-center gap-0 min-w-[800px]">
          {ROUNDS.map((round, ri) => {
            const isLast = ri === ROUNDS.length - 1;
            const nextRound = !isLast ? ROUNDS[ri + 1] : null;

            return (
              <div key={round.key} className="flex flex-col items-center" style={{ minWidth: ri === 3 ? 170 : 140 }}>
                {/* Round header */}
                <div className="mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                    ri === 3 ? 'bg-gold text-navy' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ri === 3 ? '🏆 ' : ''}{round.title}
                  </span>
                </div>

                {/* Match slots with connector lines */}
                <div className="flex flex-col items-center" style={{ gap: round.slots.length <= 2 ? '48px' : round.slots.length <= 4 ? '24px' : '8px' }}>
                  {round.slots.map((slot, si) => {
                    const winner = picks[slot.id] ? teams.find(t => t.id === picks[slot.id]) : null;
                    const isFinal = slot.round === 'final';
                    const hasFeeders = slot.feedsFrom.length > 0;
                    const feeder1 = hasFeeders && slot.feedsFrom[0] ? (picks[slot.feedsFrom[0]] ? teams.find(t => t.id === picks[slot.feedsFrom[0]]) : null) : null;
                    const feeder2 = hasFeeders && slot.feedsFrom[1] ? (picks[slot.feedsFrom[1]] ? teams.find(t => t.id === picks[slot.feedsFrom[1]]) : null) : null;

                    // For R16: show ELO-based seeded teams since no picks yet
                    let t1 = feeder1;
                    let t2 = feeder2;
                    if (slot.round === 'r16') {
                      const top16 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 16);
                      t1 = top16[si * 2] || null;
                      t2 = top16[si * 2 + 1] || null;
                    }

                    const canClick = t1 && t2 && !winner && (slot.round === 'r16' || (feeder1 && feeder2));

                    return (
                      <div key={slot.id} className="flex items-center">
                        {/* Connector from previous round */}
                        {!isLast && nextRound && (
                          <ConnectorLines
                            matchIndex={si}
                            matchCount={round.slots.length}
                            nextMatchCount={nextRound.slots.length}
                          />
                        )}

                        {/* Match card */}
                        <button
                          onClick={() => canClick && setSelectingSlot(slot.id)}
                          disabled={!canClick}
                          className={`
                            relative rounded-xl border px-3 py-2.5 text-center transition-all w-[128px]
                            ${isFinal
                              ? 'border-gold bg-gradient-to-b from-yellow-50 to-white shadow-md shadow-gold/20'
                              : winner
                                ? 'border-gray-200 bg-white shadow-sm'
                                : canClick
                                  ? 'border-gray-200 bg-white hover:border-navy-400 hover:shadow-md cursor-pointer'
                                  : 'border-gray-100 bg-gray-50'
                            }
                          `}
                          style={{ minHeight: isFinal ? 80 : 64 }}
                        >
                          {isFinal && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">🏆</div>}

                          {/* Time */}
                          <div className="text-[10px] text-gray-400 font-mono mb-1.5">{slot.date} {slot.time}</div>

                          {/* Teams */}
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 text-center min-w-0">
                              {t1 ? (
                                <>
                                  <div className="text-lg">{t1.flag}</div>
                                  <div className={`text-[10px] font-semibold truncate ${winner && t1.id === winner.id ? 'text-gold-dark' : 'text-gray-700'}`}>
                                    {t1.name}
                                  </div>
                                </>
                              ) : (
                                <div className="text-gray-300 text-lg">?</div>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-300 font-bold shrink-0">VS</span>
                            <div className="flex-1 text-center min-w-0">
                              {t2 ? (
                                <>
                                  <div className="text-lg">{t2.flag}</div>
                                  <div className={`text-[10px] font-semibold truncate ${winner && t2.id === winner.id ? 'text-gold-dark' : 'text-gray-700'}`}>
                                    {t2.name}
                                  </div>
                                </>
                              ) : (
                                <div className="text-gray-300 text-lg">?</div>
                              )}
                            </div>
                          </div>

                          {/* Winner indicator */}
                          {winner && (
                            <div className="mt-1.5 text-[10px] font-bold text-gold-dark">
                              {winner.flag} {winner.name} 晋级
                            </div>
                          )}

                          {!winner && canClick && (
                            <div className="mt-1 text-[9px] text-gray-400">点击选择 →</div>
                          )}

                          <div className="text-[8px] text-gray-400 mt-1">{slot.city}</div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════ Empty State ═══════ */}
      {!started && (
        <div className="text-center mt-4 p-8 rounded-2xl bg-white border border-gray-200 shadow-sm max-w-lg mx-auto">
          <div className="text-4xl mb-3">👆</div>
          <p className="text-gray-700 font-semibold">点击上方任意一场比赛开始预测</p>
          <p className="text-gray-400 text-sm mt-1">选择晋级球队后自动进入下一轮</p>
          <p className="text-gray-400 text-sm">或点击「⚡ 快速预测」一键生成</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   Connector Lines (CSS borders)
   ═══════════════════════════════════ */

function ConnectorLines({ matchIndex, matchCount, nextMatchCount }: {
  matchIndex: number;
  matchCount: number;
  nextMatchCount: number;
}) {
  // Draw lines connecting this match to the next round
  // Each next-round match takes 2 current-round matches
  const nextIdx = Math.floor(matchIndex / 2);
  const isUpper = matchIndex % 2 === 0;
  const totalPairs = matchCount / 2;
  const nextSpacing = matchCount / nextMatchCount; // should be 2

  // Render a connector bracket shape:
  // Upper half: ─┐
  // Lower half: ─┘
  // These connect to the center of the pair

  return (
    <div className="relative" style={{ width: 40, height: matchCount <= 2 ? 48 : 24, flexShrink: 0 }}>
      <svg width="100%" height="100%" className="overflow-visible" style={{ overflow: 'visible' }}>
        {isUpper ? (
          // Upper → goes down and right
          <path
            d={`M 0 12 L 20 12 L 20 ${matchCount <= 2 ? 48 : 36} L 40 ${matchCount <= 2 ? 48 : 36}`}
            fill="none"
            stroke="#D1D5DB"
            strokeWidth={1.5}
          />
        ) : (
          // Lower → goes up and right
          <path
            d={`M 0 12 L 20 12 L 20 ${matchCount <= 2 ? -12 : -12} L 40 ${matchCount <= 2 ? -12 : -12}`}
            fill="none"
            stroke="#D1D5DB"
            strokeWidth={1.5}
          />
        )}
      </svg>
    </div>
  );
}
