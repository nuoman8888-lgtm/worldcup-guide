// 2026 World Cup Match Schedule
// 104 total matches: 72 group + 32 knockout

import { groups } from './teams';

export type MatchStatus = 'upcoming' | 'live' | 'finished';
export type MatchStage = 'group' | 'round32' | 'round16' | 'quarterfinal' | 'semifinal' | 'thirdPlace' | 'final';

export interface Match {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // HH:MM Beijing time (UTC+8)
  timeUTC: string;
  homeTeamId: string;
  awayTeamId: string;
  group?: string;
  stage: MatchStage;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  venue: string;
  city: string;
}

// Generate group stage matches
function generateGroupMatches(): Match[] {
  const matches: Match[] = [];
  let matchId = 1;

  // Schedule: each group plays over ~2 weeks
  // Format: 4-5 matches per day
  const groupSchedule: Record<string, { group: string; matchIndex: number }[]> = {};

  // We have 12 groups, each with 6 matches (round-robin among 4 teams)
  // Total: 72 group matches
  // Spread across days from June 11 to June 27

  // Day-by-day schedule
  const daySchedule: [string, [string, number][]][] = [
    // June 11 (Thursday) - Opening day
    ['2026-06-11', [
      ['A', 1], ['A', 2], // Canada vs Cameroon, Portugal vs South Korea
    ]],
    // June 12 (Friday)
    ['2026-06-12', [
      ['B', 1], ['B', 2], ['C', 1], ['C', 2],
    ]],
    // June 13 (Saturday)
    ['2026-06-13', [
      ['D', 1], ['D', 2], ['E', 1], ['E', 2],
    ]],
    // June 14 (Sunday)
    ['2026-06-14', [
      ['F', 1], ['F', 2], ['G', 1], ['G', 2],
    ]],
    // June 15 (Monday)
    ['2026-06-15', [
      ['H', 1], ['H', 2], ['I', 1], ['I', 2],
    ]],
    // June 16 (Tuesday)
    ['2026-06-16', [
      ['J', 1], ['J', 2], ['K', 1], ['K', 2],
    ]],
    // June 17 (Wednesday)
    ['2026-06-17', [
      ['L', 1], ['L', 2], ['A', 3], ['A', 4],
    ]],
    // June 18 (Thursday)
    ['2026-06-18', [
      ['B', 3], ['B', 4], ['C', 3], ['C', 4],
    ]],
    // June 19 (Friday)
    ['2026-06-19', [
      ['D', 3], ['D', 4], ['E', 3], ['E', 4],
    ]],
    // June 20 (Saturday)
    ['2026-06-20', [
      ['F', 3], ['F', 4], ['G', 3], ['G', 4],
    ]],
    // June 21 (Sunday)
    ['2026-06-21', [
      ['H', 3], ['H', 4], ['I', 3], ['I', 4],
    ]],
    // June 22 (Monday)
    ['2026-06-22', [
      ['J', 3], ['J', 4], ['K', 3], ['K', 4],
    ]],
    // June 23 (Tuesday)
    ['2026-06-23', [
      ['L', 3], ['L', 4], ['A', 5], ['A', 6],
    ]],
    // June 24 (Wednesday)
    ['2026-06-24', [
      ['B', 5], ['B', 6], ['C', 5], ['C', 6], ['D', 5], ['D', 6],
    ]],
    // June 25 (Thursday)
    ['2026-06-25', [
      ['E', 5], ['E', 6], ['F', 5], ['F', 6], ['G', 5], ['G', 6],
    ]],
    // June 26 (Friday)
    ['2026-06-26', [
      ['H', 5], ['H', 6], ['I', 5], ['I', 6], ['J', 5], ['J', 6],
    ]],
    // June 27 (Saturday)
    ['2026-06-27', [
      ['K', 5], ['K', 6], ['L', 5], ['L', 6],
    ]],
  ];

  // Match pairings per group (matchIndex: [homeTeamIndex, awayTeamIndex] in group.teams array)
  // Standard round-robin: 1v2, 3v4, 1v3, 2v4, 1v4, 2v3
  const matchPairings: Record<number, [number, number]> = {
    1: [0, 3], // Team1 vs Team4
    2: [1, 2], // Team2 vs Team3
    3: [0, 1], // Team1 vs Team2
    4: [2, 3], // Team3 vs Team4
    5: [0, 2], // Team1 vs Team3
    6: [1, 3], // Team2 vs Team4
  };

  const timeSlots = ['13:00', '16:00', '20:00', '23:00'];
  const timeSlotsUTC = ['05:00', '08:00', '12:00', '15:00'];

  for (const [date, groupMatches] of daySchedule) {
    for (let i = 0; i < groupMatches.length; i++) {
      const [groupName, matchIndex] = groupMatches[i] as [string, number];
      const group = groups.find(g => g.name === groupName)!;
      const pairing = matchPairings[matchIndex as number];
      const homeTeamId = group.teams[pairing[0]];
      const awayTeamId = group.teams[pairing[1]];

      const timeSlot = i % 4;
      const time = timeSlots[timeSlot];
      const timeUTC = timeSlotsUTC[timeSlot];

      const venueInfo = getVenue(groupName, matchIndex);

      matches.push({
        id: `m${matchId}`,
        date,
        time,
        timeUTC,
        homeTeamId,
        awayTeamId,
        group: groupName,
        stage: 'group',
        status: 'upcoming',
        venue: venueInfo.venue,
        city: venueInfo.city,
      });
      matchId++;
    }
  }

  // ===== KNOCKOUT STAGE =====
  // Round of 32: June 28 - July 3 (16 matches)
  const r32Dates = ['2026-06-28', '2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02', '2026-07-03'];
  for (let i = 0; i < 16; i++) {
    const dateIdx = Math.floor(i / 3);
    matches.push({
      id: `r32-${i + 1}`,
      date: r32Dates[dateIdx],
      time: i % 2 === 0 ? '20:00' : '23:00',
      timeUTC: i % 2 === 0 ? '12:00' : '15:00',
      homeTeamId: 'TBD',
      awayTeamId: 'TBD',
      stage: 'round32',
      status: 'upcoming',
      venue: knockoutVenues[i % 8],
      city: knockoutCities[i % 8],
    });
  }

  // Round of 16: July 4-7 (8 matches)
  const r16Dates = ['2026-07-04', '2026-07-05', '2026-07-06', '2026-07-07'];
  for (let i = 0; i < 8; i++) {
    matches.push({
      id: `r16-${i + 1}`,
      date: r16Dates[Math.floor(i / 2)],
      time: i % 2 === 0 ? '20:00' : '23:00',
      timeUTC: i % 2 === 0 ? '12:00' : '15:00',
      homeTeamId: 'TBD',
      awayTeamId: 'TBD',
      stage: 'round16',
      status: 'upcoming',
      venue: knockoutVenues[i % 8],
      city: knockoutCities[i % 8],
    });
  }

  // Quarter-finals: July 9-10 (4 matches)
  for (let i = 0; i < 4; i++) {
    matches.push({
      id: `qf-${i + 1}`,
      date: i < 2 ? '2026-07-09' : '2026-07-10',
      time: i % 2 === 0 ? '20:00' : '23:00',
      timeUTC: i % 2 === 0 ? '12:00' : '15:00',
      homeTeamId: 'TBD',
      awayTeamId: 'TBD',
      stage: 'quarterfinal',
      status: 'upcoming',
      venue: knockoutVenues[i],
      city: knockoutCities[i],
    });
  }

  // Semi-finals: July 13-14
  matches.push({
    id: 'sf-1',
    date: '2026-07-13',
    time: '20:00',
    timeUTC: '12:00',
    homeTeamId: 'TBD',
    awayTeamId: 'TBD',
    stage: 'semifinal',
    status: 'upcoming',
    venue: 'AT&T Stadium',
    city: 'Arlington (Dallas)',
  });
  matches.push({
    id: 'sf-2',
    date: '2026-07-14',
    time: '20:00',
    timeUTC: '12:00',
    homeTeamId: 'TBD',
    awayTeamId: 'TBD',
    stage: 'semifinal',
    status: 'upcoming',
    venue: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
  });

  // Third place: July 18
  matches.push({
    id: '3rd',
    date: '2026-07-18',
    time: '20:00',
    timeUTC: '12:00',
    homeTeamId: 'TBD',
    awayTeamId: 'TBD',
    stage: 'thirdPlace',
    status: 'upcoming',
    venue: 'Hard Rock Stadium',
    city: 'Miami',
  });

  // Final: July 19
  matches.push({
    id: 'final',
    date: '2026-07-19',
    time: '20:00',
    timeUTC: '12:00',
    homeTeamId: 'TBD',
    awayTeamId: 'TBD',
    stage: 'final',
    status: 'upcoming',
    venue: 'MetLife Stadium',
    city: 'New York / New Jersey',
  });

  return matches;
}

