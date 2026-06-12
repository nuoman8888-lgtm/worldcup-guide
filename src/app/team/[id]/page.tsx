import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTeam, getTeamsByGroup, teams } from '@/data/teams';
import { getMatchesByTeam } from '@/data/matches';
import { getChampionshipProbabilities } from '@/data/standings';
import { predictMatch } from '@/lib/ai';
import { getChampionOdds } from '@/data/odds';
import { searchPlayers } from '@/data/players';
import RadarChart from '@/components/RadarChart';
import TeamStories from '@/components/TeamStories';
import PageTracker from '@/components/PageTracker';
import storiesData from '@/data/team-stories.json';
import type { Team } from '@/data/teams';

// ── Flag-based hero colors for popular teams ──
const teamHeroColors: Record<string, string> = {
  brazil: 'from-yellow-400 via-yellow-500 to-green-600',
  argentina: 'from-sky-400 via-sky-300 to-blue-400',
  germany: 'from-gray-900 via-red-600 to-yellow-500',
  france: 'from-blue-800 via-blue-700 to-red-600',
  england: 'from-navy to-red-600',
  spain: 'from-red-700 via-red-600 to-yellow-500',
  portugal: 'from-red-700 via-red-600 to-green-700',
  netherlands: 'from-orange-500 to-orange-600',
  japan: 'from-blue-900 to-blue-800',
  'south-korea': 'from-red-600 to-blue-700',
  italy: 'from-blue-800 to-blue-700',
  uruguay: 'from-sky-600 to-sky-700',
  croatia: 'from-red-700 to-red-600',
  belgium: 'from-red-700 via-red-600 to-yellow-500',
  mexico: 'from-green-700 via-white to-red-600',
  usa: 'from-blue-800 via-blue-700 to-red-600',
  senegal: 'from-green-700 via-yellow-400 to-red-600',
  morocco: 'from-red-700 to-red-600',
  colombia: 'from-yellow-500 via-blue-700 to-red-600',
};

function getHeroColor(teamId: string): string {
  return teamHeroColors[teamId] || 'from-navy to-navy-600';
}

function isLightColor(teamId: string): boolean {
  return teamId === 'argentina' || teamId === 'mexico';
}

