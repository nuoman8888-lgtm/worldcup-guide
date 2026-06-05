import Link from 'next/link';
import type { Player } from '@/data/players';
import { getTeam } from '@/data/teams';

export default function PlayerCard({ player, compact = false }: { player: Player; compact?: boolean }) {
  const team = getTeam(player.teamId);
  // Position color
  const posColors: Record<string, string> = {
    FW: 'bg-red-50 text-red-700 border-red-200',
    MF: 'bg-blue-50 text-blue-700 border-blue-200',
    DF: 'bg-green-50 text-green-700 border-green-200',
    GK: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 hover:shadow-sm transition-shadow">
        {/* Avatar placeholder with initials */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
          player.position === 'FW' ? 'bg-red-100 text-red-700' :
          player.position === 'MF' ? 'bg-blue-100 text-blue-700' :
          player.position === 'DF' ? 'bg-green-100 text-green-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {player.nameEn.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">{player.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${posColors[player.position] || 'bg-gray-50 text-gray-600'}`}>
              {player.position}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-0.5">
            {team && <span>{team.flag} {team.name}</span>}
            <span>{player.appearances}场</span>
            <span>{player.goals}球</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-navy">{player.marketValue}</div>
          <div className="text-[9px] text-gray-400">身价</div>
        </div>
      </div>
    );
  }

  // Full card
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className={`px-4 py-4 flex items-center gap-4 ${
        player.position === 'FW' ? 'bg-gradient-to-r from-red-50 to-white' :
        player.position === 'MF' ? 'bg-gradient-to-r from-blue-50 to-white' :
        player.position === 'DF' ? 'bg-gradient-to-r from-green-50 to-white' :
        'bg-gradient-to-r from-yellow-50 to-white'
      }`}>
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold shrink-0 ${
          player.position === 'FW' ? 'bg-red-500 text-white' :
          player.position === 'MF' ? 'bg-blue-500 text-white' :
          player.position === 'DF' ? 'bg-green-500 text-white' :
          'bg-yellow-500 text-white'
        }`}>
          {player.nameEn.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">{player.name}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${posColors[player.position] || ''}`}>
              {player.position}
            </span>
          </div>
          <p className="text-sm text-gray-500">{player.nameEn}</p>
          {team && (
            <Link href={`/team/${team.id}`} className="inline-flex items-center gap-1 text-xs text-gold-dark hover:underline mt-0.5">
              {team.flag} {team.name}
            </Link>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-extrabold text-navy">{player.marketValue}</div>
          <div className="text-[10px] text-gray-400">市场身价</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
        <div className="p-3 text-center">
          <div className="text-xl font-extrabold text-gray-900">{player.appearances}</div>
          <div className="text-[10px] text-gray-400">国家队出场</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-xl font-extrabold text-gray-900">{player.goals}</div>
          <div className="text-[10px] text-gray-400">国家队进球</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-xl font-extrabold text-gray-900">{player.age}</div>
          <div className="text-[10px] text-gray-400">年龄</div>
        </div>
      </div>
    </div>
  );
}
