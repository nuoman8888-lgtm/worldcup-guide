// AI Prediction accuracy tracker (localStorage)
const KEY = 'wc_ai_predictions';

interface StoredPrediction {
  matchId: number;
  predicted: { winner: string; homeScore: number; awayScore: number };
  actual?: { winner: string; homeScore: number; awayScore: number };
  date: string;
}

function getAll(): StoredPrediction[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function save(all: StoredPrediction[]) {
  try { localStorage.setItem(KEY, JSON.stringify(all.slice(-200))); } catch {}
}

export function recordPrediction(matchId: number, winner: string, homeScore: number, awayScore: number) {
  const all = getAll();
  if (all.find(p => p.matchId === matchId)) return;
  all.push({ matchId, predicted: { winner, homeScore, awayScore }, date: new Date().toISOString().slice(0, 10) });
  save(all);
}

export function checkResults(apiMatches: any[]) {
  const all = getAll();
  let changed = false;
  for (const p of all) {
    if (p.actual) continue;
    const m = apiMatches.find((x: any) => x.id === p.matchId && x.status === 'FINISHED');
    if (!m) continue;
    const h = m.score?.fullTime?.home, a = m.score?.fullTime?.away;
    if (h == null || a == null) continue;
    const actualWinner = h > a ? 'HOME' : a > h ? 'AWAY' : 'DRAW';
    p.actual = { winner: actualWinner, homeScore: h, awayScore: a };
    changed = true;
  }
  if (changed) save(all);
}

export function getStats() {
  const all = getAll();
  const judged = all.filter(p => p.actual);
  const total = judged.length;
  if (!total) return { total, winHit: 0, winHitPct: 0, scoreHit: 0, scoreHitPct: 0, recent: [] as StoredPrediction[] };

  let winHit = 0, scoreHit = 0;
  for (const p of judged) {
    const predWinner = p.predicted.homeScore > p.predicted.awayScore ? 'HOME' : p.predicted.homeScore < p.predicted.awayScore ? 'AWAY' : 'DRAW';
    if (predWinner === p.actual!.winner) winHit++;
    if (p.predicted.homeScore === p.actual!.homeScore && p.predicted.awayScore === p.actual!.awayScore) scoreHit++;
  }
  return {
    total, winHit, winHitPct: Math.round(winHit / total * 100),
    scoreHit, scoreHitPct: Math.round(scoreHit / total * 100),
    recent: judged.slice(-5).reverse(),
  };
}
