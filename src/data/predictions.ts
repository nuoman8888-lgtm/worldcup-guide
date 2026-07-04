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
  m25: { qwen: '2-0 / 1-0', claude: '2-1 / 1-1', chatgpt: '2-0 / 1-0', deepseek: '2-1 / 1-0' },  // 捷克 vs 南非
  m26: { qwen: '2-1 / 1-0', claude: '2-0 / 2-1', chatgpt: '2-0 / 2-1', deepseek: '1-0 / 2-1' },  // 瑞士 vs 波黑
  m27: { qwen: '2-0 / 3-1', claude: '2-1 / 1-0', chatgpt: '1-1 / 2-1', deepseek: '1-1 / 2-1' },  // 加拿大 vs 卡塔尔
  m28: { qwen: '2-1 / 1-1', claude: '1-1 / 1-2', chatgpt: '1-1 / 2-1', deepseek: '1-0 / 2-1' },  // 墨西哥 vs 韩国
  // ═══ June 20 · Round 2 ═══
  m29: { qwen: '1-1 / 2-1', claude: '2-0 / 2-1', chatgpt: '2-1 / 2-0', deepseek: '2-0 / 3-1' },  // 美国 vs 澳大利亚
  m30: { qwen: '0-1 / 1-2', claude: '1-2 / 0-1', chatgpt: '1-1 / 0-1', deepseek: '0-1 / 1-1' },  // 苏格兰 vs 摩洛哥
  m31: { qwen: '3-0 / 4-0', claude: '3-0 / 4-0', chatgpt: '4-0 / 3-0', deepseek: '4-0 / 3-0' },  // 巴西 vs 海地
  m32: { qwen: '1-1 / 2-1', claude: '2-1 / 1-0', chatgpt: '1-1 / 2-1', deepseek: '2-1 / 1-0' },  // 土耳其 vs 巴拉圭
  // ═══ June 21 · Round 2 ═══
  m33: { qwen: '2-1 / 1-0', claude: '2-1 / 3-1', chatgpt: '2-1 / 1-1', deepseek: '1-1 / 2-1' },  // 荷兰 vs 瑞典
  m34: { qwen: '2-0 / 3-1', claude: '2-1 / 3-1', chatgpt: '3-0 / 2-0', deepseek: '2-0 / 3-0' },  // 德国 vs 科特迪瓦
  m35: { qwen: '2-0 / 1-0', claude: '3-0 / 4-0', chatgpt: '2-0 / 3-1', deepseek: '2-0 / 1-0' },  // 厄瓜多尔 vs 库拉索
  m36: { qwen: '1-2 / 1-1', claude: '1-2 / 0-1', chatgpt: '1-2 / 1-1', deepseek: '0-1 / 1-1' },  // 突尼斯 vs 日本
  // ═══ June 22 · Round 2 ═══
  m37: { qwen: '3-0 / 2-0', claude: '2-0 / 3-0', chatgpt: '3-0 / 2-0', deepseek: '2-0 / 3-0' },  // 西班牙 vs 沙特
  m38: { qwen: '2-0 / 1-0', claude: '2-1 / 1-1', chatgpt: '2-1 / 1-1', deepseek: '2-1 / 1-0' },  // 比利时 vs 伊朗
  m39: { qwen: '2-0 / 3-0', claude: '1-0 / 2-0', chatgpt: '2-0 / 3-1', deepseek: '1-0 / 2-0' },  // 乌拉圭 vs 佛得角
  m40: { qwen: '0-2 / 1-2', claude: '1-2 / 1-1', chatgpt: '0-1 / 1-1', deepseek: '0-1 / 0-2' },  // 新西兰 vs 埃及
  // ═══ June 23 · Round 2 ═══
  m41: { qwen: '2-1 / 1-0', claude: '2-1 / 1-0', chatgpt: '2-0 / 2-1', deepseek: '2-0 / 2-1' },  // 阿根廷 vs 奥地利
  m42: { qwen: '3-0 / 2-0', claude: '4-0 / 3-0', chatgpt: '3-0 / 2-0', deepseek: '3-0 / 2-0' },  // 法国 vs 伊拉克
  m43: { qwen: '1-1 / 1-2', claude: '2-1 / 1-1', chatgpt: '1-1 / 2-1', deepseek: '2-1 / 1-1' },  // 挪威 vs 塞内加尔
  m44: { qwen: '0-2 / 1-2', claude: '1-2 / 0-1', chatgpt: '0-2 / 1-2', deepseek: '0-1 / 0-2' },  // 约旦 vs 阿尔及利亚
  // ═══ June 24 · Round 2 ═══
  m45: { qwen: '3-0 / 2-0', claude: '3-0 / 2-0', chatgpt: '2-0 / 3-1', deepseek: '3-0 / 2-0' },  // 葡萄牙 vs 乌兹别克斯坦
  m46: { qwen: '2-0 / 2-1', claude: '2-0 / 2-1', chatgpt: '2-1 / 1-1', deepseek: '2-1 / 1-0' },  // 英格兰 vs 加纳
  m47: { qwen: '0-2 / 1-2', claude: '0-2 / 1-2', chatgpt: '0-2 / 1-2', deepseek: '0-1 / 1-1' },  // 巴拿马 vs 克罗地亚
  m48: { qwen: '2-0 / 1-0', claude: '2-0 / 1-0', chatgpt: '2-0 / 3-1', deepseek: '2-0 / 1-0' },  // 哥伦比亚 vs 民主刚果
  // ═══ June 25 · Round 3 ═══
  m49: { qwen: '2-1 / 1-1', claude: '2-1 / 1-1', chatgpt: '2-1 / 1-1', deepseek: '1-1 / 2-1' },  // 瑞士 vs 加拿大
  m50: { qwen: '1-1 / 2-1', claude: '1-1 / 2-1', chatgpt: '1-1 / 2-1', deepseek: '1-0 / 0-0' },  // 波黑 vs 卡塔尔
  m51: { qwen: '2-0 / 1-0', claude: '2-0 / 3-0', chatgpt: '2-0 / 3-0', deepseek: '3-0 / 2-0' },  // 摩洛哥 vs 海地
  m52: { qwen: '0-2 / 1-2', claude: '0-2 / 1-3', chatgpt: '0-2 / 1-3', deepseek: '0-2 / 0-3' },  // 苏格兰 vs 巴西
  m53: { qwen: '1-2 / 0-1', claude: '1-2 / 0-1', chatgpt: '0-1 / 1-1', deepseek: '0-1 / 1-1' },  // 南非 vs 韩国
  m54: { qwen: '1-2 / 0-1', claude: '1-2 / 0-1', chatgpt: '1-1 / 1-2', deepseek: '1-1 / 0-1' },  // 捷克 vs 墨西哥
  // ═══ June 26 · Round 3 ═══
  m55: { qwen: '0-3 / 1-3', claude: '0-3 / 1-3', chatgpt: '0-2 / 1-2', deepseek: '0-2 / 0-3' },  // 库拉索 vs 科特迪瓦
  m56: { qwen: '1-2 / 0-2', claude: '1-2 / 0-2', chatgpt: '1-2 / 0-2', deepseek: '0-2 / 1-2' },  // 厄瓜多尔 vs 德国
  m57: { qwen: '0-2 / 1-2', claude: '0-2 / 1-2', chatgpt: '0-2 / 1-2', deepseek: '0-1 / 1-1' },  // 突尼斯 vs 荷兰
  m58: { qwen: '1-1 / 2-1', claude: '1-1 / 2-1', chatgpt: '1-1 / 2-1', deepseek: '1-1 / 2-1' },  // 日本 vs 瑞典
  m59: { qwen: '1-1 / 1-2', claude: '1-1 / 1-2', chatgpt: '1-1 / 1-2', deepseek: '1-1 / 0-1' },  // 土耳其 vs 美国
  m60: { qwen: '1-1 / 1-0', claude: '1-1 / 1-0', chatgpt: '1-1 / 2-1', deepseek: '0-1 / 1-1' },  // 巴拉圭 vs 澳大利亚
  // ═══ June 27 · Round 3 ═══
  m61: { qwen: '2-0 / 3-0', claude: '2-0 / 3-0', chatgpt: '1-0 / 1-1', deepseek: '2-0 / 1-0' },  // 塞内加尔 vs 伊拉克
  m62: { qwen: '1-2 / 1-1', claude: '1-2 / 1-1', chatgpt: '1-2 / 1-1', deepseek: '1-2 / 2-2' },  // 挪威 vs 法国
  m63: { qwen: '1-0 / 1-1', claude: '1-0 / 1-1', chatgpt: '1-1 / 0-1', deepseek: '1-0 / 0-0' },  // 佛得角 vs 沙特
  m64: { qwen: '1-2 / 0-2', claude: '1-2 / 0-2', chatgpt: '1-2 / 1-1', deepseek: '1-1 / 0-1' },  // 乌拉圭 vs 西班牙
  m65: { qwen: '1-1 / 2-1', claude: '1-1 / 2-1', chatgpt: '1-1 / 1-0', deepseek: '1-0 / 0-0' },  // 埃及 vs 伊朗
  m66: { qwen: '0-2 / 1-2', claude: '0-2 / 1-2', chatgpt: '0-2 / 0-3', deepseek: '0-2 / 1-2' },  // 新西兰 vs 比利时
  // ═══ June 28 · Round 3 ═══
  m67: { qwen: '2-1 / 1-0', claude: '2-1 / 1-0', chatgpt: '2-1 / 1-1', deepseek: '1-0 / 0-0' },  // 克罗地亚 vs 加纳
  m68: { qwen: '0-2 / 1-2', claude: '0-2 / 1-3', chatgpt: '0-2 / 1-3', deepseek: '0-2 / 0-3' },  // 巴拿马 vs 英格兰
  m69: { qwen: '1-2 / 1-1', claude: '1-2 / 1-1', chatgpt: '1-1 / 1-2', deepseek: '1-1 / 0-1' },  // 哥伦比亚 vs 葡萄牙
  m70: { qwen: '1-1 / 2-1', claude: '1-1 / 2-1', chatgpt: '1-1 / 1-2', deepseek: '1-1 / 2-1' },  // 民主刚果 vs 乌兹别克斯坦
  m71: { qwen: '1-1 / 1-2', claude: '1-1 / 1-2', chatgpt: '1-1 / 1-2', deepseek: '0-1 / 1-1' },  // 阿尔及利亚 vs 奥地利
  m72: { qwen: '0-3 / 1-3', claude: '0-3 / 1-3', chatgpt: '0-3 / 1-3', deepseek: '0-3 / 0-2' },  // 约旦 vs 阿根廷
  // ═══ Round of 32 · 6.29-7.4 ═══
  'r32-1':  { qwen: '0-2 / 1-2', claude: '1-2 / 1-1', chatgpt: '0-2 / 1-2', deepseek: '1-1 / 0-1' },  // 南非 vs 加拿大
  'r32-2':  { qwen: '2-1 / 3-1', claude: '2-1 / 1-1', chatgpt: '2-1 / 1-0', deepseek: '2-1 / 1-0' },  // 巴西 vs 日本
  'r32-3':  { qwen: '2-0 / 3-0', claude: '3-1 / 2-0', chatgpt: '2-0 / 2-1', deepseek: '2-0 / 1-0' },  // 德国 vs 巴拉圭
  'r32-4':  { qwen: '1-0 / 2-1', claude: '2-1 / 1-2', chatgpt: '1-1 / 2-1', deepseek: '2-0 / 2-1' },  // 荷兰 vs 摩洛哥
  'r32-5':  { qwen: '2-1 / 1-1', claude: '1-2 / 1-1', chatgpt: '1-1 / 1-2', deepseek: '1-2 / 0-2' },  // 科特迪瓦 vs 挪威
  'r32-6':  { qwen: '2-0 / 3-1', claude: '3-1 / 2-0', chatgpt: '2-1 / 1-0', deepseek: '2-1 / 1-0' },  // 法国 vs 瑞典
  'r32-7':  { qwen: '1-1 / 2-1', claude: '2-1 / 1-1', chatgpt: '1-1 / 2-1', deepseek: '1-1 / 1-0' },  // 墨西哥 vs 厄瓜多尔
  'r32-8':  { qwen: '3-0 / 4-0', claude: '2-0 / 3-0', chatgpt: '3-0 / 2-0', deepseek: '2-0 / 3-0' },  // 英格兰 vs 民主刚果
  'r32-9':  { qwen: '2-2 / 1-2', claude: '1-1 / 2-1', chatgpt: '1-1 / 2-1', deepseek: '1-1 / 2-1' },  // 比利时 vs 塞内加尔
  'r32-10': { qwen: '2-1 / 1-0', claude: '2-1 / 1-0', chatgpt: '2-1 / 1-1', deepseek: '2-1 / 1-0' },  // 美国 vs 波黑
  'r32-11': { qwen: '2-0 / 3-1', claude: '3-1 / 2-0', chatgpt: '2-0 / 2-1', deepseek: '2-0 / 1-0' },  // 西班牙 vs 奥地利
  'r32-12': { qwen: '1-1 / 2-1', claude: '1-1 / 2-1', chatgpt: '1-1 / 2-1', deepseek: '1-0 / 1-1' },  // 葡萄牙 vs 克罗地亚
  'r32-13': { qwen: '1-0 / 2-0', claude: '2-1 / 1-1', chatgpt: '1-0 / 1-1', deepseek: '1-0 / 0-0' },  // 瑞士 vs 阿尔及利亚
  'r32-14': { qwen: '1-0 / 1-1', claude: '1-2 / 1-1', chatgpt: '1-1 / 1-0', deepseek: '1-1 / 0-1' },  // 澳大利亚 vs 埃及
  'r32-15': { qwen: '3-0 / 4-1', claude: '3-0 / 2-0', chatgpt: '2-0 / 3-0', deepseek: '3-0 / 2-0' },  // 阿根廷 vs 佛得角
  'r32-16': { qwen: '2-0 / 2-1', claude: '2-1 / 1-0', chatgpt: '2-1 / 1-1', deepseek: '2-1 / 1-0' },  // 哥伦比亚 vs 加纳
  // ═══ Round of 16 · 7.5-7.8 ═══
  'r16-1': { claude: '1-0 / 2-1', chatgpt: '0-1 / 1-1', deepseek: '1-1 / 0-1', qwen: '1-2 / 1-1' },  // 加拿大 vs 摩洛哥
  'r16-2': { claude: '3-0 / 2-0', chatgpt: '0-2 / 1-2', deepseek: '0-2 / 1-2', qwen: '0-2 / 1-2' },  // 巴拉圭 vs 法国
  'r16-3': { claude: '2-1 / 3-1', chatgpt: '2-1 / 1-0', deepseek: '2-1 / 1-1', qwen: '2-1 / 1-1' },  // 巴西 vs 挪威
  'r16-4': { claude: '2-0 / 3-0', chatgpt: '1-2 / 0-1', deepseek: '1-2 / 0-1', qwen: '1-2 / 1-1' },  // 墨西哥 vs 英格兰
  'r16-5': { claude: '1-1 / 2-1', chatgpt: '1-1 / 1-2', deepseek: '1-1 / 0-1', qwen: '1-2 / 1-1' },  // 葡萄牙 vs 西班牙
  'r16-6': { claude: '2-1 / 1-0', chatgpt: '1-2 / 1-1', deepseek: '2-1 / 1-1', qwen: '2-1 / 1-1' },  // 美国 vs 比利时
  'r16-7': { claude: '3-0 / 2-0', chatgpt: '2-0 / 3-1', deepseek: '2-0 / 1-0', qwen: '2-0 / 1-0' },  // 阿根廷 vs 埃及
  'r16-8': { claude: '1-0 / 1-1', chatgpt: '1-1 / 1-2', deepseek: '1-1 / 0-0', qwen: '1-1 / 1-2' },  // 瑞士 vs 哥伦比亚
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
