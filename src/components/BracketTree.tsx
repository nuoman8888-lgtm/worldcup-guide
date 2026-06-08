'use client';

import { useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════
   BracketTree — 世界杯冠军之路
   Content-driven heights · Compact · No dead space
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
  matches: MatchNodeData[];
}

/* ── Per-round match heights (content-driven, no uniform sizing) ── */
const H = [72, 72, 42, 42, 48]; // R32, R16, QF, SF, Final
const CHAMPION_H = 60;
const NODE_W = 110;
const CHAMPION_W = 140;
const COL_GAP = 32;
const HEADER_H = 24;
const TOP_PAD = 8;

function matchH(roundIdx: number): number { return H[roundIdx] ?? 48; }

/* ── Compute Y positions: each round centered between its feeder pairs ── */

/** Pre-compute all match Y positions for the bracket tree */
function computePositions(rounds: RoundData[]): number[][] {
  const positions: number[][] = [];

  // R32: evenly spaced
  const r0: number[] = [];
  for (let i = 0; i < rounds[0].matches.length; i++) {
    r0.push(TOP_PAD + HEADER_H + H[0] * i);
  }
  positions.push(r0);

  // Subsequent rounds: centered between feeder pair midpoints
  for (let r = 1; r < rounds.length; r++) {
    const prev = positions[r - 1];
    const prevH = H[r - 1];
    const curH = H[r];
    const cur: number[] = [];

    for (let i = 0; i < rounds[r].matches.length; i++) {
      const a = i * 2, b = i * 2 + 1;
      const midA = prev[a] + prevH / 2;
      const midB = prev[b] + prevH / 2;
      const center = (midA + midB) / 2;
      cur.push(center - curH / 2);
    }
    positions.push(cur);
  }

  return positions;
}

function matchCenterY(positions: number[][], roundIdx: number, matchIdx: number): number {
  return positions[roundIdx][matchIdx] + H[roundIdx] / 2;
}

/* ── Zoom ── */
const ZOOM_LEVELS = [0.8, 1.0, 1.2];

