// 2026 World Cup Match Schedule (corrected per FIFA official schedule)
// All times Beijing (UTC+8). Tournament: June 12 – July 20, 2026
import { groups } from './teams';

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

  // Round of 32: June 29 – July 4 (16 matches)
  const r32Slots = [
    // June 29
    ['2026-06-29','03:00'],
    // June 30
    ['2026-06-30','01:00'], ['2026-06-30','04:30'], ['2026-06-30','09:00'],
    // July 1
    ['2026-07-01','01:00'], ['2026-07-01','05:00'], ['2026-07-01','09:00'],
    // July 2
    ['2026-07-02','00:00'], ['2026-07-02','04:00'], ['2026-07-02','08:00'],
    // July 3
    ['2026-07-03','03:00'], ['2026-07-03','07:00'], ['2026-07-03','11:00'],
    // July 4
    ['2026-07-04','02:00'], ['2026-07-04','06:00'], ['2026-07-04','09:30'],
  ];
  for (let i=0; i<16; i++) {
    matches.push({ id:`r32-${i+1}`, date:r32Slots[i][0], time:r32Slots[i][1], timeUTC:toUTC(r32Slots[i][1]), homeTeamId:'TBD', awayTeamId:'TBD', stage:'round32', status:'upcoming', venue:koVenues[i%8], city:koCities[i%8] });
  }

  // Round of 16: July 5-8 (8 matches)
  const r16Slots = [
    ['2026-07-05','01:00'],['2026-07-05','05:00'],
    ['2026-07-06','04:00'],['2026-07-06','08:00'],
    ['2026-07-07','03:00'],['2026-07-07','08:00'],
    ['2026-07-08','00:00'],['2026-07-08','04:00'],
  ];
  for (let i=0; i<8; i++) {
    matches.push({ id:`r16-${i+1}`, date:r16Slots[i][0], time:r16Slots[i][1], timeUTC:toUTC(r16Slots[i][1]), homeTeamId:'TBD', awayTeamId:'TBD', stage:'round16', status:'upcoming', venue:koVenues[i], city:koCities[i] });
  }

  // Quarter-finals: July 10-12 (4 matches)
  const qfSlots = [
    ['2026-07-10','04:00'], ['2026-07-11','03:00'],
    ['2026-07-12','05:00'], ['2026-07-12','09:00'],
  ];
  for (let i=0; i<4; i++) {
    matches.push({ id:`qf-${i+1}`, date:qfSlots[i][0], time:qfSlots[i][1], timeUTC:toUTC(qfSlots[i][1]), homeTeamId:'TBD', awayTeamId:'TBD', stage:'quarterfinal', status:'upcoming', venue:koVenues[i], city:koCities[i] });
  }

  // Semis: July 15-16
  matches.push({ id:'sf-1', date:'2026-07-15', time:'03:00', timeUTC:'19:00', homeTeamId:'TBD', awayTeamId:'TBD', stage:'semifinal', status:'upcoming', venue:'AT&T Stadium', city:'达拉斯' });
  matches.push({ id:'sf-2', date:'2026-07-16', time:'03:00', timeUTC:'19:00', homeTeamId:'TBD', awayTeamId:'TBD', stage:'semifinal', status:'upcoming', venue:'Mercedes-Benz Stadium', city:'亚特兰大' });

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
export function getTodayMatches(): Match[] { const today = new Date().toISOString().split('T')[0]; return getMatchesByDate(today); }
export function getUpcomingMatches(): Match[] { const today = new Date().toISOString().split('T')[0]; return allMatches.filter(m => m.date >= today && m.status !== 'finished'); }
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
