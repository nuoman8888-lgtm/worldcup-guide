'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { getAllTeams, groups } from '@/data/teams';
import { encodeShareData, getShareUrl } from '@/lib/share-utils';
import BracketTree, { type RoundData, type MatchNodeData } from '@/components/BracketTree';
import type { Team } from '@/data/teams';

const teams = getAllTeams();
const teamMap = new Map(teams.map(t => [t.id, t]));

/* ═══════════════════════════════════════════════════
   Per-tournament form noise — makes each simulation unique
   ═══════════════════════════════════════════════════ */

// ±60 ELO noise per team per tournament (form / injuries / morale)
let tourForm: Map<string, number> | null = null;

function adjElo(team: Team): number {
  if (!tourForm) return team.elo;
  return team.elo + (tourForm.get(team.id) ?? 0);
}

/* ═══════════════════════════════════════════════════
   ELO Probability Engine
   ═══════════════════════════════════════════════════ */

/** Probability that team with eloA beats team with eloB (0–1) */
function eloProb(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

/** Random outcome: true = team A wins, false = team B wins */
function eloWin(eloA: number, eloB: number): boolean {
  return Math.random() < eloProb(eloA, eloB);
}

/** Draw probability based on ELO gap */
function drawProb(eloA: number, eloB: number): number {
  const gap = Math.abs(eloA - eloB);
  let p = 0.26 - (gap / 400) * 0.10;
  return Math.max(0.14, Math.min(0.28, p));
}

interface MatchOutcome {
  winner: Team | null; // null = draw
  goalsA: number;
  goalsB: number;
}

/** Simulate a match between two teams using ELO + Poisson-like goals */
function playMatch(teamA: Team, teamB: Team): MatchOutcome {
  const eA = adjElo(teamA);
  const eB = adjElo(teamB);
  const pA = eloProb(eA, eB);
  const pDraw = drawProb(eA, eB);
  const roll = Math.random();

  let winner: Team | null;
  if (roll < pDraw) {
    winner = null; // draw
  } else if (roll < pDraw + (1 - pDraw) * pA) {
    winner = teamA;
  } else {
    winner = teamB;
  }

  // Simple goal model for tiebreaking
  const strengthA = eA / 400;
  const strengthB = eB / 400;
  const goalsA = Math.max(0, Math.round(strengthA - strengthB * 0.2 + (Math.random() - 0.3) * 2.5 + 1.0));
  const goalsB = Math.max(0, Math.round(strengthB - strengthA * 0.2 + (Math.random() - 0.3) * 2.5 + 0.7));

  return { winner, goalsA, goalsB };
}

/* ═══════════════════════════════════════════════════
   Group Stage Simulation (12 groups × 6 matches)
   ═══════════════════════════════════════════════════ */

interface GroupRecord {
  team: Team;
  pts: number;
  gf: number;  // goals for
  ga: number;  // goals against
  gd: number;  // goal difference
}

interface ThirdRecord {
  team: Team;
  pts: number;
  gd: number;
  gf: number;
}

interface GroupResult {
  groupName: string;
  winner: Team;
  runnerUp: Team;
  third: Team;
  thirdRecord: ThirdRecord;
  fourth: Team;
}

function simulateGroup(groupName: string): GroupResult {
  const g = groups.find(x => x.name === groupName)!;
  const groupTeams = g.teams.map(id => teamMap.get(id)!).filter(Boolean);
  const records = new Map<string, GroupRecord>();

  groupTeams.forEach(t => {
    records.set(t.id, { team: t, pts: 0, gf: 0, ga: 0, gd: 0 });
  });

  // Round-robin: 6 matches per group
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const t1 = groupTeams[i];
      const t2 = groupTeams[j];
      const outcome = playMatch(t1, t2);

      const r1 = records.get(t1.id)!;
      const r2 = records.get(t2.id)!;

      r1.gf += outcome.goalsA;
      r1.ga += outcome.goalsB;
      r2.gf += outcome.goalsB;
      r2.ga += outcome.goalsA;

      if (outcome.winner === null) {
        // Draw
        r1.pts += 1;
        r2.pts += 1;
      } else if (outcome.winner.id === t1.id) {
        r1.pts += 3;
      } else {
        r2.pts += 3;
      }
    }
  }

  // Update goal difference
  records.forEach(r => { r.gd = r.gf - r.ga; });

  // Sort: pts → gd → gf → elo (with form adjustment)
  const sorted = [...records.values()].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return adjElo(b.team) - adjElo(a.team);
  });

  return {
    groupName,
    winner: sorted[0].team,
    runnerUp: sorted[1].team,
    third: sorted[2].team,
    thirdRecord: { team: sorted[2].team, pts: sorted[2].pts, gd: sorted[2].gd, gf: sorted[2].gf },
    fourth: sorted[3].team,
  };
}

/* ═══════════════════════════════════════════════════
   2026 World Cup Knockout Bracket (Real FIFA Format)
   ═══════════════════════════════════════════════════ */

/** FIFA 2026 official: valid 3rd-place sources for each group winner that faces a 3rd-place team */
const THIRD_VALID: Record<string, string[]> = {
  'A': ['C','E','F','H','I'],
  'B': ['E','F','G','I','J'],
  'D': ['B','E','F','I','J'],
  'E': ['A','B','C','D','F'],
  'G': ['A','E','H','I','J'],
  'I': ['C','D','F','G','H'],
  'K': ['D','E','I','J','L'],
  'L': ['E','H','I','J','K'],
};

