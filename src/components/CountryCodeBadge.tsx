import { getTeam } from '@/data/teams';

/** Consistent flag display — uses emoji flags */
export default function CountryCodeBadge({
  teamId,
  size = 'md',
}: {
  teamId: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const team = getTeam(teamId);
  const flag = team?.flag || '❓';

  const sizeClasses = {
    sm: 'text-base leading-none',
    md: 'text-xl leading-none',
    lg: 'text-3xl leading-none',
  };

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${sizeClasses[size]}`}
      title={team?.name || teamId}
      aria-label={team?.nameEn || teamId}
    >
      {flag}
    </span>
  );
}
