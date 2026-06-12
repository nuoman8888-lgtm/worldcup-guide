// AI Prediction Engine
// Uses ELO-based model with form adjustments for realistic predictions
import { teams, getTeam, type Team } from '@/data/teams';
import { getChampionshipProbabilities } from '@/data/standings';

export interface MatchPrediction {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedScore: string;
  confidence: 'high' | 'medium' | 'low';
  factors: PredictionFactor[];
  topScores: { home: number; away: number; prob: number }[];
}

export interface PredictionFactor {
  label: string;
  impact: 'positive' | 'negative' | 'neutral';
  detail: string;
}

/** Poisson probability: P(k|λ) = λ^k * e^(-λ) / k! */
function poissonProb(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

/** Expected goals from ELO difference (realistic 0.3–3.5 range) */
function expectedGoals(eloA: number, eloB: number): [number, number] {
  const eloDiff = eloA - eloB;
  const home = 1.35 + (eloDiff / 400) * 0.65;
  const away = 1.15 - (eloDiff / 400) * 0.55;
  return [
    Math.max(0.25, Math.min(3.5, home)),
    Math.max(0.2, Math.min(3.0, away)),
  ];
}

/** Enumerate all 0–MAX score combos, sort by probability descending */
const MAX_GOALS = 4;
function mostLikelyScores(homeLambda: number, awayLambda: number): { home: number; away: number; prob: number }[] {
  const scores: { home: number; away: number; prob: number }[] = [];
  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = poissonProb(homeLambda, h) * poissonProb(awayLambda, a);
      scores.push({ home: h, away: a, prob: Math.round(p * 1000) / 10 });
    }
  }
  return scores.sort((a, b) => b.prob - a.prob);
}