/**
 * Assign 8 best 3rd-place teams to R32 slots M1–M8.
 * Uses greedy matching with backtracking fallback.
 */
function assignThirdPlaceTeams(
  thirdTeams: { team: Team; pts: number; gd: number; gf: number }[],
): Record<string, Team> {
  // Sort by record: best first
  const sorted = [...thirdTeams].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return adjElo(b.team) - adjElo(a.team);
  });

  const slotGroups = ['A','B','D','E','G','I','K','L']; // FIFA: these 8 group winners face 3rd-place teams
  const assigned = new Map<string, Team>(); // slot group → team
  const used = new Set<string>(); // team ids already assigned

  // Greedy: assign each team to first valid available slot
  for (const third of sorted) {
    let assigned_ = false;
    for (const sg of slotGroups) {
      if (assigned.has(sg)) continue;
      if (THIRD_VALID[sg].includes(third.team.group)) {
        assigned.set(sg, third.team);
        used.add(third.team.id);
        assigned_ = true;
        break;
      }
    }
    // Fallback: assign to any available slot
    if (!assigned_) {
      for (const sg of slotGroups) {
        if (!assigned.has(sg)) {
          assigned.set(sg, third.team);
          used.add(third.team.id);
          break;
        }
      }
    }
  }

  const result: Record<string, Team> = {};
  assigned.forEach((team, sg) => { result[sg] = team; });
  return result;
}

/** Build R32 bracket from group stage results */
function buildR32Bracket(groupResults: GroupResult[]): Team[][] {
  const grMap = new Map(groupResults.map(g => [g.groupName, g]));

  // 12 group winners and runners-up
  const winners = Object.fromEntries(groupResults.map(g => [g.groupName, g.winner]));
  const runners = Object.fromEntries(groupResults.map(g => [g.groupName, g.runnerUp]));

  // Collect 3rd place teams with ACTUAL group stage records
  const thirdsWithRecord = groupResults.map(g => ({
    team: g.third,
    pts: g.thirdRecord.pts,
    gd: g.thirdRecord.gd,
    gf: g.thirdRecord.gf,
  }));

  // Sort by record: best 8 advance
  const bestThirds = [...thirdsWithRecord].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return adjElo(b.team) - adjElo(a.team);
  }).slice(0, 8);

  const thirdAssign = assignThirdPlaceTeams(bestThirds);

  // FIFA 2026 Official R32 matchups (16 matches)
  // [0-7] Group winners vs 3rd place (A,B,D,E,G,I,K,L)
  const m3rd: Team[][] = ['A','B','D','E','G','I','K','L'].map(g => [
    winners[g],
    thirdAssign[g],
  ]);

  // [8-11] Cross-group winners vs runners-up (FIFA official: C-F, H-J pairs)
  const m8:  Team[] = [winners['C'], runners['F']];  // 1C vs 2F
  const m9:  Team[] = [winners['F'], runners['C']];  // 1F vs 2C
  const m10: Team[] = [winners['H'], runners['J']];  // 1H vs 2J
  const m11: Team[] = [winners['J'], runners['H']];  // 1J vs 2H

  // [12-15] Runners-up matches (FIFA official: 2A-2B, 2D-2G, 2E-2I, 2K-2L)
  const m12: Team[] = [runners['A'], runners['B']];  // 2A vs 2B
  const m13: Team[] = [runners['D'], runners['G']];  // 2D vs 2G
  const m14: Team[] = [runners['E'], runners['I']];  // 2E vs 2I
  const m15: Team[] = [runners['K'], runners['L']];  // 2K vs 2L

  return [...m3rd, m8, m9, m10, m11, m12, m13, m14, m15];
}

/* ═══════════════════════════════════════════════════
   Full Tournament Simulation
   ═══════════════════════════════════════════════════ */

interface SimResult {
  champion: Team;
  runnerUp: Team;
  semiFinalists: Team[];    // 4 teams (SF participants)
  quarterFinalists: Team[]; // 8 teams (QF participants)
}

