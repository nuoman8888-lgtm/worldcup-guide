'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

/* ═══════════════════════════════════════════════════
   BracketTree — Visual knockout bracket (mobile-first)
   Horizontal scroll + pinch zoom + tap-to-advance
   ═══════════════════════════════════════════════════ */

export interface MatchNodeData {
  id: string;
  label: string;
  teamA: { id: string; name: string; flag: string } | null;
  teamB: { id: string; name: string; flag: string } | null;
  winner: string | null;
  canClick: boolean;
}

export interface RoundData {
  title: string;
  matches: MatchNodeData[];
}

// ── Layout constants ──
const COL_GAP = 34;        // gap between columns
const NODE_W = 128;        // match node width (wider for readable names)
const R32_H = 48;          // R32 match height (team row = 22px, good tap target)
const R16_H = 96;          // R16 match height
const QF_H = 192;          // QF match height
const SF_H = 384;          // SF match height
const FINAL_H = 768;       // Final match height (16×48=768, fits phone screen)
const ROUND_HEADER_H = 24; // height for round column title
const TOP_PAD = 6;         // top padding

function matchHeight(roundIdx: number): number {
  return [R32_H, R16_H, QF_H, SF_H, FINAL_H][roundIdx] || R32_H;
}

/** Y-center of match i in a given round */
function matchY(roundIdx: number, i: number): number {
  const h = matchHeight(roundIdx);
  return TOP_PAD + ROUND_HEADER_H + h * i + h / 2;
}

/** SVG path for a bracket connection line */
function connectorPath(
  x1: number, y1: number,  // start: right edge of source match
  x2: number, y2: number,  // end: left edge of target match
): string {
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
}

/** SVG path for two siblings merging into one parent */
function mergePath(
  x1: number, y1a: number, y1b: number,  // two source Ys
  x2: number, y2: number,                 // target Y
): string {
  const midX = (x1 + x2) / 2;
  return [
    `M ${x1} ${y1a} L ${midX} ${y1a} L ${midX} ${y2} L ${x2} ${y2}`,
    `M ${x1} ${y1b} L ${midX} ${y1b} L ${midX} ${y2}`,
  ].join(' ');
}

// ── Zoom controls ──
function ZoomControls({ scale, onZoomIn, onZoomOut, onReset }: {
  scale: number; onZoomIn: () => void; onZoomOut: () => void; onReset: () => void;
}) {
  return (
    <div className="fixed bottom-20 right-3 z-30 flex flex-col gap-1.5 md:hidden">
      <button
        onClick={onZoomIn}
        className="w-9 h-9 bg-white/90 backdrop-blur border border-gray-200 rounded-lg flex items-center justify-center text-lg font-bold text-gray-700 shadow-sm active:bg-gray-100"
        aria-label="放大"
      >+</button>
      <button
        onClick={onReset}
        className="w-9 h-9 bg-white/90 backdrop-blur border border-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm active:bg-gray-100"
        aria-label="重置缩放"
      >1:1</button>
      <button
        onClick={onZoomOut}
        className="w-9 h-9 bg-white/90 backdrop-blur border border-gray-200 rounded-lg flex items-center justify-center text-lg font-bold text-gray-700 shadow-sm active:bg-gray-100"
        aria-label="缩小"
      >−</button>
    </div>
  );
}