export function predictMatch(homeTeamId: string, awayTeamId: string): MatchPrediction {
  const home = getTeam(homeTeamId);
  const away = getTeam(awayTeamId);

  if (!home || !away) {
    return {
      homeWinProb: 33, drawProb: 34, awayWinProb: 33,
      predictedScore: '?-?',
      confidence: 'low',
      factors: [{ label: '数据不足', impact: 'neutral', detail: '无法获取完整球队数据' }],
      topScores: [],
    };
  }

  // ── Robust ELO-based prediction ──
  const eloDiff = home.elo - away.elo;

  // Expected win rate from ELO (0-1)
  const expectedHome = 1 / (1 + Math.pow(10, -eloDiff / 400));

  // Draw probability: higher when teams are close (ELO gap small)
  const absGap = Math.abs(eloDiff);
  let drawProb = 0.26 - (absGap / 400) * 0.10;
  drawProb = Math.max(0.15, Math.min(0.28, drawProb));

  // Distribute remaining between home/away
  const remaining = 1 - drawProb;
  let homeWinProb = expectedHome * remaining;
  let awayWinProb = remaining - homeWinProb;

  // Adjust for recent form (capped)
  const homeForm = home.recentForm.filter(r => r === 'W').length - home.recentForm.filter(r => r === 'L').length;
  const awayForm = away.recentForm.filter(r => r === 'W').length - away.recentForm.filter(r => r === 'L').length;
  const homeFormBonus = Math.max(-0.05, Math.min(0.05, homeForm * 0.015));
  const awayFormBonus = Math.max(-0.05, Math.min(0.05, awayForm * 0.015));

  homeWinProb += homeFormBonus;
  awayWinProb += awayFormBonus;
  drawProb -= (homeFormBonus + awayFormBonus) * 0.3;

  // Clamp all to valid ranges
  homeWinProb = Math.max(0.04, Math.min(0.88, homeWinProb));
  awayWinProb = Math.max(0.04, Math.min(0.88, awayWinProb));
  drawProb = Math.max(0.12, Math.min(0.32, drawProb));

  // Normalize to exactly 100%
  const total = homeWinProb + awayWinProb + drawProb;
  homeWinProb = (homeWinProb / total) * 100;
  drawProb = (drawProb / total) * 100;
  awayWinProb = (awayWinProb / total) * 100;

  // Round to 1 decimal, ensure sum = 100.0
  homeWinProb = Math.round(homeWinProb * 10) / 10;
  drawProb = Math.round(drawProb * 10) / 10;
  awayWinProb = Math.round(awayWinProb * 10) / 10;

  // Fix rounding: adjust largest to make sum=100
  const sum = homeWinProb + drawProb + awayWinProb;
  const diff = Math.round((100 - sum) * 10) / 10;
  if (Math.abs(diff) >= 0.1) {
    // Add diff to the largest probability
    if (homeWinProb >= drawProb && homeWinProb >= awayWinProb) homeWinProb += diff;
    else if (drawProb >= homeWinProb && drawProb >= awayWinProb) drawProb += diff;
    else awayWinProb += diff;
  }

  // Final clamp to ensure no negative or >100
  homeWinProb = Math.max(0, Math.min(100, Math.round(homeWinProb * 10) / 10));
  drawProb = Math.max(0, Math.min(100, Math.round(drawProb * 10) / 10));
  awayWinProb = Math.max(0, Math.min(100, Math.round(awayWinProb * 10) / 10));

  // Poisson-distribution score prediction (realistic 0-4 goal range)
  const [homeLambda, awayLambda] = expectedGoals(home.elo, away.elo);
  const topScores = mostLikelyScores(homeLambda, awayLambda);
  const best = topScores[0];
  const predictedScore = `${best.home}-${best.away}`;

  // Confidence level
  const probGap = Math.abs(homeWinProb - awayWinProb);
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (probGap > 40) confidence = 'high';
  else if (probGap < 10) confidence = 'low';

  // Analysis factors
  const factors: PredictionFactor[] = [];

  // ELO factor
  if (eloDiff > 100) {
    factors.push({ label: 'ELO评分优势', impact: 'positive', detail: `${home.name} ELO评分高出${Math.round(eloDiff)}分` });
  } else if (eloDiff < -100) {
    factors.push({ label: 'ELO评分劣势', impact: 'negative', detail: `${away.name} ELO评分高出${Math.round(-eloDiff)}分` });
  } else {
    factors.push({ label: 'ELO评分接近', impact: 'neutral', detail: `两队ELO评分仅差${Math.round(Math.abs(eloDiff))}分` });
  }

  // FIFA Ranking factor
  if (home.fifaRank < away.fifaRank - 10) {
    factors.push({ label: '世界排名优势', impact: 'positive', detail: `${home.name}排名第${home.fifaRank}，远高于${away.name}的第${away.fifaRank}` });
  } else if (away.fifaRank < home.fifaRank - 10) {
    factors.push({ label: '世界排名劣势', impact: 'negative', detail: `${away.name}排名第${away.fifaRank}，远高于${home.name}的第${home.fifaRank}` });
  }

  // Recent form factor
  const homeWins = home.recentForm.filter(r => r === 'W').length;
  const awayWins = away.recentForm.filter(r => r === 'W').length;
  if (homeWins >= 4) {
    factors.push({ label: '近期状态火热', impact: 'positive', detail: `${home.name}最近5场取得${homeWins}场胜利` });
  } else if (homeWins <= 1) {
    factors.push({ label: '近期状态不佳', impact: 'negative', detail: `${home.name}最近5场仅胜${homeWins}场` });
  }
  if (awayWins >= 4) {
    factors.push({ label: '对手状态火热', impact: 'negative', detail: `${away.name}最近5场取得${awayWins}场胜利` });
  }

  // World Cup experience
  if (home.worldCupApps > away.worldCupApps + 5) {
    factors.push({ label: '大赛经验丰富', impact: 'positive', detail: `${home.name}第${home.worldCupApps}次参加世界杯，经验远胜对手` });
  }

  // Best result factor
  if (home.bestResult.includes('冠军') && !away.bestResult.includes('冠军')) {
    factors.push({ label: '冠军底蕴', impact: 'positive', detail: `${home.name}曾${home.bestResult}` });
  }

  return { homeWinProb, drawProb, awayWinProb, predictedScore, confidence, factors, topScores: topScores.slice(0, 3) };
}