function simulateOnce(): SimResult {
  // ── Per-tournament form noise (±60 ELO per team) ──
  tourForm = new Map<string, number>();
  teamMap.forEach((_, id) => {
    // Box-Muller-ish: sum 3 uniforms for approximate normal distribution
    const noise = (Math.random() + Math.random() + Math.random() - 1.5) * 40;
    tourForm!.set(id, Math.round(noise));
  });

  // 1. Group stage: 12 groups
  const groupResults = groups.map(g => simulateGroup(g.name));

  // 2. Build R32 bracket
  const r32Matches = buildR32Bracket(groupResults);

  // 3. Simulate R32 → R16 → QF → SF → Final
  function playKnockout(match: Team[]): Team {
    const [t1, t2] = match;
    if (!t1) return t2;
    if (!t2) return t1;
    return eloWin(adjElo(t1), adjElo(t2)) ? t1 : t2;
  }

  // R32: 16 matches → 16 winners
  const r32Winners = r32Matches.map(m => playKnockout(m));

  // R16: FIFA 2026 official bracket pairings
  // Matches feed into QF-1 through QF-4, then SF-1 (upper) and SF-2 (lower)
  const r16Pairings: [number, number][] = [
    [3, 5],    // R16-1: 1E/3rd vs 1I/3rd  → QF-1
    [12, 9],   // R16-2: 2A/2B  vs 1F/2C   → QF-1
    [15, 10],  // R16-3: 2K/2L  vs 1H/2J   → QF-2
    [2, 4],    // R16-4: 1D/3rd vs 1G/3rd  → QF-2
    [8, 14],   // R16-5: 1C/2F  vs 2E/2I   → QF-3
    [0, 7],    // R16-6: 1A/3rd vs 1L/3rd  → QF-3
    [11, 13],  // R16-7: 1J/2H  vs 2D/2G   → QF-4
    [1, 6],    // R16-8: 1B/3rd vs 1K/3rd  → QF-4
  ];
  const r16Winners = r16Pairings.map(([a, b]) =>
    playKnockout([r32Winners[a], r32Winners[b]]));

  // QF: 4 matches
  // QF-1: Winner(R16-1) vs Winner(R16-2)
  // QF-2: Winner(R16-3) vs Winner(R16-4)
  // QF-3: Winner(R16-5) vs Winner(R16-6)
  // QF-4: Winner(R16-7) vs Winner(R16-8)
  const qfPairings = [[0, 1], [2, 3], [4, 5], [6, 7]];
  const qfWinners = qfPairings.map(([a, b]) =>
    playKnockout([r16Winners[a], r16Winners[b]]));

  // SF: 2 matches
  // SF-1 (upper): Winner(QF-1) vs Winner(QF-2) → qfWinners[0] vs qfWinners[1]
  // SF-2 (lower): Winner(QF-3) vs Winner(QF-4) → qfWinners[2] vs qfWinners[3]
  const sf1Winner = playKnockout([qfWinners[0], qfWinners[1]]);
  const sf2Winner = playKnockout([qfWinners[2], qfWinners[3]]);
  const sf1Loser = qfWinners[0].id === sf1Winner.id ? qfWinners[1] : qfWinners[0];
  const sf2Loser = qfWinners[2].id === sf2Winner.id ? qfWinners[3] : qfWinners[2];

  // Final: Winner(SF-1) vs Winner(SF-2)
  const champion = playKnockout([sf1Winner, sf2Winner]) ;
  const runnerUp = sf1Winner.id === champion.id ? sf2Winner : sf1Winner;

  // Gather results
  const semiFinalists = [champion, runnerUp, sf1Loser, sf2Loser];

  // QF participants (8 teams)
  const quarterFinalists = [
    ...qfWinners,
    // QF losers
    r16Winners[0].id === qfWinners[0].id ? r16Winners[1] : r16Winners[0],
    r16Winners[2].id === qfWinners[1].id ? r16Winners[3] : r16Winners[2],
    r16Winners[4].id === qfWinners[2].id ? r16Winners[5] : r16Winners[4],
    r16Winners[6].id === qfWinners[3].id ? r16Winners[7] : r16Winners[6],
  ];

  tourForm = null; // clean up
  return { champion, runnerUp, semiFinalists, quarterFinalists };
}

/* ═══════════════════════════════════════════════════
   Monte Carlo Simulation (≥ 10,000 iterations)
   ═══════════════════════════════════════════════════ */

interface AggregatedResults {
  // Per-team probabilities (all from the same 10k simulations)
  teams: Record<string, {
    team: Team;
    championProb: number;
    runnerUpProb: number;
    semiProb: number;
    quarterProb: number;
  }>;
  // Sorted rankings
  championRanking: { team: Team; prob: number }[];
  runnerUpRanking: { team: Team; prob: number }[];
  semiRanking: { team: Team; prob: number }[];
  quarterRanking: { team: Team; prob: number }[];
  // One representative simulation (where the most common champion won)
  representative: SimResult;
  totalSims: number;
}

/* ═══════════════════════════════════════════════════
   AI Prediction View — Mobile-First Cards
   ═══════════════════════════════════════════════════ */

const SIM_COUNT = 1000;

