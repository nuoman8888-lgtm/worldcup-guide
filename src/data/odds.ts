// Post-R32 champion odds — real market odds for remaining 16 teams
// Source: Bet365/Pinnacle/William Hill market consensus, updated 7/4
import { teams, type Team } from './teams';
import { allMatches, COMPLETED_MATCHES } from './matches';

/** Manual market odds for remaining 16 teams (R16 stage) */
const MANUAL_ODDS: Record<string, number> = {
  france: 2.87,
  argentina: 5.00,
  spain: 7.00,
  england: 11.00,
  brazil: 13.00,
  portugal: 13.00,
  colombia: 26.00,
  mexico: 29.00,
  usa: 29.00,
  morocco: 34.00,
  norway: 34.00,
  belgium: 41.00,
  switzerland: 51.00,
  canada: 251.00,
  egypt: 251.00,
  paraguay: 401.00,
};

export interface WinnerOdd {
  teamId: string;
  odds: Record<string, number>;
  advanced: boolean;
  groupResult?: string; // "1st", "2nd", "3rd-adv", "3rd-out", "4th"
  trend?: 'up' | 'down' | 'steady';
}

/* ── Calculate group stage performance per team ── */
interface TeamPerf {
  teamId: string; group: string;
  played: number; won: number; draw: number; lost: number;
  gf: number; ga: number; gd: number; pts: number;
  rank: number; advanced: boolean;
}

function computeGroupStage(): Map<string, TeamPerf> {
  const map = new Map<string, TeamPerf>();

  // Init
  for (const t of teams) {
    map.set(t.id, {
      teamId: t.id, group: t.group,
      played: 0, won: 0, draw: 0, lost: 0,
      gf: 0, ga: 0, gd: 0, pts: 0,
      rank: 0, advanced: false,
    });
  }

  // Apply completed results
  for (const match of allMatches) {
    if (match.stage !== 'group') continue;
    const score = COMPLETED_MATCHES[match.id];
    if (!score) continue;
    const h = map.get(match.homeTeamId);
    const a = map.get(match.awayTeamId);
    if (!h || !a) continue;
    const hg = score.homeScore, ag = score.awayScore;
    h.played++; a.played++;
    h.gf += hg; h.ga += ag;
    a.gf += ag; a.ga += hg;
    h.gd = h.gf - h.ga;
    a.gd = a.gf - a.ga;
    if (hg > ag) { h.won++; a.lost++; h.pts += 3; }
    else if (hg < ag) { a.won++; h.lost++; a.pts += 3; }
    else { h.draw++; a.draw++; h.pts += 1; a.pts += 1; }
  }

  // Rank within each group
  const groups = [...new Set(teams.map(t => t.group))].sort();
  const allPerfs: TeamPerf[] = [];
  for (const g of groups) {
    const members = [...map.values()].filter(p => p.group === g);
    members.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    members.forEach((p, i) => { p.rank = i + 1; });
    allPerfs.push(...members);
  }

  // Determine advancement (top 3 in each group → 36 teams, but only 32 advance)
  // Top 2 auto-advance; best 8 of 12 third-place teams advance
  const thirdPlace = allPerfs.filter(p => p.rank === 3);
  thirdPlace.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  const advancedThirds = new Set(thirdPlace.slice(0, 8).map(p => p.teamId));

  for (const p of allPerfs) {
    if (p.rank <= 2) p.advanced = true;
    else if (p.rank === 3 && advancedThirds.has(p.teamId)) p.advanced = true;
  }

  return map;
}

