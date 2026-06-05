// 2026 World Cup Group Standings
import { groups } from './teams';
import { teams, type Team } from './teams';

export interface StandingRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface GroupStandings {
  groupName: string;
  standings: StandingRow[];
}

export function getInitialStandings(): GroupStandings[] {
  return groups.map(g => ({
    groupName: g.name,
    standings: g.teams.map(teamId => ({
      teamId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    })),
  }));
}

export function getSimulatedStandings(): GroupStandings[] {
  // Return placeholder data (all zeros) — real data will come from API later
  return getInitialStandings();
}

export interface ChampionshipProb {
  teamId: string;
  probability: number;
}

export function getChampionshipProbabilities(): ChampionshipProb[] {
  const totalElo = teams.reduce((sum, t) => sum + t.elo, 0);

  const boostedValues = teams.map(t => Math.pow(t.elo / totalElo, 0.7));
  const boostedSum = boostedValues.reduce((s, v) => s + v, 0);

  return teams
    .map((t, i) => ({
      teamId: t.id,
      probability: Math.round((boostedValues[i] / boostedSum) * 1000) / 10,
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 20);
}