function AIPredictionView({ onManual }: { onManual: () => void }) {
  const [results, setResults] = useState<AggregatedResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [progress, setProgress] = useState(0);

  // Run simulations in chunks to avoid blocking the main thread
  const run = useCallback(() => {
    setLoading(true);
    setProgress(0);

    // Use requestIdleCallback or setTimeout to run in chunks
    const CHUNK = 300;
    const TOTAL = SIM_COUNT;

    const champCount: Record<string, number> = {};
    const runnerCount: Record<string, number> = {};
    const semiCount: Record<string, number> = {};
    const quartCount: Record<string, number> = {};
    const champSims: Record<string, SimResult> = {};

    let done = 0;

    function processChunk() {
      const start = performance.now();
      const end = Math.min(done + CHUNK, TOTAL);

      for (let n = done; n < end; n++) {
        const r = simulateOnce();
        champCount[r.champion.id] = (champCount[r.champion.id] || 0) + 1;
        runnerCount[r.runnerUp.id] = (runnerCount[r.runnerUp.id] || 0) + 1;
        r.semiFinalists.forEach(t => { semiCount[t.id] = (semiCount[t.id] || 0) + 1; });
        r.quarterFinalists.forEach(t => { quartCount[t.id] = (quartCount[t.id] || 0) + 1; });
        champSims[r.champion.id] = r;
      }

      done = end;
      setProgress(Math.round((done / TOTAL) * 100));

      if (done < TOTAL) {
        // Yield to browser between chunks
        setTimeout(processChunk, 0);
      } else {
        // All done — build results
        const pct = (c: number) => Math.round((c / TOTAL) * 1000) / 10;
        const allTeamIds = new Set([...Object.keys(champCount), ...Object.keys(runnerCount), ...Object.keys(semiCount), ...Object.keys(quartCount)]);
        const teamsProbs: Record<string, { team: Team; championProb: number; runnerUpProb: number; semiProb: number; quarterProb: number }> = {};
        allTeamIds.forEach(id => {
          const team = teamMap.get(id);
          if (team) {
            teamsProbs[id] = {
              team,
              championProb: pct(champCount[id] || 0),
              runnerUpProb: pct(runnerCount[id] || 0),
              semiProb: pct(semiCount[id] || 0),
              quarterProb: pct(quartCount[id] || 0),
            };
          }
        });

        const rank = (counter: Record<string, number>, limit: number) =>
          Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, limit)
            .map(([id, c]) => ({ team: teamMap.get(id)!, prob: pct(c) })).filter(x => x.team);

        const champEntries = Object.entries(champCount);
        const totalChamps = champEntries.reduce((sum, [, c]) => sum + c, 0);
        let roll = Math.random() * totalChamps;
        let selectedChampId = champEntries[0]?.[0] ?? '';
        for (const [id, c] of champEntries) {
          roll -= c;
          if (roll <= 0) { selectedChampId = id; break; }
        }

        setResults({
          teams: teamsProbs,
          championRanking: rank(champCount, 10),
          runnerUpRanking: rank(runnerCount, 10),
          semiRanking: rank(semiCount, 16),
          quarterRanking: rank(quartCount, 16),
          representative: champSims[selectedChampId] || simulateOnce(),
          totalSims: TOTAL,
        });
        setRunCount(c => c + 1);
        setLoading(false);
      }
    }

    setTimeout(processChunk, 50);
  }, []);

  // Auto-run on mount
  useEffect(() => { run(); }, [run]);

  if (loading || !results) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin text-4xl mb-4">⚽</div>
        <p className="text-gray-500 text-sm">正在运行 {SIM_COUNT.toLocaleString()} 次蒙特卡洛模拟...</p>
        {progress > 0 && (
          <div className="w-48 mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-xs text-gray-400 mt-1">{progress}%</p>
          </div>
        )}
        <p className="text-gray-400 text-xs mt-1">模拟完整小组赛 + 淘汰赛，非阻塞执行中</p>
      </div>
    );
  }

  const { representative, championRanking, teams } = results;
  const rep = representative;

  // All 4 semi-finalists from the representative simulation
  const semiTeams = rep.semiFinalists;

  return (
    <div className="max-w-lg mx-auto">
      {/* ═══ Champion Hero Card ═══ */}
      <div
        className="rounded-2xl p-6 shadow-xl text-center mb-6"
        style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%)',
          border: '2px solid #D4AF37',
        }}
      >
        <div className="text-xs font-bold tracking-widest uppercase text-navy/50 mb-2">
          🏆 AI 预测冠军
        </div>
        <div className="text-7xl mb-3">{rep.champion.flag}</div>
        <div className="text-2xl font-extrabold text-navy mb-1">{rep.champion.name}</div>
        <div className="text-sm text-navy/50 mb-3">{rep.champion.nameEn}</div>
        <div className="inline-flex items-baseline gap-1.5 bg-white/60 rounded-full px-4 py-1.5">
          <span className="text-4xl font-extrabold text-navy tabular-nums">
            {teams[rep.champion.id]?.championProb ?? 0}%
          </span>
          <span className="text-sm text-navy/60 font-medium">夺冠概率</span>
        </div>
      </div>

      {/* ═══ Champion Probability Ranking ═══ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-700">📊 夺冠概率 TOP 10</span>
        </div>
        {championRanking.slice(0, 10).map((c, i) => {
          const maxProb = championRanking[0]?.prob || 30;
          const barWidth = Math.max(3, (c.prob / maxProb) * 100);
          const isGold = i === 0;
          const isSilver = i === 1;
          const isBronze = i === 2;
          return (
            <div
              key={c.team.id}
              className={`flex items-center gap-3 px-5 py-3 ${
                i < 9 ? 'border-b border-gray-50' : ''
              } ${isGold ? 'bg-gold-50' : ''}`}
            >
              <span
                className={`text-xs font-bold w-5 tabular-nums ${
                  isGold ? 'text-gold' : isSilver ? 'text-gray-400' : isBronze ? 'text-amber-600' : 'text-gray-400'
                }`}
              >
                {i + 1}
              </span>
              <span className="text-2xl shrink-0">{c.team.flag}</span>
              <span className="font-semibold text-gray-900 text-sm flex-1 truncate">
                {c.team.name}
              </span>
              <div className="hidden sm:block w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isGold ? 'bg-gold' : 'bg-navy/60'}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 w-14 text-right tabular-nums">
                {c.prob}%
              </span>
            </div>
          );
        })}
      </div>

      {/* ═══ Runner-up Card ═══ */}
      <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm text-center mb-4">
        <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
          🥈 亚军预测
        </div>
        <div className="text-5xl mb-2">{rep.runnerUp.flag}</div>
        <div className="text-lg font-extrabold text-gray-900 mb-0.5">{rep.runnerUp.name}</div>
        <div className="text-xs text-gray-400 mb-2">{rep.runnerUp.nameEn}</div>
        <div className="inline-flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-navy tabular-nums">
            {teams[rep.runnerUp.id]?.runnerUpProb ?? 0}%
          </span>
          <span className="text-xs text-gray-400">亚军概率</span>
        </div>
      </div>

      {/* ═══ Semi-final Card ═══ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-700">🥉 四强预测</span>
          <span className="text-[11px] text-gray-400 ml-2">同一轮模拟结果</span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          {semiTeams.map((team, i) => {
            const probs = teams[team.id];
            const isChamp = team.id === rep.champion.id;
            const isRunner = team.id === rep.runnerUp.id;
            return (
              <div
                key={team.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${
                  i > 1 ? 'border-t border-gray-100' : ''
                }`}
              >
                <span className="text-3xl shrink-0">{team.flag}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 text-sm">{team.name}</span>
                    {isChamp && <span className="text-[10px] bg-gold/20 text-gold-dark px-1.5 py-0.5 rounded-full font-bold">冠军</span>}
                    {isRunner && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">亚军</span>}
                  </div>
                  <div className="text-[11px] text-gray-400">{team.nameEn}</div>
                </div>
                <div className="ml-auto text-right shrink-0">
                  <div className="text-lg font-extrabold text-navy tabular-nums">
                    {probs?.semiProb ?? 0}%
                  </div>
                  <div className="text-[10px] text-gray-400">四强率</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Quarter-final Card ═══ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-700">⚽ 八强预测</span>
          <span className="text-[11px] text-gray-400 ml-2">含四强4队 + 八强4队</span>
        </div>
        <div className="divide-y divide-gray-50">
          {rep.quarterFinalists.map((team) => {
            const probs = teams[team.id];
            const isSemi = semiTeams.some(s => s.id === team.id);
            return (
              <div
                key={team.id}
                className={`flex items-center gap-3 px-4 py-3 ${isSemi ? 'bg-gray-50/50' : ''}`}
              >
                <span className="text-2xl shrink-0">{team.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{team.name}</div>
                  <div className="text-[11px] text-gray-400">{team.nameEn}</div>
                </div>
                {isSemi && (
                  <span className="text-[10px] bg-navy/10 text-navy px-1.5 py-0.5 rounded-full font-bold shrink-0">
                    四强
                  </span>
                )}
                <div className="text-right shrink-0 ml-2">
                  <div className="text-base font-extrabold text-navy tabular-nums">
                    {probs?.quarterProb ?? 0}%
                  </div>
                  <div className="text-[10px] text-gray-400">八强率</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Actions ═══ */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
        <button
          onClick={run}
          disabled={loading}
          className="px-6 py-3 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy-light transition-colors shadow-sm disabled:opacity-50"
        >
          🔄 重新 AI 预测
        </button>
        <button
          onClick={onManual}
          className="px-6 py-3 bg-white text-navy rounded-xl text-sm font-bold border-2 border-navy/15 hover:bg-navy/5 transition-colors"
        >
          ✋ 手动模拟淘汰赛 →
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">
        基于 {results.totalSims.toLocaleString()} 次蒙特卡洛模拟（完整小组赛 + 淘汰赛推演）
        {runCount > 1 && <span className="text-gray-300"> · 已运行 {runCount} 次</span>}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Manual Bracket View — Interactive Knockout Tree
   ═══════════════════════════════════════════════════ */

type Picks = Record<string, string>;

interface Slot {
  id: string; date: string; time: string; city: string; feedsFrom: string[];
}

const R32: Slot[] = Array.from({ length: 16 }, (_, i) => ({
  id: `r32-${i + 1}`, date: '', time: '', city: '', feedsFrom: [],
}));

// FIFA 2026 official R16 feedsFrom (R32 1-based IDs)
const R16_M: Slot[] = [
  { id: 'r16-1', date: '', time: '', city: '', feedsFrom: ['r32-4', 'r32-6'] },    // R32[3],[5]
  { id: 'r16-2', date: '', time: '', city: '', feedsFrom: ['r32-13', 'r32-10'] },   // R32[12],[9]
  { id: 'r16-3', date: '', time: '', city: '', feedsFrom: ['r32-16', 'r32-11'] },   // R32[15],[10]
  { id: 'r16-4', date: '', time: '', city: '', feedsFrom: ['r32-3', 'r32-5'] },     // R32[2],[4]
  { id: 'r16-5', date: '', time: '', city: '', feedsFrom: ['r32-9', 'r32-15'] },    // R32[8],[14]
  { id: 'r16-6', date: '', time: '', city: '', feedsFrom: ['r32-1', 'r32-8'] },     // R32[0],[7]
  { id: 'r16-7', date: '', time: '', city: '', feedsFrom: ['r32-12', 'r32-14'] },   // R32[11],[13]
  { id: 'r16-8', date: '', time: '', city: '', feedsFrom: ['r32-2', 'r32-7'] },     // R32[1],[6]
];

// FIFA 2026 official QF feedsFrom (R16 IDs)
const QF_M: Slot[] = [
  { id: 'qf-1', date: '', time: '', city: '', feedsFrom: ['r16-1', 'r16-2'] },
  { id: 'qf-2', date: '', time: '', city: '', feedsFrom: ['r16-3', 'r16-4'] },
  { id: 'qf-3', date: '', time: '', city: '', feedsFrom: ['r16-5', 'r16-6'] },
  { id: 'qf-4', date: '', time: '', city: '', feedsFrom: ['r16-7', 'r16-8'] },
];

// FIFA 2026 official SF feedsFrom (QF IDs)
const SF_M: Slot[] = [
  { id: 'sf-1', date: '', time: '', city: '', feedsFrom: ['qf-1', 'qf-2'] },
  { id: 'sf-2', date: '', time: '', city: '', feedsFrom: ['qf-3', 'qf-4'] },
];

const FINAL_M: Slot[] = [
  { id: 'final', date: '', time: '', city: '', feedsFrom: ['sf-1', 'sf-2'] },
];

interface SeedData {
  id: string; date: string; city: string;
  teams: Array<{ id: string; name: string; flag: string; winner: boolean }>;
  winner: Team | null; canClick: boolean; isFinal: boolean;
}

// ── Module-level bracket helpers (shared by desktop + mobile) ──

const top32 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 32);

