// Standings — all real-time data now comes from /api/standings
// Team ELO data kept for championship probability calculations
import { teams, type Team } from './teams';

export interface ChampionshipProb {
  teamId: string;
  probability: number;
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
