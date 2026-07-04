// Generate static /api/matches from local match data.
// Runs after `next build`, writes to `out/api/matches`.
// Cloudflare Pages serves this as a static file at /api/matches.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'out/api';
const OUT_FILE = join(OUT_DIR, 'matches');

// ── Replicated data (mirrors src/data/teams.ts & src/data/matches.ts) ──
// This script CANNOT import TS modules – keep data in sync manually.

const TEAM_TLA = {
  mexico:'MEX', 'south-korea':'KOR', czech:'CZE', 'south-africa':'RSA',
  canada:'CAN', bosnia:'BIH', qatar:'QAT', switzerland:'SUI',
  usa:'USA', paraguay:'PAR', australia:'AUS', turkey:'TUR',
  brazil:'BRA', morocco:'MAR', haiti:'HAI', scotland:'SCO',
  germany:'GER', curacao:'CUW', 'ivory-coast':'CIV', ecuador:'ECU',
  netherlands:'NED', japan:'JPN', sweden:'SWE', tunisia:'TUN',
  spain:'ESP', 'cape-verde':'CPV', 'saudi-arabia':'KSA', uruguay:'URY',
  belgium:'BEL', egypt:'EGY', iran:'IRN', 'new-zealand':'NZL',
  france:'FRA', senegal:'SEN', iraq:'IRQ', norway:'NOR',
  argentina:'ARG', algeria:'DZ', austria:'AUT', jordan:'JOR',
  portugal:'POR', 'dr-congo':'COD', uzbekistan:'UZB', colombia:'COL',
  england:'ENG', croatia:'HRV', ghana:'GHA', panama:'PAN',
};

const TEAM_NAME = {
  mexico:'墨西哥', 'south-korea':'韩国', czech:'捷克', 'south-africa':'南非',
  canada:'加拿大', bosnia:'波黑', qatar:'卡塔尔', switzerland:'瑞士',
  usa:'美国', paraguay:'巴拉圭', australia:'澳大利亚', turkey:'土耳其',
  brazil:'巴西', morocco:'摩洛哥', haiti:'海地', scotland:'苏格兰',
  germany:'德国', curacao:'库拉索', 'ivory-coast':'科特迪瓦', ecuador:'厄瓜多尔',
  netherlands:'荷兰', japan:'日本', sweden:'瑞典', tunisia:'突尼斯',
  spain:'西班牙', 'cape-verde':'佛得角', 'saudi-arabia':'沙特', uruguay:'乌拉圭',
  belgium:'比利时', egypt:'埃及', iran:'伊朗', 'new-zealand':'新西兰',
  france:'法国', senegal:'塞内加尔', iraq:'伊拉克', norway:'挪威',
  argentina:'阿根廷', algeria:'阿尔及利亚', austria:'奥地利', jordan:'约旦',
  portugal:'葡萄牙', 'dr-congo':'民主刚果', uzbekistan:'乌兹别克斯坦', colombia:'哥伦比亚',
  england:'英格兰', croatia:'克罗地亚', ghana:'加纳', panama:'巴拿马',
};

