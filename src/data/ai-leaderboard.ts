// ── AI World Cup Lab: Leaderboard ──
// Real match results from matches.ts → COMPLETED_MATCHES
// Judgment: ✓ 命中 (exact) | ✓ 方向正确 (correct outcome) | ✗ (miss)

import { AI_MODELS, MODEL_ORDER, type ModelId } from './ai-models';
import { getPredictions } from './predictions';
import { getTeam } from './teams';
import { allMatches, applyCompletedResults, COMPLETED_MATCHES } from './matches';

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */

export interface StoredPrediction {
  matchId: string; date: string; time: string;  // time = "HH:MM" Beijing
  homeTeam: string; awayTeam: string;
  predictions: Record<ModelId, {
    predictedScore: string; winner: string;
    predictedHomeGoals: number; predictedAwayGoals: number;
  }>;
  result?: {
    homeScore: number; awayScore: number;
    actualWinner: string;
  };
}

export interface ModelStats {
  modelId: ModelId; name: string; icon: string; color: string;
  total: number;
  exactHits: number;      // ✓ 命中
  correctHits: number;    // ✓ 方向正确
  totalHits: number;      // exact + correct
  accuracy: number;       // 0-1
  currentStreak: number; bestStreak: number;
  recentResults: Array<'exact' | 'correct' | 'miss'>;
  points: number;         // exact*3 + correct*1
}

export interface LeaderboardEntry {
  rank: number; modelId: ModelId; name: string; icon: string; color: string;
  points: number; accuracy: number;
  totalHits: number; total: number;
  exactHits: number; correctHits: number;
  streak: number;
}

/* ═══════════════════════════════════════════════════════════
   Storage
   ═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'wc_ai_lab';
const DATA_VERSION = 10; // fix: seed all 104 matches (not just completed 16)

function load(): StoredPrediction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    // Version check: discard stale data from old deployments
    if (data._v !== DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return data.entries || [];
  } catch { return []; }
}

function save(data: StoredPrediction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      _v: DATA_VERSION,
      entries: data.slice(-200),
    }));
  } catch { /* quota */ }
}

/* ═══════════════════════════════════════════════════════════
   Judgment
   ═══════════════════════════════════════════════════════════ */

/** Judge one prediction against actual result. Handles "3-0 / 4-0" format. */
function judge(pred: { predictedScore: string; winner: string },
              result: { homeScore: number; awayScore: number; actualWinner: string })
: { category: 'exact' | 'correct' | 'miss'; points: number } {
  const scores = pred.predictedScore.split(' / ');  // ["3-0"] or ["3-0","4-0"]

  for (const s of scores) {
    const [h, a] = s.split('-').map(Number);
    if (isNaN(h) || isNaN(a)) continue;
    // Exact hit — any candidate matches
    if (h === result.homeScore && a === result.awayScore) {
      return { category: 'exact', points: 3 };
    }
  }

  // Check direction against primary score
  const primary = scores[0];
  const [ph, pa] = primary.split('-').map(Number);
  if (!isNaN(ph) && !isNaN(pa)) {
    const predWinner = ph > pa ? 'HOME' : pa > ph ? 'AWAY' : 'DRAW';
    const actualWinner = result.homeScore > result.awayScore ? 'HOME'
      : result.awayScore > result.homeScore ? 'AWAY' : 'DRAW';
    if (predWinner === actualWinner) {
      return { category: 'correct', points: 1 };
    }
  }

  return { category: 'miss', points: 0 };
}

/* ═══════════════════════════════════════════════════════════
   Recording & Checking
   ═══════════════════════════════════════════════════════════ */