/* ── Post-group-stage odds calculation ── */
export function getChampionOdds(): WinnerOdd[] {
  const perf = computeGroupStage();
  const bookmakers = ['Bet365', 'Pinnacle', 'William Hill'];

  // Calculate adjusted odds for each team
  const results: WinnerOdd[] = [];

  for (const t of teams) {
    const p = perf.get(t.id);
    if (!p) continue;

    // Eliminated teams get very high odds (essentially out)
    if (!p.advanced) {
      const base = t.winOdds * 8 + 200; // heavily penalized
      results.push({
        teamId: t.id,
        odds: Object.fromEntries(bookmakers.map((bm, i) => [bm, Math.round(base * (0.95 + i * 0.04) * 100) / 100])),
        advanced: false,
        groupResult: p.rank === 3 ? '3rd-out' : '4th',
        trend: 'down',
      });
      continue;
    }

    // Use real market odds if available (R16 stage), otherwise algorithmic
    const manualOdds = MANUAL_ODDS[t.id];
    let adjusted: number;

    if (manualOdds) {
      // Use real market odds directly
      adjusted = manualOdds;
    } else {
      // Fallback: algorithmic for teams without manual odds
      const rankMultiplier = p.rank === 1 ? 0.85 : p.rank === 2 ? 1.05 : 1.25;
      const gdBonus = Math.max(0.82, 1 - p.gd * 0.01);
      const ptsFactor = Math.max(0.85, 1 - (p.pts - 4) * 0.025);
      const momentum = p.won >= 2 ? 0.92 : p.won === 0 ? 1.1 : 1.0;
      adjusted = t.winOdds * rankMultiplier * gdBonus * ptsFactor * momentum;
      adjusted = Math.max(4.0, Math.min(adjusted, 150));
    }

    // Trend indicator
    const preTournament = t.winOdds;
    const change = (preTournament - adjusted) / preTournament;
    const trend: 'up' | 'down' | 'steady' = change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'steady';

    // Group result label
    const groupResult = p.rank === 1 ? '1st' : p.rank === 2 ? '2nd' : '3rd-adv';

    results.push({
      teamId: t.id,
      odds: Object.fromEntries(bookmakers.map((bm, i) =>
        [bm, Math.round(adjusted * (0.94 + i * 0.05) * 100) / 100]
      )),
      advanced: true,
      groupResult,
      trend,
    });
  }

  // Sort: advanced first (by odds ascending), then eliminated (by odds)
  results.sort((a, b) => {
    if (a.advanced !== b.advanced) return a.advanced ? -1 : 1;
    return a.odds['Bet365'] - b.odds['Bet365'];
  });

  return results;
}

/** Get top advancing teams with performance context */
export function getPostGroupAnalysis() {
  const perf = computeGroupStage();
  const advancing = [...perf.values()].filter(p => p.advanced);

  // Top performers by points
  const topPerformers = [...advancing]
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd)
    .slice(0, 8);

  // Surprise packages (low pre-tournament odds but advanced)
  const surprises = [...advancing]
    .filter(p => {
      const t = teams.find(x => x.id === p.teamId);
      return t && t.winOdds > 50 && p.rank === 1;
    })
    .slice(0, 5);

  // Disappointments (high pre-tournament odds but eliminated)
  const disappointments = [...perf.values()]
    .filter(p => !p.advanced)
    .filter(p => {
      const t = teams.find(x => x.id === p.teamId);
      return t && t.winOdds < 30;
    })
    .slice(0, 5);

  return {
    advancingCount: advancing.length,
    byGroupRank: {
      winners: advancing.filter(p => p.rank === 1).length,
      runnersUp: advancing.filter(p => p.rank === 2).length,
      thirdPlace: advancing.filter(p => p.rank === 3).length,
    },
    topPerformers: topPerformers.map(p => ({
      teamId: p.teamId,
      name: teams.find(t => t.id === p.teamId)?.name || '',
      pts: p.pts,
      gd: p.gd,
    })),
    surprises: surprises.map(p => ({
      teamId: p.teamId,
      name: teams.find(t => t.id === p.teamId)?.name || '',
      preOdds: teams.find(t => t.id === p.teamId)?.winOdds || 0,
    })),
    disappointments: disappointments.map(p => ({
      teamId: p.teamId,
      name: teams.find(t => t.id === p.teamId)?.name || '',
      preOdds: teams.find(t => t.id === p.teamId)?.winOdds || 0,
    })),
  };
}