// All matches — mirrors buildGroupMatches() output
// Group stage
const GROUP_SCHEDULE = [
  // R1
  { id:'m1', d:'2026-06-12', t:'03:00', h:'mexico', a:'south-africa', g:'A' },
  { id:'m2', d:'2026-06-12', t:'10:00', h:'south-korea', a:'czech', g:'A' },
  { id:'m3', d:'2026-06-13', t:'03:00', h:'canada', a:'bosnia', g:'B' },
  { id:'m4', d:'2026-06-13', t:'09:00', h:'usa', a:'paraguay', g:'D' },
  { id:'m5', d:'2026-06-14', t:'03:00', h:'qatar', a:'switzerland', g:'B' },
  { id:'m6', d:'2026-06-14', t:'06:00', h:'brazil', a:'morocco', g:'C' },
  { id:'m7', d:'2026-06-14', t:'09:00', h:'haiti', a:'scotland', g:'C' },
  { id:'m8', d:'2026-06-14', t:'12:00', h:'australia', a:'turkey', g:'D' },
  { id:'m9', d:'2026-06-15', t:'01:00', h:'germany', a:'curacao', g:'E' },
  { id:'m10', d:'2026-06-15', t:'04:00', h:'netherlands', a:'japan', g:'F' },
  { id:'m11', d:'2026-06-15', t:'07:00', h:'ivory-coast', a:'ecuador', g:'E' },
  { id:'m12', d:'2026-06-15', t:'10:00', h:'sweden', a:'tunisia', g:'F' },
  { id:'m13', d:'2026-06-16', t:'00:00', h:'spain', a:'cape-verde', g:'H' },
  { id:'m14', d:'2026-06-16', t:'03:00', h:'belgium', a:'egypt', g:'G' },
  { id:'m15', d:'2026-06-16', t:'06:00', h:'saudi-arabia', a:'uruguay', g:'H' },
  { id:'m16', d:'2026-06-16', t:'09:00', h:'iran', a:'new-zealand', g:'G' },
  { id:'m17', d:'2026-06-17', t:'03:00', h:'france', a:'senegal', g:'I' },
  { id:'m18', d:'2026-06-17', t:'06:00', h:'iraq', a:'norway', g:'I' },
  { id:'m19', d:'2026-06-17', t:'09:00', h:'argentina', a:'algeria', g:'J' },
  { id:'m20', d:'2026-06-17', t:'12:00', h:'austria', a:'jordan', g:'J' },
  { id:'m21', d:'2026-06-18', t:'01:00', h:'portugal', a:'dr-congo', g:'K' },
  { id:'m22', d:'2026-06-18', t:'04:00', h:'england', a:'croatia', g:'L' },
  { id:'m23', d:'2026-06-18', t:'07:00', h:'ghana', a:'panama', g:'L' },
  { id:'m24', d:'2026-06-18', t:'10:00', h:'uzbekistan', a:'colombia', g:'K' },
  // R2
  { id:'m25', d:'2026-06-19', t:'00:00', h:'czech', a:'south-africa', g:'A' },
  { id:'m26', d:'2026-06-19', t:'03:00', h:'switzerland', a:'bosnia', g:'B' },
  { id:'m27', d:'2026-06-19', t:'06:00', h:'canada', a:'qatar', g:'B' },
  { id:'m28', d:'2026-06-19', t:'09:00', h:'mexico', a:'south-korea', g:'A' },
  { id:'m29', d:'2026-06-20', t:'03:00', h:'usa', a:'australia', g:'D' },
  { id:'m30', d:'2026-06-20', t:'06:00', h:'scotland', a:'morocco', g:'C' },
  { id:'m31', d:'2026-06-20', t:'08:30', h:'brazil', a:'haiti', g:'C' },
  { id:'m32', d:'2026-06-20', t:'11:00', h:'turkey', a:'paraguay', g:'D' },
  { id:'m33', d:'2026-06-21', t:'01:00', h:'netherlands', a:'sweden', g:'F' },
  { id:'m34', d:'2026-06-21', t:'04:00', h:'germany', a:'ivory-coast', g:'E' },
  { id:'m35', d:'2026-06-21', t:'08:00', h:'ecuador', a:'curacao', g:'E' },
  { id:'m36', d:'2026-06-21', t:'12:00', h:'tunisia', a:'japan', g:'F' },
  { id:'m37', d:'2026-06-22', t:'00:00', h:'spain', a:'saudi-arabia', g:'H' },
  { id:'m38', d:'2026-06-22', t:'03:00', h:'belgium', a:'iran', g:'G' },
  { id:'m39', d:'2026-06-22', t:'06:00', h:'uruguay', a:'cape-verde', g:'H' },
  { id:'m40', d:'2026-06-22', t:'09:00', h:'new-zealand', a:'egypt', g:'G' },
  { id:'m41', d:'2026-06-23', t:'01:00', h:'argentina', a:'austria', g:'J' },
  { id:'m42', d:'2026-06-23', t:'05:00', h:'france', a:'iraq', g:'I' },
  { id:'m43', d:'2026-06-23', t:'08:00', h:'norway', a:'senegal', g:'I' },
  { id:'m44', d:'2026-06-23', t:'11:00', h:'jordan', a:'algeria', g:'J' },
  { id:'m45', d:'2026-06-24', t:'01:00', h:'portugal', a:'uzbekistan', g:'K' },
  { id:'m46', d:'2026-06-24', t:'04:00', h:'england', a:'ghana', g:'L' },
  { id:'m47', d:'2026-06-24', t:'07:00', h:'panama', a:'croatia', g:'L' },
  { id:'m48', d:'2026-06-24', t:'10:00', h:'colombia', a:'dr-congo', g:'K' },
  // R3
  { id:'m49', d:'2026-06-25', t:'03:00', h:'switzerland', a:'canada', g:'B' },
  { id:'m50', d:'2026-06-25', t:'03:00', h:'bosnia', a:'qatar', g:'B' },
  { id:'m51', d:'2026-06-25', t:'06:00', h:'morocco', a:'haiti', g:'C' },
  { id:'m52', d:'2026-06-25', t:'06:00', h:'scotland', a:'brazil', g:'C' },
  { id:'m53', d:'2026-06-25', t:'09:00', h:'south-africa', a:'south-korea', g:'A' },
  { id:'m54', d:'2026-06-25', t:'09:00', h:'czech', a:'mexico', g:'A' },
  { id:'m55', d:'2026-06-26', t:'04:00', h:'curacao', a:'ivory-coast', g:'E' },
  { id:'m56', d:'2026-06-26', t:'04:00', h:'ecuador', a:'germany', g:'E' },
  { id:'m57', d:'2026-06-26', t:'07:00', h:'tunisia', a:'netherlands', g:'F' },
  { id:'m58', d:'2026-06-26', t:'07:00', h:'japan', a:'sweden', g:'F' },
  { id:'m59', d:'2026-06-26', t:'10:00', h:'turkey', a:'usa', g:'D' },
  { id:'m60', d:'2026-06-26', t:'10:00', h:'paraguay', a:'australia', g:'D' },
  { id:'m61', d:'2026-06-27', t:'03:00', h:'senegal', a:'iraq', g:'I' },
  { id:'m62', d:'2026-06-27', t:'03:00', h:'norway', a:'france', g:'I' },
  { id:'m63', d:'2026-06-27', t:'08:00', h:'cape-verde', a:'saudi-arabia', g:'H' },
  { id:'m64', d:'2026-06-27', t:'08:00', h:'uruguay', a:'spain', g:'H' },
  { id:'m65', d:'2026-06-27', t:'11:00', h:'egypt', a:'iran', g:'G' },
  { id:'m66', d:'2026-06-27', t:'11:00', h:'new-zealand', a:'belgium', g:'G' },
  { id:'m67', d:'2026-06-28', t:'05:00', h:'croatia', a:'ghana', g:'L' },
  { id:'m68', d:'2026-06-28', t:'05:00', h:'panama', a:'england', g:'L' },
  { id:'m69', d:'2026-06-28', t:'07:30', h:'colombia', a:'portugal', g:'K' },
  { id:'m70', d:'2026-06-28', t:'07:30', h:'dr-congo', a:'uzbekistan', g:'K' },
  { id:'m71', d:'2026-06-28', t:'10:00', h:'algeria', a:'austria', g:'J' },
  { id:'m72', d:'2026-06-28', t:'10:00', h:'jordan', a:'argentina', g:'J' },
  // R32
  { id:'r32-1',  d:'2026-06-29', t:'03:00', h:'south-africa', a:'canada' },
  { id:'r32-2',  d:'2026-06-30', t:'01:00', h:'brazil', a:'japan' },
  { id:'r32-3',  d:'2026-06-30', t:'04:30', h:'germany', a:'paraguay' },
  { id:'r32-4',  d:'2026-06-30', t:'09:00', h:'netherlands', a:'morocco' },
  { id:'r32-5',  d:'2026-07-01', t:'01:00', h:'ivory-coast', a:'norway' },
  { id:'r32-6',  d:'2026-07-01', t:'05:00', h:'france', a:'sweden' },
  { id:'r32-7',  d:'2026-07-01', t:'09:00', h:'mexico', a:'ecuador' },
  { id:'r32-8',  d:'2026-07-02', t:'00:00', h:'england', a:'dr-congo' },
  { id:'r32-9',  d:'2026-07-02', t:'04:00', h:'belgium', a:'senegal' },
  { id:'r32-10', d:'2026-07-02', t:'08:00', h:'usa', a:'bosnia' },
  { id:'r32-11', d:'2026-07-03', t:'03:00', h:'spain', a:'austria' },
  { id:'r32-12', d:'2026-07-03', t:'07:00', h:'portugal', a:'croatia' },
  { id:'r32-13', d:'2026-07-03', t:'11:00', h:'switzerland', a:'algeria' },
  { id:'r32-14', d:'2026-07-04', t:'02:00', h:'australia', a:'egypt' },
  { id:'r32-15', d:'2026-07-04', t:'06:00', h:'argentina', a:'cape-verde' },
  { id:'r32-16', d:'2026-07-04', t:'09:30', h:'colombia', a:'ghana' },
  // R16
  { id:'r16-1', d:'2026-07-05', t:'01:00', h:'canada', a:'morocco' },
  { id:'r16-2', d:'2026-07-05', t:'05:00', h:'paraguay', a:'france' },
  { id:'r16-3', d:'2026-07-06', t:'04:00', h:'brazil', a:'norway' },
  { id:'r16-4', d:'2026-07-06', t:'08:00', h:'mexico', a:'england' },
  { id:'r16-5', d:'2026-07-07', t:'03:00', h:'portugal', a:'spain' },
  { id:'r16-6', d:'2026-07-07', t:'08:00', h:'usa', a:'belgium' },
  { id:'r16-7', d:'2026-07-08', t:'00:00', h:'argentina', a:'egypt' },
  { id:'r16-8', d:'2026-07-08', t:'04:00', h:'switzerland', a:'colombia' },
  // QF
  { id:'qf-1', d:'2026-07-10', t:'04:00', h:'TBD', a:'TBD' },
  { id:'qf-2', d:'2026-07-11', t:'03:00', h:'TBD', a:'TBD' },
  { id:'qf-3', d:'2026-07-12', t:'05:00', h:'TBD', a:'TBD' },
  { id:'qf-4', d:'2026-07-12', t:'09:00', h:'TBD', a:'TBD' },
  // SF
  { id:'sf-1', d:'2026-07-15', t:'03:00', h:'TBD', a:'TBD' },
  { id:'sf-2', d:'2026-07-16', t:'03:00', h:'TBD', a:'TBD' },
  // 3rd
  { id:'3rd', d:'2026-07-19', t:'05:00', h:'TBD', a:'TBD' },
  // Final
  { id:'final', d:'2026-07-20', t:'03:00', h:'TBD', a:'TBD' },
];