export interface AIAnswer {
  answer: string;
  keyPoints: string[];
  disclaimer: string;
}

const AI_RESPONSES: Record<string, { keywords: string[]; getResponse: (team: Team) => AIAnswer }> = {
  champion: {
    keywords: ['夺冠', '冠军', '能赢吗', '可能赢吗', '能不能', '有希望吗'],
    getResponse: (team: Team) => {
      const probs = getChampionshipProbabilities();
      const prob = probs.find(p => p.teamId === team.id);
      const rank = probs.findIndex(p => p.teamId === team.id) + 1;
      const percentage = prob ? prob.probability : 1;

      let answer = '';
      if (rank <= 3) {
        answer = `${team.flag} ${team.name}是本届世界杯的顶级热门！夺冠概率约${percentage}%，在所有48支球队中排名第${rank}。球队拥有世界级阵容和丰富的大赛经验${team.bestResult.includes('冠军') ? '，历史上曾' + team.bestResult : ''}。`;
      } else if (rank <= 8) {
        answer = `${team.flag} ${team.name}具备冲击冠军的实力，目前夺冠概率约${percentage}%，排名第${rank}。如果能够发挥出最佳水平，有机会走得很远。`;
      } else if (rank <= 16) {
        answer = `${team.flag} ${team.name}有一定竞争力，夺冠概率约${percentage}%，排名第${rank}。需要超常发挥和有利的签运才有机会。`;
      } else {
        answer = `${team.flag} ${team.name}夺冠概率约${percentage}%，排名第${rank}。虽然足球是圆的，但从数据和实力来看，夺冠难度较大。`;
      }

      return {
        answer,
        keyPoints: [
          `夺冠概率: ${percentage}% (排名第${rank}/48)`,
          `FIFA排名: 第${team.fifaRank}位`,
          `关键球员: ${team.keyPlayers.slice(0, 3).join('、')}`,
          `历史最佳: ${team.bestResult}`,
        ],
        disclaimer: '以上分析基于ELO评分和球队实力数据，足球比赛存在很大不确定性，仅供参考。',
      };
    },
  },
  groupQualify: {
    keywords: ['出线', '晋级', '小组', '出局', '淘汰赛'],
    getResponse: (team: Team) => {
      const groupOdds = team.groupStageOdds;
      let answer = '';
      if (groupOdds < 1.5) {
        answer = `${team.flag} ${team.name}在${team.group}组的出线形势非常好。球队实力在小组中明显占优，只要正常发挥，晋级淘汰赛问题不大。`;
      } else if (groupOdds < 2.5) {
        answer = `${team.flag} ${team.name}在${team.group}组有较大出线机会，但需要认真对待每一场比赛。小组中有强劲对手，不能掉以轻心。`;
      } else if (groupOdds < 5) {
        answer = `${team.flag} ${team.name}在${team.group}组出线有一定难度，需要至少拿到4-5分才有机会。关键比赛必须全力争胜。`;
      } else {
        answer = `${team.flag} ${team.name}在${team.group}组出线形势严峻。小组中有实力更强的对手，需要创造奇迹才能晋级。`;
      }
      return {
        answer,
        keyPoints: [
          `小组赛赔率: ${groupOdds}`,
          `FIFA排名: 第${team.fifaRank}位`,
          '每组前2名 + 8个最佳第3名晋级',
          '48支球队竞争32个出线名额',
        ],
        disclaimer: '以上分析仅供参考，实际比赛结果受多种因素影响。',
      };
    },
  },
};

