// ── Unified AI Prediction Data Source ──
// Single source of truth: homepage, AI Lab, match details.
// Manual predictions take priority; fallback to algorithmic.

import { predictAllModels, MODEL_ORDER, type ModelId, type MatchPredictionSet } from './ai-models';
import { getTeam } from './teams';
import { allMatches } from './matches';

/** Manual predictions — "3-0 / 4-0" = model has two top candidates */
const MANUAL: Record<string, Record<string, string>> = {
  // June 14 — completed (real predictions made before matches)
  m5:  { claude: '0-2', chatgpt: '0-2',                           qwen: '0-2 / 0-1' },  // 卡塔尔 vs 瑞士
  m6:  { claude: '2-1', chatgpt: '2-1',                           qwen: '1-0 / 1-1' },  // 巴西 vs 摩洛哥
  m7:  { claude: '1-1', chatgpt: '0-2',                           qwen: '0-1 / 0-2' },  // 海地 vs 苏格兰
  m8:  { claude: '2-1', chatgpt: '1-1',                           qwen: '1-2 / 1-1' },  // 澳大利亚 vs 土耳其
  // June 15 — completed (real predictions → now scored against results)
  m9:  { claude: '4-0', chatgpt: '4-0', deepseek: '4-0',        qwen: '3-0 / 4-0' },  // 德国 7-1 库拉索 → 全错
  m10: { claude: '2-1', chatgpt: '2-1', deepseek: '1-1',        qwen: '2-1 / 1-1' },  // 荷兰 2-2 日本 → DeepSeek方向正确
  m11: { claude: '1-1', chatgpt: '1-1', deepseek: '1-0',        qwen: '1-1 / 1-2' },  // 科特迪瓦 1-0 厄瓜多尔 → DeepSeek精准命中!
  m12: { claude: '2-1', chatgpt: '1-0', deepseek: '2-1',        qwen: '1-0 / 2-0' },  // 瑞典 5-1 突尼斯 → 全错方向(都是主胜)
  // June 16 — completed (3 draws! All models hit BEL-EGY, missed rest)
  m13: { claude: '3-0 / 4-0', chatgpt: '2-0 / 3-0', deepseek: '3-0 / 4-0', qwen: '3-0 / 4-0' },  // 西班牙 0-0 佛得角 → 全错
  m14: { claude: '2-1 / 1-1', chatgpt: '2-1 / 1-1', deepseek: '2-1 / 1-1', qwen: '1-1 / 1-2' },  // 比利时 1-1 埃及 → 全中!!
  m15: { claude: '0-2 / 1-2', chatgpt: '0-2 / 1-2', deepseek: '0-2 / 1-2', qwen: '0-1 / 0-2' },  // 沙特 1-1 乌拉圭 → 全错
  m16: { claude: '1-0 / 2-0', chatgpt: '1-0 / 2-0', deepseek: '1-0 / 2-0', qwen: '1-0 / 0-0' },  // 伊朗 2-2 新西兰 → 全错
  // June 17 — upcoming
  m17: { claude: '2-1 / 3-1', chatgpt: '2-1 / 1-1', deepseek: '2-1 / 1-1', qwen: '2-1 / 2-0' },  // 法国 vs 塞内加尔
  m18: { claude: '0-3 / 0-4', chatgpt: '0-2 / 0-3', deepseek: '0-2 / 1-2', qwen: '0-2 / 0-3' },  // 伊拉克 vs 挪威
  m19: { claude: '2-0 / 1-0', chatgpt: '2-0 / 2-1', deepseek: '2-0 / 2-1', qwen: '2-0 / 1-0' },  // 阿根廷 vs 阿尔及利亚
  m20: { claude: '2-0 / 3-0', chatgpt: '2-0 / 2-1', deepseek: '2-0 / 3-0', qwen: '2-0 / 3-0' },  // 奥地利 vs 约旦
  // June 18
  m21: { claude: '2-0 / 3-1', chatgpt: '3-0 / 2-0', deepseek: '3-0 / 2-0', qwen: '3-0 / 2-0' },  // 葡萄牙 vs 民主刚果
  m22: { claude: '0-2 / 1-1', chatgpt: '2-1 / 1-1', deepseek: '2-1 / 1-1', qwen: '2-1 / 1-1' },  // 英格兰 vs 克罗地亚
  m23: { claude: '1-2 / 1-1', chatgpt: '1-1 / 2-1', deepseek: '1-1 / 2-1', qwen: '1-2 / 0-0' },  // 加纳 vs 巴拿马
  m24: { claude: '0-2 / 1-3', chatgpt: '0-2 / 1-2', deepseek: '0-2 / 1-1', qwen: '0-2 / 1-2' },  // 乌兹别克斯坦 vs 哥伦比亚
  // ═══ June 19 · Round 2 ═══
  m25: { claude: '2-1 / 1-1', chatgpt: '2-0 / 1-0', deepseek: '2-1 / 1-0', qwen: '2-0 / 1-0' },  // 捷克 vs 南非
  m26: { claude: '2-0 / 2-1', chatgpt: '2-0 / 2-1', deepseek: '1-0 / 2-1', qwen: '2-1 / 1-0' },  // 瑞士 vs 波黑
  m27: { claude: '2-1 / 1-0', chatgpt: '1-1 / 2-1', deepseek: '1-1 / 2-1', qwen: '2-0 / 3-1' },  // 加拿大 vs 卡塔尔
  m28: { claude: '1-1 / 1-2', chatgpt: '1-1 / 2-1', deepseek: '1-0 / 2-1', qwen: '2-1 / 1-1' },  // 墨西哥 vs 韩国
  // ═══ June 20 · Round 2 ═══
  m29: { claude: '2-0 / 2-1', chatgpt: '2-1 / 2-0', deepseek: '2-0 / 3-1', qwen: '1-1 / 2-1' },  // 美国 vs 澳大利亚
  m30: { claude: '1-2 / 0-1', chatgpt: '1-1 / 0-1', deepseek: '0-1 / 1-1', qwen: '0-1 / 1-2' },  // 苏格兰 vs 摩洛哥
  m31: { claude: '3-0 / 4-0', chatgpt: '4-0 / 3-0', deepseek: '4-0 / 3-0', qwen: '3-0 / 4-0' },  // 巴西 vs 海地
  m32: { claude: '2-1 / 1-0', chatgpt: '1-1 / 2-1', deepseek: '2-1 / 1-0', qwen: '1-1 / 2-1' },  // 土耳其 vs 巴拉圭
  // ═══ June 21 · Round 2 ═══
  m33: { claude: '2-1 / 3-1', chatgpt: '2-1 / 1-1', deepseek: '1-1 / 2-1', qwen: '2-1 / 1-0' },  // 荷兰 vs 瑞典
  m34: { claude: '2-1 / 3-1', chatgpt: '3-0 / 2-0', deepseek: '2-0 / 3-0', qwen: '2-0 / 3-1' },  // 德国 vs 科特迪瓦
  m35: { claude: '3-0 / 4-0', chatgpt: '2-0 / 3-1', deepseek: '2-0 / 1-0', qwen: '2-0 / 1-0' },  // 厄瓜多尔 vs 库拉索
  m36: { claude: '1-2 / 0-1', chatgpt: '1-2 / 1-1', deepseek: '0-1 / 1-1', qwen: '1-2 / 1-1' },  // 突尼斯 vs 日本
  // ═══ June 22 · Round 2 ═══
  m37: { claude: '2-0 / 3-0', chatgpt: '3-0 / 2-0', deepseek: '2-0 / 3-0', qwen: '3-0 / 2-0' },  // 西班牙 vs 沙特
  m38: { claude: '2-1 / 1-1', chatgpt: '2-1 / 1-1', deepseek: '2-1 / 1-0', qwen: '2-0 / 1-0' },  // 比利时 vs 伊朗
  m39: { claude: '1-0 / 2-0', chatgpt: '2-0 / 3-1', deepseek: '1-0 / 2-0', qwen: '2-0 / 3-0' },  // 乌拉圭 vs 佛得角
  m40: { claude: '1-2 / 1-1', chatgpt: '0-1 / 1-1', deepseek: '0-1 / 0-2', qwen: '0-2 / 1-2' },  // 新西兰 vs 埃及
  // ═══ June 23 · Round 2 ═══
  m41: { claude: '2-1 / 1-0', chatgpt: '2-0 / 2-1', deepseek: '2-0 / 2-1', qwen: '2-1 / 1-0' },  // 阿根廷 vs 奥地利
  m42: { claude: '4-0 / 3-0', chatgpt: '3-0 / 2-0', deepseek: '3-0 / 2-0', qwen: '3-0 / 2-0' },  // 法国 vs 伊拉克
  m43: { claude: '2-1 / 1-1', chatgpt: '1-1 / 2-1', deepseek: '2-1 / 1-1', qwen: '1-1 / 1-2' },  // 挪威 vs 塞内加尔
  m44: { claude: '1-2 / 0-1', chatgpt: '0-2 / 1-2', deepseek: '0-1 / 0-2', qwen: '0-2 / 1-2' },  // 约旦 vs 阿尔及利亚
  // ═══ June 24 · Round 2 ═══
  m45: { claude: '3-0 / 2-0', chatgpt: '2-0 / 3-1', deepseek: '3-0 / 2-0', qwen: '3-0 / 2-0' },  // 葡萄牙 vs 乌兹别克斯坦
  m46: { claude: '2-0 / 2-1', chatgpt: '2-1 / 1-1', deepseek: '2-1 / 1-0', qwen: '2-0 / 2-1' },  // 英格兰 vs 加纳
  m47: { claude: '0-2 / 1-2', chatgpt: '0-2 / 1-2', deepseek: '0-1 / 1-1', qwen: '0-2 / 1-2' },  // 巴拿马 vs 克罗地亚
  m48: { claude: '2-0 / 1-0', chatgpt: '2-0 / 3-1', deepseek: '2-0 / 1-0', qwen: '2-0 / 1-0' },  // 哥伦比亚 vs 民主刚果
  // ═══ June 25 · Round 3 ═══
  m49: { claude: '2-1 / 1-1', chatgpt: '2-1 / 1-1', deepseek: '1-1 / 2-1', qwen: '2-1 / 1-1' },  // 加拿大 vs 瑞士
  m50: { claude: '1-1 / 2-1', chatgpt: '1-1 / 2-1', deepseek: '1-0 / 0-0', qwen: '1-1 / 2-1' },  // 卡塔尔 vs 波黑
  m51: { claude: '2-0 / 3-0', chatgpt: '2-0 / 3-0', deepseek: '3-0 / 2-0', qwen: '2-0 / 1-0' },  // 海地 vs 摩洛哥
  m52: { claude: '0-2 / 1-3', chatgpt: '0-2 / 1-3', deepseek: '0-2 / 0-3', qwen: '0-2 / 1-2' },  // 巴西 vs 苏格兰
  m53: { claude: '1-2 / 0-1', chatgpt: '0-1 / 1-1', deepseek: '0-1 / 1-1', qwen: '1-2 / 0-1' },  // 韩国 vs 南非
  m54: { claude: '1-2 / 0-1', chatgpt: '1-1 / 1-2', deepseek: '1-1 / 0-1', qwen: '1-2 / 0-1' },  // 墨西哥 vs 捷克
  // ═══ June 26 · Round 3 ═══
  m55: { claude: '0-3 / 1-3', chatgpt: '0-2 / 1-2', deepseek: '0-2 / 0-3', qwen: '0-3 / 1-3' },  // 科特迪瓦 vs 库拉索
  m56: { claude: '1-2 / 0-2', chatgpt: '1-2 / 0-2', deepseek: '0-2 / 1-2', qwen: '1-2 / 0-2' },  // 德国 vs 厄瓜多尔
  m57: { claude: '0-2 / 1-2', chatgpt: '0-2 / 1-2', deepseek: '0-1 / 1-1', qwen: '0-2 / 1-2' },  // 荷兰 vs 突尼斯
  m58: { claude: '1-1 / 2-1', chatgpt: '1-1 / 2-1', deepseek: '1-1 / 2-1', qwen: '1-1 / 2-1' },  // 瑞典 vs 日本
  m59: { claude: '1-1 / 1-2', chatgpt: '1-1 / 1-2', deepseek: '1-1 / 0-1', qwen: '1-1 / 1-2' },  // 美国 vs 土耳其
  m60: { claude: '1-1 / 1-0', chatgpt: '1-1 / 2-1', deepseek: '0-1 / 1-1', qwen: '1-1 / 1-0' },  // 澳大利亚 vs 巴拉圭
  // ═══ June 27 · Round 3 ═══
  m61: { claude: '2-0 / 3-0', chatgpt: '1-0 / 1-1', deepseek: '2-0 / 1-0', qwen: '2-0 / 3-0' },  // 伊拉克 vs 塞内加尔
  m62: { claude: '1-2 / 1-1', chatgpt: '1-2 / 1-1', deepseek: '1-2 / 2-2', qwen: '1-2 / 1-1' },  // 法国 vs 挪威
  m63: { claude: '1-0 / 1-1', chatgpt: '1-1 / 0-1', deepseek: '1-0 / 0-0', qwen: '1-0 / 1-1' },  // 沙特 vs 佛得角
  m64: { claude: '1-2 / 0-2', chatgpt: '1-2 / 1-1', deepseek: '1-1 / 0-1', qwen: '1-2 / 0-2' },  // 西班牙 vs 乌拉圭
  m65: { claude: '1-1 / 2-1', chatgpt: '1-1 / 1-0', deepseek: '1-0 / 0-0', qwen: '1-1 / 2-1' },  // 伊朗 vs 埃及
  m66: { claude: '0-2 / 1-2', chatgpt: '0-2 / 0-3', deepseek: '0-2 / 1-2', qwen: '0-2 / 1-2' },  // 比利时 vs 新西兰
  // ═══ June 28 · Round 3 ═══
  m67: { claude: '2-1 / 1-0', chatgpt: '2-1 / 1-1', deepseek: '1-0 / 0-0', qwen: '2-1 / 1-0' },  // 加纳 vs 克罗地亚
  m68: { claude: '0-2 / 1-3', chatgpt: '0-2 / 1-3', deepseek: '0-2 / 0-3', qwen: '0-2 / 1-2' },  // 英格兰 vs 巴拿马
  m69: { claude: '1-2 / 1-1', chatgpt: '1-1 / 1-2', deepseek: '1-1 / 0-1', qwen: '1-2 / 1-1' },  // 葡萄牙 vs 哥伦比亚
  m70: { claude: '1-1 / 2-1', chatgpt: '1-1 / 1-2', deepseek: '1-1 / 2-1', qwen: '1-1 / 2-1' },  // 乌兹别克斯坦 vs 民主刚果
  m71: { claude: '1-1 / 1-2', chatgpt: '1-1 / 1-2', deepseek: '0-1 / 1-1', qwen: '1-1 / 1-2' },  // 奥地利 vs 阿尔及利亚
  m72: { claude: '0-3 / 1-3', chatgpt: '0-3 / 1-3', deepseek: '0-3 / 0-2', qwen: '0-3 / 1-3' },  // 阿根廷 vs 约旦
};