// Completed match results — mirrors COMPLETED_MATCHES
const COMPLETED = {
  m1:  { homeScore: 2, awayScore: 0 },   m2:  { homeScore: 2, awayScore: 1 },
  m3:  { homeScore: 1, awayScore: 1 },   m4:  { homeScore: 4, awayScore: 1 },
  m5:  { homeScore: 1, awayScore: 1 },   m6:  { homeScore: 1, awayScore: 1 },
  m7:  { homeScore: 0, awayScore: 1 },   m8:  { homeScore: 2, awayScore: 0 },
  m9:  { homeScore: 7, awayScore: 1 },   m10: { homeScore: 2, awayScore: 2 },
  m11: { homeScore: 1, awayScore: 0 },   m12: { homeScore: 5, awayScore: 1 },
  m13: { homeScore: 0, awayScore: 0 },   m14: { homeScore: 1, awayScore: 1 },
  m15: { homeScore: 1, awayScore: 1 },   m16: { homeScore: 2, awayScore: 2 },
  m17: { homeScore: 3, awayScore: 1 },   m18: { homeScore: 1, awayScore: 4 },
  m19: { homeScore: 3, awayScore: 0 },   m20: { homeScore: 3, awayScore: 1 },
  m21: { homeScore: 1, awayScore: 1 },   m22: { homeScore: 4, awayScore: 2 },
  m23: { homeScore: 1, awayScore: 0 },   m24: { homeScore: 1, awayScore: 3 },
  m25: { homeScore: 1, awayScore: 1 },   m26: { homeScore: 4, awayScore: 1 },
  m27: { homeScore: 6, awayScore: 0 },   m28: { homeScore: 1, awayScore: 0 },
  m29: { homeScore: 2, awayScore: 0 },   m30: { homeScore: 0, awayScore: 1 },
  m31: { homeScore: 3, awayScore: 0 },   m32: { homeScore: 0, awayScore: 1 },
  m33: { homeScore: 5, awayScore: 1 },   m34: { homeScore: 2, awayScore: 1 },
  m35: { homeScore: 0, awayScore: 0 },   m36: { homeScore: 0, awayScore: 4 },
  m37: { homeScore: 4, awayScore: 0 },   m38: { homeScore: 0, awayScore: 0 },
  m39: { homeScore: 2, awayScore: 2 },   m40: { homeScore: 1, awayScore: 3 },
  m41: { homeScore: 2, awayScore: 0 },   m42: { homeScore: 3, awayScore: 0 },
  m43: { homeScore: 3, awayScore: 2 },   m44: { homeScore: 1, awayScore: 2 },
  m45: { homeScore: 5, awayScore: 0 },   m46: { homeScore: 0, awayScore: 0 },
  m47: { homeScore: 0, awayScore: 1 },   m48: { homeScore: 1, awayScore: 0 },
  m49: { homeScore: 2, awayScore: 1 },   m50: { homeScore: 3, awayScore: 1 },
  m51: { homeScore: 4, awayScore: 2 },   m52: { homeScore: 0, awayScore: 3 },
  m53: { homeScore: 1, awayScore: 0 },   m54: { homeScore: 0, awayScore: 3 },
  m55: { homeScore: 0, awayScore: 2 },   m56: { homeScore: 2, awayScore: 1 },
  m57: { homeScore: 1, awayScore: 3 },   m58: { homeScore: 1, awayScore: 1 },
  m59: { homeScore: 3, awayScore: 2 },   m60: { homeScore: 0, awayScore: 0 },
  m61: { homeScore: 5, awayScore: 0 },   m62: { homeScore: 1, awayScore: 4 },
  m63: { homeScore: 0, awayScore: 0 },   m64: { homeScore: 0, awayScore: 1 },
  m65: { homeScore: 1, awayScore: 1 },   m66: { homeScore: 1, awayScore: 5 },
  m67: { homeScore: 2, awayScore: 1 },   m68: { homeScore: 0, awayScore: 2 },
  m69: { homeScore: 0, awayScore: 0 },   m70: { homeScore: 3, awayScore: 1 },
  m71: { homeScore: 3, awayScore: 3 },   m72: { homeScore: 1, awayScore: 3 },
};

