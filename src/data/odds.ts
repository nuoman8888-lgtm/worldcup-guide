// Betting odds data - for reference/analysis only
import { teams } from './teams';

export interface BookmakerOdds {
  bookmaker: string;
  homeWin: number;
  draw: number;
  awayWin: number;
}

export interface MatchOdds {
  matchId: string;
  odds: BookmakerOdds[];
  lastUpdated: string;
}

export function generateOdds(homeElo: number, awayElo: number): BookmakerOdds[] {
  const eloDiff = homeElo - awayElo;
  const homeWinProb = 1 / (1 + Math.pow(10, -eloDiff / 400));
  const awayWinProb = 1 / (1 + Math.pow(10, eloDiff / 400));
  const drawProb = Math.max(0, 1 - homeWinProb - awayWinProb);
  const margin = 1.08;

  const bookmakers = ['Bet365', 'Pinnacle', 'William Hill', '1xBet'];

  return bookmakers.map((bm, i) => {
    const jitter = (i - 1.5) * 0.03;
    return {
      bookmaker: bm,
      homeWin: Math.max(1.01, Math.round((margin / (homeWinProb + jitter)) * 100) / 100),
      draw: Math.max(1.01, Math.round((margin / (drawProb + jitter * 0.5)) * 100) / 100),
      awayWin: Math.max(1.01, Math.round((margin / (awayWinProb + jitter * 0.5)) * 100) / 100),
    };
  });
}

export function oddsToProbability(odds: number): number {
  return Math.round((1 / odds) * 1000) / 10;
}

export function getBestOdds(odds: BookmakerOdds[]): {
  bestHomeWin: number;
  bestDraw: number;
  bestAwayWin: number;
} {
  return {
    bestHomeWin: Math.max(...odds.map(o => o.homeWin)),
    bestDraw: Math.max(...odds.map(o => o.draw)),
    bestAwayWin: Math.max(...odds.map(o => o.awayWin)),
  };
}

export interface WinnerOdd {
  teamId: string;
  odds: Record<string, number>;
}

export function getChampionOdds(): WinnerOdd[] {
  return teams
    .map(t => ({
      teamId: t.id,
      odds: {
        'Bet365': Math.round(t.winOdds * (0.95 + Math.random() * 0.1) * 100) / 100,
        'Pinnacle': Math.round(t.winOdds * (0.93 + Math.random() * 0.14) * 100) / 100,
        'William Hill': Math.round(t.winOdds * (0.97 + Math.random() * 0.06) * 100) / 100,
      },
    }))
    .sort((a, b) => a.odds['Bet365'] - b.odds['Bet365']);
}
