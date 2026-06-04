import { notFound } from 'next/navigation';
import { getTeam, getTeamsByGroup, teams } from '@/data/teams';
import { getMatchesByTeam, stageNames } from '@/data/matches';
import { getChampionshipProbabilities } from '@/data/standings';
import { predictMatch } from '@/lib/ai';
import MatchCard from '@/components/MatchCard';
import Link from 'next/link';

export async function generateStaticParams() {
  return teams.map(t => ({ id: t.id }));
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = getTeam(id);
  if (!team) notFound();

  const groupTeams = getTeamsByGroup(team.group);
  const matches = getMatchesByTeam(team.id);
  const champProbs = getChampionshipProbabilities();
  const champRank = champProbs.findIndex(p => p.teamId === team.id) + 1;
  const champProb = champProbs.find(p => p.teamId === team.id)?.probability || 1;

  // Get AI prediction vs other group teams
  const groupPredictions = groupTeams
    .filter(t => t.id !== team.id)
    .map(opp => {
      const isHome = team.id < opp.id;
      const pred = isHome ? predictMatch(team.id, opp.id) : predictMatch(opp.id, team.id);
      return { opponent: opp, prediction: pred, isHome };
    });

  const formEmoji: Record<string, string> = { W: '🟢', D: '🟡', L: '🔴' };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Team Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white px-6 py-8">
          <div className="flex items-center gap-4">
            <span className="text-6xl">{team.flag}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{team.group}组</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">FIFA #{team.fifaRank}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">ELO {team.elo}</span>
              </div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <p className="text-gray-300 text-sm">{team.nameEn} · {team.worldCupApps}次世界杯</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* Team Info */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">👨‍🏫 基本信息</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">主教练</div>
                <div className="font-medium text-gray-900">{team.coach}</div>
                <div className="text-gray-500">历史最佳</div>
                <div className="font-medium text-gray-900">{team.bestResult}</div>
                <div className="text-gray-500">世界杯参赛</div>
                <div className="font-medium text-gray-900">{team.worldCupApps}次</div>
                <div className="text-gray-500">小组赛赔率</div>
                <div className="font-medium text-gray-900">{team.groupStageOdds}</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">⭐ 核心球员</h3>
              <div className="flex flex-wrap gap-2">
                {team.keyPlayers.map(p => (
                  <span key={p} className="px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">📈 近期状态</h3>
              <div className="flex items-center gap-2 mb-1">
                {team.recentForm.map((f, i) => (
                  <span key={i} className="text-lg" title={f === 'W' ? '胜' : f === 'D' ? '平' : '负'}>
                    {formEmoji[f]}
                  </span>
                ))}
              </div>
              <div className="space-y-1">
                {team.recentResults.map((r, i) => (
                  <div key={i} className="text-sm text-gray-600">{r}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Championship Probability */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3">🏆 夺冠分析</h3>
            <div className="text-center mb-3">
              <div className="text-3xl font-bold text-green-700">{champProb}%</div>
              <div className="text-xs text-gray-500">夺冠概率</div>
            </div>
            <div className="text-center mb-3">
              <div className="text-xl font-bold text-gray-900">第 {champRank} 名</div>
              <div className="text-xs text-gray-500">在48支球队中</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{team.winOdds}</div>
              <div className="text-xs text-gray-500">冠军赔率（平均）</div>
            </div>

            {/* Group Predictions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">同组对阵预测</h4>
              <div className="space-y-2">
                {groupPredictions.map(({ opponent, prediction, isHome }) => {
                  const winProb = isHome ? prediction.homeWinProb : prediction.awayWinProb;
                  return (
                    <div key={opponent.id} className="text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">VS {opponent.name}</span>
                        <span className={`font-semibold ${winProb > 40 ? 'text-green-600' : winProb > 25 ? 'text-orange-500' : 'text-red-500'}`}>
                          {winProb}% 胜率
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full mt-0.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${winProb > 40 ? 'bg-green-500' : winProb > 25 ? 'bg-orange-400' : 'bg-red-400'}`}
                          style={{ width: `${winProb}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matches */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📅 比赛赛程</h2>
        {matches.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {matches.map(m => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white rounded-xl border">
            暂无比赛数据
          </div>
        )}
      </div>

      {/* Group Mates */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">👥 同组对手</h2>
        <div className="grid grid-cols-3 gap-4">
          {groupTeams.filter(t => t.id !== team.id).map(t => (
            <Link
              key={t.id}
              href={`/team/${t.id}`}
              className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow"
            >
              <span className="text-4xl block mb-2">{t.flag}</span>
              <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
              <div className="text-xs text-gray-400">{t.nameEn}</div>
              <div className="text-xs text-gray-500 mt-1">FIFA #{t.fifaRank}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
