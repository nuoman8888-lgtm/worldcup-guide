'use client';

import { useRef, useState, useEffect, useMemo } from 'react';

/* ═══════════════════════════════════════════════════
   BracketTree — 世界杯冠军之路 · Premium Dark Theme
   FIFA × 雷速体育风格
   ═══════════════════════════════════════════════════ */

export interface MatchNodeData {
  id: string;
  teamA: { id: string; name: string; flag: string } | null;
  teamB: { id: string; name: string; flag: string } | null;
  winner: string | null;
  canClick: boolean;
}

export interface RoundData {
  title: string;
  subtitle: string;
  matches: MatchNodeData[];
}

/* ── Layout ── */
const H = [72, 72, 46, 46, 52]; // per-round match heights
const CHAMPION_H = 90;
const NODE_W = 114;
const CHAMPION_W = 150;
const COL_GAP = 34;
const HEADER_H = 32;
const TOP_PAD = 8;
const ZOOM_LEVELS = [0.8, 1.0, 1.2];

function computePositions(rounds: RoundData[]): number[][] {
  const positions: number[][] = [];
  const r0: number[] = [];
  for (let i = 0; i < rounds[0].matches.length; i++) r0.push(TOP_PAD + HEADER_H + H[0] * i);
  positions.push(r0);
  for (let r = 1; r < rounds.length; r++) {
    const prev = positions[r - 1], prevH = H[r - 1], curH = H[r];
    const cur: number[] = [];
    for (let i = 0; i < rounds[r].matches.length; i++) {
      const a = i * 2, b = i * 2 + 1;
      cur.push(((prev[a] + prevH / 2) + (prev[b] + prevH / 2)) / 2 - curH / 2);
    }
    positions.push(cur);
  }
  return positions;
}

function matchCenterY(positions: number[][], roundIdx: number, matchIdx: number): number {
  return positions[roundIdx][matchIdx] + H[roundIdx] / 2;
}

/* ═══════════════════════════════ Team Row ═══════════════════════════════ */
function TeamRow({ team, isWinner, canClick, rowH, onClick }: {
  team: { id: string; name: string; flag: string } | null;
  isWinner: boolean; canClick: boolean; rowH: number; onClick: () => void;
}) {
  if (!team) {
    return (
      <div className="flex items-center gap-1.5 px-2" style={{ height: rowH, opacity: 0.3 }}>
        <span className="shrink-0 text-center leading-none" style={{ fontSize: '0.85rem', width: '1.3rem' }}>—</span>
        <span className="text-[10px] text-white/40">待定</span>
      </div>
    );
  }
  return (
    <button
      onClick={canClick ? onClick : undefined} disabled={!canClick}
      className={[
        'flex items-center gap-1.5 px-2 w-full text-left transition-all duration-200 select-none rounded-sm',
        isWinner
          ? 'bg-gradient-to-r from-[#f6b100] to-[#ffcc33] text-[#08111f] font-bold'
          : 'hover:bg-white/[0.06] active:bg-white/[0.10] cursor-pointer text-white/75',
      ].join(' ')}
      style={{
        height: rowH,
        boxShadow: isWinner ? '0 0 12px rgba(255,193,7,0.35), inset 0 1px 0 rgba(255,255,255,0.2)' : undefined,
      }}
    >
      <span className="shrink-0 text-center leading-none" style={{ fontSize: '0.9rem', width: '1.3rem' }}>{team.flag}</span>
      <span className="truncate leading-tight" style={{ fontSize: '0.7rem' }}>{team.name}</span>
    </button>
  );
}