function getVenue(group: string, matchIndex: number): { venue: string; city: string } {
  const venueMap: Record<string, { venue: string; city: string }[]> = {
    'A': [
      { venue: 'BMO Field', city: 'Toronto' },
      { venue: 'BC Place', city: 'Vancouver' },
    ],
    'B': [
      { venue: 'Estadio Azteca', city: 'Mexico City' },
      { venue: 'Estadio BBVA', city: 'Monterrey' },
    ],
    'C': [
      { venue: 'SoFi Stadium', city: 'Los Angeles' },
      { venue: "Levi's Stadium", city: 'San Francisco' },
    ],
    'D': [
      { venue: 'MetLife Stadium', city: 'New York / New Jersey' },
      { venue: 'Gillette Stadium', city: 'Boston' },
    ],
    'E': [
      { venue: 'AT&T Stadium', city: 'Arlington (Dallas)' },
      { venue: 'NRG Stadium', city: 'Houston' },
    ],
    'F': [
      { venue: 'Mercedes-Benz Stadium', city: 'Atlanta' },
      { venue: 'Hard Rock Stadium', city: 'Miami' },
    ],
    'G': [
      { venue: 'Lincoln Financial Field', city: 'Philadelphia' },
      { venue: 'Arrowhead Stadium', city: 'Kansas City' },
    ],
    'H': [
      { venue: "Lumen Field", city: 'Seattle' },
      { venue: 'Empower Field', city: 'Denver' },
    ],
    'I': [
      { venue: 'BMO Field', city: 'Toronto' },
      { venue: 'BC Place', city: 'Vancouver' },
    ],
    'J': [
      { venue: 'Estadio Azteca', city: 'Mexico City' },
      { venue: 'Estadio Akron', city: 'Guadalajara' },
    ],
    'K': [
      { venue: 'SoFi Stadium', city: 'Los Angeles' },
      { venue: "Levi's Stadium", city: 'San Francisco' },
    ],
    'L': [
      { venue: 'MetLife Stadium', city: 'New York / New Jersey' },
      { venue: 'Gillette Stadium', city: 'Boston' },
    ],
  };

  const venues = venueMap[group] || [{ venue: 'TBD', city: 'TBD' }];
  return venues[matchIndex % venues.length];
}

