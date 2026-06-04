// 2026 FIFA World Cup - 48 Teams (from lngqt.com correct data)
// Tournament: June 12 – July 20, 2026

export interface Team {
  id: string; name: string; nameEn: string; flag: string; group: string;
  fifaRank: number; elo: number; coach: string; keyPlayers: string[];
  recentForm: ('W'|'D'|'L')[]; recentResults: string[];
  worldCupApps: number; bestResult: string; groupStageOdds: number; winOdds: number;
}

export interface GroupInfo {
  name: string;
  teams: string[];
}

export const groups: GroupInfo[] = [
  { name: 'A', teams: ['mexico', 'south-africa', 'south-korea', 'czech'] },
  { name: 'B', teams: ['canada', 'bosnia', 'qatar', 'switzerland'] },
  { name: 'C', teams: ['usa', 'paraguay', 'australia', 'turkey'] },
  { name: 'D', teams: ['brazil', 'morocco', 'haiti', 'scotland'] },
  { name: 'E', teams: ['germany', 'curacao', 'ivory-coast', 'ecuador'] },
  { name: 'F', teams: ['netherlands', 'japan', 'sweden', 'tunisia'] },
  { name: 'G', teams: ['spain', 'cape-verde', 'saudi-arabia', 'uruguay'] },
  { name: 'H', teams: ['belgium', 'egypt', 'iran', 'new-zealand'] },
  { name: 'I', teams: ['france', 'senegal', 'iraq', 'norway'] },
  { name: 'J', teams: ['argentina', 'algeria', 'austria', 'jordan'] },
  { name: 'K', teams: ['portugal', 'dr-congo', 'uzbekistan', 'colombia'] },
  { name: 'L', teams: ['england', 'croatia', 'ghana', 'panama'] },
];

