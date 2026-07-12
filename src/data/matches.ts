// 2026 World Cup Match Schedule (corrected per FIFA official schedule)
// All times Beijing (UTC+8). Tournament: June 12 – July 20, 2026
import { groups } from './teams';
import { getBeijingToday } from '@/lib/utils';

export type MatchStatus = 'upcoming' | 'live' | 'finished';
export type MatchStage = 'group' | 'round32' | 'round16' | 'quarterfinal' | 'semifinal' | 'thirdPlace' | 'final';

export interface Match {
  id: string; date: string; time: string; timeUTC: string;
  homeTeamId: string; awayTeamId: string; group?: string;
  stage: MatchStage; status: MatchStatus;
  homeScore?: number; awayScore?: number;
  venue: string; city: string;
}

// Group team index helpers — match round-robin pairs
// Round 1: 1v4 (0v3), 2v3 (1v2)
// Round 2: 1v2 (0v1), 3v4 (2v3)
// Round 3: 1v3 (0v2), 2v4 (1v3)

interface ScheduledMatch { date: string; time: string; groupName: string; homeIdx: number; awayIdx: number; }

function buildGroupMatches(): Match[] {
  const schedule: ScheduledMatch[] = [
    // ===== ROUND 1 =====
    // June 12 (Fri)
    { date:'2026-06-12', time:'03:00', groupName:'A', homeIdx:0, awayIdx:3 }, // Mexico vs South Africa
    { date:'2026-06-12', time:'10:00', groupName:'A', homeIdx:1, awayIdx:2 }, // South Korea vs Czech
    // June 13 (Sat)
    { date:'2026-06-13', time:'03:00', groupName:'B', homeIdx:0, awayIdx:3 }, // Canada vs Bosnia
    { date:'2026-06-13', time:'09:00', groupName:'D', homeIdx:0, awayIdx:3 }, // USA vs Paraguay
    // June 14 (Sun)
    { date:'2026-06-14', time:'03:00', groupName:'B', homeIdx:1, awayIdx:2 }, // Qatar vs Switzerland
    { date:'2026-06-14', time:'06:00', groupName:'C', homeIdx:0, awayIdx:3 }, // Brazil vs Morocco
    { date:'2026-06-14', time:'09:00', groupName:'C', homeIdx:1, awayIdx:2 }, // Haiti vs Scotland
    { date:'2026-06-14', time:'12:00', groupName:'D', homeIdx:1, awayIdx:2 }, // Australia vs Turkey
    // June 15 (Mon)
    { date:'2026-06-15', time:'01:00', groupName:'E', homeIdx:0, awayIdx:3 }, // Germany vs Curacao
    { date:'2026-06-15', time:'04:00', groupName:'F', homeIdx:0, awayIdx:3 }, // Netherlands vs Japan
    { date:'2026-06-15', time:'07:00', groupName:'E', homeIdx:1, awayIdx:2 }, // Ivory Coast vs Ecuador
    { date:'2026-06-15', time:'10:00', groupName:'F', homeIdx:1, awayIdx:2 }, // Sweden vs Tunisia
    // June 16 (Tue)
    { date:'2026-06-16', time:'00:00', groupName:'H', homeIdx:0, awayIdx:3 }, // Spain vs Cape Verde
    { date:'2026-06-16', time:'03:00', groupName:'G', homeIdx:0, awayIdx:3 }, // Belgium vs Egypt
    { date:'2026-06-16', time:'06:00', groupName:'H', homeIdx:1, awayIdx:2 }, // Saudi Arabia vs Uruguay
    { date:'2026-06-16', time:'09:00', groupName:'G', homeIdx:1, awayIdx:2 }, // Iran vs New Zealand
    // June 17 (Wed)
    { date:'2026-06-17', time:'03:00', groupName:'I', homeIdx:0, awayIdx:3 }, // France vs Senegal
    { date:'2026-06-17', time:'06:00', groupName:'I', homeIdx:1, awayIdx:2 }, // Iraq vs Norway
    { date:'2026-06-17', time:'09:00', groupName:'J', homeIdx:0, awayIdx:3 }, // Argentina vs Algeria
    { date:'2026-06-17', time:'12:00', groupName:'J', homeIdx:1, awayIdx:2 }, // Austria vs Jordan
    // June 18 (Thu)
    { date:'2026-06-18', time:'01:00', groupName:'K', homeIdx:0, awayIdx:3 }, // Portugal vs DR Congo
    { date:'2026-06-18', time:'04:00', groupName:'L', homeIdx:0, awayIdx:3 }, // England vs Croatia
    { date:'2026-06-18', time:'07:00', groupName:'L', homeIdx:1, awayIdx:2 }, // Ghana vs Panama
    { date:'2026-06-18', time:'10:00', groupName:'K', homeIdx:1, awayIdx:2 }, // Uzbekistan vs Colombia

    // ===== ROUND 2 =====
    // June 19 (Fri)
    { date:'2026-06-19', time:'00:00', groupName:'A', homeIdx:2, awayIdx:3 }, // Czech vs South Africa
    { date:'2026-06-19', time:'03:00', groupName:'B', homeIdx:2, awayIdx:3 }, // Switzerland vs Bosnia
    { date:'2026-06-19', time:'06:00', groupName:'B', homeIdx:0, awayIdx:1 }, // Canada vs Qatar
    { date:'2026-06-19', time:'09:00', groupName:'A', homeIdx:0, awayIdx:1 }, // Mexico vs South Korea
    // June 20 (Sat)
    { date:'2026-06-20', time:'03:00', groupName:'D', homeIdx:0, awayIdx:1 }, // USA vs Australia
    { date:'2026-06-20', time:'06:00', groupName:'C', homeIdx:2, awayIdx:3 }, // Scotland vs Morocco
    { date:'2026-06-20', time:'08:30', groupName:'C', homeIdx:0, awayIdx:1 }, // Brazil vs Haiti
    { date:'2026-06-20', time:'11:00', groupName:'D', homeIdx:2, awayIdx:3 }, // Turkey vs Paraguay
    // June 21 (Sun)
    { date:'2026-06-21', time:'01:00', groupName:'F', homeIdx:0, awayIdx:1 }, // Netherlands vs Sweden
    { date:'2026-06-21', time:'04:00', groupName:'E', homeIdx:0, awayIdx:1 }, // Germany vs Ivory Coast
    { date:'2026-06-21', time:'08:00', groupName:'E', homeIdx:2, awayIdx:3 }, // Ecuador vs Curacao
    { date:'2026-06-21', time:'12:00', groupName:'F', homeIdx:2, awayIdx:3 }, // Tunisia vs Japan
    // June 22 (Mon)
    { date:'2026-06-22', time:'00:00', groupName:'H', homeIdx:0, awayIdx:1 }, // Spain vs Saudi Arabia
    { date:'2026-06-22', time:'03:00', groupName:'G', homeIdx:0, awayIdx:1 }, // Belgium vs Iran
    { date:'2026-06-22', time:'06:00', groupName:'H', homeIdx:2, awayIdx:3 }, // Uruguay vs Cape Verde
    { date:'2026-06-22', time:'09:00', groupName:'G', homeIdx:2, awayIdx:3 }, // New Zealand vs Egypt
    // June 23 (Tue)
    { date:'2026-06-23', time:'01:00', groupName:'J', homeIdx:0, awayIdx:1 }, // Argentina vs Austria
    { date:'2026-06-23', time:'05:00', groupName:'I', homeIdx:0, awayIdx:1 }, // France vs Iraq
    { date:'2026-06-23', time:'08:00', groupName:'I', homeIdx:2, awayIdx:3 }, // Norway vs Senegal
    { date:'2026-06-23', time:'11:00', groupName:'J', homeIdx:2, awayIdx:3 }, // Jordan vs Algeria
    // June 24 (Wed)
    { date:'2026-06-24', time:'01:00', groupName:'K', homeIdx:0, awayIdx:1 }, // Portugal vs Uzbekistan
    { date:'2026-06-24', time:'04:00', groupName:'L', homeIdx:0, awayIdx:1 }, // England vs Ghana
    { date:'2026-06-24', time:'07:00', groupName:'L', homeIdx:2, awayIdx:3 }, // Panama vs Croatia
    { date:'2026-06-24', time:'10:00', groupName:'K', homeIdx:2, awayIdx:3 }, // Colombia vs DR Congo

    // ===== ROUND 3 =====
    // June 25 (Thu)
    { date:'2026-06-25', time:'03:00', groupName:'B', homeIdx:0, awayIdx:2 }, // Canada vs Switzerland
    { date:'2026-06-25', time:'03:00', groupName:'B', homeIdx:1, awayIdx:3 }, // Qatar vs Bosnia
    { date:'2026-06-25', time:'06:00', groupName:'C', homeIdx:1, awayIdx:3 }, // Haiti vs Morocco
    { date:'2026-06-25', time:'06:00', groupName:'C', homeIdx:0, awayIdx:2 }, // Brazil vs Scotland
    { date:'2026-06-25', time:'09:00', groupName:'A', homeIdx:1, awayIdx:3 }, // South Korea vs South Africa
    { date:'2026-06-25', time:'09:00', groupName:'A', homeIdx:0, awayIdx:2 }, // Mexico vs Czech
    // June 26 (Fri)
    { date:'2026-06-26', time:'04:00', groupName:'E', homeIdx:1, awayIdx:3 }, // Ivory Coast vs Curacao
    { date:'2026-06-26', time:'04:00', groupName:'E', homeIdx:0, awayIdx:2 }, // Germany vs Ecuador
    { date:'2026-06-26', time:'07:00', groupName:'F', homeIdx:0, awayIdx:2 }, // Netherlands vs Tunisia
    { date:'2026-06-26', time:'07:00', groupName:'F', homeIdx:1, awayIdx:3 }, // Sweden vs Japan
    { date:'2026-06-26', time:'10:00', groupName:'D', homeIdx:0, awayIdx:2 }, // USA vs Turkey
    { date:'2026-06-26', time:'10:00', groupName:'D', homeIdx:1, awayIdx:3 }, // Australia vs Paraguay
    // June 27 (Sat)
    { date:'2026-06-27', time:'03:00', groupName:'I', homeIdx:1, awayIdx:3 }, // Iraq vs Senegal
    { date:'2026-06-27', time:'03:00', groupName:'I', homeIdx:0, awayIdx:2 }, // France vs Norway
    { date:'2026-06-27', time:'08:00', groupName:'H', homeIdx:1, awayIdx:3 }, // Saudi Arabia vs Cape Verde
    { date:'2026-06-27', time:'08:00', groupName:'H', homeIdx:0, awayIdx:2 }, // Spain vs Uruguay
    { date:'2026-06-27', time:'11:00', groupName:'G', homeIdx:1, awayIdx:3 }, // Iran vs Egypt
    { date:'2026-06-27', time:'11:00', groupName:'G', homeIdx:0, awayIdx:2 }, // Belgium vs New Zealand
    // June 28 (Sun)
    { date:'2026-06-28', time:'05:00', groupName:'L', homeIdx:1, awayIdx:3 }, // Ghana vs Croatia
    { date:'2026-06-28', time:'05:00', groupName:'L', homeIdx:0, awayIdx:2 }, // England vs Panama
    { date:'2026-06-28', time:'07:30', groupName:'K', homeIdx:0, awayIdx:2 }, // Portugal vs Colombia
    { date:'2026-06-28', time:'07:30', groupName:'K', homeIdx:1, awayIdx:3 }, // Uzbekistan vs DR Congo
    { date:'2026-06-28', time:'10:00', groupName:'J', homeIdx:1, awayIdx:3 }, // Austria vs Algeria
    { date:'2026-06-28', time:'10:00', groupName:'J', homeIdx:0, awayIdx:2 }, // Argentina vs Jordan
  ];

  const matches: Match[] = [];
  let mid = 1;
  const venueMap: Record<string, {v:string;c:string}> = {
    A:{v:'Estadio Azteca',c:'墨西哥城'},
    B:{v:'BMO Field',c:'多伦多'},
    C:{v:'SoFi Stadium',c:'洛杉矶'},
    D:{v:'MetLife Stadium',c:'纽约'},
    E:{v:'AT&T Stadium',c:'达拉斯'},
    F:{v:'Mercedes-Benz Stadium',c:'亚特兰大'},
    G:{v:'Levi\'s Stadium',c:'旧金山'},
    H:{v:'Lumen Field',c:'西雅图'},
    I:{v:'Hard Rock Stadium',c:'迈阿密'},
    J:{v:'NRG Stadium',c:'休斯顿'},
    K:{v:'Lincoln Financial Field',c:'费城'},
    L:{v:'Gillette Stadium',c:'波士顿'},
  };

  for (const s of schedule) {
    const g = groups.find(x => x.name === s.groupName)!;
    const h = g.teams[s.homeIdx];
    const a = g.teams[s.awayIdx];
    const v = venueMap[s.groupName] || {v:'TBD',c:'TBD'};
    matches.push({
      id:`m${mid++}`, date:s.date, time:s.time, timeUTC:toUTC(s.time),
      homeTeamId:h, awayTeamId:a, group:s.groupName,
      stage:'group', status:'upcoming', venue:v.v, city:v.c,
    });
  }

  // ===== KNOCKOUT STAGE =====
  const koVenues = ['Estadio Azteca', 'BMO Field', 'SoFi Stadium', 'MetLife Stadium', 'AT&T Stadium', 'Mercedes-Benz Stadium', 'Lincoln Financial Field', 'Hard Rock Stadium'];
  const koCities = ['墨西哥城', '多伦多', '洛杉矶', '纽约', '达拉斯', '亚特兰大', '费城', '迈阿密'];

  // Round of 32: June 29 - July 4 (16 matches)
  const r32Slots: Array<{date:string; time:string; home:string; away:string}> = [
    // June 29
    { date:'2026-06-29', time:'03:00', home:'south-africa', away:'canada' },
    // June 30
    { date:'2026-06-30', time:'01:00', home:'brazil', away:'japan' },
    { date:'2026-06-30', time:'04:30', home:'germany', away:'paraguay' },
    { date:'2026-06-30', time:'09:00', home:'netherlands', away:'morocco' },
    // July 1
    { date:'2026-07-01', time:'01:00', home:'ivory-coast', away:'norway' },
    { date:'2026-07-01', time:'05:00', home:'france', away:'sweden' },
    { date:'2026-07-01', time:'09:00', home:'mexico', away:'ecuador' },
    // July 2
    { date:'2026-07-02', time:'00:00', home:'england', away:'dr-congo' },
    { date:'2026-07-02', time:'04:00', home:'belgium', away:'senegal' },
    { date:'2026-07-02', time:'08:00', home:'usa', away:'bosnia' },
    // July 3
    { date:'2026-07-03', time:'03:00', home:'spain', away:'austria' },
    { date:'2026-07-03', time:'07:00', home:'portugal', away:'croatia' },
    { date:'2026-07-03', time:'11:00', home:'switzerland', away:'algeria' },
    // July 4
    { date:'2026-07-04', time:'02:00', home:'australia', away:'egypt' },
    { date:'2026-07-04', time:'06:00', home:'argentina', away:'cape-verde' },
    { date:'2026-07-04', time:'09:30', home:'colombia', away:'ghana' },
  ];
  for (let i=0; i<r32Slots.length; i++) {
    const s = r32Slots[i];
    matches.push({ id:`r32-${i+1}`, date:s.date, time:s.time, timeUTC:toUTC(s.time), homeTeamId:s.home, awayTeamId:s.away, stage:'round32', status:'upcoming', venue:koVenues[i%8], city:koCities[i%8] });
  }

  // Round of 16: July 5-8 (8 matches)
  const r16Slots: Array<{date:string; time:string; home:string; away:string}> = [
    // July 5
    { date:'2026-07-05', time:'01:00', home:'canada', away:'morocco' },
    { date:'2026-07-05', time:'05:00', home:'paraguay', away:'france' },
    // July 6
    { date:'2026-07-06', time:'04:00', home:'brazil', away:'norway' },
    { date:'2026-07-06', time:'08:00', home:'mexico', away:'england' },
    // July 7
    { date:'2026-07-07', time:'03:00', home:'portugal', away:'spain' },
    { date:'2026-07-07', time:'08:00', home:'usa', away:'belgium' },
    // July 8
    { date:'2026-07-08', time:'00:00', home:'argentina', away:'egypt' },
    { date:'2026-07-08', time:'04:00', home:'switzerland', away:'colombia' },
  ];
  for (let i=0; i<r16Slots.length; i++) {
    const s = r16Slots[i];
    matches.push({ id:`r16-${i+1}`, date:s.date, time:s.time, timeUTC:toUTC(s.time), homeTeamId:s.home, awayTeamId:s.away, stage:'round16', status:'upcoming', venue:koVenues[i], city:koCities[i] });
  }

  // Quarter-finals: July 10-12 (4 matches)
  const qfData: Array<{date:string; time:string; home:string; away:string; venue:string; city:string}> = [
    { date:'2026-07-10', time:'04:00', home:'france',       away:'morocco',     venue:'Gillette Stadium',        city:'波士顿' },
    { date:'2026-07-11', time:'03:00', home:'spain',        away:'belgium',     venue:'SoFi Stadium',            city:'洛杉矶' },
    { date:'2026-07-12', time:'05:00', home:'norway',       away:'england',     venue:'Hard Rock Stadium',       city:'迈阿密' },
    { date:'2026-07-12', time:'09:00', home:'argentina',    away:'switzerland', venue:'Arrowhead Stadium',        city:'堪萨斯城' },
  ];
  for (let i=0; i<qfData.length; i++) {
    const q = qfData[i];
    matches.push({ id:`qf-${i+1}`, date:q.date, time:q.time, timeUTC:toUTC(q.time), homeTeamId:q.home, awayTeamId:q.away, stage:'quarterfinal', status:'upcoming', venue:q.venue, city:q.city });
  }

  // Semis: July 15-16
  matches.push({ id:'sf-1', date:'2026-07-15', time:'03:00', timeUTC:'19:00', homeTeamId:'france', awayTeamId:'spain', stage:'semifinal', status:'upcoming', venue:'AT&T Stadium', city:'达拉斯' });
  matches.push({ id:'sf-2', date:'2026-07-16', time:'03:00', timeUTC:'19:00', homeTeamId:'england', awayTeamId:'argentina', stage:'semifinal', status:'upcoming', venue:'Mercedes-Benz Stadium', city:'亚特兰大' });

  // 3rd place: July 19
  matches.push({ id:'3rd', date:'2026-07-19', time:'05:00', timeUTC:'21:00', homeTeamId:'TBD', awayTeamId:'TBD', stage:'thirdPlace', status:'upcoming', venue:'Hard Rock Stadium', city:'迈阿密' });
  // Final: July 20
  matches.push({ id:'final', date:'2026-07-20', time:'03:00', timeUTC:'19:00', homeTeamId:'TBD', awayTeamId:'TBD', stage:'final', status:'upcoming', venue:'MetLife Stadium', city:'纽约' });

  return matches;
}

