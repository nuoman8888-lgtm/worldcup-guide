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

        {/* Progress — fixed widths, no overflow */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 whitespace-nowrap">
            {ROUNDS.map(r => {
              const count = r.slots.filter(s => picks[s.id]).length;
              return (
                <span key={r.key} className={`w-[72px] text-center ${count === r.slots.length ? 'text-qualify font-semibold' : ''}`}>
                  {r.title}&nbsp;{count}/{r.slots.length}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-600 tabular-nums w-8">{progress}%</span>
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
        <BracketTree rounds={ROUNDS} picks={picks} teams={teams} onSelectSlot={setSelectingSlot} />
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
   Bracket Tree — SVG absolute positioning
   R16 = baseline height, all others vertically centered
   ═══════════════════════════════════ */

const CARD_W = 110;
const CARD_H = 60;
const FINAL_H = 78;
const R16_GAP = 4;
const QF_GAP = 14;
const SF_GAP = 38;
const COL_GAP = 52; // horizontal space between round centers (includes connector)
const HEADER_H = 28;

// Y positions for R16 cards (8 cards, centers)
const R16_STEP = CARD_H + R16_GAP; // 64
const R16_Y = Array.from({ length: 8 }, (_, i) => i * R16_STEP + CARD_H / 2);
const R16_TOTAL_H = 8 * CARD_H + 7 * R16_GAP; // 508

// Pre-compute all Y positions
function bracketLayout() {
  // R16: 8 cards, Y centers at 30, 94, 158, 222, 286, 350, 414, 478
  const r16Y = Array.from({ length: 8 }, (_, i) => i * R16_STEP + CARD_H / 2);

  // QF: 4 cards, each at center of R16 pair
  const qfStep = 2 * R16_STEP; // 128
  const qfY = Array.from({ length: 4 }, (_, i) => (r16Y[i * 2] + r16Y[i * 2 + 1]) / 2);
  const qfTotalH = 4 * CARD_H + 3 * QF_GAP;

  // SF: 2 cards, each at center of QF pair
  const sfStep = 2 * qfStep; // 256
  const sfY = Array.from({ length: 2 }, (_, i) => (qfY[i * 2] + qfY[i * 2 + 1]) / 2);
  const sfTotalH = 2 * CARD_H + 1 * SF_GAP;

  // Final: 1 card, center of SF pair
  const finalY = [(sfY[0] + sfY[1]) / 2];
  const finalTotalH = FINAL_H;

  return {
    r16: { ys: r16Y, count: 8, cardH: CARD_H, gap: R16_GAP, totalH: R16_TOTAL_H },
    qf: { ys: qfY, count: 4, cardH: CARD_H, gap: QF_GAP, totalH: qfTotalH },
    sf: { ys: sfY, count: 2, cardH: CARD_H, gap: SF_GAP, totalH: sfTotalH },
    final: { ys: finalY, count: 1, cardH: FINAL_H, gap: 0, totalH: finalTotalH },
  };
}

const LAYOUT = bracketLayout();
const BASELINE_H = R16_TOTAL_H; // all columns use this as container height

// X positions for each round (accumulated column widths + gaps)
const ROUND_X = [0, CARD_W + COL_GAP, (CARD_W + COL_GAP) * 2, (CARD_W + COL_GAP) * 3];
const TOTAL_W = ROUND_X[3] + CARD_W;

function BracketTree({ rounds, picks, teams, onSelectSlot }: {
  rounds: typeof ROUNDS;
  picks: Picks;
  teams: Team[];
  onSelectSlot: (id: string) => void;
}) {
  const layoutKeys = ['r16', 'qf', 'sf', 'final'] as const;

  return (
    <div className="relative mx-auto" style={{ width: TOTAL_W, height: BASELINE_H + HEADER_H }}>
      {/* SVG connector lines — rendered first, behind cards */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={TOTAL_W}
        height={BASELINE_H + HEADER_H}
        style={{ overflow: 'visible', zIndex: 1 }}
      >
        {/* R16 → QF connectors */}
        {LAYOUT.r16.ys.map((y, i) => {
          const pairIdx = Math.floor(i / 2);
          const targetY = LAYOUT.qf.ys[pairIdx];
          const x1 = ROUND_X[0] + CARD_W;
          const x2 = ROUND_X[1];
          const midX = (x1 + x2) / 2;
          return (
            <path
              key={`r16-qf-${i}`}
              d={`M ${x1} ${y + HEADER_H} L ${midX} ${y + HEADER_H} L ${midX} ${targetY + HEADER_H} L ${x2} ${targetY + HEADER_H}`}
              fill="none" stroke="#CBD5E1" strokeWidth={1.5}
            />
          );
        })}
        {/* QF → SF connectors */}
        {LAYOUT.qf.ys.map((y, i) => {
          const pairIdx = Math.floor(i / 2);
          const targetY = LAYOUT.sf.ys[pairIdx];
          const x1 = ROUND_X[1] + CARD_W;
          const x2 = ROUND_X[2];
          const midX = (x1 + x2) / 2;
          return (
            <path
              key={`qf-sf-${i}`}
              d={`M ${x1} ${y + HEADER_H} L ${midX} ${y + HEADER_H} L ${midX} ${targetY + HEADER_H} L ${x2} ${targetY + HEADER_H}`}
              fill="none" stroke="#CBD5E1" strokeWidth={1.5}
            />
          );
        })}
        {/* SF → Final connectors */}
        {LAYOUT.sf.ys.map((y, i) => {
          const targetY = LAYOUT.final.ys[0];
          const x1 = ROUND_X[2] + CARD_W;
          const x2 = ROUND_X[3];
          const midX = (x1 + x2) / 2;
          return (
            <path
              key={`sf-final-${i}`}
              d={`M ${x1} ${y + HEADER_H} L ${midX} ${y + HEADER_H} L ${midX} ${targetY + HEADER_H} L ${x2} ${targetY + HEADER_H}`}
              fill="none" stroke="#CBD5E1" strokeWidth={1.5}
            />
          );
        })}
        {/* Dots at R16 card right edges */}
        {LAYOUT.r16.ys.map((y, i) => (
          <circle key={`dot-r16-${i}`} cx={ROUND_X[0] + CARD_W} cy={y + HEADER_H} r={2.5} fill="#94A3B8" />
        ))}
        {/* Dots at QF card edges */}
        {LAYOUT.qf.ys.flatMap((y, i) => [
          <circle key={`dot-qf-l-${i}`} cx={ROUND_X[1]} cy={y + HEADER_H} r={2.5} fill="#94A3B8" />,
          <circle key={`dot-qf-r-${i}`} cx={ROUND_X[1] + CARD_W} cy={y + HEADER_H} r={2.5} fill="#94A3B8" />,
        ])}
        {LAYOUT.sf.ys.flatMap((y, i) => [
          <circle key={`dot-sf-l-${i}`} cx={ROUND_X[2]} cy={y + HEADER_H} r={2.5} fill="#94A3B8" />,
          <circle key={`dot-sf-r-${i}`} cx={ROUND_X[2] + CARD_W} cy={y + HEADER_H} r={2.5} fill="#94A3B8" />,
        ])}
      </svg>

      {/* Round columns */}
      {layoutKeys.map((key, ri) => {
        const layout = LAYOUT[key];
        const round = rounds[ri];
        const isFinal = key === 'final';
        const cardH = layout.cardH;
        const x = ROUND_X[ri];
        // Vertical centering: shorter columns are centered within BASELINE_H
        const offsetY = HEADER_H + (BASELINE_H - layout.totalH) / 2;

        return (
          <div key={key} className="absolute" style={{ left: x, top: 0, width: CARD_W }}>
            {/* Round title */}
            <div className="flex justify-center" style={{ height: HEADER_H, alignItems: 'flex-end', paddingBottom: 4 }}>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isFinal ? 'bg-gold text-navy' : 'bg-gray-100 text-gray-600'
              }`}>
                {isFinal ? '🏆 ' : ''}{round.title}
              </span>
            </div>

            {/* Cards positioned absolutely */}
            <div className="relative" style={{ height: BASELINE_H }}>
              {round.slots.map((slot, si) => {
                const winner = picks[slot.id] ? teams.find(t => t.id === picks[slot.id]) : null;
                const hasFeeders = slot.feedsFrom.length > 0;
                const feeder1 = hasFeeders && slot.feedsFrom[0] ? (picks[slot.feedsFrom[0]] ? teams.find(t => t.id === picks[slot.feedsFrom[0]]) : null) : null;
                const feeder2 = hasFeeders && slot.feedsFrom[1] ? (picks[slot.feedsFrom[1]] ? teams.find(t => t.id === picks[slot.feedsFrom[1]]) : null) : null;

                let t1 = feeder1, t2 = feeder2;
                if (key === 'r16') {
                  const top16 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 16);
                  t1 = top16[si * 2] || null;
                  t2 = top16[si * 2 + 1] || null;
                }

                const canClick = t1 && t2 && !winner && (key === 'r16' || (feeder1 && feeder2));
                // Y within the container: offset from vertical centering
                const y = si * (cardH + layout.gap) - (BASELINE_H - layout.totalH) / 2;

                return (
                  <button
                    key={slot.id}
                    onClick={() => canClick && onSelectSlot(slot.id)}
                    disabled={!canClick}
                    className={`
                      absolute left-0 right-0 rounded-xl border px-2 py-1.5 text-center transition-all
                      ${isFinal
                        ? 'border-gold bg-gradient-to-b from-yellow-50 to-white shadow-md shadow-gold/20'
                        : winner ? 'border-gray-200 bg-white shadow-sm'
                        : canClick ? 'border-gray-200 bg-white hover:border-navy-400 hover:shadow-md cursor-pointer'
                        : 'border-gray-100 bg-gray-50'
                      }
                    `}
                    style={{ top: y, height: cardH }}
                  >
                    {isFinal && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🏆</div>}
                    <div className="text-[9px] text-gray-400 font-mono mb-0.5">{slot.date} {slot.time}</div>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 text-center min-w-0 leading-tight">
                        {t1 ? <><div className="text-base">{t1.flag}</div><div className={`text-[9px] font-semibold truncate ${winner && t1.id === winner.id ? 'text-gold-dark' : 'text-gray-700'}`}>{t1.name}</div></> : <div className="text-gray-300 text-base">?</div>}
                      </div>
                      <span className="text-[9px] text-gray-300 font-bold shrink-0">VS</span>
                      <div className="flex-1 text-center min-w-0 leading-tight">
                        {t2 ? <><div className="text-base">{t2.flag}</div><div className={`text-[9px] font-semibold truncate ${winner && t2.id === winner.id ? 'text-gold-dark' : 'text-gray-700'}`}>{t2.name}</div></> : <div className="text-gray-300 text-base">?</div>}
                      </div>
                    </div>
                    {winner && <div className="mt-0.5 text-[9px] font-bold text-gold-dark leading-tight">{winner.flag} {winner.name} 晋级</div>}
                    {!winner && canClick && <div className="mt-0.5 text-[8px] text-gray-400">点击选择 →</div>}
                    <div className="text-[7px] text-gray-400 truncate">{slot.city}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
