'use client';

import { useRef, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════
   BracketTree — 世界杯冠军之路 对阵树
   Navy theme · Gold champion · Pure bracket layout
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

/* ── Layout ── */
const NODE_W = 112;         // match node width
const COL_GAP = 36;         // gap between columns
const ROW_H = 24;           // single team row height
const DIVIDER = 2;          // divider between two teams
const MATCH_H = ROW_H * 2 + DIVIDER;  // 50px per match
const HEADER_H = 28;        // round title
const TOP_PAD = 8;

function roundMatchHeight(roundIdx: number): number {
  // Each round has half the matches → double the height per match
  return MATCH_H * Math.pow(2, roundIdx);
}

function matchTop(roundIdx: number, matchIdx: number): number {
  const mh = roundMatchHeight(roundIdx);
  return TOP_PAD + HEADER_H + mh * matchIdx;
}

function matchCenterY(roundIdx: number, matchIdx: number): number {
  return matchTop(roundIdx, matchIdx) + roundMatchHeight(roundIdx) / 2;
}

/* ── Zoom presets ── */
const ZOOM_LEVELS = [0.8, 1.0, 1.2];

/* ═══════════════════════════════ Team Row ═══════════════════════════════ */
function TeamRow({
  team,
  isWinner,
  canClick,
  isFinal,
  onClick,
}: {
  team: { id: string; name: string; flag: string } | null;
  isWinner: boolean;
  canClick: boolean;
  isFinal: boolean;
  onClick: () => void;
}) {
  if (!team) {
    return (
      <div
        className="flex items-center gap-1.5 px-2 opacity-30"
        style={{ height: ROW_H }}
      >
        <span className="text-sm w-5 text-center">—</span>
        <span className="text-[11px] text-gray-400">待定</span>
      </div>
    );
  }

  return (
    <button
      onClick={canClick ? onClick : undefined}
      disabled={!canClick}
      className={[
        'flex items-center gap-1.5 px-2 w-full text-left transition-all duration-150 select-none',
        isWinner
          ? 'bg-amber-400/20 border-l-[3px] border-amber-400'
          : canClick
            ? 'hover:bg-white/10 active:bg-amber-400/10 cursor-pointer'
            : '',
      ].join(' ')}
      style={{ height: ROW_H }}
    >
      <span
        className="shrink-0 text-center leading-none"
        style={{ fontSize: isFinal ? '1.2rem' : '1rem', width: '1.5rem' }}
      >
        {team.flag}
      </span>
      <span
        className={[
          'truncate leading-tight font-medium',
          isWinner
            ? 'text-amber-400 font-bold'
            : 'text-white/90',
        ].join(' ')}
        style={{ fontSize: isFinal ? '0.8rem' : '0.72rem' }}
      >
        {team.name}
      </span>
      {isWinner && (
        <span className="text-amber-400 text-[10px] shrink-0 ml-auto mr-0.5">▶</span>
      )}
    </button>
  );
}

/* ═══════════════════════════════ Match Node ═══════════════════════════════ */
function MatchNode({
  match,
  roundIdx,
  matchIdx,
  onPick,
}: {
  match: MatchNodeData;
  roundIdx: number;
  matchIdx: number;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const mh = roundMatchHeight(roundIdx);
  const isFinal = roundIdx === 4;

  return (
    <div
      className="absolute left-0"
      style={{
        top: matchTop(roundIdx, matchIdx),
        width: NODE_W,
        height: mh,
      }}
    >
      <div
        className={[
          'flex flex-col rounded-lg overflow-hidden border w-full h-full',
          isFinal
            ? 'border-amber-500/60 bg-white/5 backdrop-blur'
            : 'border-white/10 bg-white/5',
        ].join(' ')}
      >
        <TeamRow
          team={match.teamA}
          isWinner={match.winner === match.teamA?.id}
          canClick={match.canClick && !!match.teamA}
          isFinal={isFinal}
          onClick={() => match.teamA && onPick(match.id, match.teamA.id)}
        />
        {/* Divider */}
        <div className="w-full border-t border-white/10" style={{ height: DIVIDER }} />
        <TeamRow
          team={match.teamB}
          isWinner={match.winner === match.teamB?.id}
          canClick={match.canClick && !!match.teamB}
          isFinal={isFinal}
          onClick={() => match.teamB && onPick(match.id, match.teamB.id)}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════ Zoom Controls ═══════════════════════════════ */
function ZoomControls({
  scale, onChange,
}: {
  scale: number; onChange: (s: number) => void;
}) {
  return (
    <div className="fixed bottom-24 right-3 z-30 flex flex-col gap-1.5 md:bottom-6">
      {ZOOM_LEVELS.map(level => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={[
            'w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-lg border',
            scale === level
              ? 'bg-amber-400 text-navy border-amber-400'
              : 'bg-navy-light/90 text-white/70 border-white/10 hover:bg-navy-light hover:text-white',
          ].join(' ')}
          aria-label={`缩放 ${Math.round(level * 100)}%`}
        >
          {Math.round(level * 100)}%
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════ SVG Connections ═══════════════════════════════ */
function Connections({ rounds }: { rounds: RoundData[] }) {
  const lines: { d: string; key: string }[] = [];

  for (let r = 0; r < rounds.length - 1; r++) {
    const currCount = rounds[r].matches.length;
    const nextCount = rounds[r + 1].matches.length;
    const fromX = r * (NODE_W + COL_GAP) + NODE_W;
    const toX = (r + 1) * (NODE_W + COL_GAP);

    for (let i = 0; i < nextCount; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const yA = matchCenterY(r, a);
      const yB = matchCenterY(r, b);
      const yTarget = matchCenterY(r + 1, i);
      const midX = (fromX + toX) / 2;

      lines.push({
        d: [
          `M ${fromX} ${yA} L ${midX} ${yA} L ${midX} ${yTarget} L ${toX} ${yTarget}`,
          `M ${fromX} ${yB} L ${midX} ${yB} L ${midX} ${yTarget}`,
        ].join(' '),
        key: `c-${r}-${i}`,
      });
    }
  }

  // Champion connection
  if (rounds.length > 0) {
    const lastR = rounds.length - 1;
    const finalX = lastR * (NODE_W + COL_GAP) + NODE_W;
    const finalY = matchCenterY(lastR, 0);
    const champX = (lastR + 1) * (NODE_W + COL_GAP);
    lines.push({
      d: `M ${finalX} ${finalY} L ${champX} ${finalY}`,
      key: 'c-champ',
    });
  }

  const svgW = rounds.length * (NODE_W + COL_GAP) + 160;
  const svgH = TOP_PAD + HEADER_H + MATCH_H * Math.pow(2, rounds.length - 1 || 0) * (rounds[0]?.matches.length || 1);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: svgW, height: svgH, zIndex: 0 }}
    >
      {lines.map(l => (
        <path
          key={l.key}
          d={l.d}
          fill="none"
          stroke="rgba(148,163,184,0.25)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/* ═══════════════════════════ Champion Card ═══════════════════════════════ */
function ChampionCard({
  champion, x, totalH,
}: {
  champion: { flag: string; name: string; nameEn: string };
  x: number; totalH: number;
}) {
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{ left: x, top: 0, width: 130, height: totalH }}
    >
      <div
        className="text-center px-5 py-6 rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.08) 100%)',
          border: '1.5px solid rgba(251,191,36,0.4)',
          boxShadow: '0 0 40px rgba(251,191,36,0.12), 0 0 80px rgba(251,191,36,0.06)',
        }}
      >
        <div className="text-[10px] font-bold tracking-widest uppercase text-amber-400/70 mb-2">
          🏆 Champion
        </div>
        <div className="text-5xl mb-2 drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">
          {champion.flag}
        </div>
        <div className="text-base font-extrabold text-white mb-0.5">
          {champion.name}
        </div>
        <div className="text-[11px] text-white/40">
          {champion.nameEn}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Main Component ═══════════════════════════════ */
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
  const [scale, setScale] = useState(1.0);

  const lastRoundIdx = rounds.length - 1;
  const totalHeight = TOP_PAD + HEADER_H + MATCH_H * Math.pow(2, lastRoundIdx) * (rounds[0]?.matches.length || 1);
  const bracketWidth = rounds.length * (NODE_W + COL_GAP);
  const totalWidth = bracketWidth + 160; // + champion area

  const zoomIn = useCallback(() => {
    const idx = ZOOM_LEVELS.indexOf(scale);
    if (idx < ZOOM_LEVELS.length - 1) setScale(ZOOM_LEVELS[idx + 1]);
  }, [scale]);
  const zoomOut = useCallback(() => {
    const idx = ZOOM_LEVELS.indexOf(scale);
    if (idx > 0) setScale(ZOOM_LEVELS[idx - 1]);
  }, [scale]);

  return (
    <div className="relative">
      {/* Zoom controls */}
      <ZoomControls scale={scale} onChange={setScale} />

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-auto scrollbar-hide overscroll-x-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y pinch-zoom',
          maxHeight: 'calc(100vh - 200px)',
          paddingBottom: '24px',
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
          {/* Connection lines */}
          <Connections rounds={rounds} />

          {/* Match columns */}
          {rounds.map((round, roundIdx) => (
            <div
              key={roundIdx}
              className="absolute"
              style={{
                left: roundIdx * (NODE_W + COL_GAP),
                top: 0,
                width: NODE_W,
              }}
            >
              {/* Round title */}
              <div
                className="absolute text-center w-full font-bold text-white/50 tracking-wider whitespace-nowrap"
                style={{
                  top: TOP_PAD,
                  height: HEADER_H,
                  fontSize: roundIdx === 4 ? '0.7rem' : '0.6rem',
                  lineHeight: `${HEADER_H}px`,
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
                  onPick={onPick}
                />
              ))}
            </div>
          ))}

          {/* Champion */}
          {champion && (
            <ChampionCard
              champion={champion}
              x={rounds.length * (NODE_W + COL_GAP)}
              totalH={totalHeight}
            />
          )}

          {/* Empty champion placeholder */}
          {!champion && (
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: rounds.length * (NODE_W + COL_GAP),
                top: 0,
                width: 130,
                height: totalHeight,
              }}
            >
              <div className="text-center opacity-20">
                <div className="text-5xl mb-2">🏆</div>
                <div className="text-[11px] text-white/40">等待冠军</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll hint */}
      {totalFilled < 5 && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 text-[11px] text-white/30 flex items-center gap-1 pointer-events-none">
          <span>← 滑动查看 →</span>
        </div>
      )}
    </div>
  );
}
