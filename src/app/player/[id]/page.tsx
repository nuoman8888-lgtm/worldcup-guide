import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPlayer, getPlayersByTeam, getPlayerRadarData, topPlayers } from '@/data/players';
import { getTeam } from '@/data/teams';
import RadarChart from '@/components/RadarChart';
import PlayerAvatar from '@/components/PlayerAvatar';

// ── Position colors ──
const posColors: Record<string, string> = {
  FW: 'from-red-500 to-red-600',
  MF: 'from-blue-500 to-blue-600',
  DF: 'from-green-500 to-green-600',
  GK: 'from-yellow-500 to-yellow-600',
};
const posBg: Record<string, string> = {
  FW: 'bg-red-100 text-red-700',
  MF: 'bg-blue-100 text-blue-700',
  DF: 'bg-green-100 text-green-700',
  GK: 'bg-yellow-100 text-yellow-700',
};

export async function generateStaticParams() {
  return topPlayers.map(p => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) return { title: '球员未找到' };
  const team = getTeam(player.teamId);
  return {
    title: `${player.name} (${player.nameEn}) - ${team?.name || ''} | 世界杯球员数据`,
    description: `${player.name}，${player.position}，效力于${player.club}，${team?.name || ''}国家队${player.appearances}场${player.goals}球。身价${player.marketValue}。`,
  };
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) notFound();

  const team = getTeam(player.teamId);
  const teammates = getPlayersByTeam(player.teamId).filter(p => p.id !== player.id);
  const radarData = getPlayerRadarData(player);
  const gradient = posColors[player.position] || 'from-gray-500 to-gray-600';
  const badge = posBg[player.position] || 'bg-gray-100 text-gray-600';

  return (
    <div className="min-h-screen">
      {/* ═══════ Hero ═══════ */}
      <section className={`bg-gradient-to-br ${gradient} text-white`}>
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <PlayerAvatar
              photoUrl={player.photoUrl}
              initial={player.nameEn.charAt(0)}
              name={player.name}
            />
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badge}`}>
                  {player.position}
                </span>
                {team && (
                  <Link
                    href={`/team/${team.id}`}
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-white/15 backdrop-blur hover:bg-white/25 transition-colors"
                  >
                    {team.flag} {team.name}
                  </Link>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-white/15 backdrop-blur">
                  {player.club}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold">{player.name}</h1>
              <p className="text-sm mt-1 text-white/70">{player.nameEn} · {player.age}岁</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { label: '国家队出场', value: `${player.appearances}场` },
              { label: '国家队进球', value: `${player.goals}球` },
              { label: '身价', value: player.marketValue },
              { label: '俱乐部', value: player.club },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-4 bg-white/10 backdrop-blur">
                <div className="text-xs font-medium mb-1 text-white/60">{stat.label}</div>
                <div className="text-lg font-extrabold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Content: two-column ═══════ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Radar Chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">📊 能力雷达</h3>
            <p className="text-xs text-gray-400 mb-4">基于比赛数据综合评估（0-10分）</p>
            <RadarChart data={radarData} size={240} />
            <div className="flex justify-center gap-3 mt-3 text-[11px] text-gray-500 flex-wrap">
              {radarData.map(d => (
                <span key={d.label}>{d.label} {d.value}</span>
              ))}
            </div>
          </div>

          {/* Right: Stats + Link */}
          <div className="space-y-5">
            {/* Detailed stats */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3">📋 详细数据</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: '年龄', value: `${player.age}岁` },
                  { label: '位置', value: player.position },
                  { label: '俱乐部', value: player.club },
                  { label: '国家队出场', value: `${player.appearances}场` },
                  { label: '国家队进球', value: `${player.goals}球` },
                  { label: '场均进球', value: `${(player.goals / Math.max(1, player.appearances)).toFixed(2)}` },
                  { label: '身价', value: player.marketValue },
                  { label: '姓名', value: player.nameEn },
                ].map(row => (
                  <div key={row.label} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-0.5">{row.label}</div>
                    <div className="font-semibold text-gray-900">{row.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* National team card */}
            {team && (
              <Link
                href={`/team/${team.id}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-navy-600 transition-all group"
              >
                <h3 className="font-bold text-gray-900 mb-3">🏳️ 国家队</h3>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{team.flag}</span>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{team.name}</div>
                    <div className="text-sm text-gray-500">{team.nameEn} · {team.group}组</div>
                    <div className="text-xs text-gray-400 mt-1">FIFA #{team.fifaRank} · ELO {team.elo}</div>
                  </div>
                  <span className="ml-auto text-gray-300 group-hover:text-gold transition-colors">→</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* ═══════ Teammates ═══════ */}
        {teammates.length > 0 && team && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              👥 {team.name} 队友
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {teammates.map(p => (
                <Link
                  key={p.id}
                  href={`/player/${p.id}`}
                  className="shrink-0 bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md hover:border-navy-600 transition-all group w-32"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${posColors[p.position] || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white text-lg font-bold mx-auto mb-2`}>
                    {p.nameEn.charAt(0)}
                  </div>
                  <div className="font-semibold text-gray-900 text-xs">{p.name}</div>
                  <div className="text-[10px] text-gray-400">{p.position} · {p.age}岁</div>
                  <div className="text-[10px] text-gold-dark mt-0.5 font-medium">{p.marketValue}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