/* ═══════════════════════════════ Match Node ═══════════════════════════════ */
function MatchNode({ match, roundIdx, top, onPick }: {
  match: MatchNodeData; roundIdx: number; top: number;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const mh = H[roundIdx], rowH = Math.floor((mh - 2) / 2), isFinal = roundIdx === 4;
  const hasWinner = !!match.winner;
  return (
    <div className="absolute left-0" style={{ top, width: NODE_W, height: mh }}>
      <div className="flex flex-col rounded-lg overflow-hidden w-full h-full"
        style={{
          background: 'rgba(18,32,58,0.95)',
          border: hasWinner && !isFinal ? '1px solid rgba(255,193,7,0.30)' : '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          boxShadow: isFinal ? '0 0 20px rgba(255,193,7,0.15)' : '0 2px 8px rgba(0,0,0,0.3)',
        }}>
        <TeamRow team={match.teamA} isWinner={!!(match.winner && match.winner === match.teamA?.id)}
          canClick={match.canClick && !!match.teamA} rowH={rowH}
          onClick={() => match.teamA && onPick(match.id, match.teamA.id)} />
        <div className="w-full" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <TeamRow team={match.teamB} isWinner={!!(match.winner && match.winner === match.teamB?.id)}
          canClick={match.canClick && !!match.teamB} rowH={rowH}
          onClick={() => match.teamB && onPick(match.id, match.teamB.id)} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════ Winner Path Highlight ═══════════════════ */
function Connections({ rounds, positions, picks }: {
  rounds: RoundData[]; positions: number[][]; picks: Record<string, string>;
}) {
  const lines: { d: string; key: string; gold: boolean }[] = [];
  const svgW = rounds.length * (NODE_W + COL_GAP) + CHAMPION_W + 20;
  const svgH = (positions[0]?.[positions[0].length - 1] ?? 0) + H[0] + 8;

  // winnerOf helper
  const w = (slotId: string): string | null => picks[slotId] || null;

  for (let r = 0; r < rounds.length - 1; r++) {
    const fromX = r * (NODE_W + COL_GAP) + NODE_W, toX = (r + 1) * (NODE_W + COL_GAP);
    for (let i = 0; i < rounds[r + 1].matches.length; i++) {
      const a = i * 2, b = i * 2 + 1;
      const yA = matchCenterY(positions, r, a), yB = matchCenterY(positions, r, b);
      const yT = matchCenterY(positions, r + 1, i);
      const midX = (fromX + toX) / 2;

      // Check if this path is part of the champion's route
      const nextSlot = rounds[r + 1].matches[i].id;
      const nextWinner = w(nextSlot);
      const aWinner = w(rounds[r].matches[a].id);
      const bWinner = w(rounds[r].matches[b].id);
      const aGold = aWinner && aWinner === nextWinner;
      const bGold = bWinner && bWinner === nextWinner;

      lines.push({
        d: [`M ${fromX} ${yA} L ${midX} ${yA} L ${midX} ${yT} L ${toX} ${yT}`,
            `M ${fromX} ${yB} L ${midX} ${yB} L ${midX} ${yT}`].join(' '),
        key: `c-${r}-${i}`,
        gold: !!(aGold || bGold),
      });
    }
  }
  // Final → Champion connection
  if (rounds.length > 0) {
    const lastR = rounds.length - 1;
    const fy = matchCenterY(positions, lastR, 0);
    const fx = lastR * (NODE_W + COL_GAP) + NODE_W;
    const cx = (lastR + 1) * (NODE_W + COL_GAP);
    const hasChamp = !!w(rounds[lastR].matches[0].id);
    lines.push({ d: `M ${fx} ${fy} L ${cx} ${fy}`, key: 'c-champ', gold: hasChamp });
  }

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: svgW, height: svgH, zIndex: 0 }}>
      {lines.map(l => (
        <path key={l.key} d={l.d} fill="none"
          stroke={l.gold ? '#f6b100' : 'rgba(255,255,255,0.12)'}
          strokeWidth={l.gold ? '2' : '1.2'}
          strokeLinecap="round" strokeLinejoin="round"
          style={l.gold ? { filter: 'drop-shadow(0 0 4px rgba(255,193,7,0.4))' } : undefined}
        />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════ Champion ═══════════════════════════════ */
function ChampionCard({ champion, prob, x }: {
  champion: { flag: string; name: string; nameEn: string }; prob: number; x: number;
}) {
  const totalH = TOP_PAD + HEADER_H + H[0] * 16;
  const cardH = 130, top = (totalH - cardH) / 2;
  return (
    <div className="absolute flex items-center justify-center" style={{ left: x, top, width: CHAMPION_W, height: cardH }}>
      <div className="text-center px-4 py-4 rounded-2xl w-full"
        style={{
          background: 'linear-gradient(160deg, rgba(18,32,58,0.98) 0%, rgba(18,32,58,0.9) 100%)',
          border: '1.5px solid rgba(246,177,0,0.5)',
          boxShadow: '0 0 40px rgba(255,193,7,0.25), 0 0 80px rgba(255,193,7,0.10), 0 8px 32px rgba(0,0,0,0.4)',
        }}>
        <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-amber-400/70 mb-2">🏆 预测冠军</div>
        <div className="text-4xl mb-2 drop-shadow-[0_0_16px_rgba(255,193,7,0.4)]">{champion.flag}</div>
        <div className="text-sm font-extrabold text-white mb-1">{champion.name}</div>
        <div className="text-[10px] text-white/30 mb-2">{champion.nameEn}</div>
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full"
          style={{ background: 'rgba(246,177,0,0.12)', border: '1px solid rgba(246,177,0,0.25)' }}>
          <span className="text-amber-400 font-bold text-sm">{prob}%</span>
          <span className="text-amber-400/50 text-[10px]">夺冠概率</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ Zoom ═══════════════════════════════ */
function ZoomControls({ scale, onChange }: { scale: number; onChange: (s: number) => void }) {
  return (
    <div className="fixed bottom-24 right-3 z-30 flex flex-col gap-1.5 md:bottom-6">
      {ZOOM_LEVELS.map(level => (
        <button key={level} onClick={() => onChange(level)}
          className={['w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all border',
            scale === level
              ? 'bg-gradient-to-b from-[#f6b100] to-[#ffcc33] text-[#08111f] border-[#f6b100] shadow-lg shadow-amber-500/25'
              : 'text-white/50 border-white/10 hover:text-white/80 hover:border-white/20',
          ].join(' ')}
          style={{ background: scale === level ? undefined : 'rgba(18,32,58,0.9)', backdropFilter: 'blur(8px)' }}>
          {Math.round(level * 100)}%</button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════ Stats Bar ═══════════════════════════════ */
function StatsBar({ filled, total, champion }: {
  filled: number; total: number; champion: { name: string; flag: string } | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-6 px-4 py-3 rounded-xl"
      style={{ background: 'rgba(18,32,58,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
      <div className="text-center">
        <div className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-0.5">已完成</div>
        <div className="text-white font-bold text-lg tabular-nums">{filled}<span className="text-white/30 text-sm">/{total}</span></div>
      </div>
      {champion && (
        <div className="text-center">
          <div className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-0.5">预测冠军</div>
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-lg">{champion.flag}</span>
            <span className="text-white font-bold text-sm">{champion.name}</span>
          </div>
        </div>
      )}
      <div className="text-center">
        <div className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-0.5">预测完成度</div>
        <div className="text-amber-400 font-bold text-lg tabular-nums">{Math.round((filled / total) * 100)}%</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ Main ═══════════════════════════════ */
export default function BracketTree({
  rounds, champion, totalFilled, totalSlots, onPick, championProb,
}: {
  rounds: RoundData[];
  champion: { flag: string; name: string; nameEn: string } | null;
  totalFilled: number;
  totalSlots: number;
  onPick: (slotId: string, teamId: string) => void;
  championProb?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.0);

  useEffect(() => setScale(window.innerWidth >= 768 ? 1.5 : 1.0), []);

  const positions = computePositions(rounds);
  const totalH = (positions[0]?.[positions[0].length - 1] ?? 0) + H[0] + 8;
  const totalWidth = rounds.length * (NODE_W + COL_GAP) + CHAMPION_W + 20;
  const champCY = rounds.length > 0 ? matchCenterY(positions, rounds.length - 1, 0) : totalH / 2;

  // Build picks from match winners for connection highlighting
  const picks = useMemo(() => {
    const p: Record<string, string> = {};
    rounds.forEach(r => r.matches.forEach(m => { if (m.winner) p[m.id] = m.winner; }));
    return p;
  }, [rounds]);

  return (
    <div className="relative">
      <StatsBar filled={totalFilled} total={totalSlots} champion={champion} />
      <ZoomControls scale={scale} onChange={setScale} />

      <div ref={scrollRef} className="overflow-x-auto overflow-y-auto scrollbar-hide overscroll-x-contain"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y pinch-zoom', maxHeight: 'calc(100vh - 260px)', paddingBottom: 24 }}>
        <div className="relative" style={{
          width: totalWidth * scale, height: totalH * scale,
          transform: `scale(${scale})`, transformOrigin: 'top left', minWidth: totalWidth,
        }}>
          <Connections rounds={rounds} positions={positions} picks={picks} />

          {rounds.map((round, roundIdx) => (
            <div key={roundIdx} className="absolute" style={{ left: roundIdx * (NODE_W + COL_GAP), top: 0, width: NODE_W }}>
              {/* Round title — bilingual */}
              <div className="absolute text-center w-full whitespace-nowrap"
                style={{ top: TOP_PAD, height: HEADER_H }}>
                <div className="text-white/80 font-bold tracking-[0.08em] uppercase"
                  style={{ fontSize: '0.65rem', lineHeight: '16px' }}>{round.title}</div>
                <div className="text-white/30 font-medium tracking-[0.12em] uppercase"
                  style={{ fontSize: '0.5rem', lineHeight: '14px' }}>{round.subtitle}</div>
              </div>

              {round.matches.map((match, matchIdx) => (
                <MatchNode key={match.id} match={match} roundIdx={roundIdx}
                  top={positions[roundIdx][matchIdx]} onPick={onPick} />
              ))}
            </div>
          ))}

          {champion ? (
            <ChampionCard champion={champion} prob={championProb ?? 0} x={rounds.length * (NODE_W + COL_GAP)} />
          ) : (
            <div className="absolute flex items-center justify-center" style={{
              left: rounds.length * (NODE_W + COL_GAP), top: champCY - CHAMPION_H / 2,
              width: CHAMPION_W, height: CHAMPION_H, opacity: 0.2,
            }}>
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-[10px] text-white/30">等待冠军</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {totalFilled < 3 && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 text-[11px] text-white/25 pointer-events-none">← 滑动查看完整对阵树 →</div>
      )}
    </div>
  );
}