export const teams: Team[] = [
  // === GROUP A ===
  { id:'mexico', name:'墨西哥', nameEn:'Mexico', flag:'🇲🇽', group:'A', fifaRank:14, elo:1860, coach:'Javier Aguirre', keyPlayers:['Santiago Giménez','Edson Álvarez','Hirving Lozano'], recentForm:['W','W','W','D','L'], recentResults:['2-0 vs Honduras','3-1 vs El Salvador','1-0 vs Costa Rica','1-1 vs USA','0-2 vs Argentina'], worldCupApps:18, bestResult:'八强 (1970, 1986)', groupStageOdds:1.40, winOdds:67 },
  { id:'south-africa', name:'南非', nameEn:'South Africa', flag:'🇿🇦', group:'A', fifaRank:58, elo:1590, coach:'Hugo Broos', keyPlayers:['Percy Tau','Lyle Foster','Themba Zwane'], recentForm:['W','D','L','W','L'], recentResults:['2-0 vs Morocco','1-1 vs Ghana','0-1 vs Senegal','3-1 vs Zimbabwe','1-2 vs Nigeria'], worldCupApps:4, bestResult:'小组赛', groupStageOdds:4.50, winOdds:751 },
  { id:'south-korea', name:'韩国', nameEn:'South Korea', flag:'🇰🇷', group:'A', fifaRank:22, elo:1820, coach:'Hong Myung-bo', keyPlayers:['Son Heung-min','Kim Min-jae','Lee Kang-in'], recentForm:['W','D','W','W','L'], recentResults:['2-0 vs China','1-1 vs Australia','3-1 vs Thailand','2-0 vs Singapore','0-1 vs Japan'], worldCupApps:12, bestResult:'第四名 (2002)', groupStageOdds:1.80, winOdds:201 },
  { id:'czech', name:'捷克', nameEn:'Czech Republic', flag:'🇨🇿', group:'A', fifaRank:35, elo:1745, coach:'Ivan Hašek', keyPlayers:['Patrik Schick','Tomáš Souček','Adam Hložek'], recentForm:['W','L','W','D','W'], recentResults:['2-1 vs Norway','0-2 vs Spain','3-0 vs Moldova','1-1 vs Poland','2-0 vs Faroe Islands'], worldCupApps:9, bestResult:'亚军 (1934, 1962)', groupStageOdds:2.50, winOdds:151 },

  // === GROUP B ===
  { id:'canada', name:'加拿大', nameEn:'Canada', flag:'🇨🇦', group:'B', fifaRank:31, elo:1780, coach:'Jesse Marsch', keyPlayers:['Alphonso Davies','Jonathan David','Stephen Eustáquio'], recentForm:['W','D','W','L','W'], recentResults:['2-0 vs Guatemala','1-1 vs Costa Rica','3-1 vs Jamaica','0-2 vs USA','2-1 vs Honduras'], worldCupApps:3, bestResult:'小组赛', groupStageOdds:2.10, winOdds:101 },
  { id:'bosnia', name:'波黑', nameEn:'Bosnia & Herz.', flag:'🇧🇦', group:'B', fifaRank:62, elo:1585, coach:'Sergej Barbarez', keyPlayers:['Edin Džeko','Rade Krunić','Miralem Pjanić'], recentForm:['L','W','D','L','W'], recentResults:['1-2 vs Portugal','2-0 vs Luxembourg','1-1 vs Slovakia','0-3 vs Iceland','2-1 vs Liechtenstein'], worldCupApps:2, bestResult:'小组赛', groupStageOdds:5.00, winOdds:751 },
  { id:'qatar', name:'卡塔尔', nameEn:'Qatar', flag:'🇶🇦', group:'B', fifaRank:44, elo:1650, coach:'Tintín Márquez', keyPlayers:['Akram Afif','Almoez Ali','Hassan Al-Haydos'], recentForm:['L','W','L','D','W'], recentResults:['1-2 vs Iran','3-0 vs Kuwait','0-1 vs Uzbekistan','2-2 vs UAE','2-0 vs India'], worldCupApps:2, bestResult:'小组赛 (2022)', groupStageOdds:6.00, winOdds:1001 },
  { id:'switzerland', name:'瑞士', nameEn:'Switzerland', flag:'🇨🇭', group:'B', fifaRank:15, elo:1855, coach:'Murat Yakin', keyPlayers:['Granit Xhaka','Manuel Akanji','Xherdan Shaqiri'], recentForm:['W','D','W','W','L'], recentResults:['2-0 vs Bulgaria','1-1 vs Israel','3-1 vs Belarus','2-1 vs Andorra','0-2 vs Portugal'], worldCupApps:13, bestResult:'八强 (1934-1954)', groupStageOdds:1.30, winOdds:67 },

  // === GROUP C ===
  { id:'usa', name:'美国', nameEn:'USA', flag:'🇺🇸', group:'C', fifaRank:11, elo:1880, coach:'Mauricio Pochettino', keyPlayers:['Christian Pulisic','Giovanni Reyna','Folarin Balogun'], recentForm:['W','W','L','W','W'], recentResults:['3-0 vs Trinidad','2-0 vs Canada','0-1 vs Colombia','4-1 vs Grenada','2-0 vs Panama'], worldCupApps:12, bestResult:'季军 (1930)', groupStageOdds:1.25, winOdds:26 },
  { id:'paraguay', name:'巴拉圭', nameEn:'Paraguay', flag:'🇵🇾', group:'C', fifaRank:48, elo:1645, coach:'Daniel Garnero', keyPlayers:['Miguel Almirón','Julio Enciso','Gustavo Gómez'], recentForm:['L','W','D','W','L'], recentResults:['0-1 vs Argentina','2-0 vs Bolivia','1-1 vs Chile','2-1 vs Peru','0-3 vs Brazil'], worldCupApps:9, bestResult:'八强 (2010)', groupStageOdds:6.00, winOdds:501 },
  { id:'australia', name:'澳大利亚', nameEn:'Australia', flag:'🇦🇺', group:'C', fifaRank:23, elo:1790, coach:'Graham Arnold', keyPlayers:['Mathew Ryan','Harry Souttar','Riley McGree'], recentForm:['W','L','W','D','W'], recentResults:['2-0 vs UAE','1-3 vs Japan','3-0 vs Palestine','1-1 vs South Korea','2-1 vs Bahrain'], worldCupApps:7, bestResult:'16强 (2006, 2022)', groupStageOdds:2.50, winOdds:251 },
  { id:'turkey', name:'土耳其', nameEn:'Turkey', flag:'🇹🇷', group:'C', fifaRank:37, elo:1720, coach:'Vincenzo Montella', keyPlayers:['Hakan Çalhanoğlu','Arda Güler','Cenk Tosun'], recentForm:['W','W','L','W','D'], recentResults:['3-0 vs Latvia','2-1 vs Croatia','0-1 vs Portugal','4-0 vs Armenia','2-2 vs Wales'], worldCupApps:3, bestResult:'季军 (2002)', groupStageOdds:2.50, winOdds:126 },

  // === GROUP D ===
  { id:'brazil', name:'巴西', nameEn:'Brazil', flag:'🇧🇷', group:'D', fifaRank:3, elo:2080, coach:'Dorival Júnior', keyPlayers:['Vinícius Júnior','Rodrygo','Alisson Becker'], recentForm:['W','W','W','D','W'], recentResults:['4-0 vs Peru','2-1 vs Colombia','3-0 vs Bolivia','1-1 vs Uruguay','5-1 vs Ecuador'], worldCupApps:23, bestResult:'冠军 (1958-2002共5次)', groupStageOdds:1.04, winOdds:5.5 },
  { id:'morocco', name:'摩洛哥', nameEn:'Morocco', flag:'🇲🇦', group:'D', fifaRank:13, elo:1870, coach:'Walid Regragui', keyPlayers:['Achraf Hakimi','Brahim Díaz','Youssef En-Nesyri'], recentForm:['W','W','W','L','W'], recentResults:['2-0 vs Algeria','3-1 vs Zambia','1-0 vs Egypt','0-2 vs Spain','2-1 vs Ivory Coast'], worldCupApps:7, bestResult:'第四名 (2022)', groupStageOdds:1.50, winOdds:51 },
  { id:'haiti', name:'海地', nameEn:'Haiti', flag:'🇭🇹', group:'D', fifaRank:86, elo:1490, coach:'Sébastien Migné', keyPlayers:['Frantzdy Pierrot','Duckens Nazon','Carlens Arcus'], recentForm:['L','W','L','L','D'], recentResults:['0-2 vs Canada','2-1 vs Cuba','0-3 vs Costa Rica','1-2 vs Suriname','1-1 vs Grenada'], worldCupApps:2, bestResult:'小组赛 (1974)', groupStageOdds:12.00, winOdds:2001 },
  { id:'scotland', name:'苏格兰', nameEn:'Scotland', flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', group:'D', fifaRank:30, elo:1755, coach:'Steve Clarke', keyPlayers:['Andrew Robertson','Scott McTominay','Billy Gilmour'], recentForm:['W','W','L','D','W'], recentResults:['2-0 vs Norway','3-0 vs Cyprus','1-2 vs Spain','1-1 vs Georgia','2-0 vs Ireland'], worldCupApps:9, bestResult:'小组赛', groupStageOdds:3.50, winOdds:251 },

  // === GROUP E ===
  { id:'germany', name:'德国', nameEn:'Germany', flag:'🇩🇪', group:'E', fifaRank:8, elo:1950, coach:'Julian Nagelsmann', keyPlayers:['Jamal Musiala','Florian Wirtz','Kai Havertz'], recentForm:['W','W','W','W','L'], recentResults:['3-1 vs Netherlands','2-0 vs France','4-0 vs Hungary','2-1 vs Bosnia','0-2 vs Spain'], worldCupApps:21, bestResult:'冠军 (1954-2014共4次)', groupStageOdds:1.04, winOdds:9 },
  { id:'curacao', name:'库拉索', nameEn:'Curaçao', flag:'🇨🇼', group:'E', fifaRank:90, elo:1470, coach:'Dick Advocaat', keyPlayers:['Leandro Bacuna','Juninho Bacuna','Rangelo Janga'], recentForm:['L','L','W','D','L'], recentResults:['0-3 vs Mexico','1-2 vs Panama','2-0 vs Barbados','1-1 vs Guatemala','0-2 vs Costa Rica'], worldCupApps:1, bestResult:'小组赛', groupStageOdds:15.00, winOdds:2501 },
  { id:'ivory-coast', name:'科特迪瓦', nameEn:'Ivory Coast', flag:'🇨🇮', group:'E', fifaRank:38, elo:1720, coach:'Emerse Faé', keyPlayers:['Sébastien Haller','Franck Kessié','Simon Adingra'], recentForm:['W','W','L','W','D'], recentResults:['2-1 vs Nigeria','3-0 vs Gambia','0-1 vs Morocco','2-0 vs DR Congo','1-1 vs Mali'], worldCupApps:4, bestResult:'小组赛', groupStageOdds:2.75, winOdds:201 },
  { id:'ecuador', name:'厄瓜多尔', nameEn:'Ecuador', flag:'🇪🇨', group:'E', fifaRank:32, elo:1750, coach:'Félix Sánchez', keyPlayers:['Moisés Caicedo','Piero Hincapié','Enner Valencia'], recentForm:['W','D','W','L','W'], recentResults:['2-1 vs Chile','1-1 vs Colombia','3-0 vs Bolivia','0-2 vs Brazil','2-0 vs Peru'], worldCupApps:5, bestResult:'16强 (2006)', groupStageOdds:2.00, winOdds:151 },

  // === GROUP F ===
  { id:'netherlands', name:'荷兰', nameEn:'Netherlands', flag:'🇳🇱', group:'F', fifaRank:7, elo:1965, coach:'Ronald Koeman', keyPlayers:['Virgil van Dijk','Cody Gakpo','Frenkie de Jong'], recentForm:['W','W','L','W','W'], recentResults:['4-0 vs Gibraltar','3-1 vs Ireland','1-2 vs France','2-0 vs Greece','6-0 vs Gibraltar'], worldCupApps:12, bestResult:'亚军 (1974,1978,2010)', groupStageOdds:1.08, winOdds:13 },
  { id:'japan', name:'日本', nameEn:'Japan', flag:'🇯🇵', group:'F', fifaRank:17, elo:1845, coach:'Hajime Moriyasu', keyPlayers:['Kaoru Mitoma','Takefusa Kubo','Wataru Endo'], recentForm:['W','W','W','W','D'], recentResults:['3-0 vs North Korea','5-0 vs Myanmar','2-0 vs Syria','4-1 vs Indonesia','1-1 vs Australia'], worldCupApps:8, bestResult:'16强 (4次)', groupStageOdds:1.50, winOdds:101 },
  { id:'sweden', name:'瑞典', nameEn:'Sweden', flag:'🇸🇪', group:'F', fifaRank:25, elo:1790, coach:'Jon Dahl Tomasson', keyPlayers:['Alexander Isak','Dejan Kulusevski','Victor Lindelöf'], recentForm:['W','W','L','W','D'], recentResults:['2-0 vs Azerbaijan','3-1 vs Estonia','0-2 vs Belgium','2-0 vs Moldova','1-1 vs Austria'], worldCupApps:13, bestResult:'亚军 (1958)', groupStageOdds:1.80, winOdds:101 },
  { id:'tunisia', name:'突尼斯', nameEn:'Tunisia', flag:'🇹🇳', group:'F', fifaRank:29, elo:1765, coach:'Jalel Kadri', keyPlayers:['Ellyes Skhiri','Hannibal Mejbri','Youssef Msakni'], recentForm:['W','L','W','D','L'], recentResults:['2-0 vs Malawi','0-2 vs Senegal','1-0 vs Chad','1-1 vs Mali','0-1 vs Cameroon'], worldCupApps:7, bestResult:'小组赛', groupStageOdds:4.50, winOdds:501 },

  // === GROUP G ===
  { id:'spain', name:'西班牙', nameEn:'Spain', flag:'🇪🇸', group:'G', fifaRank:5, elo:2020, coach:'Luis de la Fuente', keyPlayers:['Lamine Yamal','Pedri','Rodri'], recentForm:['W','W','W','W','W'], recentResults:['2-0 vs Germany','3-0 vs Georgia','4-1 vs Cyprus','2-0 vs Scotland','5-0 vs Andorra'], worldCupApps:17, bestResult:'冠军 (2010)', groupStageOdds:1.04, winOdds:8.5 },
  { id:'cape-verde', name:'佛得角', nameEn:'Cape Verde', flag:'🇨🇻', group:'G', fifaRank:64, elo:1560, coach:'Bubista', keyPlayers:['Ryan Mendes','Jovane Cabral','Garry Rodrigues'], recentForm:['L','W','D','L','W'], recentResults:['0-2 vs Nigeria','2-1 vs Guinea','1-1 vs Angola','0-1 vs Egypt','2-0 vs Eswatini'], worldCupApps:1, bestResult:'小组赛', groupStageOdds:10.00, winOdds:2001 },
  { id:'saudi-arabia', name:'沙特', nameEn:'Saudi Arabia', flag:'🇸🇦', group:'G', fifaRank:53, elo:1630, coach:'Roberto Mancini', keyPlayers:['Salem Al-Dawsari','Firas Al-Buraikan','Saud Abdulhamid'], recentForm:['W','L','W','D','L'], recentResults:['2-1 vs Qatar','0-3 vs Japan','3-0 vs Yemen','1-1 vs Oman','1-2 vs South Korea'], worldCupApps:7, bestResult:'16强 (1994)', groupStageOdds:5.50, winOdds:751 },
  { id:'uruguay', name:'乌拉圭', nameEn:'Uruguay', flag:'🇺🇾', group:'G', fifaRank:12, elo:1890, coach:'Marcelo Bielsa', keyPlayers:['Federico Valverde','Darwin Núñez','Ronald Araújo'], recentForm:['W','W','D','W','L'], recentResults:['2-0 vs Brazil','3-1 vs Bolivia','1-1 vs Colombia','2-0 vs Ecuador','0-1 vs Argentina'], worldCupApps:15, bestResult:'冠军 (1930, 1950)', groupStageOdds:1.20, winOdds:21 },

  // === GROUP H ===
  { id:'belgium', name:'比利时', nameEn:'Belgium', flag:'🇧🇪', group:'H', fifaRank:3, elo:1990, coach:'Domenico Tedesco', keyPlayers:['Kevin De Bruyne','Romelu Lukaku','Jérémy Doku'], recentForm:['W','W','W','D','W'], recentResults:['3-0 vs Austria','2-1 vs Italy','4-0 vs San Marino','1-1 vs Netherlands','2-0 vs Sweden'], worldCupApps:15, bestResult:'季军 (2018)', groupStageOdds:1.04, winOdds:11 },
  { id:'egypt', name:'埃及', nameEn:'Egypt', flag:'🇪🇬', group:'H', fifaRank:33, elo:1740, coach:'Hossam Hassan', keyPlayers:['Mohamed Salah','Omar Marmoush','Trézéguet'], recentForm:['W','D','W','L','W'], recentResults:['2-1 vs Burkina Faso','1-1 vs Ghana','3-0 vs Djibouti','0-1 vs Morocco','2-0 vs Ethiopia'], worldCupApps:4, bestResult:'小组赛', groupStageOdds:3.00, winOdds:251 },
  { id:'iran', name:'伊朗', nameEn:'Iran', flag:'🇮🇷', group:'H', fifaRank:20, elo:1810, coach:'Amir Ghalenoei', keyPlayers:['Mehdi Taremi','Sardar Azmoun','Alireza Jahanbakhsh'], recentForm:['W','W','W','L','W'], recentResults:['3-0 vs UAE','2-1 vs Qatar','4-0 vs Hong Kong','0-1 vs Japan','2-0 vs Uzbekistan'], worldCupApps:7, bestResult:'小组赛', groupStageOdds:3.00, winOdds:401 },
  { id:'new-zealand', name:'新西兰', nameEn:'New Zealand', flag:'🇳🇿', group:'H', fifaRank:92, elo:1480, coach:'Darren Bazeley', keyPlayers:['Chris Wood','Sarpreet Singh','Liberato Cacace'], recentForm:['W','W','L','D','W'], recentResults:['2-0 vs Solomon Is.','3-1 vs Fiji','0-3 vs Australia','1-1 vs Tahiti','2-1 vs PNG'], worldCupApps:3, bestResult:'小组赛', groupStageOdds:10.00, winOdds:2001 },

  // === GROUP I ===
  { id:'france', name:'法国', nameEn:'France', flag:'🇫🇷', group:'I', fifaRank:2, elo:2105, coach:'Didier Deschamps', keyPlayers:['Kylian Mbappé','Antoine Griezmann','Aurélien Tchouaméni'], recentForm:['W','W','W','D','W'], recentResults:['3-0 vs Netherlands','2-0 vs Ireland','4-1 vs Greece','1-1 vs Germany','2-0 vs Belgium'], worldCupApps:17, bestResult:'冠军 (1998, 2018)', groupStageOdds:1.03, winOdds:6.5 },
  { id:'senegal', name:'塞内加尔', nameEn:'Senegal', flag:'🇸🇳', group:'I', fifaRank:18, elo:1830, coach:'Pape Thiaw', keyPlayers:['Sadio Mané','Kalidou Koulibaly','Nicolas Jackson'], recentForm:['W','W','D','W','L'], recentResults:['2-0 vs Cameroon','3-1 vs Togo','1-1 vs Egypt','4-0 vs South Sudan','0-1 vs Morocco'], worldCupApps:4, bestResult:'八强 (2002)', groupStageOdds:2.20, winOdds:81 },
  { id:'iraq', name:'伊拉克', nameEn:'Iraq', flag:'🇮🇶', group:'I', fifaRank:55, elo:1610, coach:'Jesús Casas', keyPlayers:['Aymen Hussein','Ali Jasim','Zidane Iqbal'], recentForm:['W','W','L','W','D'], recentResults:['2-0 vs Vietnam','3-1 vs Philippines','0-2 vs Japan','2-0 vs Indonesia','1-1 vs Jordan'], worldCupApps:2, bestResult:'小组赛 (1986)', groupStageOdds:7.00, winOdds:1501 },
  { id:'norway', name:'挪威', nameEn:'Norway', flag:'🇳🇴', group:'I', fifaRank:42, elo:1700, coach:'Ståle Solbakken', keyPlayers:['Erling Haaland','Martin Ødegaard','Alexander Sørloth'], recentForm:['W','L','W','W','D'], recentResults:['2-1 vs Czech Rep.','0-3 vs Spain','3-0 vs Cyprus','2-0 vs Georgia','1-1 vs Scotland'], worldCupApps:4, bestResult:'16强 (1998)', groupStageOdds:3.00, winOdds:101 },

  // === GROUP J ===
  { id:'argentina', name:'阿根廷', nameEn:'Argentina', flag:'🇦🇷', group:'J', fifaRank:1, elo:2135, coach:'Lionel Scaloni', keyPlayers:['Lionel Messi','Julián Álvarez','Enzo Fernández'], recentForm:['W','W','W','W','W'], recentResults:['2-0 vs Brazil','3-0 vs Bolivia','1-0 vs Paraguay','4-1 vs Chile','2-0 vs Peru'], worldCupApps:19, bestResult:'冠军 (1978,1986,2022)', groupStageOdds:1.04, winOdds:8 },
  { id:'algeria', name:'阿尔及利亚', nameEn:'Algeria', flag:'🇩🇿', group:'J', fifaRank:40, elo:1705, coach:'Vladimir Petković', keyPlayers:['Riyad Mahrez','Ismaël Bennacer','Amine Gouiri'], recentForm:['W','L','W','D','L'], recentResults:['2-0 vs Uganda','1-2 vs Morocco','3-1 vs Niger','1-1 vs Tanzania','0-1 vs Tunisia'], worldCupApps:5, bestResult:'16强 (2014)', groupStageOdds:4.00, winOdds:351 },
  { id:'austria', name:'奥地利', nameEn:'Austria', flag:'🇦🇹', group:'J', fifaRank:24, elo:1800, coach:'Ralf Rangnick', keyPlayers:['David Alaba','Marcel Sabitzer','Christoph Baumgartner'], recentForm:['W','W','W','W','D'], recentResults:['2-0 vs Germany','3-1 vs Sweden','2-0 vs Estonia','4-1 vs Azerbaijan','1-1 vs Belgium'], worldCupApps:8, bestResult:'季军 (1954)', groupStageOdds:1.50, winOdds:67 },
  { id:'jordan', name:'约旦', nameEn:'Jordan', flag:'🇯🇴', group:'J', fifaRank:68, elo:1545, coach:'Hussein Ammouta', keyPlayers:['Musa Al-Taamari','Yazan Al-Naimat','Ali Olwan'], recentForm:['W','L','W','D','L'], recentResults:['2-0 vs Kuwait','1-3 vs South Korea','3-1 vs Oman','1-1 vs Tajikistan','0-2 vs Iraq'], worldCupApps:1, bestResult:'小组赛', groupStageOdds:10.00, winOdds:2001 },

  // === GROUP K ===
  { id:'portugal', name:'葡萄牙', nameEn:'Portugal', flag:'🇵🇹', group:'K', fifaRank:6, elo:1985, coach:'Roberto Martínez', keyPlayers:['Cristiano Ronaldo','Bruno Fernandes','Rúben Dias'], recentForm:['W','W','D','W','W'], recentResults:['3-0 vs Finland','2-1 vs Iceland','1-1 vs Croatia','4-0 vs Liechtenstein','2-0 vs Slovakia'], worldCupApps:9, bestResult:'季军 (1966)', groupStageOdds:1.08, winOdds:13 },
  { id:'dr-congo', name:'民主刚果', nameEn:'DR Congo', flag:'🇨🇩', group:'K', fifaRank:61, elo:1575, coach:'Sébastien Desabre', keyPlayers:['Chancel Mbemba','Yoane Wissa','Grady Diangana'], recentForm:['L','W','L','W','D'], recentResults:['1-2 vs Mali','2-0 vs Togo','0-2 vs Morocco','3-1 vs Sudan','1-1 vs Angola'], worldCupApps:2, bestResult:'小组赛 (1974)', groupStageOdds:7.00, winOdds:1001 },
  { id:'uzbekistan', name:'乌兹别克斯坦', nameEn:'Uzbekistan', flag:'🇺🇿', group:'K', fifaRank:56, elo:1605, coach:'Srečko Katanec', keyPlayers:['Eldor Shomurodov','Jaloliddin Masharipov','Otabek Shukurov'], recentForm:['W','L','W','D','L'], recentResults:['2-1 vs Iran','0-2 vs Japan','3-0 vs Turkmenistan','1-1 vs Qatar','1-2 vs South Korea'], worldCupApps:1, bestResult:'小组赛', groupStageOdds:5.50, winOdds:1001 },
  { id:'colombia', name:'哥伦比亚', nameEn:'Colombia', flag:'🇨🇴', group:'K', fifaRank:16, elo:1850, coach:'Néstor Lorenzo', keyPlayers:['Luis Díaz','James Rodríguez','Jhon Durán'], recentForm:['W','W','D','W','W'], recentResults:['2-1 vs Brazil','3-0 vs Bolivia','1-1 vs Uruguay','2-0 vs Paraguay','1-0 vs Venezuela'], worldCupApps:7, bestResult:'八强 (2014)', groupStageOdds:1.25, winOdds:26 },

  // === GROUP L ===
  { id:'england', name:'英格兰', nameEn:'England', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', group:'L', fifaRank:4, elo:2050, coach:'Thomas Tuchel', keyPlayers:['Jude Bellingham','Harry Kane','Bukayo Saka'], recentForm:['W','W','W','W','D'], recentResults:['3-1 vs Italy','2-0 vs Ukraine','4-0 vs Malta','2-1 vs North Macedonia','1-1 vs Germany'], worldCupApps:17, bestResult:'冠军 (1966)', groupStageOdds:1.04, winOdds:7 },
  { id:'croatia', name:'克罗地亚', nameEn:'Croatia', flag:'🇭🇷', group:'L', fifaRank:10, elo:1920, coach:'Zlatko Dalić', keyPlayers:['Luka Modrić','Joško Gvardiol','Mateo Kovačić'], recentForm:['W','D','W','W','L'], recentResults:['2-0 vs Latvia','1-1 vs Wales','3-0 vs Armenia','2-1 vs Turkey','0-2 vs Spain'], worldCupApps:7, bestResult:'亚军 (2018)', groupStageOdds:1.30, winOdds:34 },
  { id:'ghana', name:'加纳', nameEn:'Ghana', flag:'🇬🇭', group:'L', fifaRank:60, elo:1605, coach:'Otto Addo', keyPlayers:['Mohammed Kudus','Thomas Partey','Iñaki Williams'], recentForm:['L','W','L','D','W'], recentResults:['0-2 vs Nigeria','2-1 vs CAR','1-3 vs Morocco','1-1 vs Angola','2-0 vs Madagascar'], worldCupApps:5, bestResult:'八强 (2010)', groupStageOdds:5.50, winOdds:501 },
  { id:'panama', name:'巴拿马', nameEn:'Panama', flag:'🇵🇦', group:'L', fifaRank:45, elo:1600, coach:'Thomas Christiansen', keyPlayers:['Michael Murillo','Aníbal Godoy','Ismael Díaz'], recentForm:['L','W','L','L','W'], recentResults:['1-2 vs Costa Rica','3-0 vs Cuba','0-2 vs USA','1-3 vs Mexico','2-0 vs Belize'], worldCupApps:2, bestResult:'小组赛 (2018)', groupStageOdds:8.00, winOdds:1501 },
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
