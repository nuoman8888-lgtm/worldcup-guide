// ── AI World Cup Lab: 4-Model Prediction Engine ──
// Claude · ChatGPT · DeepSeek · 千问 (Qwen)
// Each model has a distinct "personality" — different weights for ELO, form, FIFA rank.
//
// Philosophy: We don't care which AI predicts the "right" score.
// We care which AI understands football best. They compete against each other.

import { getTeam, type Team } from '@/data/teams';

/* ═══════════════════════════════════════════════════════════
   Model Definitions
   ═══════════════════════════════════════════════════════════ */

export interface ModelInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  description: string;
  /** What this model weights most in predictions */
  personality: string;
}

export const AI_MODELS: Record<string, ModelInfo> = {
  claude: {
    id: 'claude',
    name: 'Claude',
    icon: '🧠',
    color: '#7C3AED',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/25',
    textClass: 'text-purple-300',
    description: 'ELO至上，保守稳健',
    personality: 'ELO权重90%，FIFA排名辅助，偏好低比分、稳健预测，极少预测冷门',
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '🤖',
    color: '#10A37F',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/25',
    textClass: 'text-emerald-300',
    description: '数据均衡，中庸之道',
    personality: 'ELO+FIFA排名+历史战绩均衡加权，预测偏中庸，不激进也不保守',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔮',
    color: '#3B82F6',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/25',
    textClass: 'text-blue-300',
    description: '状态为王，敢猜冷门',
    personality: '近期状态权重最高，敢于预测冷门，看好状态火热的弱队爆冷',
  },
  qwen: {
    id: 'qwen',
    name: '千问',
    icon: '🌊',
    color: '#F59E0B',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/25',
    textClass: 'text-amber-300',
    description: '攻击至上，高比分党',
    personality: '倾向高比分、进攻型预测，重视球队攻击力和近期进球数',
  },
};

export const MODEL_ORDER = ['claude', 'chatgpt', 'deepseek', 'qwen'] as const;
export type ModelId = typeof MODEL_ORDER[number];

/* ═══════════════════════════════════════════════════════════
   Prediction Result Types
   ═══════════════════════════════════════════════════════════ */

export interface ModelPrediction {
  modelId: ModelId;
  predictedScore: string;
  winner: string;         // team name or '平局'
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: number;     // 0-100
  reasoning: string;
}

export interface MatchPredictionSet {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeFlag: string;
  awayFlag: string;
  predictions: Record<ModelId, ModelPrediction>;
  /** Consensus: which side the majority of models pick */
  consensus: { side: string; modelCount: number; total: number };
  generatedAt: string; // ISO date
}

/* ═══════════════════════════════════════════════════════════
   Per-Model Prediction Logic
   Each model has unique weights → different predictions
   ═══════════════════════════════════════════════════════════ */

/** ELO → expected win probability (0-1) */
function eloWinProb(homeElo: number, awayElo: number): number {
  return 1 / (1 + Math.pow(10, -(homeElo - awayElo) / 400));
}

/** Form score: +1 per win, -1 per loss, capped [-3, 3] */
function formScore(team: Team): number {
  let s = 0;
  for (const r of team.recentForm) {
    if (r === 'W') s++;
    else if (r === 'L') s--;
  }
  return Math.max(-3, Math.min(3, s));
}

/** Normalize 3 probabilities to sum to 100, integer percentages */
function normalize(h: number, d: number, a: number): [number, number, number] {
  const total = h + d + a;
  if (total === 0) return [34, 33, 33];
  let hh = Math.round((h / total) * 100);
  let dd = Math.round((d / total) * 100);
  let aa = 100 - hh - dd;
  // Fix rounding drift
  if (aa < 0) { dd += aa; aa = 0; }
  if (dd < 0) { hh += dd; dd = 0; }
  return [Math.max(0, hh), Math.max(0, dd), Math.max(0, aa)];
}