export function recordLabPrediction(
  matchId: string, homeTeam: string, awayTeam: string,
  predictions: Record<ModelId, { predictedScore: string; winner: string }>,
  opts?: { date?: string; time?: string },
): void {
  const all = load();
  if (all.find(p => p.matchId === matchId)) return;
  // Use explicit date/time first, then look up from schedule by ID or team names, fall back to current time
  let date = opts?.date;
  let time = opts?.time;
  if (!date || !time) {
    const match = allMatches.find(m => m.id === matchId)
      ?? allMatches.find(m => {
        const ht = getTeam(m.homeTeamId);
        const at = getTeam(m.awayTeamId);
        return ht?.name === homeTeam && at?.name === awayTeam;
      });
    date = date ?? match?.date ?? new Date().toISOString().slice(0, 10);
    time = time ?? match?.time ?? (() => {
      const bj = new Date(Date.now() + 8 * 3600000);
      return `${String(bj.getUTCHours()).padStart(2,'0')}:${String(bj.getUTCMinutes()).padStart(2,'0')}`;
    })();
  }
  const entry: StoredPrediction = {
    matchId,
    date,
    time,
    homeTeam, awayTeam, predictions: {} as StoredPrediction['predictions'],
  };
  for (const mid of MODEL_ORDER) {
    const [h, a] = predictions[mid].predictedScore.split('-').map(Number);
    entry.predictions[mid] = {
      predictedScore: predictions[mid].predictedScore,
      winner: predictions[mid].winner,
      predictedHomeGoals: isNaN(h) ? 0 : h,
      predictedAwayGoals: isNaN(a) ? 0 : a,
    };
  }
  all.push(entry);
  save(all);
}

export function checkLabResults(apiMatches: any[]): void {
  const all = load();
  let changed = false;
  for (const entry of all) {
    if (entry.result) continue;
    // Match by ID first (API numeric), then fall back to team names (internal IDs, historical data)
    const m = apiMatches.find((x: any) =>
      x.status === 'FINISHED' && (
        String(x.id) === String(entry.matchId) ||
        (x.homeTeam?.name === entry.homeTeam && x.awayTeam?.name === entry.awayTeam)
      )
    );
    if (!m) continue;
    const h = m.score?.fullTime?.home, a = m.score?.fullTime?.away;
    if (h == null || a == null) continue;
    entry.result = {
      homeScore: h, awayScore: a,
      actualWinner: h > a ? entry.homeTeam : a > h ? entry.awayTeam : '平局',
    };
    changed = true;
  }
  if (changed) save(all);
}

/* ═══════════════════════════════════════════════════════════
   Stats & Leaderboard
   ═══════════════════════════════════════════════════════════ */

