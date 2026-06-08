'use client';

import { useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════
   BracketTree — 世界杯冠军之路
   Compact bracket · Navy & Gold · Mobile-first
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
const NODE_W = 110;          // match node width
const CHAMPION_W = 140;      // champion card width
const COL_GAP = 32;          // gap between columns
const TEAM_ROW = 22;         // single team row height
const MATCH_H = TEAM_ROW * 2 + 2;  // 46px — base match height
const HEADER_H = 26;         // round title
const TOP_PAD = 8;

// Total bracket height = R32 total (16 matches)
const TOTAL_H = TOP_PAD + HEADER_H + MATCH_H * 16; // ~770px

// Each round's per-match height (capped after R16 to reduce whitespace)
function perMatchH(roundIdx: number): number {
  // R32=46, R16=92, QF=60(capped), SF=60(capped), Final=70
  if (roundIdx === 0) return MATCH_H;       // 46
  if (roundIdx === 1) return MATCH_H * 2;   // 92 (aligned between R32 pairs)
  if (roundIdx === 2) return 60;             // QF capped
  if (roundIdx === 3) return 60;             // SF capped
  return 70;                                  // Final
}

// Y position of match within the bracket
function matchY(roundIdx: number, matchIdx: number): number {
  if (roundIdx <= 1) {
    // R32 & R16: traditional expanding alignment
    const mh = roundIdx === 0 ? MATCH_H : MATCH_H * 2;
    return TOP_PAD + HEADER_H + mh * matchIdx;
  }
  // QF/SF/Final: centered in TOTAL_H
  const count = 16 >> roundIdx; // matches in this round
  const totalThisRound = perMatchH(roundIdx) * count;
  const offset = (TOTAL_H - totalThisRound) / 2;
  return offset + perMatchH(roundIdx) * matchIdx;
}

function matchCenterY(roundIdx: number, matchIdx: number): number {
  return matchY(roundIdx, matchIdx) + perMatchH(roundIdx) / 2;
}

/* ── Zoom presets ── */
const ZOOM_LEVELS = [0.8, 1.0, 1.2];

/* ═══════════════════════════════ Team Row ═══════════════════════════════ */
function TeamRow({
  team, isWinner, canClick, isFinal, onClick,
}: {
  team: { id: string; name: string; flag: string } | null;
  isWinner: boolean;
  canClick: boolean;
  isFinal: boolean;
  onClick: () => void;
}) {
  if (!team) {
    return (
      <div className="flex items-center gap-1 px-1.5 opacity-25" style={{ height: TEAM_ROW }}>
        <span className="text-xs w-4 text-center">—</span>
        <span className="text-[10px] text-white/40">待定</span>
      </div>
    );
  }

  return (
    <button
      onClick={canClick ? onClick : undefined}
      disabled={!canClick}
      className={[
        'flex items-center gap-1 px-1.5 w-full text-left transition-all duration-150 select-none rounded-sm',
        isWinner
          ? 'bg-amber-400/15'
          : canClick
            ? 'hover:bg-white/5 active:bg-amber-400/8 cursor-pointer'
            : '',
      ].join(' ')}
      style={{ height: TEAM_ROW }}
    >
      <span
        className="shrink-0 text-center leading-none"
        style={{ fontSize: isFinal ? '1.1rem' : '0.95rem', width: '1.3rem' }}
      >
        {team.flag}
      </span>
      <span
        className={[
          'truncate leading-tight',
          isWinner ? 'text-amber-400 font-bold' : 'text-white/85',
        ].join(' ')}
        style={{ fontSize: isFinal ? '0.75rem' : '0.7rem' }}
      >
        {team.name}
      </span>
    </button>
  );
}

/* ═══════════════════════════════ Match Node ═══════════════════════════════ */
function MatchNode({
  match, roundIdx, matchIdx, onPick,
}: {
  match: MatchNodeData; roundIdx: number; matchIdx: number;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const mh = perMatchH(roundIdx);
  const isFinal = roundIdx === 4;

  return (
    <div
      className="absolute left-0"
      style={{ top: matchY(roundIdx, matchIdx), width: NODE_W, height: mh }}
    >
      <div className={[
        'flex flex-col rounded-lg overflow-hidden border w-full h-full',
        isFinal
          ? 'border-amber-500/50 bg-white/[0.06]'
          : 'border-white/8 bg-white/[0.03]',
      ].join(' ')}>
        <TeamRow
          team={match.teamA} isWinner={match.winner === match.teamA?.id}
          canClick={match.canClick && !!match.teamA} isFinal={isFinal}
          onClick={() => match.teamA && onPick(match.id, match.teamA.id)}
        />
        <div className="w-full border-t border-white/5" />
        <TeamRow
          team={match.teamB} isWinner={match.winner === match.teamB?.id}
          canClick={match.canClick && !!match.teamB} isFinal={isFinal}
          onClick={() => match.teamB && onPick(match.id, match.teamB.id)}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════ Zoom ═══════════════════════════════ */
function ZoomControls({ scale, onChange }: { scale: number; onChange: (s: number) => void }) {
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
              : 'bg-navy-light/90 text-white/60 border-white/10 hover:bg-navy-light hover:text-white',
          ].join(' ')}
        >{Math.round(level * 100)}%</button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════ Connections ═══════════════════════════════ */
function Connections({ rounds }: { rounds: RoundData[] }) {
  const lines: { d: string; key: string }[] = [];
  const svgW = rounds.length * (NODE_W + COL_GAP) + CHAMPION_W + 20;

  for (let r = 0; r < rounds.length - 1; r++) {
    const fromX = r * (NODE_W + COL_GAP) + NODE_W;
    const toX = (r + 1) * (NODE_W + COL_GAP);
    const nextCount = rounds[r + 1].matches.length;

    for (let i = 0; i < nextCount; i++) {
      const a = i * 2, b = i * 2 + 1;
      const yA = matchCenterY(r, a);
      const yB = matchCenterY(r, b);
      const yT = matchCenterY(r + 1, i);
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
    const finalY = matchCenterY(lastR, 0);
    const champX = (lastR + 1) * (NODE_W + COL_GAP);
    lines.push({ d: `M ${finalX} ${finalY} L ${champX} ${finalY}`, key: 'c-champ' });
  }

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: svgW, height: TOTAL_H, zIndex: 0 }}>
      {lines.map(l => (
        <path key={l.key} d={l.d} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1"
          strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════ Champion ═══════════════════════════════ */
function ChampionCard({ champion, x }: { champion: { flag: string; name: string; nameEn: string }; x: number }) {
  const cardH = 120;
  const top = (TOTAL_H - cardH) / 2;
  return (
    <div className="absolute flex items-center justify-center" style={{ left: x, top, width: CHAMPION_W, height: cardH }}>
      <div
        className="text-center px-4 py-4 rounded-2xl w-full"
        style={{
          background: 'linear-gradient(160deg, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.06) 60%, transparent 100%)',
          border: '1.5px solid rgba(251,191,36,0.45)',
          boxShadow: '0 0 50px rgba(251,191,36,0.15), 0 0 100px rgba(251,191,36,0.06), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        <div className="text-[9px] font-bold tracking-[0.15em] uppercase text-amber-400/60 mb-1.5">Champion</div>
        <div className="text-4xl mb-1.5 drop-shadow-[0_0_16px_rgba(251,191,36,0.35)]">{champion.flag}</div>
        <div className="text-sm font-extrabold text-white mb-0.5">{champion.name}</div>
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
  const bracketWidth = rounds.length * (NODE_W + COL_GAP);
  const totalWidth = bracketWidth + CHAMPION_W + 20;

  return (
    <div className="relative">
      <ZoomControls scale={scale} onChange={setScale} />

      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-auto scrollbar-hide overscroll-x-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y pinch-zoom',
          maxHeight: 'calc(100vh - 180px)',
          paddingBottom: 24,
        }}
      >
        <div
          className="relative"
          style={{
            width: totalWidth * scale,
            height: TOTAL_H * scale,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            minWidth: totalWidth,
          }}
        >
          <Connections rounds={rounds} />

          {/* Round columns */}
          {rounds.map((round, roundIdx) => (
            <div key={roundIdx} className="absolute" style={{ left: roundIdx * (NODE_W + COL_GAP), top: 0, width: NODE_W }}>
              <div
                className="absolute text-center w-full font-bold text-white/40 tracking-wider whitespace-nowrap"
                style={{ top: TOP_PAD, height: HEADER_H, fontSize: '0.6rem', lineHeight: `${HEADER_H}px` }}
              >{round.title}</div>
              {round.matches.map((match, matchIdx) => (
                <MatchNode key={match.id} match={match} roundIdx={roundIdx} matchIdx={matchIdx} onPick={onPick} />
              ))}
            </div>
          ))}

          {/* Champion / Placeholder */}
          {champion
            ? <ChampionCard champion={champion} x={rounds.length * (NODE_W + COL_GAP)} />
            : (
              <div className="absolute flex items-center justify-center opacity-15"
                style={{ left: rounds.length * (NODE_W + COL_GAP), top: (TOTAL_H - 100) / 2, width: CHAMPION_W, height: 100 }}>
                <div className="text-center"><div className="text-4xl mb-1">🏆</div><div className="text-[10px] text-white/30">等待冠军</div></div>
              </div>
            )}
        </div>
      </div>

      {totalFilled < 5 && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 text-[11px] text-white/20 flex items-center gap-1 pointer-events-none">
          <span>← 滑动查看 →</span>
        </div>
      )}
    </div>
  );
}
