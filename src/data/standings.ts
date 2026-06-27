// Standings — all real-time data now comes from /api/standings
// Team ELO data kept for championship probability calculations
import { teams, type Team, groups as staticGroups } from './teams';
import { allMatches } from './matches';
import { getTeam } from './teams';

export interface ChampionshipProb {
  teamId: string;
  probability: number;
}

export interface StaticStandingRow {
  position: number;
  team: { id: number; name: string; shortName: string; tla: string };
  playedGames: number; won: number; draw: number; lost: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number; points: number;
}

export interface StaticStandingGroup {
  group: string; type: string; table: StaticStandingRow[];
}

/** Generate static standings from completed match results */
export function generateStaticStandings(): StaticStandingGroup[] {
  const result: StaticStandingGroup[] = [];
  for (const g of staticGroups) {
    const teamStats: Record<string, { played: number; won: number; draw: number; lost: number; gf: number; ga: number; pts: number }> = {};
    for (const tid of g.teams) {
      teamStats[tid] = { played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
    }
    for (const m of allMatches) {
      if (m.group !== g.name || m.status !== 'finished') continue;
      if (m.homeScore == null || m.awayScore == null) continue;
      const h = teamStats[m.homeTeamId], a = teamStats[m.awayTeamId];
      if (!h || !a) continue;
      h.played++; a.played++;
      h.gf += m.homeScore; h.ga += m.awayScore;
      a.gf += m.awayScore; a.ga += m.homeScore;
      if (m.homeScore > m.awayScore) { h.won++; a.lost++; h.pts += 3; }
      else if (m.homeScore < m.awayScore) { a.won++; h.lost++; a.pts += 3; }
      else { h.draw++; a.draw++; h.pts += 1; a.pts += 1; }
    }
    const table: StaticStandingRow[] = Object.entries(teamStats)
      .map(([tid, s]) => {
        const t = getTeam(tid);
        return {
          position: 0,
          team: { id: 0, name: t?.name || tid, shortName: t?.name || tid, tla: tid.toUpperCase() },
          playedGames: s.played, won: s.won, draw: s.draw, lost: s.lost,
          goalsFor: s.gf, goalsAgainst: s.ga, goalDifference: s.gf - s.ga, points: s.pts,
        };
      })
      .sort((a, b) => b.points - a.points || (b.goalDifference - a.goalDifference) || (b.goalsFor - a.goalsFor));
    table.forEach((row, i) => { row.position = i + 1; });
    result.push({ group: `GROUP_${g.name}`, type: 'TOTAL', table });
  }
  return result;
}

/** Championship probability based on team ELO ratings */
export function getChampionshipProbabilities(): ChampionshipProb[] {
  const totalElo = teams.reduce((sum, t) => sum + t.elo, 0);
  const boosted = teams.map(t => Math.pow(t.elo / totalElo, 0.7));
  const boostedSum = boosted.reduce((s, v) => s + v, 0);

  return teams
    .map((t, i) => ({
      teamId: t.id,
      probability: Math.round((boosted[i] / boostedSum) * 1000) / 10,
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 20);
}