function ZoomControls({ scale, onChange }: { scale: number; onChange: (s: number) => void }) {
  return (
    <div className="fixed bottom-24 right-3 z-30 flex flex-col gap-1.5 md:bottom-6">
      {ZOOM_LEVELS.map(level => (
        <button key={level} onClick={() => onChange(level)}
          className={[
            'w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-lg border',
            scale === level ? 'bg-amber-400 text-navy border-amber-400'
              : 'bg-navy-light/90 text-white/60 border-white/10 hover:bg-navy-light hover:text-white',
          ].join(' ')}>{Math.round(level * 100)}%</button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════ Team Row ═══════════════════════════════ */
function TeamRow({
  team, isWinner, canClick, rowH, onClick,
}: {
  team: { id: string; name: string; flag: string } | null;
  isWinner: boolean; canClick: boolean; rowH: number;
  onClick: () => void;
}) {
  if (!team) {
    return (
      <div className="flex items-center gap-1 px-1.5 opacity-25" style={{ height: rowH }}>
        <span className="text-xs w-4 text-center">—</span>
        <span className="text-[10px] text-white/40">待定</span>
      </div>
    );
  }

  return (
    <button
      onClick={canClick ? onClick : undefined} disabled={!canClick}
      className={[
        'flex items-center gap-1 px-1.5 w-full text-left transition-all duration-150 select-none rounded-sm',
        isWinner ? 'bg-amber-400/15' : canClick ? 'hover:bg-white/5 active:bg-amber-400/8 cursor-pointer' : '',
      ].join(' ')}
      style={{ height: rowH }}
    >
      <span className="shrink-0 text-center leading-none"
        style={{ fontSize: '0.95rem', width: '1.3rem' }}>{team.flag}</span>
      <span className={['truncate leading-tight', isWinner ? 'text-amber-400 font-bold' : 'text-white/85'].join(' ')}
        style={{ fontSize: '0.7rem' }}>{team.name}</span>
    </button>
  );
}

/* ═══════════════════════════════ Match Node ═══════════════════════════════ */
function MatchNode({
  match, roundIdx, top, onPick,
}: {
  match: MatchNodeData; roundIdx: number; top: number;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const mh = H[roundIdx];
  const rowH = Math.floor((mh - 2) / 2); // split height evenly
  const isFinal = roundIdx === 4;

  return (
    <div className="absolute left-0" style={{ top, width: NODE_W, height: mh }}>
      <div className={[
        'flex flex-col rounded-lg overflow-hidden border w-full h-full',
        isFinal ? 'border-amber-500/50 bg-white/[0.06]' : 'border-white/8 bg-white/[0.03]',
      ].join(' ')}>
        <TeamRow team={match.teamA} isWinner={match.winner === match.teamA?.id}
          canClick={match.canClick && !!match.teamA} rowH={rowH}
          onClick={() => match.teamA && onPick(match.id, match.teamA.id)} />
        <div className="w-full border-t border-white/5" style={{ height: 2 }} />
        <TeamRow team={match.teamB} isWinner={match.winner === match.teamB?.id}
          canClick={match.canClick && !!match.teamB} rowH={rowH}
          onClick={() => match.teamB && onPick(match.id, match.teamB.id)} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════ Connections ═══════════════════════════════ */
function Connections({ rounds, positions }: { rounds: RoundData[]; positions: number[][] }) {
  const lines: { d: string; key: string }[] = [];
  const svgW = rounds.length * (NODE_W + COL_GAP) + CHAMPION_W + 20;
  const lastR32 = positions[0]?.[positions[0].length - 1] ?? 0;
  const svgH = lastR32 + H[0] + 8;

  for (let r = 0; r < rounds.length - 1; r++) {
    const fromX = r * (NODE_W + COL_GAP) + NODE_W;
    const toX = (r + 1) * (NODE_W + COL_GAP);

    for (let i = 0; i < rounds[r + 1].matches.length; i++) {
      const a = i * 2, b = i * 2 + 1;
      const yA = matchCenterY(positions, r, a);
      const yB = matchCenterY(positions, r, b);
      const yT = matchCenterY(positions, r + 1, i);
      const midX = (fromX + toX) / 2;

      lines.push({
        d: [
          `M ${fromX} ${yA} L ${midX} ${yA} L ${midX} ${yT} L ${toX} ${yT}`,
          `M ${fromX} ${yB} L ${midX} ${yB} L ${midX} ${yT}`,
        ].join(' '),
        key: `c-${r}-${i}`,
      });
    }
  }

  // Final → Champion
  if (rounds.length > 0) {
    const lastR = rounds.length - 1;
    const finalX = lastR * (NODE_W + COL_GAP) + NODE_W;
    const finalY = matchCenterY(positions, lastR, 0);
    const champX = (lastR + 1) * (NODE_W + COL_GAP);
    lines.push({ d: `M ${finalX} ${finalY} L ${champX} ${finalY}`, key: 'c-champ' });
  }

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: svgW, height: svgH, zIndex: 0 }}>
      {lines.map(l => (
        <path key={l.key} d={l.d} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1"
          strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════ Champion ═══════════════════════════════ */
function ChampionCard({
  champion, x, centerY,
}: {
  champion: { flag: string; name: string; nameEn: string }; x: number; centerY: number;
}) {
  const top = centerY - CHAMPION_H / 2;
  return (
    <div className="absolute flex items-center justify-center" style={{ left: x, top, width: CHAMPION_W, height: CHAMPION_H }}>
      <div className="text-center px-4 py-3 rounded-2xl w-full"
        style={{
          background: 'linear-gradient(160deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.06) 60%, transparent 100%)',
          border: '1.5px solid rgba(251,191,36,0.45)',
          boxShadow: '0 0 50px rgba(251,191,36,0.18), 0 0 100px rgba(251,191,36,0.08)',
        }}>
        <div className="text-[9px] font-bold tracking-[0.15em] uppercase text-amber-400/60 mb-1">Champion</div>
        <div className="text-3xl mb-1 drop-shadow-[0_0_14px_rgba(251,191,36,0.35)]">{champion.flag}</div>
        <div className="text-sm font-extrabold text-white">{champion.name}</div>
        <div className="text-[10px] text-white/30">{champion.nameEn}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ Main ═══════════════════════════════ */
export default function BracketTree({
  rounds, champion, totalFilled, onPick,
}: {
  rounds: RoundData[];
  champion: { flag: string; name: string; nameEn: string } | null;
  totalFilled: number;
  totalSlots: number;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.0);

  const positions = computePositions(rounds);
  const lastR32Y = positions[0]?.[positions[0].length - 1] ?? 0;
  const totalH = lastR32Y + H[0] + 8;
  const bracketWidth = rounds.length * (NODE_W + COL_GAP);
  const totalWidth = bracketWidth + CHAMPION_W + 20;
  const champCenterY = rounds.length > 0 ? matchCenterY(positions, rounds.length - 1, 0) : totalH / 2;

  return (
    <div className="relative">
      <ZoomControls scale={scale} onChange={setScale} />

      <div ref={scrollRef}
        className="overflow-x-auto overflow-y-auto scrollbar-hide overscroll-x-contain"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y pinch-zoom',
          maxHeight: 'calc(100vh - 180px)', paddingBottom: 24 }}>
        <div className="relative"
          style={{
            width: totalWidth * scale, height: totalH * scale,
            transform: `scale(${scale})`, transformOrigin: 'top left', minWidth: totalWidth,
          }}>
          <Connections rounds={rounds} positions={positions} />

          {rounds.map((round, roundIdx) => (
            <div key={roundIdx} className="absolute" style={{ left: roundIdx * (NODE_W + COL_GAP), top: 0, width: NODE_W }}>
              <div className="absolute text-center w-full font-bold text-white/40 tracking-wider whitespace-nowrap"
                style={{ top: TOP_PAD, height: HEADER_H, fontSize: '0.6rem', lineHeight: `${HEADER_H}px` }}>
                {round.title}
              </div>
              {round.matches.map((match, matchIdx) => (
                <MatchNode key={match.id} match={match} roundIdx={roundIdx}
                  top={positions[roundIdx][matchIdx]} onPick={onPick} />
              ))}
            </div>
          ))}

          {champion
            ? <ChampionCard champion={champion} x={rounds.length * (NODE_W + COL_GAP)} centerY={champCenterY} />
            : (
              <div className="absolute flex items-center justify-center opacity-15"
                style={{ left: rounds.length * (NODE_W + COL_GAP),
                  top: champCenterY - CHAMPION_H / 2, width: CHAMPION_W, height: CHAMPION_H }}>
                <div className="text-center"><div className="text-4xl mb-1">🏆</div><div className="text-[10px] text-white/30">等待冠军</div></div>
              </div>
            )}
        </div>
      </div>

      {totalFilled < 5 && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 text-[11px] text-white/20 pointer-events-none">← 滑动查看 →</div>
      )}
    </div>
  );
}
