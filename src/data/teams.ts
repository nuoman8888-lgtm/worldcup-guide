// 2026 FIFA World Cup - 48 Teams Data
// World Cup dates: June 11 - July 19, 2026

export interface Team {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  group: string;
  fifaRank: number;
  elo: number;
  coach: string;
  keyPlayers: string[];
  recentForm: ('W' | 'D' | 'L')[];
  recentResults: string[];
  worldCupApps: number;
  bestResult: string;
  groupStageOdds: number;
  winOdds: number;
}

export interface GroupInfo {
  name: string;
  teams: string[];
}

export const groups: GroupInfo[] = [
  { name: 'A', teams: ['canada', 'portugal', 'south-korea', 'cameroon'] },
  { name: 'B', teams: ['mexico', 'netherlands', 'japan', 'egypt'] },
  { name: 'C', teams: ['usa', 'italy', 'australia', 'senegal'] },
  { name: 'D', teams: ['argentina', 'croatia', 'saudi-arabia', 'ghana'] },
  { name: 'E', teams: ['france', 'denmark', 'iran', 'morocco'] },
  { name: 'F', teams: ['brazil', 'switzerland', 'costa-rica', 'nigeria'] },
  { name: 'G', teams: ['england', 'uruguay', 'qatar', 'ivory-coast'] },
  { name: 'H', teams: ['spain', 'colombia', 'uae', 'south-africa'] },
  { name: 'I', teams: ['germany', 'chile', 'iraq', 'burkina-faso'] },
  { name: 'J', teams: ['belgium', 'serbia', 'china', 'mali'] },
  { name: 'K', teams: ['austria', 'ukraine', 'poland', 'new-zealand'] },
  { name: 'L', teams: ['sweden', 'ecuador', 'jamaica', 'panama'] },
];

