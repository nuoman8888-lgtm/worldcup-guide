// Champion odds — reads from team reference data
// These are pre-tournament odds set before the World Cup
import { teams } from './teams';

export interface WinnerOdd {
  teamId: string;
  odds: Record<string, number>;
}

export function getChampionOdds(): WinnerOdd[] {
  const bookmakers = ['Bet365', 'Pinnacle', 'William Hill'];

  return teams
    .map(t => {
      const base = t.winOdds;
      return {
        teamId: t.id,
        odds: Object.fromEntries(bookmakers.map((bm, i) => [bm, Math.round(base * (0.95 + i * 0.04) * 100) / 100])),
      };
    })
    .sort((a, b) => a.odds['Bet365'] - b.odds['Bet365']);
}