export function aiChat(question: string, teamId?: string): AIAnswer {
  const team = teamId ? getTeam(teamId) : null;

  // Check if there's a team context in the question
  if (!team) {
    // Try to find team from question
    const mentionedTeam = teams.find(t =>
      question.includes(t.name) || question.includes(t.nameEn)
    );
    if (mentionedTeam) {
      return aiChat(question, mentionedTeam.id);
    }
  }

  // Check for champion-related questions
  if (team) {
    for (const [_, handler] of Object.entries(AI_RESPONSES)) {
      if (handler.keywords.some(kw => question.includes(kw))) {
        return handler.getResponse(team);
      }
    }

    // Generic team question
    return {
      answer: `关于${team.flag} ${team.name}：这支球队目前FIFA排名第${team.fifaRank}位，由${team.coach}执教。核心球员包括${team.keyPlayers.slice(0, 3).join('、')}。${team.name}共${team.worldCupApps}次参加世界杯，历史最佳成绩为${team.bestResult}。`,
      keyPoints: [
        `FIFA排名: 第${team.fifaRank}位`,
        `ELO评分: ${team.elo}`,
        `主教练: ${team.coach}`,
        `关键球员: ${team.keyPlayers.slice(0, 3).join('、')}`,
      ],
      disclaimer: '数据来源于各大数据平台，仅供参考。',
    };
  }

  // General questions
  return {
    answer: '请告诉我你想了解哪支球队或哪场比赛？你可以问我：\n\n• "巴西能夺冠吗？"\n• "阿根廷出线形势如何？"\n• "法国队实力分析"\n• 输入球队名称了解更多',
    keyPoints: [],
    disclaimer: 'AI分析基于历史数据和球队实力，仅供参考。',
  };
}

export function getChampionProbData() {
  return getChampionshipProbabilities().map(p => {
    const team = getTeam(p.teamId);
    return { ...p, team: team! };
  }).filter(p => p.team);
}

// ── Multi-Model AI Prediction (Claude + Qwen Fusion) ──

export interface AdvancedPrediction {
  // Overall fusion result
  winner: string;
  confidence: number;
  // Top 3 most likely scores
  topScores: { home: number; away: number; probability: number }[];
  // Individual model predictions
  claude: { predictedScore: string; confidence: number; reasoning: string };
  qwen: { predictedScore: string; confidence: number; reasoning: string };
  // Win/Draw/Loss probabilities
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
}

/**
 * Simulated Claude model (ELO-heavy, conservative).
 * Claude tends to favor the stronger team with narrower scorelines.
 */
function simulateClaude(home: Team, away: Team): { score: string; conf: number; reason: string } {
  const eloDiff = home.elo - away.elo;
  const pHome = 1 / (1 + Math.pow(10, -eloDiff / 400));

  let homeGoals: number, awayGoals: number;
  if (pHome > 0.7) {
    homeGoals = 2; awayGoals = 0;
  } else if (pHome > 0.55) {
    homeGoals = 1 + (eloDiff > 200 ? 1 : 0); awayGoals = eloDiff < 50 ? 1 : 0;
  } else if (pHome > 0.45) {
    homeGoals = 1; awayGoals = 1;
  } else if (pHome > 0.3) {
    homeGoals = 0; awayGoals = 1 + (eloDiff < -200 ? 1 : 0);
  } else {
    homeGoals = 0; awayGoals = 2;
  }

  const conf = Math.min(85, Math.round(50 + Math.abs(eloDiff) / 15));
  const reason = eloDiff > 100
    ? `${home.name} ELO优势明显（+${eloDiff}），预期控制比赛节奏`
    : eloDiff < -100
    ? `${away.name} ELO更高（+${-eloDiff}），${home.name}需防守反击`
    : '两队ELO接近，中场争夺将是关键';

  return { score: `${homeGoals}-${awayGoals}`, conf, reason };
}