const knockoutVenues = [
  'BMO Field', 'Estadio Azteca', 'SoFi Stadium', 'MetLife Stadium',
  'AT&T Stadium', 'Mercedes-Benz Stadium', 'Lincoln Financial Field', 'Hard Rock Stadium',
];

const knockoutCities = [
  'Toronto', 'Mexico City', 'Los Angeles', 'New York / New Jersey',
  'Arlington (Dallas)', 'Atlanta', 'Philadelphia', 'Miami',
];

export const allMatches: Match[] = generateGroupMatches();

// Helper functions
export function getMatchesByDate(date: string): Match[] {
  return allMatches.filter(m => m.date === date);
}

export function getMatchesByTeam(teamId: string): Match[] {
  return allMatches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId);
}

export function getMatchesByGroup(group: string): Match[] {
  return allMatches.filter(m => m.group === group);
}

export function getMatch(id: string): Match | undefined {
  return allMatches.find(m => m.id === id);
}

export function getTodayMatches(): Match[] {
  const today = new Date().toISOString().split('T')[0];
  return getMatchesByDate(today);
}

export function getUpcomingMatches(): Match[] {
  const today = new Date().toISOString().split('T')[0];
  return allMatches.filter(m => m.date >= today && m.status !== 'finished');
}

export function getUniqueDates(): string[] {
  const dates = new Set(allMatches.map(m => m.date));
  return Array.from(dates).sort();
}

export function getKnockoutMatches(): Match[] {
  return allMatches.filter(m => m.stage !== 'group');
}

export const stageNames: Record<MatchStage, string> = {
  group: '小组赛',
  round32: '32强赛',
  round16: '16强赛',
  quarterfinal: '四分之一决赛',
  semifinal: '半决赛',
  thirdPlace: '三四名决赛',
  final: '决赛',
};

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const day = days[date.getDay()];
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  return `${month}月${dayOfMonth}日 ${day}`;
}