function toUTC(beijingTime: string): string {
  const [h, m] = beijingTime.split(':').map(Number);
  let utcH = h - 8;
  if (utcH < 0) utcH += 24;
  return `${String(utcH).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

export const allMatches: Match[] = buildGroupMatches();

export function getMatchesByDate(date: string): Match[] { return allMatches.filter(m => m.date === date); }
export function getMatchesByTeam(teamId: string): Match[] { return allMatches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId); }
export function getMatchesByGroup(group: string): Match[] { return allMatches.filter(m => m.group === group); }
export function getMatch(id: string): Match | undefined { return allMatches.find(m => m.id === id); }
export function getTodayMatches(): Match[] { const today = getBeijingToday(); return getMatchesByDate(today); }
export function getUpcomingMatches(): Match[] { const today = getBeijingToday(); return allMatches.filter(m => m.date >= today && m.status !== 'finished'); }

/** Get only genuinely upcoming/live matches (excludes finished, only today and future) */
export function getActiveUpcomingMatches(): Match[] {
  const today = getBeijingToday();
  return allMatches.filter(m => m.date >= today && (m.status === 'upcoming' || m.status === 'live'));
}

/** Get today's focus matches (finished + live + upcoming) */
export function getTodayFocusMatches(): Match[] {
  const today = getBeijingToday();
  return allMatches.filter(m => m.date === today);
}
export function getUniqueDates(): string[] { const dates = new Set(allMatches.map(m => m.date)); return Array.from(dates).sort(); }
export function getKnockoutMatches(): Match[] { return allMatches.filter(m => m.stage !== 'group'); }

export const stageNames: Record<MatchStage, string> = {
  group:'小组赛', round32:'32强赛', round16:'16强赛', quarterfinal:'四分之一决赛', semifinal:'半决赛', thirdPlace:'三四名决赛', final:'决赛',
};

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['周日','周一','周二','周三','周四','周五','周六'];
  return `${date.getMonth()+1}月${date.getDate()}日 ${days[date.getDay()]}`;
}

/** Real completed match results — authoritative data source */
export const COMPLETED_MATCHES: Record<string, { homeScore: number; awayScore: number }> = {
  // === June 12-13 . Round 1 ===
  m1:  { homeScore: 2, awayScore: 0 },  // Mexico 2-0 South Africa
  m2:  { homeScore: 2, awayScore: 1 },  // South Korea 2-1 Czechia
  // June 13
  m3:  { homeScore: 1, awayScore: 1 },  // Canada 1-1 Bosnia
  m4:  { homeScore: 4, awayScore: 1 },  // USA 4-1 Paraguay
  // June 14
  m5:  { homeScore: 1, awayScore: 1 },  // Qatar 1-1 Switzerland
  m6:  { homeScore: 1, awayScore: 1 },  // Brazil 1-1 Morocco
  m7:  { homeScore: 0, awayScore: 1 },  // Haiti 0-1 Scotland
  m8:  { homeScore: 2, awayScore: 0 },  // Australia 2-0 Turkey
  // June 15
  m9:  { homeScore: 7, awayScore: 1 },  // Germany 7-1 Curacao
  m10: { homeScore: 2, awayScore: 2 },  // Netherlands 2-2 Japan
  m11: { homeScore: 1, awayScore: 0 },  // Ivory Coast 1-0 Ecuador
  m12: { homeScore: 5, awayScore: 1 },  // Sweden 5-1 Tunisia
  // June 16
  m13: { homeScore: 0, awayScore: 0 },  // Spain 0-0 Cape Verde
  m14: { homeScore: 1, awayScore: 1 },  // Belgium 1-1 Egypt
  m15: { homeScore: 1, awayScore: 1 },  // Saudi Arabia 1-1 Uruguay
  m16: { homeScore: 2, awayScore: 2 },  // Iran 2-2 New Zealand
  // === June 17 . Round 1 ===
  m17: { homeScore: 3, awayScore: 1 },  // France 3-1 Senegal
  m18: { homeScore: 1, awayScore: 4 },  // Iraq 1-4 Norway
  m19: { homeScore: 3, awayScore: 0 },  // Argentina 3-0 Algeria
  m20: { homeScore: 3, awayScore: 1 },  // Austria 3-1 Jordan
  // === June 18 . Round 1 ===
  m21: { homeScore: 1, awayScore: 1 },  // Portugal 1-1 DR Congo
  m22: { homeScore: 4, awayScore: 2 },  // England 4-2 Croatia
  m23: { homeScore: 1, awayScore: 0 },  // Ghana 1-0 Panama
  m24: { homeScore: 1, awayScore: 3 },  // Uzbekistan 1-3 Colombia
  // === June 19 . Round 2 ===
  m25: { homeScore: 1, awayScore: 1 },  // Czechia 1-1 South Africa
  m26: { homeScore: 4, awayScore: 1 },  // Switzerland 4-1 Bosnia
  m27: { homeScore: 6, awayScore: 0 },  // Canada 6-0 Qatar
  m28: { homeScore: 1, awayScore: 0 },  // Mexico 1-0 South Korea
  // === June 20 . Round 2 ===
  m29: { homeScore: 2, awayScore: 0 },  // USA 2-0 Australia
  m30: { homeScore: 0, awayScore: 1 },  // Scotland 0-1 Morocco
  m31: { homeScore: 3, awayScore: 0 },  // Brazil 3-0 Haiti
  m32: { homeScore: 0, awayScore: 1 },  // Turkey 0-1 Paraguay
  // === June 21 . Round 2 ===
  m33: { homeScore: 5, awayScore: 1 },  // Netherlands 5-1 Sweden
  m34: { homeScore: 2, awayScore: 1 },  // Germany 2-1 Ivory Coast
  m35: { homeScore: 0, awayScore: 0 },  // Ecuador 0-0 Curacao
  m36: { homeScore: 0, awayScore: 4 },  // Tunisia 0-4 Japan
  // === June 22 . Round 2 ===
  m37: { homeScore: 4, awayScore: 0 },  // Spain 4-0 Saudi Arabia
  m38: { homeScore: 0, awayScore: 0 },  // Belgium 0-0 Iran
  m39: { homeScore: 2, awayScore: 2 },  // Uruguay 2-2 Cape Verde
  m40: { homeScore: 1, awayScore: 3 },  // New Zealand 1-3 Egypt
  // === June 23 . Round 2 ===
  m41: { homeScore: 2, awayScore: 0 },  // Argentina 2-0 Austria
  m42: { homeScore: 3, awayScore: 0 },  // France 3-0 Iraq
  m43: { homeScore: 3, awayScore: 2 },  // Norway 3-2 Senegal
  m44: { homeScore: 1, awayScore: 2 },  // Jordan 1-2 Algeria
  // === June 24 . Round 2 ===
  m45: { homeScore: 5, awayScore: 0 },  // Portugal 5-0 Uzbekistan
  m46: { homeScore: 0, awayScore: 0 },  // England 0-0 Ghana
  m47: { homeScore: 0, awayScore: 1 },  // Panama 0-1 Croatia
  m48: { homeScore: 1, awayScore: 0 },  // Colombia 1-0 DR Congo
  // === June 25 . Round 3 ===
  m49: { homeScore: 2, awayScore: 1 },  // Switzerland 2-1 Canada
  m50: { homeScore: 3, awayScore: 1 },  // Bosnia 3-1 Qatar
  m51: { homeScore: 4, awayScore: 2 },  // Morocco 4-2 Haiti
  m52: { homeScore: 0, awayScore: 3 },  // Scotland 0-3 Brazil
  m53: { homeScore: 1, awayScore: 0 },  // South Africa 1-0 South Korea
  m54: { homeScore: 0, awayScore: 3 },  // Czechia 0-3 Mexico
  // === June 26 . Round 3 ===
  m55: { homeScore: 0, awayScore: 2 },  // Curacao 0-2 Ivory Coast
  m56: { homeScore: 2, awayScore: 1 },  // Ecuador 2-1 Germany
  m57: { homeScore: 1, awayScore: 3 },  // Tunisia 1-3 Netherlands
  m58: { homeScore: 1, awayScore: 1 },  // Japan 1-1 Sweden
  m59: { homeScore: 3, awayScore: 2 },  // Turkey 3-2 USA
  m60: { homeScore: 0, awayScore: 0 },  // Paraguay 0-0 Australia
  // === June 27 . Round 3 ===
  m61: { homeScore: 5, awayScore: 0 },  // Senegal 5-0 Iraq
  m62: { homeScore: 1, awayScore: 4 },  // Norway 1-4 France
  m63: { homeScore: 0, awayScore: 0 },  // Cape Verde 0-0 Saudi Arabia
  m64: { homeScore: 0, awayScore: 1 },  // Uruguay 0-1 Spain
  m65: { homeScore: 1, awayScore: 1 },  // Egypt 1-1 Iran
  m66: { homeScore: 1, awayScore: 5 },  // New Zealand 1-5 Belgium
  // === June 28 . Round 3 ===
  m67: { homeScore: 2, awayScore: 1 },  // Croatia 2-1 Ghana
  m68: { homeScore: 0, awayScore: 2 },  // Panama 0-2 England
  m69: { homeScore: 0, awayScore: 0 },  // Colombia 0-0 Portugal
  m70: { homeScore: 3, awayScore: 1 },  // DR Congo 3-1 Uzbekistan
  m71: { homeScore: 3, awayScore: 3 },  // Algeria 3-3 Austria
  m72: { homeScore: 1, awayScore: 3 },  // Jordan 1-3 Argentina
  // === Round of 32 . 6.29-7.4 ===
  'r32-1':  { homeScore: 0, awayScore: 1 },  // South Africa 0-1 Canada
  'r32-2':  { homeScore: 2, awayScore: 1 },  // Brazil 2-1 Japan
  'r32-3':  { homeScore: 4, awayScore: 5 },  // Germany 4-5 Paraguay
  'r32-4':  { homeScore: 3, awayScore: 4 },  // Netherlands 3-4 Morocco
  'r32-5':  { homeScore: 1, awayScore: 2 },  // Ivory Coast 1-2 Norway
  'r32-6':  { homeScore: 3, awayScore: 0 },  // France 3-0 Sweden
  'r32-7':  { homeScore: 2, awayScore: 0 },  // Mexico 2-0 Ecuador
  'r32-8':  { homeScore: 2, awayScore: 1 },  // England 2-1 DR Congo
  'r32-9':  { homeScore: 3, awayScore: 2 },  // Belgium 3-2 Senegal
  'r32-10': { homeScore: 2, awayScore: 0 },  // USA 2-0 Bosnia
  'r32-11': { homeScore: 3, awayScore: 0 },  // Spain 3-0 Austria
  'r32-12': { homeScore: 2, awayScore: 1 },  // Portugal 2-1 Croatia
  'r32-13': { homeScore: 2, awayScore: 0 },  // Switzerland 2-0 Algeria
  'r32-14': { homeScore: 3, awayScore: 5 },  // Australia 3-5 Egypt
  'r32-15': { homeScore: 3, awayScore: 2 },  // Argentina 3-2 Cape Verde
  'r32-16': { homeScore: 1, awayScore: 0 },  // Colombia 1-0 Ghana
  // === Round of 16 · 7.5-7.8 ===
  'r16-1': { homeScore: 0, awayScore: 3 },  // Canada 0-3 Morocco
  'r16-2': { homeScore: 0, awayScore: 1 },  // Paraguay 0-1 France
  'r16-3': { homeScore: 1, awayScore: 2 },  // Brazil 1-2 Norway
  'r16-4': { homeScore: 2, awayScore: 3 },  // Mexico 2-3 England
  'r16-5': { homeScore: 0, awayScore: 1 },  // Portugal 0-1 Spain
  'r16-6': { homeScore: 1, awayScore: 4 },  // USA 1-4 Belgium
  'r16-7': { homeScore: 3, awayScore: 2 },  // Argentina 3-2 Egypt
  'r16-8': { homeScore: 4, awayScore: 3 },  // Switzerland 4-3 Colombia
  // === Quarter-finals · 7.10-7.12 ===
  'qf-1': { homeScore: 2, awayScore: 0 },  // France 2-0 Morocco
  'qf-2': { homeScore: 2, awayScore: 1 },  // Spain 2-1 Belgium
  'qf-3': { homeScore: 1, awayScore: 2 },  // Norway 1-2 England (AET, 1-1 FT)
  'qf-4': { homeScore: 3, awayScore: 1 },  // Argentina 3-1 Switzerland (AET, 1-1 FT)
};

/**
 * Apply real completed match results.
 * Priority: COMPLETED_MATCHES (real data) > simulated (deterministic fallback).
 */
export function applyCompletedResults(): void {
  for (const [id, score] of Object.entries(COMPLETED_MATCHES)) {
    const m = allMatches.find(x => x.id === id);
    if (m) {
      m.status = 'finished';
      m.homeScore = score.homeScore;
      m.awayScore = score.awayScore;
    }
  }
}

/** Expert predictions for upcoming matches */
export const EXPERT_PREDICTIONS: Record<string, string> = {
  m9:  '4-0',   // 德国 vs 库拉索
  m10: '2-1',   // 荷兰 vs 日本
  m11: '1-1',   // 科特迪瓦 vs 厄瓜多尔
  m12: '1-0',   // 瑞典 vs 突尼斯
};

/** Get expert prediction for a match, or null if not available */
export function getExpertPrediction(matchId: string): string | null {
  return EXPERT_PREDICTIONS[matchId] || null;
}
