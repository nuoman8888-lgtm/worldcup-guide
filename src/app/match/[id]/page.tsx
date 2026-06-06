import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMatch, stageNames, formatDate, allMatches } from '@/data/matches';
import { getTeam } from '@/data/teams';
import { predictMatch } from '@/lib/ai';
import { generateOdds } from '@/data/odds';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) return { title: '比赛未找到' };
  const home = match.homeTeamId !== 'TBD' ? getTeam(match.homeTeamId) : null;
  const away = match.awayTeamId !== 'TBD' ? getTeam(match.awayTeamId) : null;
  const stageName = stageNames[match.stage];
  const title = home && away
    ? `${home.name} vs ${away.name} | ${stageName} | 世界杯 2026`
    : `${stageName} | 世界杯 2026`;
  return {
    title,
    description: `${formatDate(match.date)} ${match.time} · ${match.city} · ${match.venue}`,
  };
}

export async function generateStaticParams() {
  return allMatches.map(m => ({ id: m.id }));
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) notFound();

  const homeTeam = match.homeTeamId !== 'TBD' ? getTeam(match.homeTeamId) : null;
  const awayTeam = match.awayTeamId !== 'TBD' ? getTeam(match.awayTeamId) : null;

  let prediction: ReturnType<typeof predictMatch> | null = null;
  let odds: ReturnType<typeof generateOdds> | null = null;

  if (homeTeam && awayTeam) {
    prediction = predictMatch(match.homeTeamId, match.awayTeamId);
    odds = generateOdds(homeTeam.elo, awayTeam.elo);
  }

  const otherGroupMatches = match.group
    ? allMatches.filter(m => m.group === match.group && m.id !== match.id)
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Match Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              {match.group && <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{match.group}组</span>}
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{stageNames[match.stage]}</span>
              {match.status === 'live' && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs animate-pulse">LIVE</span>
              )}
            </div>
            <span>{formatDate(match.date)}</span>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1">
              {homeTeam ? (
                <Link href={`/team/${homeTeam.id}`} className="flex flex-col items-center hover:opacity-80 transition-opacity">
                  <span className="text-6xl mb-3">{homeTeam.flag}</span>
                  <h2 className="text-xl font-bold text-gray-900 text-center">{homeTeam.name}</h2>
                  <p className="text-sm text-gray-400">{homeTeam.nameEn}</p>
                  <p className="text-xs text-gray-400 mt-1">FIFA #{homeTeam.fifaRank}</p>
                </Link>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-6xl mb-3">❓</span>
                  <h2 className="text-xl font-bold text-gray-400">待定</h2>
                </div>
              )}
            </div>

            {/* VS / Score */}
            <div className="flex-shrink-0 mx-8 text-center">
              {match.status === 'finished' ? (
                <div>
                  <div className="text-4xl font-bold text-gray-900">{match.homeScore} - {match.awayScore}</div>
                  <div className="text-sm text-gray-500 mt-1">比赛结束</div>
                </div>
              ) : match.status === 'live' ? (
                <div>
                  <div className="text-4xl font-bold text-red-600 animate-pulse">{match.homeScore ?? 0} - {match.awayScore ?? 0}</div>
                  <div className="text-sm text-red-500 mt-1">⚡ 进行中</div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-gray-300">VS</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">{match.time}</div>
                  <div className="text-xs text-gray-500">北京时间 (UTC+8)</div>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1">
              {awayTeam ? (
                <Link href={`/team/${awayTeam.id}`} className="flex flex-col items-center hover:opacity-80 transition-opacity">
                  <span className="text-6xl mb-3">{awayTeam.flag}</span>
                  <h2 className="text-xl font-bold text-gray-900 text-center">{awayTeam.name}</h2>
                  <p className="text-sm text-gray-400">{awayTeam.nameEn}</p>
                  <p className="text-xs text-gray-400 mt-1">FIFA #{awayTeam.fifaRank}</p>
                </Link>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-6xl mb-3">❓</span>
                  <h2 className="text-xl font-bold text-gray-400">待定</h2>
                </div>
              )}
            </div>
          </div>

          {/* Venue Info */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span>📍 {match.city}</span>
            <span>🏟️ {match.venue}</span>
          </div>
        </div>
      </div>

      {/* ── Data Comparison + Recent Form ── */}
      {homeTeam && awayTeam && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Data Comparison */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">📊 数据对比</h3>
            <div className="space-y-3">
              {[
                { label: 'FIFA排名', home: `#${homeTeam.fifaRank}`, away: `#${awayTeam.fifaRank}`, better: homeTeam.fifaRank < awayTeam.fifaRank ? 'home' : 'away' },
                { label: 'ELO评分', home: homeTeam.elo.toString(), away: awayTeam.elo.toString(), better: homeTeam.elo > awayTeam.elo ? 'home' : 'away' },
                { label: '世界杯参赛', home: `${homeTeam.worldCupApps}次`, away: `${awayTeam.worldCupApps}次`, better: homeTeam.worldCupApps > awayTeam.worldCupApps ? 'home' : 'away' },
                { label: '历史最佳', home: homeTeam.bestResult, away: awayTeam.bestResult, better: null },
                { label: '小组赔率', home: homeTeam.groupStageOdds.toString(), away: awayTeam.groupStageOdds.toString(), better: homeTeam.groupStageOdds < awayTeam.groupStageOdds ? 'home' : 'away' },
              ].map(row => (
                <div key={row.label} className="flex items-center text-sm">
                  <span className={`flex-1 text-right font-semibold tabular-nums ${
                    row.better === 'home' ? 'text-navy' : 'text-gray-600'
                  }`}>
                    {row.home}
                  </span>
                  <span className="w-20 text-center text-xs text-gray-400 font-medium">{row.label}</span>
                  <span className={`flex-1 text-left font-semibold tabular-nums ${
                    row.better === 'away' ? 'text-navy' : 'text-gray-600'
                  }`}>
                    {row.away}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">📈 近期状态</h3>
            <div className="space-y-4">
              {[homeTeam, awayTeam].map((team, ti) => {
                const wins = team.recentForm.filter(f => f === 'W').length;
                return (
                  <div key={team.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{team.flag}</span>
                      <span className="text-sm font-semibold text-gray-900">{team.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">近5场 {wins}胜{team.recentForm.filter(f => f === 'D').length}平{team.recentForm.filter(f => f === 'L').length}负</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {team.recentForm.map((f, i) => (
                        <span
                          key={i}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            f === 'W' ? 'bg-qualify-light text-qualify border border-qualify' :
                            f === 'D' ? 'bg-yellow-50 text-yellow-600 border border-yellow-300' :
                            'bg-red-50 text-red-500 border border-red-300'
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    {/* Result details */}
                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                      {team.recentResults.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className={`w-1 h-1 rounded-full ${
                            team.recentForm[i] === 'W' ? 'bg-qualify' :
                            team.recentForm[i] === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          {r}
                        </div>
                      ))}
                    </div>
                    {ti === 0 && <div className="border-t border-gray-100 my-3" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Core Players ── */}
      {homeTeam && awayTeam && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">⭐ 核心球员</h3>
          <div className="grid grid-cols-2 gap-6">
            {[homeTeam, awayTeam].map(team => (
              <div key={team.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{team.flag}</span>
                  <span className="text-sm font-semibold text-gray-900">{team.name}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {team.keyPlayers.map(p => (
                    <span key={p} className="px-3 py-1.5 bg-navy text-gold-light rounded-full text-xs font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Prediction & Odds */}
      {prediction && (
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* AI Prediction */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🤖</span> AI预测分析
              <span className={`text-xs px-2 py-0.5 rounded ml-auto ${
                prediction.confidence === 'high' ? 'bg-qualify-light text-qualify' :
                prediction.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                置信度: {prediction.confidence === 'high' ? '高' : prediction.confidence === 'medium' ? '中' : '低'}
              </span>
            </h3>

            {/* AI One-Line Analysis */}
            <div className="mb-5 p-3 bg-gold-50 border border-gold-light rounded-lg">
              <p className="text-sm text-navy leading-relaxed">
                💡 {homeTeam && awayTeam && prediction.homeWinProb > prediction.awayWinProb
                  ? `${homeTeam.name}整体实力占优（FIFA #${homeTeam.fifaRank} vs #${awayTeam.fifaRank}），${prediction.homeWinProb > 50 ? '取胜概率较大' : '但优势并不明显'}。${prediction.drawProb > 25 ? '平局可能性不容忽视，' : ''}预计${prediction.homeWinProb > 50 ? homeTeam.name : '双方'}${prediction.homeWinProb > 50 ? `小胜` : '将陷入苦战'}。`
                  : `${awayTeam?.name}整体实力占优（FIFA #${awayTeam?.fifaRank} vs #${homeTeam?.fifaRank}），${prediction.awayWinProb > 50 ? '取胜概率较大' : '但优势并不明显'}。${prediction.drawProb > 25 ? '平局可能性不容忽视，' : ''}预计${prediction.awayWinProb > 50 ? awayTeam?.name : '双方'}${prediction.awayWinProb > 50 ? `小胜` : '将陷入苦战'}。`
                }
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-qualify-light rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">{homeTeam?.name}胜</div>
                <div className="text-2xl font-bold text-qualify">{prediction.homeWinProb}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">平局</div>
                <div className="text-2xl font-bold text-gray-600">{prediction.drawProb}%</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">{awayTeam?.name}胜</div>
                <div className="text-2xl font-bold text-orange-600">{prediction.awayWinProb}%</div>
              </div>
            </div>

            <div className="text-center mb-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">AI预测比分: </span>
              <span className="text-lg font-bold text-gray-900">{prediction.predictedScore}</span>
            </div>

            <div className="space-y-2">
              {prediction.factors.map((f, i) => (
                <div key={i} className={`text-xs flex items-start gap-1.5 ${
                  f.impact === 'positive' ? 'text-qualify' : f.impact === 'negative' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <span>{f.impact === 'positive' ? '✅' : f.impact === 'negative' ? '⚠️' : 'ℹ️'}</span>
                  <span><strong>{f.label}:</strong> {f.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Odds */}
          {odds && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">💰 赔率对比</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-xs text-gray-500">博彩公司</th>
                      <th className="text-center py-2 text-xs text-gray-500">主胜</th>
                      <th className="text-center py-2 text-xs text-gray-500">平局</th>
                      <th className="text-center py-2 text-xs text-gray-500">客胜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {odds.map(o => (
                      <tr key={o.bookmaker} className="border-b border-gray-50">
                        <td className="py-3 font-medium text-gray-900">{o.bookmaker}</td>
                        <td className="text-center py-3 font-mono font-bold">{o.homeWin}</td>
                        <td className="text-center py-3 font-mono font-bold">{o.draw}</td>
                        <td className="text-center py-3 font-mono font-bold">{o.awayWin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                ⚠️ 赔率数据仅供参考分析，不构成投注建议。请理性观赛。
              </p>
            </div>
          )}
        </div>
      )}

      {/* Other Group Matches */}
      {otherGroupMatches.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-4">📅 {match.group}组其他比赛</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {otherGroupMatches.map(m => {
              const hm = getTeam(m.homeTeamId);
              const am = getTeam(m.awayTeamId);
              return (
                <Link
                  key={m.id}
                  href={`/match/${m.id}`}
                  className="bg-white rounded-lg border border-gray-100 p-3 hover:shadow-md transition-shadow text-center"
                >
                  <div className="text-xs text-gray-400 mb-2">{formatDate(m.date)} {m.time}</div>
                  <div className="flex items-center justify-center gap-2">
                    {hm && <span className="text-xl">{hm.flag}</span>}
                    <span className="text-xs font-medium text-gray-900">{hm?.name || 'TBD'}</span>
                    <span className="text-xs text-gray-400">VS</span>
                    <span className="text-xs font-medium text-gray-900">{am?.name || 'TBD'}</span>
                    {am && <span className="text-xl">{am.flag}</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{m.venue}</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