// Match labels for mobile panels
const R32_LABELS = Array.from({ length: 16 }, (_, i) => `M${i + 1}`);
const R16_LABELS = Array.from({ length: 8 }, (_, i) => `R16-${'①②③④⑤⑥⑦⑧'[i]}`);
const QF_LABELS = Array.from({ length: 4 }, (_, i) => `¼决赛-${'①②③④'[i]}`);
const SF_LABELS = ['半决赛-①', '半决赛-②'];
const FINAL_LABEL = ['🏆 决赛'];

type SectionId = 'upper' | 'lower' | 'qf' | 'sf' | 'final';

interface SectionDef {
  id: SectionId;
  title: string;
  matchCount: number;
  slots: Slot[];
  labels: string[];
}

const SECTION_DEFS: SectionDef[] = [
  {
    // QF-1 + QF-2 → SF-1 (Upper bracket)
    id: 'upper', title: '上半区', matchCount: 12,
    slots: [R32[3], R32[5], R32[12], R32[9], R32[15], R32[10], R32[2], R32[4], R16_M[0], R16_M[1], R16_M[2], R16_M[3]],
    labels: [R32_LABELS[3], R32_LABELS[5], R32_LABELS[12], R32_LABELS[9], R32_LABELS[15], R32_LABELS[10], R32_LABELS[2], R32_LABELS[4], R16_LABELS[0], R16_LABELS[1], R16_LABELS[2], R16_LABELS[3]],
  },
  {
    // QF-3 + QF-4 → SF-2 (Lower bracket)
    id: 'lower', title: '下半区', matchCount: 12,
    slots: [R32[8], R32[14], R32[0], R32[7], R32[11], R32[13], R32[1], R32[6], R16_M[4], R16_M[5], R16_M[6], R16_M[7]],
    labels: [R32_LABELS[8], R32_LABELS[14], R32_LABELS[0], R32_LABELS[7], R32_LABELS[11], R32_LABELS[13], R32_LABELS[1], R32_LABELS[6], R16_LABELS[4], R16_LABELS[5], R16_LABELS[6], R16_LABELS[7]],
  },
  {
    id: 'qf', title: '八强', matchCount: 4,
    slots: QF_M, labels: QF_LABELS,
  },
  {
    id: 'sf', title: '四强', matchCount: 2,
    slots: SF_M, labels: SF_LABELS,
  },
  {
    id: 'final', title: '决赛', matchCount: 1,
    slots: FINAL_M, labels: FINAL_LABEL,
  },
];

