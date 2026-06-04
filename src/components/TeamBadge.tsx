import { getTeam } from '@/data/teams';
import Link from 'next/link';

export default function TeamBadge({ teamId, size = 'md', showName = true }: {
  teamId: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}) {
  const team = getTeam(teamId);
  if (!team) return <span className="text-gray-400">{teamId}</span>;

  const sizeClasses = {
    sm: 'text-lg px-2 py-1 text-xs gap-1',
    md: 'text-2xl px-3 py-1.5 text-sm gap-2',
    lg: 'text-4xl px-4 py-2 text-base gap-3',
  };

  const flagSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };

  return (
    <Link
      href={`/team/${team.id}`}
      className={`inline-flex items-center rounded-lg hover:bg-gray-100 transition-colors ${sizeClasses[size]}`}
    >
      <span className={flagSizes[size]}>{team.flag}</span>
      {showName && (
        <div className="text-left leading-tight">
          <div className="font-semibold text-gray-900">{team.name}</div>
          {size !== 'sm' && <div className="text-gray-400 text-[10px]">{team.nameEn}</div>}
        </div>
      )}
    </Link>
  );
}
