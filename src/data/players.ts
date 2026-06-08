// 2026 World Cup — Key Players (all 48 teams' core players)
export interface Player {
  id: string;
  name: string;
  nameEn: string;
  teamId: string;
  position: string;
  age: number;
  appearances: number;
  goals: number;
  marketValue: string;
  marketValueEur: number;
  club: string;
  photoUrl?: string;
  abilities: { speed: number; shooting: number; passing: number; dribbling: number; defense: number; physical: number };
}

export interface PlayerAbilities {
  speed: number; shooting: number; passing: number; dribbling: number; defense: number; physical: number;
}

const _ = undefined; // shorthand for no photoUrl

export const topPlayers: Player[] = [
  // ═══ GROUP A ═══
  // Mexico
  { id:'s-gimenez', name:'圣地亚哥·希门尼斯', nameEn:'Santiago Giménez', teamId:'mexico', position:'FW', age:25, appearances:35, goals:8, marketValue:'5000万欧', marketValueEur:50, club:'Feyenoord', photoUrl:_, abilities:{speed:8,shooting:8,passing:6,dribbling:7,defense:2,physical:7} },
  { id:'e-alvarez', name:'埃德森·阿尔瓦雷斯', nameEn:'Edson Álvarez', teamId:'mexico', position:'MF', age:28, appearances:80, goals:5, marketValue:'3500万欧', marketValueEur:35, club:'West Ham', photoUrl:_, abilities:{speed:6,shooting:5,passing:7,dribbling:6,defense:8,physical:8} },
  { id:'lozano', name:'洛萨诺', nameEn:'Hirving Lozano', teamId:'mexico', position:'FW', age:30, appearances:75, goals:18, marketValue:'2000万欧', marketValueEur:20, club:'PSV', photoUrl:_, abilities:{speed:9,shooting:7,passing:7,dribbling:8,defense:3,physical:5} },
  // South Korea
  { id:'son', name:'孙兴慜', nameEn:'Son Heung-min', teamId:'south-korea', position:'FW', age:33, appearances:130, goals:51, marketValue:'4000万欧', marketValueEur:40, club:'Tottenham', photoUrl:'https://cdn.sofifa.net/players/200/104/25_120.png', abilities:{speed:9,shooting:9,passing:7,dribbling:8,defense:3,physical:6} },
  { id:'kim-minjae', name:'金玟哉', nameEn:'Kim Min-jae', teamId:'south-korea', position:'DF', age:29, appearances:65, goals:4, marketValue:'4500万欧', marketValueEur:45, club:'Bayern Munich', photoUrl:_, abilities:{speed:7,shooting:4,passing:6,dribbling:4,defense:9,physical:9} },
  { id:'lee-kangin', name:'李刚仁', nameEn:'Lee Kang-in', teamId:'south-korea', position:'MF', age:25, appearances:35, goals:8, marketValue:'3500万欧', marketValueEur:35, club:'PSG', photoUrl:_, abilities:{speed:7,shooting:7,passing:9,dribbling:9,defense:4,physical:5} },
  // Czech
  { id:'schick', name:'希克', nameEn:'Patrik Schick', teamId:'czech', position:'FW', age:30, appearances:45, goals:22, marketValue:'2500万欧', marketValueEur:25, club:'Bayer Leverkusen', photoUrl:_, abilities:{speed:7,shooting:8,passing:6,dribbling:7,defense:3,physical:7} },
  { id:'soucek', name:'绍切克', nameEn:'Tomáš Souček', teamId:'czech', position:'MF', age:31, appearances:75, goals:14, marketValue:'2200万欧', marketValueEur:22, club:'West Ham', photoUrl:_, abilities:{speed:5,shooting:7,passing:7,dribbling:5,defense:8,physical:9} },
  { id:'hlozek', name:'赫洛泽克', nameEn:'Adam Hložek', teamId:'czech', position:'FW', age:23, appearances:25, goals:5, marketValue:'1800万欧', marketValueEur:18, club:'Bayer Leverkusen', photoUrl:_, abilities:{speed:8,shooting:7,passing:7,dribbling:8,defense:3,physical:6} },
  // South Africa
  { id:'tau', name:'塔乌', nameEn:'Percy Tau', teamId:'south-africa', position:'FW', age:32, appearances:50, goals:16, marketValue:'800万欧', marketValueEur:8, club:'Al Ahly', photoUrl:_, abilities:{speed:8,shooting:7,passing:7,dribbling:8,defense:3,physical:5} },
  { id:'foster', name:'福斯特', nameEn:'Lyle Foster', teamId:'south-africa', position:'FW', age:25, appearances:20, goals:6, marketValue:'1200万欧', marketValueEur:12, club:'Burnley', photoUrl:_, abilities:{speed:8,shooting:7,passing:5,dribbling:7,defense:2,physical:7} },
  { id:'zwane', name:'兹瓦内', nameEn:'Themba Zwane', teamId:'south-africa', position:'MF', age:36, appearances:50, goals:12, marketValue:'500万欧', marketValueEur:5, club:'Mamelodi Sundowns', photoUrl:_, abilities:{speed:6,shooting:6,passing:8,dribbling:8,defense:4,physical:5} },

  // ═══ GROUP B ═══
  // Canada
  { id:'davies', name:'阿方索·戴维斯', nameEn:'Alphonso Davies', teamId:'canada', position:'DF', age:25, appearances:55, goals:16, marketValue:'7000万欧', marketValueEur:70, club:'Bayern Munich', photoUrl:_, abilities:{speed:10,shooting:7,passing:7,dribbling:9,defense:7,physical:7} },
  { id:'david', name:'乔纳森·戴维', nameEn:'Jonathan David', teamId:'canada', position:'FW', age:26, appearances:55, goals:30, marketValue:'6000万欧', marketValueEur:60, club:'Lille', photoUrl:_, abilities:{speed:8,shooting:9,passing:6,dribbling:7,defense:2,physical:6} },
  { id:'eustaquio', name:'欧斯塔基奥', nameEn:'Stephen Eustáquio', teamId:'canada', position:'MF', age:29, appearances:45, goals:5, marketValue:'1500万欧', marketValueEur:15, club:'Porto', photoUrl:_, abilities:{speed:6,shooting:6,passing:8,dribbling:7,defense:7,physical:6} },
  // Qatar
  { id:'afif', name:'阿菲夫', nameEn:'Akram Afif', teamId:'qatar', position:'FW', age:29, appearances:115, goals:35, marketValue:'600万欧', marketValueEur:6, club:'Al Sadd', photoUrl:_, abilities:{speed:8,shooting:7,passing:8,dribbling:9,defense:2,physical:5} },
  { id:'almoez', name:'阿尔莫兹·阿里', nameEn:'Almoez Ali', teamId:'qatar', position:'FW', age:29, appearances:115, goals:55, marketValue:'400万欧', marketValueEur:4, club:'Al Duhail', photoUrl:_, abilities:{speed:7,shooting:8,passing:6,dribbling:7,defense:2,physical:6} },
  { id:'al-haydos', name:'海多斯', nameEn:'Hassan Al-Haydos', teamId:'qatar', position:'MF', age:35, appearances:180, goals:40, marketValue:'200万欧', marketValueEur:2, club:'Al Sadd', photoUrl:_, abilities:{speed:5,shooting:7,passing:8,dribbling:7,defense:4,physical:5} },
  // Switzerland
  { id:'xhaka', name:'扎卡', nameEn:'Granit Xhaka', teamId:'switzerland', position:'MF', age:33, appearances:130, goals:15, marketValue:'2000万欧', marketValueEur:20, club:'Bayer Leverkusen', photoUrl:_, abilities:{speed:5,shooting:8,passing:9,dribbling:5,defense:7,physical:8} },
  { id:'akanji', name:'阿坎吉', nameEn:'Manuel Akanji', teamId:'switzerland', position:'DF', age:30, appearances:65, goals:3, marketValue:'4000万欧', marketValueEur:40, club:'Manchester City', photoUrl:_, abilities:{speed:8,shooting:4,passing:7,dribbling:5,defense:9,physical:8} },
  { id:'shaqiri', name:'沙奇里', nameEn:'Xherdan Shaqiri', teamId:'switzerland', position:'MF', age:34, appearances:125, goals:32, marketValue:'500万欧', marketValueEur:5, club:'Chicago Fire', photoUrl:_, abilities:{speed:6,shooting:8,passing:8,dribbling:8,defense:3,physical:6} },
  // Bosnia
  { id:'dzeko', name:'哲科', nameEn:'Edin Džeko', teamId:'bosnia', position:'FW', age:40, appearances:135, goals:66, marketValue:'200万欧', marketValueEur:2, club:'Fenerbahçe', photoUrl:_, abilities:{speed:4,shooting:8,passing:7,dribbling:5,defense:4,physical:7} },
  { id:'krunic', name:'克鲁尼奇', nameEn:'Rade Krunić', teamId:'bosnia', position:'MF', age:32, appearances:40, goals:4, marketValue:'800万欧', marketValueEur:8, club:'Fenerbahçe', photoUrl:_, abilities:{speed:6,shooting:6,passing:7,dribbling:6,defense:7,physical:7} },
  { id:'pjanic', name:'皮亚尼奇', nameEn:'Miralem Pjanić', teamId:'bosnia', position:'MF', age:36, appearances:115, goals:18, marketValue:'300万欧', marketValueEur:3, club:'Al Sharjah', photoUrl:_, abilities:{speed:4,shooting:7,passing:9,dribbling:7,defense:5,physical:5} },

  // ═══ GROUP C ═══
  // Brazil
  { id:'neymar', name:'内马尔', nameEn:'Neymar Jr', teamId:'brazil', position:'FW', age:34, appearances:128, goals:79, marketValue:'1500万欧', marketValueEur:15, club:'Santos', photoUrl:'https://cdn.sofifa.net/players/190/871/25_120.png', abilities:{speed:8,shooting:8,passing:9,dribbling:10,defense:2,physical:5} },
  { id:'vinicius', name:'维尼修斯', nameEn:'Vinícius Júnior', teamId:'brazil', position:'FW', age:25, appearances:40, goals:8, marketValue:'2亿欧', marketValueEur:200, club:'Real Madrid', photoUrl:'https://cdn.sofifa.net/players/238/794/25_120.png', abilities:{speed:10,shooting:8,passing:7,dribbling:10,defense:3,physical:6} },
  { id:'rodrygo', name:'罗德里戈', nameEn:'Rodrygo', teamId:'brazil', position:'FW', age:25, appearances:30, goals:7, marketValue:'1.1亿欧', marketValueEur:110, club:'Real Madrid', photoUrl:'https://cdn.sofifa.net/players/243/812/25_120.png', abilities:{speed:9,shooting:8,passing:7,dribbling:9,defense:3,physical:5} },
  // Haiti
  { id:'pierrot', name:'皮埃罗', nameEn:'Frantzdy Pierrot', teamId:'haiti', position:'FW', age:31, appearances:35, goals:22, marketValue:'300万欧', marketValueEur:3, club:'Maccabi Haifa', photoUrl:_, abilities:{speed:7,shooting:7,passing:5,dribbling:6,defense:2,physical:8} },
  { id:'nazon', name:'纳宗', nameEn:'Duckens Nazon', teamId:'haiti', position:'FW', age:32, appearances:55, goals:30, marketValue:'250万欧', marketValueEur:3, club:'CSKA Sofia', photoUrl:_, abilities:{speed:8,shooting:7,passing:5,dribbling:7,defense:2,physical:7} },
  { id:'arcus', name:'阿尔库斯', nameEn:'Carlens Arcus', teamId:'haiti', position:'DF', age:29, appearances:40, goals:3, marketValue:'200万欧', marketValueEur:2, club:'Angers', photoUrl:_, abilities:{speed:7,shooting:3,passing:5,dribbling:5,defense:7,physical:7} },
  // Scotland
  { id:'robertson', name:'罗伯逊', nameEn:'Andrew Robertson', teamId:'scotland', position:'DF', age:32, appearances:80, goals:4, marketValue:'2000万欧', marketValueEur:20, club:'Liverpool', photoUrl:_, abilities:{speed:8,shooting:5,passing:8,dribbling:7,defense:8,physical:7} },
  { id:'mctominay', name:'麦克托米奈', nameEn:'Scott McTominay', teamId:'scotland', position:'MF', age:29, appearances:60, goals:11, marketValue:'3500万欧', marketValueEur:35, club:'Napoli', photoUrl:_, abilities:{speed:6,shooting:8,passing:7,dribbling:6,defense:7,physical:8} },
  { id:'gilmour', name:'吉尔摩', nameEn:'Billy Gilmour', teamId:'scotland', position:'MF', age:25, appearances:35, goals:2, marketValue:'1500万欧', marketValueEur:15, club:'Brighton', photoUrl:_, abilities:{speed:6,shooting:5,passing:8,dribbling:7,defense:6,physical:5} },
  // Morocco
  { id:'hakimi', name:'阿什拉夫', nameEn:'Achraf Hakimi', teamId:'morocco', position:'DF', age:27, appearances:85, goals:10, marketValue:'6500万欧', marketValueEur:65, club:'PSG', photoUrl:_, abilities:{speed:10,shooting:6,passing:8,dribbling:8,defense:7,physical:7} },
  { id:'brahim', name:'卜拉欣·迪亚斯', nameEn:'Brahim Díaz', teamId:'morocco', position:'MF', age:26, appearances:20, goals:4, marketValue:'3500万欧', marketValueEur:35, club:'Real Madrid', photoUrl:_, abilities:{speed:8,shooting:7,passing:8,dribbling:9,defense:4,physical:5} },
  { id:'en-nesyri', name:'恩内斯里', nameEn:'Youssef En-Nesyri', teamId:'morocco', position:'FW', age:29, appearances:75, goals:25, marketValue:'2000万欧', marketValueEur:20, club:'Fenerbahçe', photoUrl:_, abilities:{speed:8,shooting:8,passing:5,dribbling:6,defense:3,physical:8} },

  // ═══ GROUP D ═══
  // USA
  { id:'pulisic', name:'普利西奇', nameEn:'Christian Pulisic', teamId:'usa', position:'FW', age:27, appearances:75, goals:32, marketValue:'5000万欧', marketValueEur:50, club:'AC Milan', photoUrl:_, abilities:{speed:9,shooting:8,passing:8,dribbling:9,defense:4,physical:6} },
  { id:'reyna', name:'雷纳', nameEn:'Giovanni Reyna', teamId:'usa', position:'MF', age:23, appearances:35, goals:8, marketValue:'2500万欧', marketValueEur:25, club:'Borussia Dortmund', photoUrl:_, abilities:{speed:7,shooting:7,passing:8,dribbling:9,defense:4,physical:5} },
  { id:'balogun', name:'巴洛贡', nameEn:'Folarin Balogun', teamId:'usa', position:'FW', age:24, appearances:20, goals:6, marketValue:'3500万欧', marketValueEur:35, club:'Monaco', photoUrl:_, abilities:{speed:9,shooting:8,passing:5,dribbling:7,defense:2,physical:7} },
  // Australia
  { id:'ryan', name:'马修·瑞安', nameEn:'Mathew Ryan', teamId:'australia', position:'GK', age:34, appearances:95, goals:0, marketValue:'300万欧', marketValueEur:3, club:'AZ Alkmaar', photoUrl:_, abilities:{speed:3,shooting:1,passing:5,dribbling:1,defense:2,physical:4} },
  { id:'souttar', name:'苏塔', nameEn:'Harry Souttar', teamId:'australia', position:'DF', age:27, appearances:35, goals:8, marketValue:'1200万欧', marketValueEur:12, club:'Leicester City', photoUrl:_, abilities:{speed:4,shooting:5,passing:5,dribbling:3,defense:8,physical:9} },
  { id:'mcgree', name:'麦格里', nameEn:'Riley McGree', teamId:'australia', position:'MF', age:27, appearances:30, goals:4, marketValue:'800万欧', marketValueEur:8, club:'Middlesbrough', photoUrl:_, abilities:{speed:7,shooting:7,passing:7,dribbling:7,defense:5,physical:6} },
  // Turkey
  { id:'calhanoglu', name:'恰尔汗奥卢', nameEn:'Hakan Çalhanoğlu', teamId:'turkey', position:'MF', age:32, appearances:95, goals:20, marketValue:'3000万欧', marketValueEur:30, club:'Inter Milan', photoUrl:_, abilities:{speed:6,shooting:9,passing:9,dribbling:7,defense:6,physical:6} },
  { id:'guler', name:'居莱尔', nameEn:'Arda Güler', teamId:'turkey', position:'MF', age:21, appearances:20, goals:4, marketValue:'5000万欧', marketValueEur:50, club:'Real Madrid', photoUrl:_, abilities:{speed:7,shooting:8,passing:9,dribbling:9,defense:4,physical:4} },
  { id:'tosun', name:'托松', nameEn:'Cenk Tosun', teamId:'turkey', position:'FW', age:35, appearances:55, goals:22, marketValue:'500万欧', marketValueEur:5, club:'Beşiktaş', photoUrl:_, abilities:{speed:5,shooting:7,passing:5,dribbling:5,defense:3,physical:7} },
  // Paraguay
  { id:'almiron', name:'阿尔米隆', nameEn:'Miguel Almirón', teamId:'paraguay', position:'MF', age:32, appearances:60, goals:8, marketValue:'1800万欧', marketValueEur:18, club:'Newcastle', photoUrl:_, abilities:{speed:9,shooting:7,passing:7,dribbling:8,defense:5,physical:5} },
  { id:'enciso', name:'恩西索', nameEn:'Julio Enciso', teamId:'paraguay', position:'FW', age:22, appearances:20, goals:3, marketValue:'2500万欧', marketValueEur:25, club:'Brighton', photoUrl:_, abilities:{speed:9,shooting:7,passing:7,dribbling:8,defense:3,physical:5} },
  { id:'g-gomez', name:'古斯塔沃·戈麦斯', nameEn:'Gustavo Gómez', teamId:'paraguay', position:'DF', age:33, appearances:85, goals:7, marketValue:'800万欧', marketValueEur:8, club:'Palmeiras', photoUrl:_, abilities:{speed:5,shooting:5,passing:5,dribbling:3,defense:8,physical:8} },

  // ═══ GROUP E ═══
  // Germany
  { id:'musiala', name:'穆西亚拉', nameEn:'Jamal Musiala', teamId:'germany', position:'MF', age:23, appearances:40, goals:8, marketValue:'1.4亿欧', marketValueEur:140, club:'Bayern Munich', photoUrl:'https://cdn.sofifa.net/players/256/790/25_120.png', abilities:{speed:9,shooting:7,passing:8,dribbling:10,defense:5,physical:5} },
  { id:'wirtz', name:'维尔茨', nameEn:'Florian Wirtz', teamId:'germany', position:'MF', age:23, appearances:32, goals:6, marketValue:'1.3亿欧', marketValueEur:130, club:'Bayer Leverkusen', photoUrl:'https://cdn.sofifa.net/players/256/630/25_120.png', abilities:{speed:8,shooting:8,passing:9,dribbling:9,defense:4,physical:5} },
  { id:'havertz', name:'哈弗茨', nameEn:'Kai Havertz', teamId:'germany', position:'FW', age:27, appearances:55, goals:20, marketValue:'6000万欧', marketValueEur:60, club:'Arsenal', photoUrl:_, abilities:{speed:7,shooting:8,passing:8,dribbling:7,defense:5,physical:7} },
  // Ivory Coast
  { id:'haller', name:'阿莱', nameEn:'Sébastien Haller', teamId:'ivory-coast', position:'FW', age:32, appearances:40, goals:15, marketValue:'1500万欧', marketValueEur:15, club:'Borussia Dortmund', photoUrl:_, abilities:{speed:6,shooting:8,passing:6,dribbling:6,defense:3,physical:8} },
  { id:'kessie', name:'凯西', nameEn:'Franck Kessié', teamId:'ivory-coast', position:'MF', age:29, appearances:75, goals:12, marketValue:'2500万欧', marketValueEur:25, club:'Al Ahli', photoUrl:_, abilities:{speed:6,shooting:7,passing:7,dribbling:6,defense:8,physical:9} },
  { id:'adingra', name:'阿丁格拉', nameEn:'Simon Adingra', teamId:'ivory-coast', position:'FW', age:24, appearances:20, goals:5, marketValue:'3000万欧', marketValueEur:30, club:'Brighton', photoUrl:_, abilities:{speed:9,shooting:7,passing:7,dribbling:9,defense:4,physical:5} },
  // Ecuador
  { id:'caicedo', name:'凯塞多', nameEn:'Moisés Caicedo', teamId:'ecuador', position:'MF', age:24, appearances:50, goals:5, marketValue:'9000万欧', marketValueEur:90, club:'Chelsea', photoUrl:_, abilities:{speed:7,shooting:6,passing:8,dribbling:7,defense:8,physical:8} },
  { id:'hincapie', name:'因卡皮耶', nameEn:'Piero Hincapié', teamId:'ecuador', position:'DF', age:24, appearances:40, goals:3, marketValue:'4000万欧', marketValueEur:40, club:'Bayer Leverkusen', photoUrl:_, abilities:{speed:7,shooting:4,passing:6,dribbling:5,defense:9,physical:8} },
  { id:'valencia', name:'恩纳·瓦伦西亚', nameEn:'Enner Valencia', teamId:'ecuador', position:'FW', age:36, appearances:90, goals:42, marketValue:'500万欧', marketValueEur:5, club:'Internacional', photoUrl:_, abilities:{speed:7,shooting:8,passing:5,dribbling:6,defense:3,physical:7} },
  // Curacao
  { id:'l-bacuna', name:'林德罗·巴库纳', nameEn:'Leandro Bacuna', teamId:'curacao', position:'MF', age:34, appearances:50, goals:14, marketValue:'200万欧', marketValueEur:2, club:'Groningen', photoUrl:_, abilities:{speed:6,shooting:6,passing:7,dribbling:6,defense:5,physical:7} },
  { id:'j-bacuna', name:'儒尼尼奥·巴库纳', nameEn:'Juninho Bacuna', teamId:'curacao', position:'MF', age:28, appearances:30, goals:6, marketValue:'300万欧', marketValueEur:3, club:'Birmingham City', photoUrl:_, abilities:{speed:7,shooting:6,passing:7,dribbling:7,defense:5,physical:6} },
  { id:'janga', name:'扬哈', nameEn:'Rangelo Janga', teamId:'curacao', position:'FW', age:34, appearances:40, goals:20, marketValue:'150万欧', marketValueEur:2, club:'FC Eindhoven', photoUrl:_, abilities:{speed:6,shooting:7,passing:5,dribbling:5,defense:3,physical:7} },

  // ═══ GROUP F ═══
  // Netherlands
  { id:'vandijk', name:'范迪克', nameEn:'Virgil van Dijk', teamId:'netherlands', position:'DF', age:34, appearances:78, goals:9, marketValue:'3000万欧', marketValueEur:30, club:'Liverpool', photoUrl:'https://cdn.sofifa.net/players/203/376/25_120.png', abilities:{speed:7,shooting:5,passing:7,dribbling:4,defense:10,physical:10} },
  { id:'gakpo', name:'加克波', nameEn:'Cody Gakpo', teamId:'netherlands', position:'FW', age:27, appearances:38, goals:15, marketValue:'6000万欧', marketValueEur:60, club:'Liverpool', photoUrl:_, abilities:{speed:8,shooting:8,passing:7,dribbling:8,defense:4,physical:7} },
  { id:'dejong', name:'德容', nameEn:'Frenkie de Jong', teamId:'netherlands', position:'MF', age:29, appearances:60, goals:3, marketValue:'7000万欧', marketValueEur:70, club:'Barcelona', photoUrl:_, abilities:{speed:7,shooting:5,passing:9,dribbling:9,defense:6,physical:6} },
  // Sweden
  { id:'isak', name:'伊萨克', nameEn:'Alexander Isak', teamId:'sweden', position:'FW', age:26, appearances:50, goals:18, marketValue:'8000万欧', marketValueEur:80, club:'Newcastle', photoUrl:_, abilities:{speed:9,shooting:9,passing:7,dribbling:8,defense:3,physical:7} },
  { id:'kulusevski', name:'库卢塞夫斯基', nameEn:'Dejan Kulusevski', teamId:'sweden', position:'MF', age:26, appearances:45, goals:7, marketValue:'5500万欧', marketValueEur:55, club:'Tottenham', photoUrl:_, abilities:{speed:8,shooting:7,passing:8,dribbling:8,defense:5,physical:7} },
  { id:'lindelof', name:'林德洛夫', nameEn:'Victor Lindelöf', teamId:'sweden', position:'DF', age:31, appearances:70, goals:3, marketValue:'1500万欧', marketValueEur:15, club:'Manchester United', photoUrl:_, abilities:{speed:6,shooting:4,passing:7,dribbling:4,defense:8,physical:7} },
  // Tunisia
  { id:'skhiri', name:'斯希里', nameEn:'Ellyes Skhiri', teamId:'tunisia', position:'MF', age:31, appearances:70, goals:8, marketValue:'1500万欧', marketValueEur:15, club:'Eintracht Frankfurt', photoUrl:_, abilities:{speed:6,shooting:6,passing:7,dribbling:6,defense:8,physical:8} },
  { id:'mejbri', name:'梅布里', nameEn:'Hannibal Mejbri', teamId:'tunisia', position:'MF', age:23, appearances:30, goals:2, marketValue:'1200万欧', marketValueEur:12, club:'Burnley', photoUrl:_, abilities:{speed:7,shooting:5,passing:7,dribbling:7,defense:6,physical:6} },
  { id:'msakni', name:'姆萨克尼', nameEn:'Youssef Msakni', teamId:'tunisia', position:'FW', age:35, appearances:105, goals:25, marketValue:'300万欧', marketValueEur:3, club:'Al Arabi', photoUrl:_, abilities:{speed:6,shooting:7,passing:7,dribbling:8,defense:3,physical:5} },
  // Japan
  { id:'mitoma', name:'三笘薰', nameEn:'Kaoru Mitoma', teamId:'japan', position:'FW', age:29, appearances:30, goals:10, marketValue:'5000万欧', marketValueEur:50, club:'Brighton', photoUrl:_, abilities:{speed:9,shooting:7,passing:7,dribbling:10,defense:5,physical:6} },
  { id:'kubo', name:'久保建英', nameEn:'Takefusa Kubo', teamId:'japan', position:'MF', age:25, appearances:45, goals:8, marketValue:'6000万欧', marketValueEur:60, club:'Real Sociedad', photoUrl:_, abilities:{speed:8,shooting:7,passing:8,dribbling:9,defense:4,physical:4} },
  { id:'endo', name:'远藤航', nameEn:'Wataru Endo', teamId:'japan', position:'MF', age:33, appearances:65, goals:5, marketValue:'1200万欧', marketValueEur:12, club:'Liverpool', photoUrl:_, abilities:{speed:6,shooting:5,passing:7,dribbling:5,defense:9,physical:8} },

  // ═══ GROUP G ═══
  // Belgium
  { id:'debruyne', name:'德布劳内', nameEn:'Kevin De Bruyne', teamId:'belgium', position:'MF', age:34, appearances:110, goals:28, marketValue:'5000万欧', marketValueEur:50, club:'Manchester City', photoUrl:'https://cdn.sofifa.net/players/192/985/25_120.png', abilities:{speed:6,shooting:9,passing:10,dribbling:7,defense:5,physical:6} },
  { id:'lukaku', name:'卢卡库', nameEn:'Romelu Lukaku', teamId:'belgium', position:'FW', age:33, appearances:120, goals:85, marketValue:'3000万欧', marketValueEur:30, club:'Roma', photoUrl:_, abilities:{speed:7,shooting:9,passing:6,dribbling:5,defense:4,physical:10} },
  { id:'doku', name:'多库', nameEn:'Jérémy Doku', teamId:'belgium', position:'FW', age:24, appearances:30, goals:4, marketValue:'6500万欧', marketValueEur:65, club:'Manchester City', photoUrl:_, abilities:{speed:10,shooting:6,passing:7,dribbling:10,defense:3,physical:6} },
  // Iran
  { id:'taremi', name:'塔雷米', nameEn:'Mehdi Taremi', teamId:'iran', position:'FW', age:33, appearances:85, goals:50, marketValue:'1200万欧', marketValueEur:12, club:'Inter Milan', photoUrl:_, abilities:{speed:7,shooting:9,passing:7,dribbling:7,defense:3,physical:7} },
  { id:'azmoun', name:'阿兹蒙', nameEn:'Sardar Azmoun', teamId:'iran', position:'FW', age:31, appearances:80, goals:55, marketValue:'800万欧', marketValueEur:8, club:'Bayer Leverkusen', photoUrl:_, abilities:{speed:8,shooting:8,passing:6,dribbling:7,defense:2,physical:7} },
  { id:'jahanbakhsh', name:'贾汉巴赫什', nameEn:'Alireza Jahanbakhsh', teamId:'iran', position:'FW', age:32, appearances:75, goals:18, marketValue:'500万欧', marketValueEur:5, club:'Feyenoord', photoUrl:_, abilities:{speed:7,shooting:7,passing:7,dribbling:7,defense:4,physical:6} },
  // New Zealand
  { id:'wood', name:'克里斯·伍德', nameEn:'Chris Wood', teamId:'new-zealand', position:'FW', age:34, appearances:80, goals:38, marketValue:'800万欧', marketValueEur:8, club:'Nottingham Forest', photoUrl:_, abilities:{speed:5,shooting:8,passing:5,dribbling:5,defense:3,physical:9} },
  { id:'singh', name:'萨普里特·辛格', nameEn:'Sarpreet Singh', teamId:'new-zealand', position:'MF', age:27, appearances:25, goals:4, marketValue:'200万欧', marketValueEur:2, club:'Hansa Rostock', photoUrl:_, abilities:{speed:7,shooting:6,passing:7,dribbling:8,defense:4,physical:5} },
  { id:'cacace', name:'卡卡切', nameEn:'Liberato Cacace', teamId:'new-zealand', position:'DF', age:25, appearances:30, goals:2, marketValue:'300万欧', marketValueEur:3, club:'Empoli', photoUrl:_, abilities:{speed:8,shooting:4,passing:6,dribbling:6,defense:7,physical:7} },
  // Egypt
  { id:'salah', name:'萨拉赫', nameEn:'Mohamed Salah', teamId:'egypt', position:'FW', age:34, appearances:100, goals:57, marketValue:'6000万欧', marketValueEur:60, club:'Liverpool', photoUrl:'https://cdn.sofifa.net/players/209/331/25_120.png', abilities:{speed:9,shooting:9,passing:8,dribbling:9,defense:3,physical:7} },
  { id:'marmoush', name:'马尔穆什', nameEn:'Omar Marmoush', teamId:'egypt', position:'FW', age:27, appearances:40, goals:10, marketValue:'5000万欧', marketValueEur:50, club:'Manchester City', photoUrl:_, abilities:{speed:9,shooting:8,passing:7,dribbling:8,defense:3,physical:6} },
  { id:'trezeguet', name:'特雷泽盖', nameEn:'Trézéguet', teamId:'egypt', position:'FW', age:31, appearances:75, goals:18, marketValue:'800万欧', marketValueEur:8, club:'Trabzonspor', photoUrl:_, abilities:{speed:8,shooting:7,passing:6,dribbling:7,defense:4,physical:6} },

  // ═══ GROUP H ═══
  // Spain
  { id:'yamal', name:'亚马尔', nameEn:'Lamine Yamal', teamId:'spain', position:'FW', age:18, appearances:22, goals:5, marketValue:'1.5亿欧', marketValueEur:150, club:'Barcelona', photoUrl:'https://cdn.sofifa.net/players/268/438/25_120.png', abilities:{speed:9,shooting:7,passing:8,dribbling:10,defense:3,physical:4} },
  { id:'pedri', name:'佩德里', nameEn:'Pedri', teamId:'spain', position:'MF', age:23, appearances:30, goals:3, marketValue:'1亿欧', marketValueEur:100, club:'Barcelona', photoUrl:'https://cdn.sofifa.net/players/251/853/25_120.png', abilities:{speed:7,shooting:6,passing:10,dribbling:9,defense:6,physical:5} },
  { id:'rodri', name:'罗德里', nameEn:'Rodri', teamId:'spain', position:'MF', age:30, appearances:60, goals:5, marketValue:'1.3亿欧', marketValueEur:130, club:'Manchester City', photoUrl:'https://cdn.sofifa.net/players/231/866/25_120.png', abilities:{speed:5,shooting:8,passing:9,dribbling:6,defense:9,physical:8} },
  // Saudi Arabia
  { id:'al-dawsari', name:'达瓦萨里', nameEn:'Salem Al-Dawsari', teamId:'saudi-arabia', position:'MF', age:34, appearances:90, goals:25, marketValue:'300万欧', marketValueEur:3, club:'Al Hilal', photoUrl:_, abilities:{speed:7,shooting:7,passing:7,dribbling:8,defense:4,physical:5} },
  { id:'al-buraikan', name:'布拉伊坎', nameEn:'Firas Al-Buraikan', teamId:'saudi-arabia', position:'FW', age:26, appearances:45, goals:15, marketValue:'400万欧', marketValueEur:4, club:'Al Ahli', photoUrl:_, abilities:{speed:8,shooting:7,passing:5,dribbling:6,defense:2,physical:6} },
  { id:'abdulhamid', name:'阿卜杜勒哈米德', nameEn:'Saud Abdulhamid', teamId:'saudi-arabia', position:'DF', age:26, appearances:40, goals:3, marketValue:'300万欧', marketValueEur:3, club:'Al Hilal', photoUrl:_, abilities:{speed:8,shooting:4,passing:6,dribbling:6,defense:7,physical:7} },
  // Uruguay
  { id:'valverde', name:'巴尔韦德', nameEn:'Federico Valverde', teamId:'uruguay', position:'MF', age:27, appearances:65, goals:8, marketValue:'1亿欧', marketValueEur:100, club:'Real Madrid', photoUrl:_, abilities:{speed:8,shooting:9,passing:8,dribbling:7,defense:7,physical:8} },
  { id:'nunez', name:'努涅斯', nameEn:'Darwin Núñez', teamId:'uruguay', position:'FW', age:27, appearances:35, goals:8, marketValue:'6500万欧', marketValueEur:65, club:'Liverpool', photoUrl:_, abilities:{speed:9,shooting:8,passing:5,dribbling:7,defense:3,physical:8} },
  { id:'araujo', name:'阿劳霍', nameEn:'Ronald Araújo', teamId:'uruguay', position:'DF', age:27, appearances:25, goals:2, marketValue:'7000万欧', marketValueEur:70, club:'Barcelona', photoUrl:_, abilities:{speed:8,shooting:5,passing:6,dribbling:4,defense:9,physical:9} },
  // Cape Verde
  { id:'r-mendes', name:'瑞安·门德斯', nameEn:'Ryan Mendes', teamId:'cape-verde', position:'FW', age:36, appearances:75, goals:18, marketValue:'200万欧', marketValueEur:2, club:'Fatih Karagümrük', photoUrl:_, abilities:{speed:7,shooting:7,passing:6,dribbling:7,defense:3,physical:6} },
  { id:'j-cabral', name:'若瓦内·卡布拉尔', nameEn:'Jovane Cabral', teamId:'cape-verde', position:'FW', age:28, appearances:30, goals:6, marketValue:'300万欧', marketValueEur:3, club:'Sporting CP', photoUrl:_, abilities:{speed:8,shooting:7,passing:6,dribbling:8,defense:3,physical:5} },
  { id:'g-rodrigues', name:'加里·罗德里格斯', nameEn:'Garry Rodrigues', teamId:'cape-verde', position:'FW', age:35, appearances:50, goals:10, marketValue:'150万欧', marketValueEur:2, club:'Sivasspor', photoUrl:_, abilities:{speed:7,shooting:6,passing:6,dribbling:7,defense:3,physical:6} },

  // ═══ GROUP I ═══
  // France
  { id:'mbappe', name:'姆巴佩', nameEn:'Kylian Mbappé', teamId:'france', position:'FW', age:27, appearances:88, goals:52, marketValue:'1.8亿欧', marketValueEur:180, club:'Real Madrid', photoUrl:'https://cdn.sofifa.net/players/231/747/25_120.png', abilities:{speed:10,shooting:9,passing:7,dribbling:9,defense:2,physical:7} },
  { id:'dembele', name:'登贝莱', nameEn:'Ousmane Dembélé', teamId:'france', position:'FW', age:29, appearances:55, goals:8, marketValue:'6000万欧', marketValueEur:60, club:'PSG', photoUrl:_, abilities:{speed:10,shooting:7,passing:8,dribbling:10,defense:3,physical:5} },
  { id:'tchouameni', name:'楚阿梅尼', nameEn:'Aurélien Tchouaméni', teamId:'france', position:'MF', age:26, appearances:40, goals:4, marketValue:'1亿欧', marketValueEur:100, club:'Real Madrid', photoUrl:_, abilities:{speed:6,shooting:7,passing:8,dribbling:6,defense:9,physical:8} },
  // Iraq
  { id:'hussein', name:'艾曼·侯赛因', nameEn:'Aymen Hussein', teamId:'iraq', position:'FW', age:30, appearances:40, goals:20, marketValue:'150万欧', marketValueEur:2, club:'Al Shorta', photoUrl:_, abilities:{speed:6,shooting:8,passing:5,dribbling:5,defense:3,physical:8} },
  { id:'a-jasim', name:'阿里·贾西姆', nameEn:'Ali Jasim', teamId:'iraq', position:'FW', age:22, appearances:15, goals:5, marketValue:'100万欧', marketValueEur:1, club:'Al Quwa Al Jawiya', photoUrl:_, abilities:{speed:8,shooting:7,passing:6,dribbling:8,defense:2,physical:5} },
  { id:'z-iqbal', name:'齐丹·伊克巴尔', nameEn:'Zidane Iqbal', teamId:'iraq', position:'MF', age:23, appearances:10, goals:1, marketValue:'200万欧', marketValueEur:2, club:'FC Utrecht', photoUrl:_, abilities:{speed:6,shooting:5,passing:7,dribbling:7,defense:5,physical:5} },
  // Norway
  { id:'haaland', name:'哈兰德', nameEn:'Erling Haaland', teamId:'norway', position:'FW', age:25, appearances:42, goals:38, marketValue:'2亿欧', marketValueEur:200, club:'Manchester City', photoUrl:'https://cdn.sofifa.net/players/239/085/25_120.png', abilities:{speed:9,shooting:10,passing:5,dribbling:6,defense:2,physical:10} },
  { id:'odegaard', name:'厄德高', nameEn:'Martin Ødegaard', teamId:'norway', position:'MF', age:27, appearances:65, goals:10, marketValue:'9000万欧', marketValueEur:90, club:'Arsenal', photoUrl:'https://cdn.sofifa.net/players/222/665/25_120.png', abilities:{speed:7,shooting:7,passing:10,dribbling:9,defense:5,physical:5} },
  { id:'sorloth', name:'瑟洛特', nameEn:'Alexander Sørloth', teamId:'norway', position:'FW', age:30, appearances:60, goals:25, marketValue:'2500万欧', marketValueEur:25, club:'Atlético Madrid', photoUrl:_, abilities:{speed:7,shooting:8,passing:6,dribbling:6,defense:3,physical:9} },
  // Senegal
  { id:'mane', name:'马内', nameEn:'Sadio Mané', teamId:'senegal', position:'FW', age:34, appearances:110, goals:45, marketValue:'2000万欧', marketValueEur:20, club:'Al Nassr', photoUrl:_, abilities:{speed:8,shooting:9,passing:7,dribbling:8,defense:4,physical:7} },
  { id:'koulibaly', name:'库利巴利', nameEn:'Kalidou Koulibaly', teamId:'senegal', position:'DF', age:35, appearances:85, goals:6, marketValue:'1000万欧', marketValueEur:10, club:'Al Hilal', photoUrl:_, abilities:{speed:6,shooting:5,passing:6,dribbling:4,defense:9,physical:9} },
  { id:'n-jackson', name:'尼古拉·杰克逊', nameEn:'Nicolas Jackson', teamId:'senegal', position:'FW', age:25, appearances:25, goals:8, marketValue:'5000万欧', marketValueEur:50, club:'Chelsea', photoUrl:_, abilities:{speed:9,shooting:7,passing:6,dribbling:8,defense:3,physical:7} },

  // ═══ GROUP J ═══
  // Argentina
  { id:'messi', name:'梅西', nameEn:'Lionel Messi', teamId:'argentina', position:'FW', age:38, appearances:192, goals:112, marketValue:'2000万欧', marketValueEur:20, club:'Inter Miami', photoUrl:'https://cdn.sofifa.net/players/158/023/25_120.png', abilities:{speed:6,shooting:9,passing:10,dribbling:10,defense:3,physical:5} },
  { id:'alvarez', name:'阿尔瓦雷斯', nameEn:'Julián Álvarez', teamId:'argentina', position:'FW', age:26, appearances:40, goals:11, marketValue:'9000万欧', marketValueEur:90, club:'Atlético Madrid', photoUrl:'https://cdn.sofifa.net/players/246/191/25_120.png', abilities:{speed:8,shooting:8,passing:7,dribbling:7,defense:4,physical:7} },
  { id:'enzo', name:'恩佐·费尔南德斯', nameEn:'Enzo Fernández', teamId:'argentina', position:'MF', age:25, appearances:35, goals:4, marketValue:'8000万欧', marketValueEur:80, club:'Chelsea', photoUrl:_, abilities:{speed:6,shooting:7,passing:9,dribbling:7,defense:7,physical:6} },
  // Austria
  { id:'alaba', name:'阿拉巴', nameEn:'David Alaba', teamId:'austria', position:'DF', age:34, appearances:110, goals:16, marketValue:'1500万欧', marketValueEur:15, club:'Real Madrid', photoUrl:_, abilities:{speed:7,shooting:7,passing:8,dribbling:7,defense:8,physical:7} },
  { id:'sabitzer', name:'萨比策', nameEn:'Marcel Sabitzer', teamId:'austria', position:'MF', age:32, appearances:85, goals:18, marketValue:'2000万欧', marketValueEur:20, club:'Borussia Dortmund', photoUrl:_, abilities:{speed:7,shooting:8,passing:8,dribbling:7,defense:6,physical:7} },
  { id:'baumgartner', name:'鲍姆加特纳', nameEn:'Christoph Baumgartner', teamId:'austria', position:'MF', age:26, appearances:45, goals:14, marketValue:'3000万欧', marketValueEur:30, club:'RB Leipzig', photoUrl:_, abilities:{speed:8,shooting:7,passing:7,dribbling:8,defense:5,physical:6} },
  // Jordan
  { id:'al-taamari', name:'塔马里', nameEn:'Musa Al-Taamari', teamId:'jordan', position:'FW', age:28, appearances:70, goals:15, marketValue:'500万欧', marketValueEur:5, club:'Montpellier', photoUrl:_, abilities:{speed:8,shooting:7,passing:7,dribbling:8,defense:3,physical:5} },
  { id:'al-naimat', name:'奈马特', nameEn:'Yazan Al-Naimat', teamId:'jordan', position:'FW', age:26, appearances:45, goals:14, marketValue:'300万欧', marketValueEur:3, club:'Al Ahli', photoUrl:_, abilities:{speed:8,shooting:7,passing:6,dribbling:7,defense:2,physical:6} },
  { id:'olwan', name:'奥尔万', nameEn:'Ali Olwan', teamId:'jordan', position:'FW', age:25, appearances:35, goals:10, marketValue:'200万欧', marketValueEur:2, club:'Al Shamal', photoUrl:_, abilities:{speed:8,shooting:7,passing:6,dribbling:7,defense:2,physical:5} },
  // Algeria
  { id:'mahrez', name:'马赫雷斯', nameEn:'Riyad Mahrez', teamId:'algeria', position:'FW', age:35, appearances:95, goals:32, marketValue:'1500万欧', marketValueEur:15, club:'Al Ahli', photoUrl:_, abilities:{speed:7,shooting:8,passing:9,dribbling:9,defense:4,physical:5} },
  { id:'bennacer', name:'本纳赛尔', nameEn:'Ismaël Bennacer', teamId:'algeria', position:'MF', age:28, appearances:55, goals:4, marketValue:'2500万欧', marketValueEur:25, club:'AC Milan', photoUrl:_, abilities:{speed:6,shooting:5,passing:8,dribbling:8,defense:7,physical:6} },
  { id:'gouiri', name:'古伊里', nameEn:'Amine Gouiri', teamId:'algeria', position:'FW', age:26, appearances:20, goals:7, marketValue:'3500万欧', marketValueEur:35, club:'Rennes', photoUrl:_, abilities:{speed:8,shooting:8,passing:7,dribbling:8,defense:3,physical:6} },

  // ═══ GROUP K ═══
  // Portugal
  { id:'ronaldo', name:'C罗', nameEn:'Cristiano Ronaldo', teamId:'portugal', position:'FW', age:41, appearances:215, goals:135, marketValue:'1200万欧', marketValueEur:12, club:'Al Nassr', photoUrl:'https://cdn.sofifa.net/players/020/801/25_120.png', abilities:{speed:5,shooting:9,passing:7,dribbling:6,defense:3,physical:7} },
  { id:'bruno', name:'B费', nameEn:'Bruno Fernandes', teamId:'portugal', position:'MF', age:31, appearances:78, goals:25, marketValue:'7000万欧', marketValueEur:70, club:'Manchester United', photoUrl:'https://cdn.sofifa.net/players/212/198/25_120.png', abilities:{speed:7,shooting:8,passing:9,dribbling:7,defense:6,physical:6} },
  { id:'ruben-dias', name:'鲁本·迪亚斯', nameEn:'Rúben Dias', teamId:'portugal', position:'DF', age:29, appearances:65, goals:4, marketValue:'8000万欧', marketValueEur:80, club:'Manchester City', photoUrl:_, abilities:{speed:6,shooting:4,passing:7,dribbling:4,defense:10,physical:9} },
  // Uzbekistan
  { id:'shomurodov', name:'绍穆罗多夫', nameEn:'Eldor Shomurodov', teamId:'uzbekistan', position:'FW', age:30, appearances:80, goals:38, marketValue:'600万欧', marketValueEur:6, club:'Cagliari', photoUrl:_, abilities:{speed:7,shooting:8,passing:6,dribbling:6,defense:3,physical:7} },
  { id:'masharipov', name:'马沙里波夫', nameEn:'Jaloliddin Masharipov', teamId:'uzbekistan', position:'MF', age:32, appearances:65, goals:14, marketValue:'300万欧', marketValueEur:3, club:'Al Nassr', photoUrl:_, abilities:{speed:7,shooting:7,passing:8,dribbling:8,defense:4,physical:5} },
  { id:'shukurov', name:'舒库罗夫', nameEn:'Otabek Shukurov', teamId:'uzbekistan', position:'MF', age:28, appearances:70, goals:10, marketValue:'500万欧', marketValueEur:5, club:'Fatih Karagümrük', photoUrl:_, abilities:{speed:6,shooting:6,passing:8,dribbling:6,defense:7,physical:7} },
  // Colombia
  { id:'l-diaz', name:'路易斯·迪亚斯', nameEn:'Luis Díaz', teamId:'colombia', position:'FW', age:29, appearances:55, goals:15, marketValue:'7500万欧', marketValueEur:75, club:'Liverpool', photoUrl:_, abilities:{speed:9,shooting:8,passing:7,dribbling:9,defense:5,physical:6} },
  { id:'james', name:'哈梅斯·罗德里格斯', nameEn:'James Rodríguez', teamId:'colombia', position:'MF', age:34, appearances:105, goals:30, marketValue:'600万欧', marketValueEur:6, club:'São Paulo', photoUrl:_, abilities:{speed:5,shooting:8,passing:9,dribbling:7,defense:4,physical:5} },
  { id:'duran', name:'杜兰', nameEn:'Jhon Durán', teamId:'colombia', position:'FW', age:22, appearances:15, goals:3, marketValue:'4500万欧', marketValueEur:45, club:'Aston Villa', photoUrl:_, abilities:{speed:8,shooting:8,passing:5,dribbling:7,defense:2,physical:8} },
  // DR Congo
  { id:'mbemba', name:'姆本巴', nameEn:'Chancel Mbemba', teamId:'dr-congo', position:'DF', age:31, appearances:85, goals:6, marketValue:'1000万欧', marketValueEur:10, club:'Marseille', photoUrl:_, abilities:{speed:7,shooting:5,passing:6,dribbling:5,defense:8,physical:8} },
  { id:'wissa', name:'维萨', nameEn:'Yoane Wissa', teamId:'dr-congo', position:'FW', age:29, appearances:30, goals:10, marketValue:'2500万欧', marketValueEur:25, club:'Brentford', photoUrl:_, abilities:{speed:8,shooting:8,passing:6,dribbling:7,defense:3,physical:6} },
  { id:'diangana', name:'迪安加纳', nameEn:'Grady Diangana', teamId:'dr-congo', position:'FW', age:28, appearances:15, goals:3, marketValue:'1500万欧', marketValueEur:15, club:'West Brom', photoUrl:_, abilities:{speed:8,shooting:7,passing:7,dribbling:8,defense:3,physical:5} },

  // ═══ GROUP L ═══
  // England
  { id:'bellingham', name:'贝林厄姆', nameEn:'Jude Bellingham', teamId:'england', position:'MF', age:22, appearances:42, goals:8, marketValue:'1.8亿欧', marketValueEur:180, club:'Real Madrid', photoUrl:'https://cdn.sofifa.net/players/252/371/25_120.png', abilities:{speed:8,shooting:8,passing:8,dribbling:8,defense:8,physical:8} },
  { id:'kane', name:'凯恩', nameEn:'Harry Kane', teamId:'england', position:'FW', age:32, appearances:105, goals:72, marketValue:'1亿欧', marketValueEur:100, club:'Bayern Munich', photoUrl:'https://cdn.sofifa.net/players/202/126/25_120.png', abilities:{speed:5,shooting:10,passing:8,dribbling:6,defense:4,physical:7} },
  { id:'saka', name:'萨卡', nameEn:'Bukayo Saka', teamId:'england', position:'FW', age:24, appearances:45, goals:14, marketValue:'1.5亿欧', marketValueEur:150, club:'Arsenal', photoUrl:'https://cdn.sofifa.net/players/246/281/25_120.png', abilities:{speed:9,shooting:8,passing:8,dribbling:8,defense:5,physical:6} },
  // Ghana
  { id:'kudus', name:'库杜斯', nameEn:'Mohammed Kudus', teamId:'ghana', position:'MF', age:25, appearances:40, goals:10, marketValue:'5000万欧', marketValueEur:50, club:'West Ham', photoUrl:_, abilities:{speed:8,shooting:8,passing:7,dribbling:9,defense:5,physical:7} },
  { id:'partey', name:'托马斯·帕尔特伊', nameEn:'Thomas Partey', teamId:'ghana', position:'MF', age:33, appearances:55, goals:14, marketValue:'1500万欧', marketValueEur:15, club:'Arsenal', photoUrl:_, abilities:{speed:6,shooting:7,passing:7,dribbling:6,defense:8,physical:8} },
  { id:'inaki', name:'伊尼亚基·威廉姆斯', nameEn:'Iñaki Williams', teamId:'ghana', position:'FW', age:32, appearances:20, goals:3, marketValue:'2500万欧', marketValueEur:25, club:'Athletic Club', photoUrl:_, abilities:{speed:10,shooting:7,passing:6,dribbling:8,defense:4,physical:8} },
  // Panama
  { id:'murillo', name:'穆里略', nameEn:'Michael Murillo', teamId:'panama', position:'DF', age:30, appearances:85, goals:10, marketValue:'400万欧', marketValueEur:4, club:'Marseille', photoUrl:_, abilities:{speed:8,shooting:5,passing:6,dribbling:7,defense:7,physical:7} },
  { id:'godoy', name:'戈多伊', nameEn:'Aníbal Godoy', teamId:'panama', position:'MF', age:36, appearances:140, goals:8, marketValue:'200万欧', marketValueEur:2, club:'Nashville SC', photoUrl:_, abilities:{speed:5,shooting:5,passing:7,dribbling:5,defense:7,physical:7} },
  { id:'ismael-diaz', name:'伊斯梅尔·迪亚斯', nameEn:'Ismael Díaz', teamId:'panama', position:'FW', age:29, appearances:40, goals:12, marketValue:'300万欧', marketValueEur:3, club:'Universidad Católica', photoUrl:_, abilities:{speed:8,shooting:7,passing:6,dribbling:7,defense:3,physical:6} },
  // Croatia
  { id:'modric', name:'莫德里奇', nameEn:'Luka Modrić', teamId:'croatia', position:'MF', age:40, appearances:185, goals:27, marketValue:'800万欧', marketValueEur:8, club:'Real Madrid', photoUrl:'https://cdn.sofifa.net/players/177/003/25_120.png', abilities:{speed:4,shooting:7,passing:10,dribbling:8,defense:6,physical:5} },
  { id:'gvardiol', name:'格瓦迪奥尔', nameEn:'Joško Gvardiol', teamId:'croatia', position:'DF', age:24, appearances:35, goals:4, marketValue:'8000万欧', marketValueEur:80, club:'Manchester City', photoUrl:_, abilities:{speed:7,shooting:5,passing:7,dribbling:6,defense:9,physical:8} },
  { id:'kovacic', name:'科瓦契奇', nameEn:'Mateo Kovačić', teamId:'croatia', position:'MF', age:32, appearances:110, goals:10, marketValue:'2500万欧', marketValueEur:25, club:'Manchester City', photoUrl:_, abilities:{speed:7,shooting:6,passing:8,dribbling:9,defense:6,physical:6} },
];

// ── Index (43 existing IDs kept for back-compat) ──
export function getPlayer(id: string): Player | undefined {
  return topPlayers.find(p => p.id === id);
}
export function getPlayersByTeam(teamId: string): Player[] {
  return topPlayers.filter(p => p.teamId === teamId);
}
export function getAllPlayers(): Player[] { return topPlayers; }

const _searchCache = new Map<string, Player[]>();
export function searchPlayers(query: string): Player[] {
  const q = query.toLowerCase();
  if (_searchCache.has(q)) return _searchCache.get(q)!;
  const results = topPlayers.filter(p =>
    p.name.includes(query) || p.nameEn.toLowerCase().includes(q)
  ).slice(0, 5);
  _searchCache.set(q, results);
  return results;
}

// ── Radar data ──
export function getPlayerRadarData(player: Player) {
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