export const teams: Team[] = [
  // ===== GROUP A =====
  {
    id: 'canada', name: '加拿大', nameEn: 'Canada', flag: '🇨🇦', group: 'A',
    fifaRank: 31, elo: 1780, coach: 'Jesse Marsch',
    keyPlayers: ['Alphonso Davies', 'Jonathan David', 'Stephen Eustáquio'],
    recentForm: ['W','D','W','L','W'],
    recentResults: ['2-0 vs Guatemala', '1-1 vs Costa Rica', '3-1 vs Jamaica', '0-2 vs USA', '2-1 vs Honduras'],
    worldCupApps: 3, bestResult: '小组赛 (1986, 2022)', groupStageOdds: 2.10, winOdds: 101,
  },
  {
    id: 'portugal', name: '葡萄牙', nameEn: 'Portugal', flag: '🇵🇹', group: 'A',
    fifaRank: 6, elo: 1985, coach: 'Roberto Martínez',
    keyPlayers: ['Cristiano Ronaldo', 'Bruno Fernandes', 'Rúben Dias'],
    recentForm: ['W','W','D','W','W'],
    recentResults: ['3-0 vs Finland', '2-1 vs Iceland', '1-1 vs Croatia', '4-0 vs Liechtenstein', '2-0 vs Slovakia'],
    worldCupApps: 9, bestResult: '季军 (1966)', groupStageOdds: 1.12, winOdds: 15,
  },
  {
    id: 'south-korea', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷', group: 'A',
    fifaRank: 22, elo: 1820, coach: 'Hong Myung-bo',
    keyPlayers: ['Son Heung-min', 'Kim Min-jae', 'Lee Kang-in'],
    recentForm: ['W','D','W','W','L'],
    recentResults: ['2-0 vs China', '1-1 vs Australia', '3-1 vs Thailand', '2-0 vs Singapore', '0-1 vs Japan'],
    worldCupApps: 12, bestResult: '第四名 (2002)', groupStageOdds: 1.80, winOdds: 201,
  },
  {
    id: 'cameroon', name: '喀麦隆', nameEn: 'Cameroon', flag: '🇨🇲', group: 'A',
    fifaRank: 41, elo: 1680, coach: 'Marc Brys',
    keyPlayers: ['Vincent Aboubakar', 'André Onana', 'Bryan Mbeumo'],
    recentForm: ['L','W','D','W','L'],
    recentResults: ['0-2 vs Senegal', '2-1 vs Zambia', '1-1 vs Guinea', '3-0 vs Mauritius', '0-1 vs Nigeria'],
    worldCupApps: 9, bestResult: '八强 (1990)', groupStageOdds: 3.50, winOdds: 501,
  },

  // ===== GROUP B =====
  {
    id: 'mexico', name: '墨西哥', nameEn: 'Mexico', flag: '🇲🇽', group: 'B',
    fifaRank: 14, elo: 1860, coach: 'Javier Aguirre',
    keyPlayers: ['Santiago Giménez', 'Edson Álvarez', 'Hirving Lozano'],
    recentForm: ['W','W','W','D','L'],
    recentResults: ['2-0 vs Honduras', '3-1 vs El Salvador', '1-0 vs Costa Rica', '1-1 vs USA', '0-2 vs Argentina'],
    worldCupApps: 18, bestResult: '八强 (1970, 1986)', groupStageOdds: 1.40, winOdds: 67,
  },
  {
    id: 'netherlands', name: '荷兰', nameEn: 'Netherlands', flag: '🇳🇱', group: 'B',
    fifaRank: 7, elo: 1965, coach: 'Ronald Koeman',
    keyPlayers: ['Virgil van Dijk', 'Cody Gakpo', 'Frenkie de Jong'],
    recentForm: ['W','W','L','W','W'],
    recentResults: ['4-0 vs Gibraltar', '3-1 vs Ireland', '1-2 vs France', '2-0 vs Greece', '6-0 vs Gibraltar'],
    worldCupApps: 12, bestResult: '亚军 (1974, 1978, 2010)', groupStageOdds: 1.08, winOdds: 13,
  },
  {
    id: 'japan', name: '日本', nameEn: 'Japan', flag: '🇯🇵', group: 'B',
    fifaRank: 17, elo: 1845, coach: 'Hajime Moriyasu',
    keyPlayers: ['Kaoru Mitoma', 'Takefusa Kubo', 'Wataru Endo'],
    recentForm: ['W','W','W','W','D'],
    recentResults: ['3-0 vs North Korea', '5-0 vs Myanmar', '2-0 vs Syria', '4-1 vs Indonesia', '1-1 vs Australia'],
    worldCupApps: 8, bestResult: '16强 (2002, 2010, 2018, 2022)', groupStageOdds: 1.65, winOdds: 151,
  },
  {
    id: 'egypt', name: '埃及', nameEn: 'Egypt', flag: '🇪🇬', group: 'B',
    fifaRank: 33, elo: 1740, coach: 'Hossam Hassan',
    keyPlayers: ['Mohamed Salah', 'Omar Marmoush', 'Trézéguet'],
    recentForm: ['W','D','W','L','W'],
    recentResults: ['2-1 vs Burkina Faso', '1-1 vs Ghana', '3-0 vs Djibouti', '0-1 vs Morocco', '2-0 vs Ethiopia'],
    worldCupApps: 4, bestResult: '小组赛', groupStageOdds: 3.00, winOdds: 351,
  },

  // ===== GROUP C =====
  {
    id: 'usa', name: '美国', nameEn: 'USA', flag: '🇺🇸', group: 'C',
    fifaRank: 11, elo: 1880, coach: 'Mauricio Pochettino',
    keyPlayers: ['Christian Pulisic', 'Giovanni Reyna', 'Folarin Balogun'],
    recentForm: ['W','W','L','W','W'],
    recentResults: ['3-0 vs Trinidad', '2-0 vs Canada', '0-1 vs Colombia', '4-1 vs Grenada', '2-0 vs Panama'],
    worldCupApps: 12, bestResult: '季军 (1930)', groupStageOdds: 1.25, winOdds: 26,
  },
  {
    id: 'italy', name: '意大利', nameEn: 'Italy', flag: '🇮🇹', group: 'C',
    fifaRank: 9, elo: 1940, coach: 'Luciano Spalletti',
    keyPlayers: ['Nicolò Barella', 'Gianluigi Donnarumma', 'Federico Chiesa'],
    recentForm: ['W','W','W','D','W'],
    recentResults: ['2-0 vs Ukraine', '4-0 vs Malta', '3-1 vs North Macedonia', '1-1 vs England', '2-1 vs Belgium'],
    worldCupApps: 19, bestResult: '冠军 (1934, 1938, 1982, 2006)', groupStageOdds: 1.15, winOdds: 17,
  },
  {
    id: 'australia', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺', group: 'C',
    fifaRank: 23, elo: 1790, coach: 'Graham Arnold',
    keyPlayers: ['Mathew Ryan', 'Harry Souttar', 'Riley McGree'],
    recentForm: ['W','L','W','D','W'],
    recentResults: ['2-0 vs UAE', '1-3 vs Japan', '3-0 vs Palestine', '1-1 vs South Korea', '2-1 vs Bahrain'],
    worldCupApps: 7, bestResult: '16强 (2006, 2022)', groupStageOdds: 3.20, winOdds: 401,
  },
  {
    id: 'senegal', name: '塞内加尔', nameEn: 'Senegal', flag: '🇸🇳', group: 'C',
    fifaRank: 18, elo: 1830, coach: 'Pape Thiaw',
    keyPlayers: ['Sadio Mané', 'Kalidou Koulibaly', 'Nicolas Jackson'],
    recentForm: ['W','W','D','W','L'],
    recentResults: ['2-0 vs Cameroon', '3-1 vs Togo', '1-1 vs Egypt', '4-0 vs South Sudan', '0-1 vs Morocco'],
    worldCupApps: 4, bestResult: '八强 (2002)', groupStageOdds: 2.50, winOdds: 101,
  },

  // ===== GROUP D =====
  {
    id: 'argentina', name: '阿根廷', nameEn: 'Argentina', flag: '🇦🇷', group: 'D',
    fifaRank: 1, elo: 2135, coach: 'Lionel Scaloni',
    keyPlayers: ['Lionel Messi', 'Julián Álvarez', 'Enzo Fernández'],
    recentForm: ['W','W','W','W','W'],
    recentResults: ['2-0 vs Brazil', '3-0 vs Bolivia', '1-0 vs Paraguay', '4-1 vs Chile', '2-0 vs Peru'],
    worldCupApps: 19, bestResult: '冠军 (1978, 1986, 2022)', groupStageOdds: 1.04, winOdds: 8,
  },
  {
    id: 'croatia', name: '克罗地亚', nameEn: 'Croatia', flag: '🇭🇷', group: 'D',
    fifaRank: 10, elo: 1920, coach: 'Zlatko Dalić',
    keyPlayers: ['Luka Modrić', 'Joško Gvardiol', 'Mateo Kovačić'],
    recentForm: ['W','D','W','W','L'],
    recentResults: ['2-0 vs Latvia', '1-1 vs Wales', '3-0 vs Armenia', '2-1 vs Turkey', '0-2 vs Spain'],
    worldCupApps: 7, bestResult: '亚军 (2018)', groupStageOdds: 1.35, winOdds: 34,
  },
  {
    id: 'saudi-arabia', name: '沙特', nameEn: 'Saudi Arabia', flag: '🇸🇦', group: 'D',
    fifaRank: 53, elo: 1630, coach: 'Roberto Mancini',
    keyPlayers: ['Salem Al-Dawsari', 'Firas Al-Buraikan', 'Saud Abdulhamid'],
    recentForm: ['W','L','W','D','L'],
    recentResults: ['2-1 vs Qatar', '0-3 vs Japan', '3-0 vs Yemen', '1-1 vs Oman', '1-2 vs South Korea'],
    worldCupApps: 7, bestResult: '16强 (1994)', groupStageOdds: 6.00, winOdds: 1001,
  },
  {
    id: 'ghana', name: '加纳', nameEn: 'Ghana', flag: '🇬🇭', group: 'D',
    fifaRank: 60, elo: 1605, coach: 'Otto Addo',
    keyPlayers: ['Mohammed Kudus', 'Thomas Partey', 'Iñaki Williams'],
    recentForm: ['L','W','L','D','W'],
    recentResults: ['0-2 vs Nigeria', '2-1 vs CAR', '1-3 vs Morocco', '1-1 vs Angola', '2-0 vs Madagascar'],
    worldCupApps: 5, bestResult: '八强 (2010)', groupStageOdds: 4.50, winOdds: 751,
  },

  // ===== GROUP E =====
  {
    id: 'france', name: '法国', nameEn: 'France', flag: '🇫🇷', group: 'E',
    fifaRank: 2, elo: 2105, coach: 'Didier Deschamps',
    keyPlayers: ['Kylian Mbappé', 'Antoine Griezmann', 'Aurélien Tchouaméni'],
    recentForm: ['W','W','W','D','W'],
    recentResults: ['3-0 vs Netherlands', '2-0 vs Ireland', '4-1 vs Greece', '1-1 vs Germany', '2-0 vs Belgium'],
    worldCupApps: 17, bestResult: '冠军 (1998, 2018)', groupStageOdds: 1.03, winOdds: 6.5,
  },
  {
    id: 'denmark', name: '丹麦', nameEn: 'Denmark', flag: '🇩🇰', group: 'E',
    fifaRank: 19, elo: 1840, coach: 'Brian Riemer',
    keyPlayers: ['Rasmus Højlund', 'Christian Eriksen', 'Andreas Christensen'],
    recentForm: ['W','W','L','W','D'],
    recentResults: ['2-0 vs Slovenia', '3-1 vs Finland', '0-1 vs Portugal', '2-0 vs N.Ireland', '1-1 vs Switzerland'],
    worldCupApps: 7, bestResult: '八强 (1998)', groupStageOdds: 1.55, winOdds: 67,
  },
  {
    id: 'iran', name: '伊朗', nameEn: 'Iran', flag: '🇮🇷', group: 'E',
    fifaRank: 20, elo: 1810, coach: 'Amir Ghalenoei',
    keyPlayers: ['Mehdi Taremi', 'Sardar Azmoun', 'Alireza Jahanbakhsh'],
    recentForm: ['W','W','W','L','W'],
    recentResults: ['3-0 vs UAE', '2-1 vs Qatar', '4-0 vs Hong Kong', '0-1 vs Japan', '2-0 vs Uzbekistan'],
    worldCupApps: 7, bestResult: '小组赛', groupStageOdds: 3.00, winOdds: 501,
  },
  {
    id: 'morocco', name: '摩洛哥', nameEn: 'Morocco', flag: '🇲🇦', group: 'E',
    fifaRank: 13, elo: 1870, coach: 'Walid Regragui',
    keyPlayers: ['Achraf Hakimi', 'Brahim Díaz', 'Youssef En-Nesyri'],
    recentForm: ['W','W','W','L','W'],
    recentResults: ['2-0 vs Algeria', '3-1 vs Zambia', '1-0 vs Egypt', '0-2 vs Spain', '2-1 vs Ivory Coast'],
    worldCupApps: 7, bestResult: '第四名 (2022)', groupStageOdds: 1.90, winOdds: 81,
  },

  // ===== GROUP F =====
  {
    id: 'brazil', name: '巴西', nameEn: 'Brazil', flag: '🇧🇷', group: 'F',
    fifaRank: 3, elo: 2080, coach: 'Dorival Júnior',
    keyPlayers: ['Vinícius Júnior', 'Rodrygo', 'Alisson Becker'],
    recentForm: ['W','W','W','D','W'],
    recentResults: ['4-0 vs Peru', '2-1 vs Colombia', '3-0 vs Bolivia', '1-1 vs Uruguay', '5-1 vs Ecuador'],
    worldCupApps: 23, bestResult: '冠军 (1958, 1962, 1970, 1994, 2002)', groupStageOdds: 1.04, winOdds: 5.5,
  },
  {
    id: 'switzerland', name: '瑞士', nameEn: 'Switzerland', flag: '🇨🇭', group: 'F',
    fifaRank: 15, elo: 1855, coach: 'Murat Yakin',
    keyPlayers: ['Granit Xhaka', 'Manuel Akanji', 'Xherdan Shaqiri'],
    recentForm: ['W','D','W','W','L'],
    recentResults: ['2-0 vs Bulgaria', '1-1 vs Israel', '3-1 vs Belarus', '2-1 vs Andorra', '0-2 vs Portugal'],
    worldCupApps: 13, bestResult: '八强 (1934, 1938, 1954)', groupStageOdds: 1.50, winOdds: 81,
  },
  {
    id: 'costa-rica', name: '哥斯达黎加', nameEn: 'Costa Rica', flag: '🇨🇷', group: 'F',
    fifaRank: 49, elo: 1640, coach: 'Gustavo Alfaro',
    keyPlayers: ['Keylor Navas', 'Joel Campbell', 'Jewison Bennette'],
    recentForm: ['W','L','D','W','L'],
    recentResults: ['2-1 vs Panama', '0-3 vs Mexico', '1-1 vs Honduras', '3-0 vs Cuba', '0-1 vs Canada'],
    worldCupApps: 7, bestResult: '八强 (2014)', groupStageOdds: 5.00, winOdds: 751,
  },
  {
    id: 'nigeria', name: '尼日利亚', nameEn: 'Nigeria', flag: '🇳🇬', group: 'F',
    fifaRank: 30, elo: 1760, coach: 'Finidi George',
    keyPlayers: ['Victor Osimhen', 'Ademola Lookman', 'Alex Iwobi'],
    recentForm: ['W','W','L','W','D'],
    recentResults: ['3-0 vs Ghana', '2-0 vs Benin', '1-2 vs Senegal', '4-1 vs Lesotho', '1-1 vs South Africa'],
    worldCupApps: 7, bestResult: '16强 (1994, 1998, 2014)', groupStageOdds: 2.75, winOdds: 251,
  },

  // ===== GROUP G =====
  {
    id: 'england', name: '英格兰', nameEn: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'G',
    fifaRank: 4, elo: 2050, coach: 'Thomas Tuchel',
    keyPlayers: ['Jude Bellingham', 'Harry Kane', 'Bukayo Saka'],
    recentForm: ['W','W','W','W','D'],
    recentResults: ['3-1 vs Italy', '2-0 vs Ukraine', '4-0 vs Malta', '2-1 vs North Macedonia', '1-1 vs Germany'],
    worldCupApps: 17, bestResult: '冠军 (1966)', groupStageOdds: 1.04, winOdds: 7,
  },
  {
    id: 'uruguay', name: '乌拉圭', nameEn: 'Uruguay', flag: '🇺🇾', group: 'G',
    fifaRank: 12, elo: 1890, coach: 'Marcelo Bielsa',
    keyPlayers: ['Federico Valverde', 'Darwin Núñez', 'Ronald Araújo'],
    recentForm: ['W','W','D','W','L'],
    recentResults: ['2-0 vs Brazil', '3-1 vs Bolivia', '1-1 vs Colombia', '2-0 vs Ecuador', '0-1 vs Argentina'],
    worldCupApps: 15, bestResult: '冠军 (1930, 1950)', groupStageOdds: 1.25, winOdds: 26,
  },
  {
    id: 'qatar', name: '卡塔尔', nameEn: 'Qatar', flag: '🇶🇦', group: 'G',
    fifaRank: 44, elo: 1650, coach: 'Tintín Márquez',
    keyPlayers: ['Akram Afif', 'Almoez Ali', 'Hassan Al-Haydos'],
    recentForm: ['L','W','L','D','W'],
    recentResults: ['1-2 vs Iran', '3-0 vs Kuwait', '0-1 vs Uzbekistan', '2-2 vs UAE', '2-0 vs India'],
    worldCupApps: 2, bestResult: '小组赛 (2022)', groupStageOdds: 8.00, winOdds: 1501,
  },
  {
    id: 'ivory-coast', name: '科特迪瓦', nameEn: 'Ivory Coast', flag: '🇨🇮', group: 'G',
    fifaRank: 38, elo: 1720, coach: 'Emerse Faé',
    keyPlayers: ['Sébastien Haller', 'Franck Kessié', 'Simon Adingra'],
    recentForm: ['W','W','L','W','D'],
    recentResults: ['2-1 vs Nigeria', '3-0 vs Gambia', '0-1 vs Morocco', '2-0 vs DR Congo', '1-1 vs Mali'],
    worldCupApps: 4, bestResult: '小组赛', groupStageOdds: 3.50, winOdds: 301,
  },

  // ===== GROUP H =====
  {
    id: 'spain', name: '西班牙', nameEn: 'Spain', flag: '🇪🇸', group: 'H',
    fifaRank: 5, elo: 2020, coach: 'Luis de la Fuente',
    keyPlayers: ['Lamine Yamal', 'Pedri', 'Rodri'],
    recentForm: ['W','W','W','W','W'],
    recentResults: ['2-0 vs Germany', '3-0 vs Georgia', '4-1 vs Cyprus', '2-0 vs Scotland', '5-0 vs Andorra'],
    worldCupApps: 17, bestResult: '冠军 (2010)', groupStageOdds: 1.04, winOdds: 8.5,
  },
  {
    id: 'colombia', name: '哥伦比亚', nameEn: 'Colombia', flag: '🇨🇴', group: 'H',
    fifaRank: 16, elo: 1850, coach: 'Néstor Lorenzo',
    keyPlayers: ['Luis Díaz', 'James Rodríguez', 'Jhon Durán'],
    recentForm: ['W','W','D','W','W'],
    recentResults: ['2-1 vs Brazil', '3-0 vs Bolivia', '1-1 vs Uruguay', '2-0 vs Paraguay', '1-0 vs Venezuela'],
    worldCupApps: 7, bestResult: '八强 (2014)', groupStageOdds: 1.30, winOdds: 34,
  },
  {
    id: 'uae', name: '阿联酋', nameEn: 'UAE', flag: '🇦🇪', group: 'H',
    fifaRank: 67, elo: 1550, coach: 'Paulo Bento',
    keyPlayers: ['Ali Mabkhout', 'Fábio Lima', 'Caio Canedo'],
    recentForm: ['L','W','L','L','W'],
    recentResults: ['0-2 vs Iran', '2-1 vs Kuwait', '1-3 vs Australia', '0-1 vs Uzbekistan', '3-0 vs India'],
    worldCupApps: 2, bestResult: '小组赛 (1990)', groupStageOdds: 10.00, winOdds: 2001,
  },
  {
    id: 'south-africa', name: '南非', nameEn: 'South Africa', flag: '🇿🇦', group: 'H',
    fifaRank: 58, elo: 1590, coach: 'Hugo Broos',
    keyPlayers: ['Percy Tau', 'Lyle Foster', 'Themba Zwane'],
    recentForm: ['W','D','L','W','L'],
    recentResults: ['2-0 vs Morocco', '1-1 vs Ghana', '0-1 vs Senegal', '3-1 vs Zimbabwe', '1-2 vs Nigeria'],
    worldCupApps: 4, bestResult: '小组赛', groupStageOdds: 6.00, winOdds: 1001,
  },

  // ===== GROUP I =====
  {
    id: 'germany', name: '德国', nameEn: 'Germany', flag: '🇩🇪', group: 'I',
    fifaRank: 8, elo: 1950, coach: 'Julian Nagelsmann',
    keyPlayers: ['Jamal Musiala', 'Florian Wirtz', 'Kai Havertz'],
    recentForm: ['W','W','W','W','L'],
    recentResults: ['3-1 vs Netherlands', '2-0 vs France', '4-0 vs Hungary', '2-1 vs Bosnia', '0-2 vs Spain'],
    worldCupApps: 21, bestResult: '冠军 (1954, 1974, 1990, 2014)', groupStageOdds: 1.05, winOdds: 9,
  },
  {
    id: 'chile', name: '智利', nameEn: 'Chile', flag: '🇨🇱', group: 'I',
    fifaRank: 36, elo: 1730, coach: 'Ricardo Gareca',
    keyPlayers: ['Alexis Sánchez', 'Ben Brereton', 'Víctor Dávila'],
    recentForm: ['L','W','D','W','L'],
    recentResults: ['0-2 vs Argentina', '2-0 vs Peru', '1-1 vs Paraguay', '3-1 vs Bolivia', '0-1 vs Colombia'],
    worldCupApps: 10, bestResult: '季军 (1962)', groupStageOdds: 1.80, winOdds: 101,
  },
  {
    id: 'iraq', name: '伊拉克', nameEn: 'Iraq', flag: '🇮🇶', group: 'I',
    fifaRank: 55, elo: 1610, coach: 'Jesús Casas',
    keyPlayers: ['Aymen Hussein', 'Ali Jasim', 'Zidane Iqbal'],
    recentForm: ['W','W','L','W','D'],
    recentResults: ['2-0 vs Vietnam', '3-1 vs Philippines', '0-2 vs Japan', '2-0 vs Indonesia', '1-1 vs Jordan'],
    worldCupApps: 2, bestResult: '小组赛 (1986)', groupStageOdds: 5.50, winOdds: 1501,
  },
  {
    id: 'burkina-faso', name: '布基纳法索', nameEn: 'Burkina Faso', flag: '🇧🇫', group: 'I',
    fifaRank: 51, elo: 1620, coach: 'Brama Traoré',
    keyPlayers: ['Edmond Tapsoba', 'Dango Ouattara', 'Bertrand Traoré'],
    recentForm: ['L','W','D','L','W'],
    recentResults: ['0-1 vs Senegal', '2-0 vs Ethiopia', '1-1 vs Guinea', '0-2 vs Egypt', '3-1 vs Malawi'],
    worldCupApps: 1, bestResult: '小组赛', groupStageOdds: 5.00, winOdds: 1001,
  },

  // ===== GROUP J =====
  {
    id: 'belgium', name: '比利时', nameEn: 'Belgium', flag: '🇧🇪', group: 'J',
    fifaRank: 3, elo: 1990, coach: 'Domenico Tedesco',
    keyPlayers: ['Kevin De Bruyne', 'Romelu Lukaku', 'Jérémy Doku'],
    recentForm: ['W','W','W','D','W'],
    recentResults: ['3-0 vs Austria', '2-1 vs Italy', '4-0 vs San Marino', '1-1 vs Netherlands', '2-0 vs Sweden'],
    worldCupApps: 15, bestResult: '季军 (2018)', groupStageOdds: 1.04, winOdds: 11,
  },
  {
    id: 'serbia', name: '塞尔维亚', nameEn: 'Serbia', flag: '🇷🇸', group: 'J',
    fifaRank: 28, elo: 1770, coach: 'Dragan Stojković',
    keyPlayers: ['Dušan Vlahović', 'Aleksandar Mitrović', 'Sergej Milinković-Savić'],
    recentForm: ['W','L','W','D','W'],
    recentResults: ['2-0 vs Montenegro', '1-2 vs Hungary', '3-1 vs Lithuania', '2-2 vs Bulgaria', '2-0 vs Cyprus'],
    worldCupApps: 13, bestResult: '第四名 (1930, 1962)', groupStageOdds: 1.50, winOdds: 101,
  },
  {
    id: 'china', name: '中国', nameEn: 'China', flag: '🇨🇳', group: 'J',
    fifaRank: 78, elo: 1520, coach: 'Branko Ivanković',
    keyPlayers: ['Wu Lei', 'Zhang Yuning', 'Jiang Guangtai'],
    recentForm: ['D','W','L','W','L'],
    recentResults: ['1-1 vs Thailand', '2-0 vs Singapore', '0-3 vs South Korea', '4-1 vs Myanmar', '0-1 vs Uzbekistan'],
    worldCupApps: 2, bestResult: '小组赛 (2002)', groupStageOdds: 12.00, winOdds: 2001,
  },
  {
    id: 'mali', name: '马里', nameEn: 'Mali', flag: '🇲🇱', group: 'J',
    fifaRank: 43, elo: 1690, coach: 'Éric Chelle',
    keyPlayers: ['Yves Bissouma', 'Amadou Haidara', 'El Bilal Touré'],
    recentForm: ['W','D','W','L','W'],
    recentResults: ['2-1 vs Burkina Faso', '1-1 vs Ivory Coast', '3-0 vs Namibia', '0-2 vs Morocco', '2-0 vs Congo'],
    worldCupApps: 1, bestResult: '小组赛', groupStageOdds: 4.00, winOdds: 501,
  },

  // ===== GROUP K =====
  {
    id: 'austria', name: '奥地利', nameEn: 'Austria', flag: '🇦🇹', group: 'K',
    fifaRank: 24, elo: 1800, coach: 'Ralf Rangnick',
    keyPlayers: ['David Alaba', 'Marcel Sabitzer', 'Christoph Baumgartner'],
    recentForm: ['W','W','W','W','D'],
    recentResults: ['2-0 vs Germany', '3-1 vs Sweden', '2-0 vs Estonia', '4-1 vs Azerbaijan', '1-1 vs Belgium'],
    worldCupApps: 8, bestResult: '季军 (1954)', groupStageOdds: 1.35, winOdds: 67,
  },
  {
    id: 'ukraine', name: '乌克兰', nameEn: 'Ukraine', flag: '🇺🇦', group: 'K',
    fifaRank: 27, elo: 1775, coach: 'Serhiy Rebrov',
    keyPlayers: ['Mykhailo Mudryk', 'Artem Dovbyk', 'Oleksandr Zinchenko'],
    recentForm: ['W','W','L','W','D'],
    recentResults: ['2-1 vs Iceland', '3-0 vs Bosnia', '1-2 vs Italy', '2-0 vs North Macedonia', '1-1 vs England'],
    worldCupApps: 2, bestResult: '八强 (2006)', groupStageOdds: 1.50, winOdds: 101,
  },
  {
    id: 'poland', name: '波兰', nameEn: 'Poland', flag: '🇵🇱', group: 'K',
    fifaRank: 26, elo: 1770, coach: 'Michał Probierz',
    keyPlayers: ['Robert Lewandowski', 'Piotr Zieliński', 'Jakub Kiwior'],
    recentForm: ['W','L','W','D','W'],
    recentResults: ['2-0 vs Estonia', '0-1 vs Wales', '3-1 vs Czechia', '1-1 vs Moldova', '2-0 vs Albania'],
    worldCupApps: 10, bestResult: '季军 (1974, 1982)', groupStageOdds: 1.55, winOdds: 126,
  },
  {
    id: 'new-zealand', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿', group: 'K',
    fifaRank: 92, elo: 1480, coach: 'Darren Bazeley',
    keyPlayers: ['Chris Wood', 'Sarpreet Singh', 'Liberato Cacace'],
    recentForm: ['W','W','L','D','W'],
    recentResults: ['2-0 vs Solomon Islands', '3-1 vs Fiji', '0-3 vs Australia', '1-1 vs Tahiti', '2-1 vs PNG'],
    worldCupApps: 3, bestResult: '小组赛', groupStageOdds: 8.00, winOdds: 2001,
  },

  // ===== GROUP L =====
  {
    id: 'sweden', name: '瑞典', nameEn: 'Sweden', flag: '🇸🇪', group: 'L',
    fifaRank: 25, elo: 1790, coach: 'Jon Dahl Tomasson',
    keyPlayers: ['Alexander Isak', 'Dejan Kulusevski', 'Victor Lindelöf'],
    recentForm: ['W','W','L','W','D'],
    recentResults: ['2-0 vs Azerbaijan', '3-1 vs Estonia', '0-2 vs Belgium', '2-0 vs Moldova', '1-1 vs Austria'],
    worldCupApps: 13, bestResult: '亚军 (1958)', groupStageOdds: 1.40, winOdds: 67,
  },
  {
    id: 'ecuador', name: '厄瓜多尔', nameEn: 'Ecuador', flag: '🇪🇨', group: 'L',
    fifaRank: 32, elo: 1750, coach: 'Félix Sánchez',
    keyPlayers: ['Moisés Caicedo', 'Piero Hincapié', 'Enner Valencia'],
    recentForm: ['W','D','W','L','W'],
    recentResults: ['2-1 vs Chile', '1-1 vs Colombia', '3-0 vs Bolivia', '0-2 vs Brazil', '2-0 vs Peru'],
    worldCupApps: 5, bestResult: '16强 (2006)', groupStageOdds: 2.00, winOdds: 151,
  },
  {
    id: 'jamaica', name: '牙买加', nameEn: 'Jamaica', flag: '🇯🇲', group: 'L',
    fifaRank: 54, elo: 1580, coach: 'Steve McClaren',
    keyPlayers: ['Leon Bailey', 'Michail Antonio', 'Demarai Gray'],
    recentForm: ['W','L','W','D','L'],
    recentResults: ['2-1 vs Canada', '0-3 vs USA', '3-0 vs Cuba', '1-1 vs Guatemala', '0-1 vs Costa Rica'],
    worldCupApps: 2, bestResult: '小组赛 (1998)', groupStageOdds: 5.00, winOdds: 751,
  },
  {
    id: 'panama', name: '巴拿马', nameEn: 'Panama', flag: '🇵🇦', group: 'L',
    fifaRank: 45, elo: 1600, coach: 'Thomas Christiansen',
    keyPlayers: ['Michael Murillo', 'Aníbal Godoy', 'Ismael Díaz'],
    recentForm: ['L','W','L','L','W'],
    recentResults: ['1-2 vs Costa Rica', '3-0 vs Cuba', '0-2 vs USA', '1-3 vs Mexico', '2-0 vs Belize'],
    worldCupApps: 2, bestResult: '小组赛 (2018)', groupStageOdds: 7.00, winOdds: 1501,
  },
];

export function getTeam(id: string): Team | undefined {
  return teams.find(t => t.id === id);
}

export function getTeamsByGroup(group: string): Team[] {
  return teams.filter(t => t.group === group);
}

export function getAllTeams(): Team[] {
  return teams;
}