function computeModelStats(modelId: ModelId, entries: StoredPrediction[]): ModelStats {
  const judged = entries.filter(e => e.result);
  const info = AI_MODELS[modelId];

  let exactHits = 0, correctHits = 0, points = 0;
  let currentStreak = 0, bestStreak = 0;
  const recentResults: Array<'exact' | 'correct' | 'miss'> = [];

  const sorted = [...judged].sort((a, b) => a.date.localeCompare(b.date));
  for (const entry of sorted) {
    const pred = entry.predictions[modelId];
    const res = entry.result!;
    const j = judge(pred, res);

    if (j.category === 'exact') exactHits++;
    else if (j.category === 'correct') correctHits++;
    points += j.points;
    // Streak bonus: +1 for each consecutive hit after the first
    if (j.category !== 'miss') {
      if (currentStreak >= 1) points += 1;
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
    recentResults.push(j.category);
  }

  const total = judged.length;
  const totalHits = exactHits + correctHits;

  return {
    modelId, name: info.name, icon: info.icon, color: info.color,
    total, exactHits, correctHits, totalHits,
    accuracy: total > 0 ? totalHits / total : 0,
    currentStreak, bestStreak,
    recentResults: recentResults.slice(-10),
    points,
  };
}

export function getLeaderboard(): LeaderboardEntry[] {
  const entries = load();
  const stats = MODEL_ORDER.map(mid => computeModelStats(mid, entries));
  stats.sort((a, b) => b.points - a.points || b.accuracy - a.accuracy);

  return stats.map((s, i) => ({
    rank: i + 1,
    modelId: s.modelId, name: s.name, icon: s.icon, color: s.color,
    points: s.points, accuracy: s.accuracy,
    totalHits: s.totalHits, total: s.total,
    exactHits: s.exactHits, correctHits: s.correctHits,
    streak: s.currentStreak,
  }));
}

export function getModelDetail(modelId: ModelId): ModelStats | null {
  const entries = load();
  const info = AI_MODELS[modelId];
  if (entries.filter(e => e.result).length === 0) {
    return {
      modelId, name: info.name, icon: info.icon, color: info.color,
      total: 0, exactHits: 0, correctHits: 0, totalHits: 0,
      accuracy: 0, currentStreak: 0, bestStreak: 0,
      recentResults: [], points: 0,
    };
  }
  return computeModelStats(modelId, entries);
}

export function getRecentLabResults(limit: number = 20): StoredPrediction[] {
  return load().filter(e => e.result)
    .sort((a, b) => {
      // Sort by date+time descending (latest first)
      const da = a.date + 'T' + (a.time || '00:00') + ':00+08:00';
      const db = b.date + 'T' + (b.time || '00:00') + ':00+08:00';
      return new Date(db).getTime() - new Date(da).getTime();
    })
    .slice(0, limit);
}

export function syncLabPredictions(
  apiMatches: any[],
  newPredictions?: Array<{
    matchId: string; homeTeam: string; awayTeam: string;
    date?: string; time?: string;
    predictions: Record<ModelId, { predictedScore: string; winner: string }>;
  }>,
): void {
  if (newPredictions) {
    for (const np of newPredictions) {
      recordLabPrediction(np.matchId, np.homeTeam, np.awayTeam, np.predictions, { date: np.date, time: np.time });
    }
  }
  if (apiMatches?.length > 0) checkLabResults(apiMatches);
}

export function getLabSummary(): {
  totalMatches: number; totalJudged: number;
  models: Array<{
    modelId: ModelId; name: string; icon: string;
    points: number; accuracy: number; totalHits: number; total: number;
    streak: number; recentResults: Array<'exact' | 'correct' | 'miss'>;
  }>;
} {
  const entries = load();
  const judged = entries.filter(e => e.result);
  return {
    totalMatches: entries.length,
    totalJudged: judged.length,
    models: MODEL_ORDER.map(mid => {
      const s = computeModelStats(mid, entries);
      return {
        modelId: mid, name: s.name, icon: s.icon,
        points: s.points, accuracy: s.accuracy,
        totalHits: s.totalHits, total: s.total,
        streak: s.currentStreak, recentResults: s.recentResults,
      };
    }),
  };
}

/* ═══════════════════════════════════════════════════════════
   Seed from COMPLETED_MATCHES — real scores only
   ═══════════════════════════════════════════════════════════ */

export function seedHistoricalData(): void {
  const all = load();
  if (all.length > 0) return;

  applyCompletedResults();

  // Seed ALL matches (completed + upcoming) with predictions
  for (const match of allMatches) {
    if (match.homeTeamId === 'TBD' || match.awayTeamId === 'TBD') continue;
    const home = getTeam(match.homeTeamId);
    const away = getTeam(match.awayTeamId);
    if (!home || !away) continue;

    const predSet = getPredictions(match.id);
    if (!predSet) continue;

    const entry: StoredPrediction = {
      matchId: match.id, date: match.date, time: match.time,
      homeTeam: home.name, awayTeam: away.name,
      predictions: {} as StoredPrediction['predictions'],
    };

    // Attach result for completed matches
    const completedScore = COMPLETED_MATCHES[match.id];
    if (completedScore) {
      entry.result = {
        homeScore: completedScore.homeScore, awayScore: completedScore.awayScore,
        actualWinner: completedScore.homeScore > completedScore.awayScore ? home.name
          : completedScore.awayScore > completedScore.homeScore ? away.name : '平局',
      };
    }

    for (const mid of MODEL_ORDER) {
      const p = predSet.predictions[mid];
      const [h, a] = p.predictedScore.split('-').map(Number);
      entry.predictions[mid] = {
        predictedScore: p.predictedScore,
        winner: p.winner,
        predictedHomeGoals: isNaN(h) ? 0 : h,
        predictedAwayGoals: isNaN(a) ? 0 : a,
      };
    }
    all.push(entry);
  }
  save(all);
}

/** Get all stored predictions (including upcoming, not just judged) */
export function getAllLabPredictions(): StoredPrediction[] {
  return load()
    .sort((a, b) => {
      const da = a.date + 'T' + (a.time || '00:00') + ':00+08:00';
      const db = b.date + 'T' + (b.time || '00:00') + ':00+08:00';
      return new Date(da).getTime() - new Date(db).getTime();
    });
}
