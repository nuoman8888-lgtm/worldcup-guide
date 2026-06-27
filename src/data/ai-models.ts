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
    description: 'ELO至上 · 零封信仰',
    personality: 'ELO权重95%。极度保守，偏好低比分与零封。强队必胜，极少冷门。典型预测：2-0, 1-0, 3-0',
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '🤖',
    color: '#10A37F',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/25',
    textClass: 'text-emerald-300',
    description: '数据均衡 · 全能选手',
    personality: 'ELO+FIFA+状态均衡加权。平稳中庸，不激进也不保守。典型预测：2-1, 1-1, 2-0',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔮',
    color: '#3B82F6',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/25',
    textClass: 'text-blue-300',
    description: '状态为王 · 冷门猎手',
    personality: '近期状态权重70%。最爱爆冷，看状态不看名气。高分乱战爱好者。典型预测：3-2, 2-2, 1-2',
  },
  qwen: {
    id: 'qwen',
    name: '千问',
    icon: '🌊',
    color: '#F59E0B',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/25',
    textClass: 'text-amber-300',
    description: '进攻狂魔 · 大球之王',
    personality: '攻击力权重极高。永远预测高比分，轻视防守。强队直接屠杀模式。典型预测：4-1, 3-1, 5-2',
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

/** Score prediction — per-model unique logic.
 *  Uses team strength ratios to produce realistic football scorelines.
 *  Strong favorites get clean sheets or big wins, balanced teams get tight games.
 */
function predictScore(
  home: Team, away: Team,
  eloDiff: number,
  homeFormScore: number,
  awayFormScore: number,
  aggression: number,      // 0-1, total goal inflation
  conservatism: number,    // 0-1, suppresses scoring (high = fewer goals)
  favorUpset: number,      // 0-1, boosts underdog scoring
  seed: number,
): { homeGoals: number; awayGoals: number } {

  // ── Strength ratio: how much better is the home team?
  // eloDiff of +400 → ratio ~9:1;  0 → ~1:1;  -400 → ~1:9
  const strengthRatio = Math.pow(10, eloDiff / 400);
  const homeShare = strengthRatio / (1 + strengthRatio); // 0-1, home's share of total strength

  // ── Total expected goals (baseline 2.5, scales with aggression, shrinks with conservatism)
  // Higher aggression + wide strength gap = more goals
  const gapBonus = Math.abs(eloDiff) / 200; // 0-2.5 extra goals for big mismatches
  const totalXG = 2.2 + aggression * 2.0 - conservatism * 0.8 + gapBonus * 0.7;

  // ── Split goals between teams
  // Home gets more if stronger, but with some randomness from seed
  let homeShareAdjusted = homeShare;

  // Form adjustment: in-form team gets more scoring share
  const formDelta = (homeFormScore - awayFormScore) * 0.03;
  homeShareAdjusted += formDelta;

  // Upset factor: underdog gets boosted
  if (eloDiff > 60) {
    homeShareAdjusted += favorUpset * 0.04; // slight boost to already-strong home
  } else if (eloDiff < -60) {
    homeShareAdjusted -= favorUpset * 0.08; // bigger boost to underdog away team
  }

  // Seed-based randomness — ±12% on share
  const shareNoise = ((seed % 100) / 100 - 0.5) * 0.24;
  homeShareAdjusted = Math.max(0.08, Math.min(0.92, homeShareAdjusted + shareNoise));

  // ── Compute per-team xG
  let homeXG = totalXG * homeShareAdjusted;
  let awayXG = totalXG * (1 - homeShareAdjusted);

  // ── Convert xG to discrete goals using seed-based offsets
  // This produces more varied scorelines than simple Math.round
  const seed2 = (seed * 7919 + 104729) % 10000;
  const seed3 = (seed * 6271 + 31397) % 10000;

  // Weighted rounding: deterministic decider
  const homeFrac = homeXG - Math.floor(homeXG);
  const awayFrac = awayXG - Math.floor(awayXG);
  const homeThreshold = 0.15 + (seed2 % 100) / 200;   // 0.15 - 0.64
  const awayThreshold = 0.15 + (seed3 % 100) / 200;

  let h = Math.floor(homeXG) + (homeFrac > homeThreshold ? 1 : 0);
  let a = Math.floor(awayXG) + (awayFrac > awayThreshold ? 1 : 0);

  // ── Floor + ceiling (generous — big wins are possible)
  h = Math.max(0, Math.min(8, h));
  a = Math.max(0, Math.min(7, a));

  // ── Tie-break: if xG says clear favorite but score tied, break the tie
  if (h === a) {
    if (homeXG > awayXG + 0.7) h++;
    else if (awayXG > homeXG + 0.7) a++;
  }

  // ── Cap blowout gap based on ELO difference
  const maxGap = Math.max(3, Math.round(Math.abs(eloDiff) / 120));
  if (h - a > maxGap) { a = h - maxGap; if (a < 0) a = 0; }
  if (a - h > maxGap) { h = a - maxGap; if (h < 0) h = 0; }

  return { homeGoals: h, awayGoals: a };
}

/* ═══════════════════════════════════════════════════════════
   Individual Model Simulators
   ═══════════════════════════════════════════════════════════ */

function simulateClaude(home: Team, away: Team): ModelPrediction {
  // Claude: ELO purist, conservative. Prefers clean sheets, low scores, rarely predicts upsets.
  const hForm = formScore(home), aForm = formScore(away);
  const eloDiff = (home.elo - away.elo) * 0.95 + (hForm - aForm) * 10;
  const seed = seedHash(home.id, away.id, 'claude');
  // Low aggression (0.05), high conservatism (0.7), minimal upset favor
  const score = predictScore(home, away, eloDiff, hForm, aForm, 0.05, 0.7, 0.03, seed);

  const rawH = eloWinProb(home.elo, away.elo) * 0.85 + 0.06;
  const rawD = Math.max(0.18, 0.28 - Math.abs(home.elo - away.elo) / 500);
  const rawA = 1 - rawH - rawD;
  const [hw, dw, aw] = normalize(rawH, rawD, Math.max(0, rawA));

  const hWin = score.homeGoals > score.awayGoals;
  const winner = hWin ? home.name : score.awayGoals > score.homeGoals ? away.name : '平局';
  const conf = Math.min(85, Math.round(50 + Math.abs(home.elo - away.elo) / 12));

  return {
    modelId: 'claude',
    predictedScore: `${score.homeGoals}-${score.awayGoals}`,
    winner, homeWinProb: hw, drawProb: dw, awayWinProb: aw, confidence: conf,
    reasoning: home.elo - away.elo > 150
      ? `${home.name} 实力碾压（ELO +${home.elo - away.elo}），零封可期`
      : home.elo - away.elo > 60
        ? `${home.name} ELO占优，稳健取胜`
        : home.elo - away.elo < -150
          ? `${away.name} ELO遥遥领先，${home.name}少输当赢`
          : home.elo - away.elo < -60
            ? `${away.name} 纸面更强，客场小胜`
            : '势均力敌，低比分平局概率大',
  };
}

function simulateChatGPT(home: Team, away: Team): ModelPrediction {
  // ChatGPT: data-balanced. Weights ELO + FIFA rank + form equally. Moderate scoring.
  const hForm = formScore(home), aForm = formScore(away);
  const eloDiff = (home.elo - away.elo) * 0.55 + (away.fifaRank - home.fifaRank) * 2.5 + (hForm - aForm) * 25;
  const seed = seedHash(home.id, away.id, 'chatgpt');
  const score = predictScore(home, away, eloDiff, hForm, aForm, 0.25, 0.45, 0.15, seed);

  const eloH = eloWinProb(home.elo, away.elo);
  const rankBonus = (away.fifaRank - home.fifaRank) / 200 * 0.05;
  const rawH = eloH * 0.50 + 0.24 + rankBonus;
  const rawD = Math.max(0.16, 0.27 - Math.abs(home.elo - away.elo) / 650);
  const rawA = 1 - rawH - rawD;
  const [hw, dw, aw] = normalize(rawH, rawD, Math.max(0, rawA));

  const hWin = score.homeGoals > score.awayGoals;
  const winner = hWin ? home.name : score.awayGoals > score.homeGoals ? away.name : '平局';
  const conf = Math.min(78, Math.round(45 + Math.abs(home.elo - away.elo) / 18));

  return {
    modelId: 'chatgpt',
    predictedScore: `${score.homeGoals}-${score.awayGoals}`,
    winner, homeWinProb: hw, drawProb: dw, awayWinProb: aw, confidence: conf,
    reasoning: home.fifaRank < away.fifaRank - 10
      ? `${home.name} FIFA排名碾压（#${home.fifaRank} vs #${away.fifaRank}），数据全面占优`
      : away.fifaRank < home.fifaRank - 10
        ? `${away.name} 排名远超${home.name}（#${away.fifaRank} vs #${home.fifaRank}），经验丰富`
        : Math.abs(home.elo - away.elo) < 40
          ? '数据指标接近，任何结果都有可能'
          : home.elo > away.elo
            ? `${home.name} 综合数据小幅领先`
            : `${away.name} 略占上风`,
  };
}

function simulateDeepSeek(home: Team, away: Team): ModelPrediction {
  // DeepSeek: form fanatic, upset lover. Heavily weights recent 5-game form, loves chaos.
  const hForm = formScore(home), aForm = formScore(away);
  const eloDiff = (home.elo - away.elo) * 0.25 + (hForm - aForm) * 60;
  const seed = seedHash(home.id, away.id, 'deepseek');
  // High aggression (0.55), low conservatism (0.15), strong upset bias (0.6)
  const score = predictScore(home, away, eloDiff, hForm, aForm, 0.55, 0.15, 0.6, seed);

  const rawH = eloWinProb(home.elo, away.elo) * 0.25 + 0.30 + (hForm - aForm) * 0.07;
  const rawD = Math.max(0.12, 0.22 - Math.abs(hForm - aForm) * 0.05);
  const rawA = 1 - rawH - rawD;
  const [hw, dw, aw] = normalize(Math.max(0.05, rawH), rawD, Math.max(0.05, rawA));

  const hWin = score.homeGoals > score.awayGoals;
  const winner = hWin ? home.name : score.awayGoals > score.homeGoals ? away.name : '平局';
  const conf = Math.min(72, Math.round(38 + Math.abs(hForm - aForm) * 12 + Math.abs(home.elo - away.elo) / 35));

  return {
    modelId: 'deepseek',
    predictedScore: `${score.homeGoals}-${score.awayGoals}`,
    winner, homeWinProb: hw, drawProb: dw, awayWinProb: aw, confidence: conf,
    reasoning: hForm - aForm >= 2
      ? `🔥 ${home.name} 状态爆棚（近5场${home.recentForm.filter(f=>f==='W').length}胜），冷门预警！`
      : aForm - hForm >= 2
        ? `⚠️ ${away.name} 势头正猛（近5场${away.recentForm.filter(f=>f==='W').length}胜），${home.name}恐被掀翻`
        : hForm > aForm
          ? `${home.name} 状态略好，有机会抢分`
          : aForm > hForm
            ? `${away.name} 近期状态更佳`
            : `${home.recentForm.filter(f=>f==='W').length}胜${home.recentForm.filter(f=>f==='L').length}负 vs ${away.recentForm.filter(f=>f==='W').length}胜${away.recentForm.filter(f=>f==='L').length}负，大球博弈`,
  };
}

function simulateQwen(home: Team, away: Team): ModelPrediction {
  // Qwen: attack maximalist. Highest aggression, lowest conservatism, loves goals.
  const hForm = formScore(home), aForm = formScore(away);
  const eloDiff = (home.elo - away.elo) * 0.45 + (hForm - aForm) * 35;
  const seed = seedHash(home.id, away.id, 'qwen');
  // Very high aggression (0.85), very low conservatism (0.05), moderate upset
  const score = predictScore(home, away, eloDiff, hForm, aForm, 0.85, 0.05, 0.25, seed);

  const rawH = eloWinProb(home.elo, away.elo) * 0.40 + 0.30 + (hForm - aForm) * 0.04;
  const rawD = Math.max(0.08, 0.19 - Math.abs(home.elo - away.elo) / 420);
  const rawA = 1 - rawH - rawD;
  const [hw, dw, aw] = normalize(Math.max(0.04, rawH), rawD, Math.max(0.04, rawA));

  const hWin = score.homeGoals > score.awayGoals;
  const winner = hWin ? home.name : score.awayGoals > score.homeGoals ? away.name : '平局';
  const conf = Math.min(76, Math.round(42 + Math.abs(home.elo - away.elo) / 24));

  const totalGoals = score.homeGoals + score.awayGoals;
  return {
    modelId: 'qwen',
    predictedScore: `${score.homeGoals}-${score.awayGoals}`,
    winner, homeWinProb: hw, drawProb: dw, awayWinProb: aw, confidence: conf,
    reasoning: totalGoals >= 5
      ? `⚽⚽ 超级进球大战！双方防线形同虚设，${totalGoals}球盛宴`
      : totalGoals >= 4
        ? `⚽ 大球预警！${home.name}与${away.name}攻击力爆表`
        : totalGoals >= 3
          ? '看好双方互有破门，进球不会少'
          : home.elo > away.elo + 100
            ? `${home.name} 攻击线豪华，有望多点开花`
            : away.elo > home.elo + 100
              ? `${away.name} 火力全开，客场大胜可期`
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