/**
 * Simulated Qwen model (form-heavy, aggressive).
 * Qwen puts more weight on recent form and tends to predict more goals.
 */
function simulateQwen(home: Team, away: Team): { score: string; conf: number; reason: string } {
  const eloDiff = home.elo - away.elo;
  const homeForm = home.recentForm.filter(f => f === 'W').length;
  const awayForm = away.recentForm.filter(f => f === 'W').length;
  const formDiff = homeForm - awayForm;

  let homeGoals: number, awayGoals: number;
  const adjElo = eloDiff + formDiff * 80;

  // Fully deterministic — no Math.random()
  // Thresholds: ELO gaps mapped to goal ranges based on real football distributions
  if (adjElo > 300) {
    // Total domination
    homeGoals = 4; awayGoals = 0;
  } else if (adjElo > 200) {
    // Clear favorite — extra goal if form is also dominant
    homeGoals = 3; awayGoals = formDiff >= 2 ? 0 : 1;
  } else if (adjElo > 80) {
    // Moderate favorite
    homeGoals = 2; awayGoals = formDiff > 0 ? 0 : 1;
  } else if (adjElo > 0) {
    // Slight edge — typically a close win
    homeGoals = 2; awayGoals = 1;
  } else if (adjElo > -80) {
    // Slight underdog — opponent edge
    homeGoals = 1; awayGoals = 2;
  } else if (adjElo > -200) {
    // Clear underdog
    homeGoals = formDiff < -1 ? 0 : 1; awayGoals = 2;
  } else if (adjElo > -350) {
    // Heavy underdog — extra opponent goal if form gap is large
    homeGoals = 0; awayGoals = formDiff < -2 ? 4 : 3;
  } else {
    // Extreme underdog — total mismatch
    homeGoals = 0; awayGoals = 4;
  }

  const conf = Math.min(80, Math.round(45 + Math.abs(adjElo) / 20 + Math.abs(formDiff) * 5));
  const reason = formDiff > 1
    ? `${home.name}近期状态火热（近5场${homeForm}胜），势头正劲`
    : formDiff < -1
    ? `${away.name}近期表现更佳（近5场${awayForm}胜），士气占优`
    : eloDiff > 0
    ? `${home.name}综合实力略胜一筹`
    : `${away.name}纸面实力更强`;

  return { score: `${homeGoals}-${awayGoals}`, conf, reason };
}

/**
 * Generate top 3 most likely scorelines with probabilities.
 * Uses Poisson distribution around the expected goals.
 */
function generateTopScores(homeLambda: number, awayLambda: number): { home: number; away: number; probability: number }[] {
  const poisson = (lambda: number, k: number): number => {
    if (lambda <= 0) return k === 0 ? 1 : 0;
    let logP = -lambda + k * Math.log(lambda);
    for (let i = 2; i <= k; i++) logP -= Math.log(i);
    return Math.exp(logP);
  };

  const scores: { home: number; away: number; probability: number }[] = [];
  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const p = poisson(homeLambda, h) * poisson(awayLambda, a);
      scores.push({ home: h, away: a, probability: Math.round(p * 1000) / 10 });
    }
  }
  return scores.sort((a, b) => b.probability - a.probability).slice(0, 3);
}

/**
 * Advanced multi-model prediction (Claude + Qwen fusion).
 * Returns winner, confidence, 3 most likely scores, and per-model details.
 */