// ── Stage mapping ──
const STAGE_API = {
  group:'GROUP_STAGE', round32:'ROUND_OF_32', round16:'ROUND_OF_16',
  quarterfinal:'QUARTER_FINAL', semifinal:'SEMI_FINAL', thirdPlace:'THIRD_PLACE', final:'FINAL',
};

function toUTC(beijingTime) {
  const [h, m] = beijingTime.split(':').map(Number);
  let utcH = h - 8;
  if (utcH < 0) utcH += 24;
  return `${String(utcH).padStart(2,'0')}:${String(m).padStart(2,'0')}:00Z`;
}

function makeMatch(m, idx) {
  const completed = COMPLETED[m.id];
  const isFinished = !!completed;
  const homeTla = TEAM_TLA[m.h] || 'TBD';
  const awayTla = TEAM_TLA[m.a] || 'TBD';
  const homeName = TEAM_NAME[m.h] || m.h;
  const awayName = TEAM_NAME[m.a] || m.a;

  // Determine stage from match ID
  let stageKey = 'group';
  if (m.id.startsWith('r32-')) stageKey = 'round32';
  else if (m.id.startsWith('r16-')) stageKey = 'round16';
  else if (m.id.startsWith('qf-')) stageKey = 'quarterfinal';
  else if (m.id.startsWith('sf-')) stageKey = 'semifinal';
  else if (m.id === '3rd') stageKey = 'thirdPlace';
  else if (m.id === 'final') stageKey = 'final';

  const utcDate = `${m.d}T${toUTC(m.t)}`;

  return {
    id: idx + 1,
    utcDate,
    status: isFinished ? 'FINISHED' : 'SCHEDULED',
    matchday: 1,
    stage: STAGE_API[stageKey] || 'GROUP_STAGE',
    group: m.g ? `GROUP_${m.g}` : null,
    homeTeam: { id: 0, name: homeName, shortName: homeName, tla: homeTla },
    awayTeam: { id: 0, name: awayName, shortName: awayName, tla: awayTla },
    score: {
      winner: isFinished ? (completed.homeScore > completed.awayScore ? 'HOME_TEAM' : completed.awayScore > completed.homeScore ? 'AWAY_TEAM' : 'DRAW') : null,
      duration: 'REGULAR',
      fullTime: {
        home: isFinished ? completed.homeScore : null,
        away: isFinished ? completed.awayScore : null,
      },
      halfTime: { home: null, away: null },
    },
  };
}

// ── Generate ──
const matches = GROUP_SCHEDULE.map((m, i) => makeMatch(m, i));
const payload = { matches, count: matches.length };

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(payload), 'utf8');

console.log(`✅ Generated ${matches.length} matches → ${OUT_FILE}`);
console.log(`   Finished: ${matches.filter(m => m.status === 'FINISHED').length}`);
console.log(`   Upcoming: ${matches.filter(m => m.status === 'SCHEDULED').length}`);