/** Deterministic seed from 2 team IDs + model ID — produces unique variation per model per match */
function seedHash(homeId: string, awayId: string, modelId: string): number {
  const s = homeId + '|' + awayId + '|' + modelId;
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

/** Score prediction — per-model unique logic, no shared formula */
function predictScore(
  home: Team, away: Team,
  eloDiff: number,    // already adjusted ELO diff
  homeFormScore: number,
  awayFormScore: number,
  aggression: number,      // 0-1, how many total goals
  conservatism: number,    // 0-1, how close the score (high = 1-0 style, low = 4-2 style)
  favorUpset: number,      // 0-1, how much to boost underdog
  seed: number,            // deterministic seed for this model+match
): { homeGoals: number; awayGoals: number } {
  // Use seed to produce a deterministic "roll" between -0.5 and +0.5
  const roll = ((seed % 1000) / 1000) - 0.5;

  // Home advantage base
  const homeAdv = 0.4 * (1 - conservatism) + roll * 0.3;

  // Expected goals — wider range than before
  // Strong favorite (eloDiff +300): homeXG ~2.5, awayXG ~0.5
  // Balanced (eloDiff 0): homeXG ~1.6, awayXG ~1.2
  // Underdog (eloDiff -300): homeXG ~0.7, awayXG ~2.3
  let homeXG = 1.5 + (eloDiff / 400) * 1.0 + homeAdv;
  let awayXG = 1.2 - (eloDiff / 400) * 0.8 - homeAdv * 0.5;

  // Form adjustment
  homeXG += (homeFormScore - awayFormScore) * 0.15 * (1 - conservatism);
  awayXG += (awayFormScore - homeFormScore) * 0.10 * (1 - conservatism);

  // Aggression inflates goals
  homeXG += aggression * 0.6;
  awayXG += aggression * 0.5;

  // Upset boost for underdog
  if (eloDiff < -50) {
    awayXG += favorUpset * 0.4;
  } else if (eloDiff > 50) {
    homeXG += favorUpset * 0.2;
  }

  // Broader clamp range
  homeXG = Math.max(0, Math.min(5.5, homeXG));
  awayXG = Math.max(0, Math.min(5.0, awayXG));

  // Round with seed-based jitter
  const jitter = ((seed % 7) - 3) * 0.15;
  let h = Math.round(homeXG + jitter);
  let a = Math.round(awayXG - jitter * 0.5);

  // Tie-break: if xG difference is clear but rounded score tied
  if (h === a && homeXG > awayXG + 0.5) h++;
  else if (h === a && awayXG > homeXG + 0.5) a++;

  // Floor and ceiling
  h = Math.max(0, Math.min(5, h));
  a = Math.max(0, Math.min(5, a));

  return { homeGoals: h, awayGoals: a };
}

/* ═══════════════════════════════════════════════════════════
   Individual Model Simulators
   ═══════════════════════════════════════════════════════════ */

function simulateClaude(home: Team, away: Team): ModelPrediction {
  // Conservative: ELO-heavy, low scoring, favors favorites
  const eloDiff = (home.elo - away.elo) * 0.9 + (formScore(home) - formScore(away)) * 15;
  const seed = seedHash(home.id, away.id, 'claude');
  const score = predictScore(home, away, eloDiff, formScore(home), formScore(away), 0.1, 0.75, 0.05, seed);

  const rawH = eloWinProb(home.elo, away.elo) * 0.87 + 0.07;
  const rawD = Math.max(0.16, 0.27 - Math.abs(home.elo - away.elo) / 550);
  const rawA = 1 - rawH - rawD;
  const [hw, dw, aw] = normalize(rawH, rawD, Math.max(0, rawA));

  const hWin = score.homeGoals > score.awayGoals;
  const winner = hWin ? home.name : score.awayGoals > score.homeGoals ? away.name : '平局';
  const conf = Math.min(86, Math.round(52 + Math.abs(home.elo - away.elo) / 14));

  return {
    modelId: 'claude',
    predictedScore: `${score.homeGoals}-${score.awayGoals}`,
    winner, homeWinProb: hw, drawProb: dw, awayWinProb: aw, confidence: conf,
    reasoning: home.elo - away.elo > 120
      ? `${home.name} ELO明显占优（+${home.elo - away.elo}），稳守反击即可`
      : home.elo - away.elo < -120
        ? `${away.name} ELO更高，${home.name}主场抢分不易`
        : '两队实力接近，趋向低比分平局',
  };
}

function simulateChatGPT(home: Team, away: Team): ModelPrediction {
  // Balanced: ELO + FIFA rank + form, moderate everything
  const eloDiff = (home.elo - away.elo) * 0.6 + (formScore(home) - formScore(away)) * 35;
  const seed = seedHash(home.id, away.id, 'chatgpt');
  const score = predictScore(home, away, eloDiff, formScore(home), formScore(away), 0.3, 0.4, 0.2, seed);

  const eloH = eloWinProb(home.elo, away.elo);
  const rankBonus = (away.fifaRank - home.fifaRank) / 250 * 0.06;
  const rawH = eloH * 0.55 + 0.22 + rankBonus;
  const rawD = Math.max(0.17, 0.27 - Math.abs(home.elo - away.elo) / 700);
  const rawA = 1 - rawH - rawD;
  const [hw, dw, aw] = normalize(rawH, rawD, Math.max(0, rawA));

  const hWin = score.homeGoals > score.awayGoals;
  const winner = hWin ? home.name : score.awayGoals > score.homeGoals ? away.name : '平局';
  const conf = Math.min(80, Math.round(47 + Math.abs(home.elo - away.elo) / 20));

  return {
    modelId: 'chatgpt',
    predictedScore: `${score.homeGoals}-${score.awayGoals}`,
    winner, homeWinProb: hw, drawProb: dw, awayWinProb: aw, confidence: conf,
    reasoning: home.fifaRank < away.fifaRank - 8
      ? `${home.name} FIFA排名更高（#${home.fifaRank} vs #${away.fifaRank}），纸面占优`
      : away.fifaRank < home.fifaRank - 8
        ? `${away.name} 排名远超${home.name}，经验更丰富`
        : '纸面数据接近，胜负取决于临场发挥',
  };
}

function simulateDeepSeek(home: Team, away: Team): ModelPrediction {
  // Form-heavy: heavily weights recent results, loves upsets, aggressive scoring
  const hForm = formScore(home), aForm = formScore(away);
  const eloDiff = (home.elo - away.elo) * 0.3 + (hForm - aForm) * 70;
  const seed = seedHash(home.id, away.id, 'deepseek');
  const score = predictScore(home, away, eloDiff, hForm, aForm, 0.45, 0.2, 0.5, seed);

  const rawH = eloWinProb(home.elo, away.elo) * 0.3 + 0.28 + (hForm - aForm) * 0.06;
  const rawD = Math.max(0.13, 0.22 - Math.abs(hForm - aForm) * 0.04);
  const rawA = 1 - rawH - rawD;
  const [hw, dw, aw] = normalize(Math.max(0.06, rawH), rawD, Math.max(0.06, rawA));

  const hWin = score.homeGoals > score.awayGoals;
  const winner = hWin ? home.name : score.awayGoals > score.homeGoals ? away.name : '平局';
  const conf = Math.min(75, Math.round(40 + Math.abs(hForm - aForm) * 10 + Math.abs(home.elo - away.elo) / 30));

  return {
    modelId: 'deepseek',
    predictedScore: `${score.homeGoals}-${score.awayGoals}`,
    winner, homeWinProb: hw, drawProb: dw, awayWinProb: aw, confidence: conf,
    reasoning: hForm - aForm > 1
      ? `🔥 ${home.name}近5场${home.recentForm.filter(f=>f==='W').length}胜气势如虹，力挺爆冷！`
      : aForm - hForm > 1
        ? `⚠️ ${away.name}近期状态火爆（${away.recentForm.filter(f=>f==='W').length}胜），${home.name}危险`
        : hForm > 0
          ? `${home.name}势头不错，看好不败`
          : '双方状态都不稳，大球可期',
  };
}

function simulateQwen(home: Team, away: Team): ModelPrediction {
  // Attack-heavy: HIGH goals, loves big scorelines, attack-oriented
  const hForm = formScore(home), aForm = formScore(away);
  const eloDiff = (home.elo - away.elo) * 0.5 + (hForm - aForm) * 40;
  const seed = seedHash(home.id, away.id, 'qwen');
  const score = predictScore(home, away, eloDiff, hForm, aForm, 0.75, 0.1, 0.2, seed);

  const rawH = eloWinProb(home.elo, away.elo) * 0.45 + 0.28 + (hForm - aForm) * 0.04;
  const rawD = Math.max(0.10, 0.20 - Math.abs(home.elo - away.elo) / 450);
  const rawA = 1 - rawH - rawD;
  const [hw, dw, aw] = normalize(Math.max(0.05, rawH), rawD, Math.max(0.05, rawA));

  const hWin = score.homeGoals > score.awayGoals;
  const winner = hWin ? home.name : score.awayGoals > score.homeGoals ? away.name : '平局';
  const conf = Math.min(78, Math.round(44 + Math.abs(home.elo - away.elo) / 22));

  return {
    modelId: 'qwen',
    predictedScore: `${score.homeGoals}-${score.awayGoals}`,
    winner, homeWinProb: hw, drawProb: dw, awayWinProb: aw, confidence: conf,
    reasoning: score.homeGoals + score.awayGoals >= 4
      ? `⚽ 进球大战预警！${home.name}与${away.name}攻击力均不容小觑`
      : score.homeGoals + score.awayGoals >= 3
        ? '看好双方破门，大球方向'
        : home.elo - away.elo > 60
          ? `${home.name}攻击线占优，有望多点开花`
          : '双方进攻欲望强烈，比分不会保守',
  };
}

/* ═══════════════════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════════════════ */

const SIMULATORS: Record<ModelId, (h: Team, a: Team) => ModelPrediction> = {
  claude: simulateClaude,
  chatgpt: simulateChatGPT,
  deepseek: simulateDeepSeek,
  qwen: simulateQwen,
};

/**
 * Generate predictions from all 4 models for a given match.
 * Returns null if either team is not found.
 */
export function predictAllModels(
  homeTeamId: string,
  awayTeamId: string,
  matchId?: string,
): MatchPredictionSet | null {
  const home = getTeam(homeTeamId);
  const away = getTeam(awayTeamId);
  if (!home || !away) return null;

  const predictions = {} as Record<ModelId, ModelPrediction>;
  for (const mid of MODEL_ORDER) {
    predictions[mid] = SIMULATORS[mid](home, away);
  }

  // Consensus
  const picks: Record<string, number> = {};
  for (const mid of MODEL_ORDER) {
    const w = predictions[mid].winner;
    picks[w] = (picks[w] || 0) + 1;
  }
  let maxCount = 0, bestSide = '';
  for (const [side, count] of Object.entries(picks)) {
    if (count > maxCount) { maxCount = count; bestSide = side; }
  }

  return {
    matchId: matchId || '',
    homeTeamId, awayTeamId,
    homeTeamName: home.name, awayTeamName: away.name,
    homeFlag: home.flag, awayFlag: away.flag,
    predictions,
    consensus: { side: bestSide, modelCount: maxCount, total: 4 },
    generatedAt: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Get a single model's prediction. Used for backward compatibility.
 */
export function predictSingleModel(
  modelId: ModelId,
  homeTeamId: string,
  awayTeamId: string,
): ModelPrediction | null {
  const home = getTeam(homeTeamId);
  const away = getTeam(awayTeamId);
  if (!home || !away) return null;
  return SIMULATORS[modelId](home, away);
}

/**
 * Get model info by ID.
 */
export function getModelInfo(modelId: string): ModelInfo | undefined {
  return AI_MODELS[modelId];
}