/** Determine which section(s) should be expanded by default based on pick progress */
function computeCurrentStage(picks: Picks): Set<SectionId> {
  const hasAny = Object.keys(picks).length > 0;
  if (!hasAny) return new Set<SectionId>(['upper', 'lower']);

  for (const section of SECTION_DEFS) {
    for (const slot of section.slots) {
      if (picks[slot.id]) continue;
      // Check if both teams are known (match is "pickable")
      let t1: Team | null = null;
      let t2: Team | null = null;
      if (slot.feedsFrom.length === 2) {
        t1 = teamMap.get(picks[slot.feedsFrom[0]]) ?? null;
        t2 = teamMap.get(picks[slot.feedsFrom[1]]) ?? null;
      } else {
        const idx = R32.indexOf(slot);
        t1 = top32[idx * 2] ?? null;
        t2 = top32[idx * 2 + 1] ?? null;
      }
      if (t1 && t2) return new Set<SectionId>([section.id]);
    }
  }
  return new Set<SectionId>(['final']);
}

// ── Mobile-only components ──

/** Single match card for mobile accordion panels */
function MobileMatchCard({
  seed, label, onPick,
}: {
  seed: SeedData; label: string; onPick: (teamId: string) => void;
}) {
  const t1 = seed.teams[0];
  const t2 = seed.teams[1];

  function teamBtn(team: typeof t1, onSelect: (() => void) | null) {
    return (
      <button
        onClick={onSelect || undefined}
        disabled={!onSelect}
        className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
          team.winner
            ? 'bg-gold-50 border-2 border-gold shadow-sm'
            : onSelect
              ? 'bg-gray-50 border border-gray-200 active:bg-gray-100 active:scale-[0.98]'
              : 'bg-gray-50/50 border border-gray-100 opacity-50 cursor-default'
        }`}
      >
        <span className="text-2xl mb-1">
          {team.flag !== '?' ? team.flag : '❓'}
        </span>
        <span className={`text-xs font-semibold text-center leading-tight truncate max-w-full ${
          team.winner ? 'text-gold-dark' : team.name === '待定' ? 'text-gray-400' : 'text-gray-800'
        }`}>
          {team.name}
        </span>
        {team.winner && <span className="text-gold text-sm mt-0.5 font-bold">✓</span>}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {label}
        </span>
        {seed.winner && (
          <span className="text-xs font-bold text-gold-dark">
            ✓ {seed.winner.flag} {seed.winner.name}
          </span>
        )}
      </div>
      <div className="flex items-stretch gap-2">
        {teamBtn(t1, seed.canClick && t1.id ? () => onPick(t1.id) : null)}
        <div className="flex items-center shrink-0">
          <span className="text-xs font-bold text-gray-300">VS</span>
        </div>
        {teamBtn(t2, seed.canClick && t2.id ? () => onPick(t2.id) : null)}
      </div>
    </div>
  );
}

/** Collapsible accordion panel for one bracket section */
function AccordionSection({
  title, matchCount, completed, seeds, labels, expanded, onToggle, onPick,
}: {
  title: string; matchCount: number; completed: number;
  seeds: SeedData[]; labels: string[];
  expanded: boolean; onToggle: () => void;
  onPick: (slotId: string, teamId: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-3 shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-gray-900 text-sm">{title}</span>
          <span className="text-[11px] text-gray-400">({matchCount}场)</span>
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
            completed === matchCount ? 'bg-green-100 text-green-700' :
            completed > 0 ? 'bg-navy/10 text-navy' : 'bg-gray-100 text-gray-400'
          }`}>
            {completed}/{matchCount}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-0 max-h-[65vh] overflow-y-auto scrollbar-hide">
          {seeds.map((seed, i) => (
            <MobileMatchCard key={seed.id} seed={seed} label={labels[i]}
              onPick={(teamId) => onPick(seed.id, teamId)} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Fixed bottom progress bar */
function FloatingProgressBar({ filled, total }: { filled: number; total: number }) {
  const pct = Math.round((filled / total) * 100);
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-navy/95 backdrop-blur-sm border-t border-white/10 px-4 py-3"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-white/60 shrink-0 tabular-nums">
          {filled}/31 场
        </span>
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-amber-400 w-8 text-right tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}

function ManualBracketView({ onBack }: { onBack: () => void }) {
  const [picks, setPicks] = useState<Picks>({});
  const [started, setStarted] = useState(false);

  const championId = picks['final'] || null;
  const champion = championId ? teamMap.get(championId) ?? null : null;

  const pick = useCallback((slotId: string, teamId: string) => {
    setPicks(prev => ({ ...prev, [slotId]: teamId }));
    setStarted(true);
  }, []);

  function winnerOf(slotId: string): Team | null {
    const wid = picks[slotId];
    return wid ? (teamMap.get(wid) ?? null) : null;
  }

  function quickPredict() {
    const p: Picks = {};
    const top32 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 32);
    R32.forEach((s, i) => {
      const t1 = top32[i * 2], t2 = top32[i * 2 + 1];
      if (t1 && t2) p[s.id] = eloWin(t1.elo, t2.elo) ? t1.id : t2.id;
    });
    [R16_M, QF_M, SF_M, FINAL_M].forEach(round => {
      round.forEach(s => {
        const t1 = teamMap.get(p[s.feedsFrom[0]]);
        const t2 = teamMap.get(p[s.feedsFrom[1]]);
        if (t1 && t2) p[s.id] = eloWin(t1.elo, t2.elo) ? t1.id : t2.id;
      });
    });
    setPicks(p); setStarted(true);
  }

  function reset() { setPicks({}); setStarted(false); }

  // ── Mobile accordion state ──
  const [mobileSection, setMobileSection] = useState<SectionId | null>(null);

  // ── Share state ──
  const [shareCopied, setShareCopied] = useState(false);

  const expandedSet = useMemo(() => {
    if (mobileSection !== null) return new Set<SectionId>([mobileSection]);
    return computeCurrentStage(picks);
  }, [mobileSection, picks]);

  function buildSeed(slot: Slot, isFinal: boolean, roundSlots: Slot[]): SeedData {
    const w = winnerOf(slot.id);
    let t1: Team | null = null, t2: Team | null = null;
    if (slot.feedsFrom.length === 2) {
      t1 = winnerOf(slot.feedsFrom[0]);
      t2 = winnerOf(slot.feedsFrom[1]);
    } else {
      const idx = roundSlots.indexOf(slot);
      t1 = top32[idx * 2] || null;
      t2 = top32[idx * 2 + 1] || null;
    }
    return {
      id: slot.id, date: '', city: '',
      teams: [
        {
          id: t1?.id || '',
          name: t1?.name || '待定',
          flag: t1?.flag || '?',
          winner: !!w && w.id === t1?.id,
        },
        {
          id: t2?.id || '',
          name: t2?.name || '待定',
          flag: t2?.flag || '?',
          winner: !!w && w.id === t2?.id,
        },
      ],
      winner: w,
      canClick: !w && !!t1 && !!t2,
      isFinal,
    };
  }

  const roundData = useMemo(() => [
    { title: '32 强', seeds: R32.map(s => buildSeed(s, false, R32)) },
    { title: '16 强', seeds: R16_M.map(s => buildSeed(s, false, R16_M)) },
    { title: '¼ 决赛', seeds: QF_M.map(s => buildSeed(s, false, QF_M)) },
    { title: '半决赛', seeds: SF_M.map(s => buildSeed(s, false, SF_M)) },
    { title: '决赛', seeds: FINAL_M.map(s => buildSeed(s, true, FINAL_M)) },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [picks]);

  // ── Build MatchNodeData for BracketTree ──
  function buildMatchNode(slot: Slot, roundSlots: Slot[]): MatchNodeData {
    const w = winnerOf(slot.id);
    let t1: Team | null = null, t2: Team | null = null;
    if (slot.feedsFrom.length === 2) {
      t1 = winnerOf(slot.feedsFrom[0]);
      t2 = winnerOf(slot.feedsFrom[1]);
    } else {
      const idx = roundSlots.indexOf(slot);
      t1 = top32[idx * 2] || null;
      t2 = top32[idx * 2 + 1] || null;
    }
    return {
      id: slot.id,
      teamA: t1 ? { id: t1.id, name: t1.name, flag: t1.flag } : null,
      teamB: t2 ? { id: t2.id, name: t2.name, flag: t2.flag } : null,
      winner: w?.id || null,
      canClick: !w && !!t1 && !!t2,
    };
  }

  const bracketRounds: RoundData[] = useMemo(() => [
    { title: '32 强', matches: R32.map(s => buildMatchNode(s, R32)) },
    { title: '16 强', matches: R16_M.map(s => buildMatchNode(s, R16_M)) },
    { title: '¼ 决赛', matches: QF_M.map(s => buildMatchNode(s, QF_M)) },
    { title: '半决赛', matches: SF_M.map(s => buildMatchNode(s, SF_M)) },
    { title: '决赛', matches: FINAL_M.map(s => buildMatchNode(s, FINAL_M)) },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [picks]);

  // ── Mobile sections: seed data for accordion panels ──
  const mobileSections = SECTION_DEFS.map(section => {
    const seeds = section.slots.map(slot => {
      const isR32Round = slot.feedsFrom.length === 0;
      return buildSeed(slot, slot.id === 'final', isR32Round ? R32 : section.slots);
    });
    const completed = seeds.filter(s => s.winner !== null).length;
    return { ...section, seeds, completed };
  });

  const filled = [...R32, ...R16_M, ...QF_M, ...SF_M, ...FINAL_M].filter(
    s => picks[s.id]
  ).length;
  const total = 31;
  const progress = Math.round((filled / total) * 100);

  return (
    <div className="max-w-full">
      {/* Back + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          ← 返回 AI 预测
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={quickPredict}
            className="px-4 py-2 bg-amber-500 text-navy rounded-lg text-sm font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
          >
            ⚡ AI 一键填充
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-white/10 text-white/80 rounded-lg text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors"
          >
            🔄 重置
          </button>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-white/40">
          <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="tabular-nums font-bold text-white/60">{progress}%</span>
        </div>
      </div>

      {/* Share button — only when 100% complete */}
      {filled === total && (
        <div className="mb-4 text-center">
          <button
            onClick={async () => {
              const encoded = encodeShareData(picks);
              const url = getShareUrl(encoded);
              try {
                await navigator.clipboard.writeText(url);
              } catch {
                const input = document.createElement('input');
                input.value = url;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
              }
              setShareCopied(true);
              setTimeout(() => setShareCopied(false), 2000);
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-navy rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-amber-400/30 transition-all shadow-md shadow-amber-400/20"
          >
            {shareCopied ? '✅ 链接已复制！' : '📤 分享我的预测'}
          </button>
          {shareCopied && (
            <p className="text-xs text-amber-400/70 mt-2 font-medium">
              链接已复制到剪贴板，发送给朋友即可
            </p>
          )}
        </div>
      )}

      {/* BracketTree — all screen sizes */}
      <BracketTree
        rounds={bracketRounds}
        champion={champion ? { flag: champion.flag, name: champion.name, nameEn: champion.nameEn } : null}
        totalFilled={filled}
        totalSlots={total}
        onPick={(slotId, teamId) => pick(slotId, teamId)}
      />
      <FloatingProgressBar filled={filled} total={31} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════ */

export default function BracketView() {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">
          🏆 淘汰赛预测器
        </h1>
        <p className="text-white/40 text-sm">
          {mode === 'ai'
            ? `ELO 概率模拟 · ${SIM_COUNT.toLocaleString()} 次蒙特卡洛推演（含完整小组赛）`
            : '逐场手动选择 · 点击球队晋级下一轮'}
        </p>
      </div>

      {mode === 'ai' ? (
        <AIPredictionView onManual={() => setMode('manual')} />
      ) : (
        <ManualBracketView onBack={() => setMode('ai')} />
      )}
    </div>
  );
}