export function predictMatchAdvanced(homeTeamId: string, awayTeamId: string): AdvancedPrediction | null {
  const home = getTeam(homeTeamId);
  const away = getTeam(awayTeamId);
  if (!home || !away) return null;

  // Get individual model predictions
  const claude = simulateClaude(home, away);
  const qwen = simulateQwen(home, away);

  // Parse scores
  const [ch, ca] = claude.score.split('-').map(Number);
  const [qh, qa] = qwen.score.split('-').map(Number);

  // Fusion: weighted average of expected goals
  const wClaude = 0.55; // Claude weight
  const wQwen = 0.45;   // Qwen weight
  const homeXG = wClaude * ch + wQwen * qh;
  const awayXG = wClaude * ca + wQwen * qa;

  // Determine winner and confidence
  let winner: string;
  let confidence: number;
  if (homeXG > awayXG + 0.5) {
    winner = home.name;
    confidence = Math.round(wClaude * claude.conf + wQwen * qwen.conf);
  } else if (awayXG > homeXG + 0.5) {
    winner = away.name;
    confidence = Math.round(wClaude * claude.conf + wQwen * qwen.conf);
  } else {
    winner = '平局';
    confidence = Math.round((wClaude * claude.conf + wQwen * qwen.conf) * 0.75);
  }

  // Calculate probabilities — proper normalization (no negative, sum = 100%)
  const eloDiff = home.elo - away.elo;

  // Raw weights: ELO-based with form adjustment, clamp to non-negative
  const rawHome = Math.max(0, (1 / (1 + Math.pow(10, -eloDiff / 400))) * 100);
  const rawDraw = Math.max(0, 26 - Math.abs(eloDiff) / 30);
  const rawAway = Math.max(0, (1 / (1 + Math.pow(10, eloDiff / 400))) * 100);

  // Normalize to sum = 100% (largest-remainder method)
  const [homeWinProb, drawProb, awayWinProb] = normalizeProbs(rawHome, rawDraw, rawAway);

  // Generate top 3 scores
  const topScores = generateTopScores(Math.round(homeXG), Math.round(awayXG));

  return {
    winner,
    confidence,
    topScores,
    claude: { predictedScore: claude.score, confidence: claude.conf, reasoning: claude.reason },
    qwen: { predictedScore: qwen.score, confidence: qwen.conf, reasoning: qwen.reason },
    homeWinProb,
    drawProb,
    awayWinProb,
  };
}

/**
 * Normalize 3 raw probability weights to integers summing to exactly 100.
 * Uses largest-remainder method. All outputs clamped to [0, 100].
 * Returns [p1, p2, p3] guaranteed to sum to 100.
 */
export function normalizeProbs(w1: number, w2: number, w3: number): [number, number, number] {
  // Clamp all inputs to non-negative
  w1 = Math.max(0, w1);
  w2 = Math.max(0, w2);
  w3 = Math.max(0, w3);

  const total = w1 + w2 + w3;

  // Edge case: all zero → equal split
  if (total === 0) return [34, 33, 33];

  // Compute exact percentages
  const exact = [w1 / total * 100, w2 / total * 100, w3 / total * 100];

  // Integer part
  const floors = exact.map(v => Math.floor(v));

  // Remainders
  const remainders = exact.map((v, i) => ({ idx: i, rem: v - floors[i] }));

  // Current sum of integers
  let sum = floors.reduce((a, b) => a + b, 0);

  // Distribute remaining points to largest remainders
  remainders.sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < 100 - sum; i++) {
    floors[remainders[i % 3].idx]++;
  }

  // Final clamp to [0, 100]
  return [
    Math.max(0, Math.min(100, floors[0])),
    Math.max(0, Math.min(100, floors[1])),
    Math.max(0, Math.min(100, floors[2])),
  ];
}

/**
 * Validate that a probability triplet is valid.
 * Returns error message if invalid, null if valid.
 */
export function validateProbs(p1: number, p2: number, p3: number): string | null {
  if (isNaN(p1) || isNaN(p2) || isNaN(p3)) return '预测数据异常：包含NaN';
  if (p1 < 0 || p2 < 0 || p3 < 0) return '预测数据异常：概率为负数';
  if (p1 > 100 || p2 > 100 || p3 > 100) return '预测数据异常：概率超过100%';
  if (Math.abs(p1 + p2 + p3 - 100) > 1) return '预测数据异常：概率和不等于100%';
  return null;
}
