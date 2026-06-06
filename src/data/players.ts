// Top World Cup 2026 star players
export interface Player {
  id: string;
  name: string;        // Chinese name
  nameEn: string;      // English name
  teamId: string;      // National team
  position: string;    // FW / MF / DF / GK
  age: number;
  appearances: number; // National team caps
  goals: number;       // National team goals
  marketValue: string; // e.g. "1.8亿欧"
  marketValueEur: number; // numeric for sorting
  club: string;        // Club team
  abilities: {         // 0-10 scale
    speed: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defense: number;
    physical: number;
  };
}

export interface PlayerAbilities {
  speed: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
}

export const topPlayers: Player[] = [
  // ── Argentina ──
  { id:'messi', name:'梅西', nameEn:'Lionel Messi', teamId:'argentina', position:'FW', age:38, appearances:192, goals:112, marketValue:'2000万欧', marketValueEur:20, club:'Inter Miami', abilities:{speed:6,shooting:9,passing:10,dribbling:10,defense:3,physical:5} },
  { id:'alvarez', name:'阿尔瓦雷斯', nameEn:'Julián Álvarez', teamId:'argentina', position:'FW', age:26, appearances:40, goals:11, marketValue:'9000万欧', marketValueEur:90, club:'Atlético Madrid', abilities:{speed:8,shooting:8,passing:7,dribbling:7,defense:4,physical:7} },
  { id:'enzo', name:'恩佐·费尔南德斯', nameEn:'Enzo Fernández', teamId:'argentina', position:'MF', age:25, appearances:35, goals:4, marketValue:'8000万欧', marketValueEur:80, club:'Chelsea', abilities:{speed:6,shooting:7,passing:9,dribbling:7,defense:7,physical:6} },

  // ── Brazil ──
  { id:'vinicius', name:'维尼修斯', nameEn:'Vinícius Júnior', teamId:'brazil', position:'FW', age:25, appearances:40, goals:8, marketValue:'2亿欧', marketValueEur:200, club:'Real Madrid', abilities:{speed:10,shooting:8,passing:7,dribbling:10,defense:3,physical:6} },
  { id:'rodrygo', name:'罗德里戈', nameEn:'Rodrygo', teamId:'brazil', position:'FW', age:25, appearances:30, goals:7, marketValue:'1.1亿欧', marketValueEur:110, club:'Real Madrid', abilities:{speed:9,shooting:8,passing:7,dribbling:9,defense:3,physical:5} },

  // ── France ──
  { id:'mbappe', name:'姆巴佩', nameEn:'Kylian Mbappé', teamId:'france', position:'FW', age:27, appearances:88, goals:52, marketValue:'1.8亿欧', marketValueEur:180, club:'Real Madrid', abilities:{speed:10,shooting:9,passing:7,dribbling:9,defense:2,physical:7} },
  { id:'griezmann', name:'格列兹曼', nameEn:'Antoine Griezmann', teamId:'france', position:'FW', age:35, appearances:137, goals:48, marketValue:'2500万欧', marketValueEur:25, club:'Atlético Madrid', abilities:{speed:6,shooting:8,passing:9,dribbling:8,defense:7,physical:5} },

  // ── Germany ──
  { id:'musiala', name:'穆西亚拉', nameEn:'Jamal Musiala', teamId:'germany', position:'MF', age:23, appearances:40, goals:8, marketValue:'1.4亿欧', marketValueEur:140, club:'Bayern Munich', abilities:{speed:9,shooting:7,passing:8,dribbling:10,defense:5,physical:5} },
  { id:'wirtz', name:'维尔茨', nameEn:'Florian Wirtz', teamId:'germany', position:'MF', age:23, appearances:32, goals:6, marketValue:'1.3亿欧', marketValueEur:130, club:'Bayer Leverkusen', abilities:{speed:8,shooting:8,passing:9,dribbling:9,defense:4,physical:5} },

  // ── England ──
  { id:'bellingham', name:'贝林厄姆', nameEn:'Jude Bellingham', teamId:'england', position:'MF', age:22, appearances:42, goals:8, marketValue:'1.8亿欧', marketValueEur:180, club:'Real Madrid', abilities:{speed:8,shooting:8,passing:8,dribbling:8,defense:8,physical:8} },
  { id:'kane', name:'凯恩', nameEn:'Harry Kane', teamId:'england', position:'FW', age:32, appearances:105, goals:72, marketValue:'1亿欧', marketValueEur:100, club:'Bayern Munich', abilities:{speed:5,shooting:10,passing:8,dribbling:6,defense:4,physical:7} },
  { id:'saka', name:'萨卡', nameEn:'Bukayo Saka', teamId:'england', position:'FW', age:24, appearances:45, goals:14, marketValue:'1.5亿欧', marketValueEur:150, club:'Arsenal', abilities:{speed:9,shooting:8,passing:8,dribbling:8,defense:5,physical:6} },

  // ── Spain ──
  { id:'yamal', name:'亚马尔', nameEn:'Lamine Yamal', teamId:'spain', position:'FW', age:18, appearances:22, goals:5, marketValue:'1.5亿欧', marketValueEur:150, club:'Barcelona', abilities:{speed:9,shooting:7,passing:8,dribbling:10,defense:3,physical:4} },
  { id:'pedri', name:'佩德里', nameEn:'Pedri', teamId:'spain', position:'MF', age:23, appearances:30, goals:3, marketValue:'1亿欧', marketValueEur:100, club:'Barcelona', abilities:{speed:7,shooting:6,passing:10,dribbling:9,defense:6,physical:5} },

  // ── Portugal ──
  { id:'ronaldo', name:'C罗', nameEn:'Cristiano Ronaldo', teamId:'portugal', position:'FW', age:41, appearances:215, goals:135, marketValue:'1200万欧', marketValueEur:12, club:'Al Nassr', abilities:{speed:5,shooting:9,passing:7,dribbling:6,defense:3,physical:7} },
  { id:'bruno', name:'B费', nameEn:'Bruno Fernandes', teamId:'portugal', position:'MF', age:31, appearances:78, goals:25, marketValue:'7000万欧', marketValueEur:70, club:'Manchester United', abilities:{speed:7,shooting:8,passing:9,dribbling:7,defense:6,physical:6} },

  // ── Netherlands ──
  { id:'vandijk', name:'范迪克', nameEn:'Virgil van Dijk', teamId:'netherlands', position:'DF', age:34, appearances:78, goals:9, marketValue:'3000万欧', marketValueEur:30, club:'Liverpool', abilities:{speed:7,shooting:5,passing:7,dribbling:4,defense:10,physical:10} },
  { id:'gakpo', name:'加克波', nameEn:'Cody Gakpo', teamId:'netherlands', position:'FW', age:27, appearances:38, goals:15, marketValue:'6000万欧', marketValueEur:60, club:'Liverpool', abilities:{speed:8,shooting:8,passing:7,dribbling:8,defense:4,physical:7} },

  // ── Norway ──
  { id:'haaland', name:'哈兰德', nameEn:'Erling Haaland', teamId:'norway', position:'FW', age:25, appearances:42, goals:38, marketValue:'2亿欧', marketValueEur:200, club:'Manchester City', abilities:{speed:9,shooting:10,passing:5,dribbling:6,defense:2,physical:10} },
  { id:'odegaard', name:'厄德高', nameEn:'Martin Ødegaard', teamId:'norway', position:'MF', age:27, appearances:65, goals:10, marketValue:'9000万欧', marketValueEur:90, club:'Arsenal', abilities:{speed:7,shooting:7,passing:10,dribbling:9,defense:5,physical:5} },

  // ── Belgium ──
  { id:'debruyne', name:'德布劳内', nameEn:'Kevin De Bruyne', teamId:'belgium', position:'MF', age:34, appearances:110, goals:28, marketValue:'5000万欧', marketValueEur:50, club:'Manchester City', abilities:{speed:6,shooting:9,passing:10,dribbling:7,defense:5,physical:6} },
  { id:'lukaku', name:'卢卡库', nameEn:'Romelu Lukaku', teamId:'belgium', position:'FW', age:33, appearances:120, goals:85, marketValue:'3000万欧', marketValueEur:30, club:'Roma', abilities:{speed:7,shooting:9,passing:6,dribbling:5,defense:4,physical:10} },

  // ── Japan ──
  { id:'mitoma', name:'三笘薰', nameEn:'Kaoru Mitoma', teamId:'japan', position:'FW', age:29, appearances:30, goals:10, marketValue:'5000万欧', marketValueEur:50, club:'Brighton', abilities:{speed:9,shooting:7,passing:7,dribbling:10,defense:5,physical:6} },
  { id:'kubo', name:'久保建英', nameEn:'Takefusa Kubo', teamId:'japan', position:'MF', age:25, appearances:45, goals:8, marketValue:'6000万欧', marketValueEur:60, club:'Real Sociedad', abilities:{speed:8,shooting:7,passing:8,dribbling:9,defense:4,physical:4} },

  // ── South Korea ──
  { id:'son', name:'孙兴慜', nameEn:'Son Heung-min', teamId:'south-korea', position:'FW', age:33, appearances:130, goals:48, marketValue:'4500万欧', marketValueEur:45, club:'Tottenham', abilities:{speed:9,shooting:9,passing:7,dribbling:8,defense:3,physical:6} },

  // ── Croatia ──
  { id:'modric', name:'莫德里奇', nameEn:'Luka Modrić', teamId:'croatia', position:'MF', age:40, appearances:182, goals:27, marketValue:'800万欧', marketValueEur:8, club:'Real Madrid', abilities:{speed:5,shooting:7,passing:10,dribbling:8,defense:7,physical:4} },

  // ── USA ──
  { id:'pulisic', name:'普利西奇', nameEn:'Christian Pulisic', teamId:'usa', position:'FW', age:27, appearances:75, goals:32, marketValue:'4500万欧', marketValueEur:45, club:'AC Milan', abilities:{speed:9,shooting:8,passing:7,dribbling:9,defense:4,physical:6} },

  // ── Morocco ──
  { id:'hakimi', name:'阿什拉夫', nameEn:'Achraf Hakimi', teamId:'morocco', position:'DF', age:27, appearances:85, goals:10, marketValue:'6500万欧', marketValueEur:65, club:'PSG', abilities:{speed:10,shooting:6,passing:7,dribbling:7,defense:8,physical:7} },

  // ── Uruguay ──
  { id:'valverde', name:'巴尔韦德', nameEn:'Federico Valverde', teamId:'uruguay', position:'MF', age:27, appearances:68, goals:8, marketValue:'1.2亿欧', marketValueEur:120, club:'Real Madrid', abilities:{speed:8,shooting:8,passing:8,dribbling:7,defense:7,physical:8} },
  { id:'nunez', name:'努涅斯', nameEn:'Darwin Núñez', teamId:'uruguay', position:'FW', age:26, appearances:35, goals:15, marketValue:'7500万欧', marketValueEur:75, club:'Liverpool', abilities:{speed:9,shooting:8,passing:5,dribbling:6,defense:3,physical:9} },

  // ── Colombia ──
  { id:'luisdiaz', name:'路易斯·迪亚斯', nameEn:'Luis Díaz', teamId:'colombia', position:'FW', age:29, appearances:55, goals:15, marketValue:'8000万欧', marketValueEur:80, club:'Liverpool', abilities:{speed:10,shooting:8,passing:6,dribbling:9,defense:4,physical:6} },

  // ── Egypt ──
  { id:'salah', name:'萨拉赫', nameEn:'Mohamed Salah', teamId:'egypt', position:'FW', age:33, appearances:100, goals:58, marketValue:'6500万欧', marketValueEur:65, club:'Liverpool', abilities:{speed:9,shooting:9,passing:7,dribbling:9,defense:3,physical:7} },

  // ── Senegal ──
  { id:'mane', name:'马内', nameEn:'Sadio Mané', teamId:'senegal', position:'FW', age:34, appearances:110, goals:45, marketValue:'2500万欧', marketValueEur:25, club:'Al Nassr', abilities:{speed:8,shooting:8,passing:7,dribbling:8,defense:4,physical:7} },

  // ── Mexico ──
  { id:'gimenez', name:'希门尼斯', nameEn:'Santiago Giménez', teamId:'mexico', position:'FW', age:25, appearances:35, goals:12, marketValue:'5000万欧', marketValueEur:50, club:'AC Milan', abilities:{speed:7,shooting:8,passing:6,dribbling:7,defense:3,physical:8} },
];

export function getPlayer(id: string): Player | undefined {
  return topPlayers.find(p => p.id === id);
}

export function getPlayersByTeam(teamId: string): Player[] {
  return topPlayers.filter(p => p.teamId === teamId);
}

export function getPlayersByClub(club: string): Player[] {
  return topPlayers.filter(p => p.club === club);
}

export function searchPlayers(query: string): Player[] {
  const q = query.toLowerCase().trim();
  return topPlayers.filter(p =>
    p.name.includes(q) ||
    p.nameEn.toLowerCase().includes(q) ||
    p.teamId.includes(q) ||
    p.club.toLowerCase().includes(q)
  );
}

export function getAllPlayers(): Player[] {
  return topPlayers;
}

/** Convert player abilities to RadarChart data format */
export function getPlayerRadarData(player: Player): { label: string; value: number }[] {
  const a = player.abilities;
  return [
    { label: '速度', value: a.speed },
    { label: '射门', value: a.shooting },
    { label: '传球', value: a.passing },
    { label: '盘带', value: a.dribbling },
    { label: '防守', value: a.defense },
    { label: '身体', value: a.physical },
  ];
}