/** Look up match by ID */
function findMatch(matchId: string): { homeTeamId: string; awayTeamId: string } | null {
  const m = allMatches.find(x => x.id === matchId);
  if (m && m.homeTeamId !== 'TBD' && m.awayTeamId !== 'TBD') return m;
  return null;
}

/** Get unified predictions — manual override or algorithmic.
 *  When matchId is an API numeric ID not found in local allMatches,
 *  pass { homeTeamId, awayTeamId } to bypass the ID lookup. */
export function getPredictions(
  matchId: string,
  opts?: { homeTeamId?: string; awayTeamId?: string },
): MatchPredictionSet | null {
  const match = findMatch(matchId);
  let homeTeamId: string;
  let awayTeamId: string;

  // Prefer explicit opts (from caller context) over match ID lookup
  if (opts?.homeTeamId && opts?.awayTeamId) {
    homeTeamId = opts.homeTeamId;
    awayTeamId = opts.awayTeamId;
  } else if (match) {
    homeTeamId = match.homeTeamId;
    awayTeamId = match.awayTeamId;
  } else {
    return null;
  }

  const home = getTeam(homeTeamId);
  const away = getTeam(awayTeamId);
  if (!home || !away) return null;

  const manual = MANUAL[matchId];
  if (!manual) return predictAllModels(home.id, away.id, matchId);

  // Build from manual override
  const algo = predictAllModels(home.id, away.id, matchId);
  if (!algo) return null;

  const predictions = { ...algo.predictions };
  for (const [mid, rawScore] of Object.entries(manual)) {
    // Take first score for winner determination (e.g. "3-0 / 4-0" → "3-0")
    const primary = rawScore.split(' / ')[0];
    const [h, a] = primary.split('-').map(Number);
    if (isNaN(h) || isNaN(a)) continue;
    predictions[mid as ModelId] = {
      ...predictions[mid as ModelId],
      predictedScore: rawScore,   // keep full string for display
      winner: h > a ? home.name : a > h ? away.name : '平局',
    };
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

  return { ...algo, predictions, consensus: { side: bestSide, modelCount: maxCount, total: 4 } };
}