// ── Single Match Node ──
function MatchNode({
  match, roundIdx, matchIdx, totalInRound, onPick,
}: {
  match: MatchNodeData;
  roundIdx: number;
  matchIdx: number;
  totalInRound: number;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const h = matchHeight(roundIdx);
  const isFinal = roundIdx === 4;
  const hasWinner = !!match.winner;

  function teamRow(team: { id: string; name: string; flag: string } | null, isTop: boolean) {
    const isWinner = team && match.winner === team.id;
    const clickable = match.canClick && team && team.id;
    const flagSize = roundIdx === 4 ? '1.5rem' : roundIdx >= 2 ? '1.1rem' : '1.2rem';

    return (
      <button
        onClick={() => clickable && onPick(match.id, team!.id)}
        disabled={!clickable}
        className={[
          'flex items-center gap-2 px-2 rounded-md transition-all w-full text-left',
          isTop ? 'rounded-t-md' : 'rounded-b-md',
          isWinner
            ? 'bg-amber-100 border border-amber-400 shadow-sm'
            : clickable
              ? 'bg-white border border-gray-200 hover:bg-amber-50 hover:border-amber-300 active:scale-[0.97] cursor-pointer shadow-sm'
              : 'bg-gray-100/50 border border-gray-150',
          team ? '' : 'opacity-40',
        ].join(' ')}
        style={{
          height: `calc(50% - 1px)`,
        }}
        aria-label={team ? `选择 ${team.name}` : '待定'}
      >
        {/* Flag */}
        <span className="shrink-0 leading-none text-center" style={{ fontSize: flagSize, width: '1.5rem' }}>
          {team?.flag || '❓'}
        </span>
        {/* Name */}
        <span className={[
          'truncate leading-tight font-semibold flex-1',
          isWinner ? 'text-amber-800' : team ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400',
        ].join(' ')}
        style={{ fontSize: roundIdx >= 3 ? '0.7rem' : '0.75rem' }}>
          {team?.name || '待定'}
        </span>
        {/* Checkmark */}
        {isWinner && (
          <span className="text-amber-600 text-xs shrink-0 font-bold">✓</span>
        )}
      </button>
    );
  }

  return (
    <div
      className="absolute left-0 flex flex-col"
      style={{
        top: TOP_PAD + ROUND_HEADER_H + h * matchIdx,
        width: NODE_W,
        height: h,
      }}
    >
      {/* Match label */}
      <div
        className="absolute text-[10px] font-bold text-gray-400 dark:text-gray-500 w-full text-center whitespace-nowrap leading-none"
        style={{ top: -12, height: 12 }}
      >
        {match.label}
      </div>
      <div className="flex flex-col h-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
        {teamRow(match.teamA, true)}
        {/* VS divider */}
        <div className="flex items-center justify-center h-0 relative z-10">
          <span className="absolute text-[10px] text-gray-400 font-bold bg-white dark:bg-gray-900 px-2 rounded-full">VS</span>
          <div className="w-full border-t border-gray-150 dark:border-gray-700" />
        </div>
        {teamRow(match.teamB, false)}
      </div>
    </div>
  );
}

// ── Main BracketTree Component ──
export default function BracketTree({
  rounds,
  champion,
  totalFilled,
  totalSlots,
  onPick,
}: {
  rounds: RoundData[];
  champion: { flag: string; name: string; nameEn: string } | null;
  totalFilled: number;
  totalSlots: number;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  const totalWidth = rounds.length * (NODE_W + COL_GAP) + 140; // +140 for champion area
  const totalHeight = TOP_PAD + ROUND_HEADER_H + FINAL_H;

  // Zoom handlers
  const zoomIn = useCallback(() => setScale(s => Math.min(2.5, +(s + 0.25).toFixed(2))), []);
  const zoomOut = useCallback(() => setScale(s => Math.max(0.5, +(s - 0.25).toFixed(2))), []);
  const zoomReset = useCallback(() => setScale(1), []);

  // Initial auto-scroll: scroll to show first few R32 matches
  useEffect(() => {
    if (!initialScrollDone && scrollRef.current) {
      // Start scrolled to the left (R32 side)
      scrollRef.current.scrollLeft = 0;
      setInitialScrollDone(true);
    }
  }, [initialScrollDone]);

  // Build SVG connection lines
  const buildConnections = () => {
    const lines: { d: string; key: string }[] = [];

    for (let r = 0; r < rounds.length - 1; r++) {
      const currMatches = rounds[r].matches;
      const nextMatches = rounds[r + 1].matches;
      const currX = r * (NODE_W + COL_GAP) + NODE_W; // right edge of current column
      const nextX = (r + 1) * (NODE_W + COL_GAP);     // left edge of next column

      // Each pair of current matches feeds into one next match
      for (let i = 0; i < nextMatches.length; i++) {
        const a = i * 2;
        const b = i * 2 + 1;
        const y1a = matchY(r, a);
        const y1b = matchY(r, b);
        const y2 = matchY(r + 1, i);
        lines.push({
          d: mergePath(currX, y1a, y1b, nextX, y2),
          key: `conn-${r}-${i}`,
        });
      }
    }

    // Final → Champion connection
    if (champion && rounds.length > 0) {
      const lastRound = rounds[rounds.length - 1];
      const finalMatch = lastRound.matches[0];
      if (finalMatch?.winner) {
        const finalX = (rounds.length - 1) * (NODE_W + COL_GAP) + NODE_W;
        const finalY = matchY(rounds.length - 1, 0);
        const champX = rounds.length * (NODE_W + COL_GAP);
        lines.push({
          d: `M ${finalX} ${finalY} L ${champX} ${finalY}`,
          key: 'conn-champion',
        });
      }
    }

    return lines;
  };

  const connections = buildConnections();

  // Scroll hint: auto-scroll right to show champion when bracket is complete
  const autoScrollToChampion = () => {
    if (scrollRef.current && totalFilled >= totalSlots) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          left: totalWidth - (scrollRef.current?.clientWidth || 375) / 2,
          behavior: 'smooth',
        });
      }, 300);
    }
  };

  return (
    <div className="relative">
      {/* Zoom controls (mobile) */}
      <ZoomControls scale={scale} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={zoomReset} />

      {/* Scrollable bracket container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide overscroll-x-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y pinch-zoom',
          paddingBottom: '80px',
        }}
      >
        <div
          className="relative"
          style={{
            width: totalWidth * scale,
            height: totalHeight * scale,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            minWidth: totalWidth,
          }}
        >
          {/* SVG Connection Lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: totalWidth, height: totalHeight, zIndex: 0 }}
          >
            {connections.map(c => (
              <path
                key={c.key}
                d={c.d}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="dark:stroke-gray-600"
              />
            ))}
          </svg>

          {/* Match Columns */}
          {rounds.map((round, roundIdx) => (
            <div
              key={roundIdx}
              className="absolute"
              style={{
                left: roundIdx * (NODE_W + COL_GAP),
                top: 0,
                width: NODE_W,
                height: totalHeight,
              }}
            >
              {/* Round title header */}
              <div
                className="absolute text-center w-full font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                style={{
                  top: TOP_PAD,
                  height: ROUND_HEADER_H,
                  fontSize: roundIdx === 4 ? '0.75rem' : '0.625rem',
                  lineHeight: `${ROUND_HEADER_H}px`,
                }}
              >
                {round.title}
              </div>
              {round.matches.map((match, matchIdx) => (
                <MatchNode
                  key={match.id}
                  match={match}
                  roundIdx={roundIdx}
                  matchIdx={matchIdx}
                  totalInRound={round.matches.length}
                  onPick={onPick}
                />
              ))}
            </div>
          ))}

          {/* Champion Area */}
          {champion && (
            <div
              className="absolute flex flex-col items-center justify-center"
              style={{
                left: rounds.length * (NODE_W + COL_GAP),
                top: 0,
                width: 120,
                height: totalHeight,
              }}
            >
              <div
                className="text-center p-4 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%)',
                  border: '2px solid #D4AF37',
                  boxShadow: '0 4px 20px rgba(212,175,55,0.25)',
                }}
              >
                <div className="text-xs font-bold text-amber-700 mb-1">🏆 冠军</div>
                <div className="text-4xl mb-1">{champion.flag}</div>
                <div className="text-sm font-extrabold text-gray-900">{champion.name}</div>
                <div className="text-[10px] text-gray-500">{champion.nameEn}</div>
              </div>
            </div>
          )}

          {/* Champion placeholder when not yet selected */}
          {!champion && rounds.length > 0 && (
            <div
              className="absolute flex flex-col items-center justify-center"
              style={{
                left: rounds.length * (NODE_W + COL_GAP),
                top: 0,
                width: 120,
                height: totalHeight,
              }}
            >
              <div className="text-center p-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 dark:bg-gray-800/30 dark:border-gray-700">
                <div className="text-4xl mb-1 opacity-30">🏆</div>
                <div className="text-xs text-gray-400 font-medium">等待晋级</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll hint arrow (mobile, when content overflows) */}
      <div className="md:hidden absolute left-1/2 -translate-x-1/2 bottom-2 text-xs text-gray-400 flex items-center gap-1 pointer-events-none">
        <span>← 滑动查看完整对阵树 →</span>
      </div>
    </div>
  );
}

export { matchHeight, matchY, NODE_W, COL_GAP, R32_H, R16_H, QF_H, SF_H, FINAL_H, TOP_PAD, ROUND_HEADER_H };