// ── Radar data from team stats ──
function computeRadarData(team: Team) {
  const maxApps = 23; // Brazil has 23
  const maxElo = 2135; // Argentina has ~2135
  const minRank = 1; // best FIFA rank

  // Form score from recent results
  const formScore = team.recentForm.reduce((s, f) => s + (f === 'W' ? 3 : f === 'D' ? 1 : 0), 0);
  const maxFormScore = 15; // 5 wins

  return [
    { label: '进攻', value: Math.round((team.elo / maxElo) * 8 + 1) },
    { label: '防守', value: Math.round((team.elo / maxElo) * 7 + 1.5) },
    { label: '中场', value: Math.round((team.elo / maxElo) * 7.5 + 1) },
    { label: '经验', value: Math.round((team.worldCupApps / maxApps) * 9 + 0.5) },
    { label: '状态', value: Math.round((formScore / maxFormScore) * 9 + 0.5) },
    { label: '排名', value: Math.max(1, Math.round(10 - (team.fifaRank / 92) * 9)) },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const team = getTeam(id);
  if (!team) return { title: '球队未找到' };
  return {
    title: `${team.flag} ${team.name} (${team.nameEn}) | 世界杯 2026 球队数据`,
    description: `${team.name} — FIFA排名第${team.fifaRank}，ELO ${team.elo}。${team.worldCupApps}次世界杯，历史最佳${team.bestResult}。小组${team.group}组，关键球员：${team.keyPlayers.slice(0, 3).join('、')}。`,
  };
}

export async function generateStaticParams() {
  return teams.map(t => ({ id: t.id }));
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = getTeam(id);
  if (!team) notFound();

  const groupTeams = getTeamsByGroup(team.group);
  const matches = getMatchesByTeam(team.id);
  const champProbs = getChampionshipProbabilities();
  const champRank = champProbs.findIndex(p => p.teamId === team.id) + 1;
  const champProb = champProbs.find(p => p.teamId === team.id)?.probability || 1;
  const allOdds = getChampionOdds();
  const teamOdds = allOdds.find(o => o.teamId === team.id);
  const topOdds = allOdds.slice(0, 10);

  // Group predictions
  const groupPredictions = groupTeams
    .filter(t => t.id !== team.id)
    .map(opp => {
      const isHome = team.id < opp.id;
      const pred = isHome ? predictMatch(team.id, opp.id) : predictMatch(opp.id, team.id);
      return { opponent: opp, prediction: pred, isHome };
    });

  const radarData = computeRadarData(team);
  const heroColor = getHeroColor(team.id);
  const lightText = isLightColor(team.id);

  return (
    <div className="min-h-screen">
      <PageTracker event="team_page_view" data={{ team: team.id }} />
      {/* ═══════ Hero — flag-based gradient ═══════ */}
      <section className={`bg-gradient-to-br ${heroColor} ${lightText ? 'text-gray-900' : 'text-white'}`}>
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center gap-5">
            <span className="text-6xl md:text-7xl drop-shadow-lg">{team.flag}</span>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  lightText ? 'bg-black/10' : 'bg-white/15 backdrop-blur'
                }`}>
                  {team.group}组
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  lightText ? 'bg-black/10' : 'bg-white/15 backdrop-blur'
                }`}>
                  FIFA #{team.fifaRank}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  lightText ? 'bg-black/10' : 'bg-white/15 backdrop-blur'
                }`}>
                  ELO {team.elo}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold">{team.name}</h1>
              <p className={`text-sm mt-1 ${lightText ? 'text-gray-700' : 'text-white/70'}`}>
                {team.nameEn} · {team.worldCupApps}次世界杯 · {team.bestResult}
              </p>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { label: '夺冠概率', value: `${champProb}%`, sub: `第${champRank}名` },
              { label: '冠军赔率', value: teamOdds?.odds['Bet365']?.toString() || '-', sub: 'Bet365' },
              { label: '小组出线', value: team.groupStageOdds.toString(), sub: '赔率' },
              { label: '主教练', value: team.coach.split(' ').pop() || team.coach, sub: team.coach },
            ].map(stat => (
              <div
                key={stat.label}
                className={`rounded-xl p-4 ${
                  lightText ? 'bg-black/5' : 'bg-white/10 backdrop-blur'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${lightText ? 'text-gray-600' : 'text-white/60'}`}>
                  {stat.label}
                </div>
                <div className="text-xl font-extrabold">{stat.value}</div>
                <div className={`text-xs mt-0.5 ${lightText ? 'text-gray-500' : 'text-white/40'}`}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Screen 2: Two-column layout ═══════ */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Radar + Recent Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-1">📊 球队能力</h3>
              <p className="text-xs text-gray-400 mb-4">基于 ELO · FIFA排名 · 近期战绩</p>
              <RadarChart data={radarData} size={220} />
              <div className="flex justify-center gap-4 mt-2 text-[11px] text-gray-500">
                {radarData.map(d => (
                  <span key={d.label}>{d.label} {d.value}</span>
                ))}
              </div>
            </div>

            {/* Team stories */}
            <TeamStories stories={(storiesData as Record<string, {title: string; content: string}[]>)[team.id] || []} />

            {/* Recent form */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3">📈 近期战绩</h3>
              <div className="flex items-center gap-1.5 mb-4">
                {team.recentForm.map((f, i) => (
                  <span
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      f === 'W' ? 'bg-qualify-light text-qualify' :
                      f === 'D' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'
                    }`}
                  >
                    {f}
                  </span>
                ))}
                <span className="text-xs text-gray-400 ml-2">
                  近5场 {team.recentForm.filter(f => f === 'W').length}胜
                </span>
              </div>
              <div className="space-y-1.5">
                {team.recentResults.map((r, i) => (
                  <div key={i} className="text-xs text-gray-600 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      team.recentForm[i] === 'W' ? 'bg-qualify' :
                      team.recentForm[i] === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {/* Championship probability */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3">🏆 夺冠概率对比</h3>
              <div className="space-y-1.5">
                {topOdds.slice(0, 5).map((item, idx) => {
                  const t = getTeam(item.teamId);
                  if (!t) return null;
                  const isCurrent = item.teamId === team.id;
                  const prob = Math.round((1 / item.odds['Bet365']) * 100);
                  const maxProb = Math.round((1 / topOdds[0].odds['Bet365']) * 100);
                  const barW = Math.max(3, (prob / maxProb) * 100);
                  return (
                    <div
                      key={item.teamId}
                      className={`flex items-center gap-2 text-xs rounded px-2 py-1.5 ${
                        isCurrent ? 'bg-gold-50 border border-gold' : ''
                      }`}
                    >
                      <span className="text-gray-400 w-4 tabular-nums">{idx + 1}</span>
                      <span className="text-base">{t.flag}</span>
                      <span className={`font-medium flex-1 truncate ${isCurrent ? 'text-gold-dark' : 'text-gray-700'}`}>
                        {t.name}
                      </span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${idx === 0 ? 'bg-gold' : isCurrent ? 'bg-navy' : 'bg-gray-300'}`} style={{ width: `${barW}%` }} />
                      </div>
                      <span className="font-semibold text-gray-500 w-10 text-right tabular-nums">{prob}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Schedule + Predictions */}
          <div className="space-y-6">
            {/* Group stage matches */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">📅 {team.group}组赛程</h2>
              {matches.length > 0 ? (
                <div className="space-y-2">
                  {matches.map(m => {
                    const h = getTeam(m.homeTeamId);
                    const a = getTeam(m.awayTeamId);
                    const isHome = m.homeTeamId === team.id;
                    const isFinished = m.status === 'finished';
                    const isLive = m.status === 'live';
                    return (
                      <Link
                        key={m.id}
                        href={`/match/${m.id}`}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-all group card-elevated ${
                          isFinished ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100 hover:border-navy-600'
                        }`}
                      >
                        <div className="text-center shrink-0 w-14">
                          <div className="text-xs text-gray-400 font-mono">{m.date.slice(5)}</div>
                          <div className="text-sm font-bold text-gray-900 font-mono">{m.time}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">
                          <span className="text-lg shrink-0">{h?.flag}</span>
                          <span className={`text-xs font-medium truncate ${isHome ? 'text-gold-dark font-bold' : 'text-gray-700'}`}>
                            {h?.name || 'TBD'}
                          </span>
                          {isFinished && m.homeScore !== undefined ? (
                            <span className="text-gray-900 font-bold text-xs shrink-0 tabular-nums">
                              {m.homeScore} - {m.awayScore}
                            </span>
                          ) : isLive ? (
                            <span className="text-red-600 font-bold text-xs shrink-0 animate-pulse tabular-nums">
                              {m.homeScore ?? 0} - {m.awayScore ?? 0}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-[10px] shrink-0">VS</span>
                          )}
                          <span className={`text-xs font-medium truncate ${!isHome ? 'text-gold-dark font-bold' : 'text-gray-700'}`}>
                            {a?.name || 'TBD'}
                          </span>
                          <span className="text-lg shrink-0">{a?.flag}</span>
                        </div>
                        {isFinished ? (
                          <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded shrink-0">完赛</span>
                        ) : isLive ? (
                          <span className="text-[10px] text-red-500 font-bold animate-pulse shrink-0">LIVE</span>
                        ) : (
                          <div className="text-[10px] text-gray-400 shrink-0 hidden sm:block">{m.city}</div>
                        )}
                        <span className="text-gray-300 group-hover:text-gold transition-colors shrink-0">→</span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-100">
                  暂无比赛数据
                </div>
              )}
            </div>

            {/* Group predictions */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">🤖 同组对阵预测</h2>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                {groupPredictions.map(({ opponent, prediction, isHome }) => {
                  const winProb = isHome ? prediction.homeWinProb : prediction.awayWinProb;
                  const drawProb = prediction.drawProb;
                  const loseProb = Math.round((100 - winProb - drawProb) * 10) / 10;
                  return (
                    <div key={opponent.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{opponent.flag}</span>
                          <span className="text-sm font-medium text-gray-900">VS {opponent.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-qualify font-bold tabular-nums">{winProb}% 胜</span>
                          <span className="text-gray-400 tabular-nums">{drawProb}% 平</span>
                          <span className="text-red-500 tabular-nums">{loseProb}% 负</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-qualify transition-all" style={{ width: `${Math.max(0, winProb)}%` }} />
                        <div className="h-full bg-gray-300 transition-all" style={{ width: `${Math.max(0, drawProb)}%` }} />
                        <div className="h-full bg-red-400 transition-all" style={{ width: `${Math.max(0, loseProb)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ Screen 3: Players + Opponents ═══════ */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Key players */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">⭐ 核心球员</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="space-y-2">
                {team.keyPlayers.map((name, i) => {
                  const matches = searchPlayers(name);
                  const player = matches.length > 0 ? matches[0] : null;
                  const posColors: Record<string, string> = {
                    FW: 'bg-red-100 text-red-700',
                    MF: 'bg-blue-100 text-blue-700',
                    DF: 'bg-green-100 text-green-700',
                    GK: 'bg-yellow-100 text-yellow-700',
                  };
                  const posBadge = player ? (posColors[player.position] || 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-400';

                  const cardBody = (
                    <>
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${player ? posBadge : 'bg-gray-100 text-gray-400'}`}>
                        {player ? player.nameEn.charAt(0) : '?'}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">{name}</div>
                        {player ? (
                          <div className="text-[11px] text-gray-500 flex items-center gap-2 flex-wrap mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${posBadge}`}>{player.position}</span>
                            <span>{player.age}岁</span>
                            <span className="text-gray-300">|</span>
                            <span className="truncate">{player.club}</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-400 mt-0.5">资料待更新</div>
                        )}
                      </div>
                      {player && (
                        <span className="text-gray-300 group-hover:text-gold transition-colors text-xs shrink-0">→</span>
                      )}
                    </>
                  );

                  return player ? (
                    <Link
                      key={name}
                      href={`/player/${player.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      {cardBody}
                    </Link>
                  ) : (
                    <div key={name} className="flex items-center gap-3 p-3 rounded-lg">
                      {cardBody}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Group opponents */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">👥 {team.group}组对手</h2>
            <div className="grid grid-cols-3 gap-3">
              {groupTeams.filter(t => t.id !== team.id).map(t => (
                <Link
                  key={t.id}
                  href={`/team/${t.id}`}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md hover:border-navy-600 transition-all group card-elevated"
                >
                  <span className="text-3xl block mb-2">{t.flag}</span>
                  <div className="font-semibold text-gray-900 text-xs">{t.name}</div>
                  <div className="text-[10px] text-gray-400">{t.nameEn}</div>
                  <div className="text-[10px] text-gray-500 mt-1">FIFA #{t.fifaRank}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
