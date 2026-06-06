import { getCountryCode } from '@/data/teams';

/** Consistent country code badge — works on all platforms (no emoji dependency) */
export default function CountryCodeBadge({
  teamId,
  size = 'md',
}: {
  teamId: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const code = getCountryCode(teamId);

  const sizeClasses = {
    sm: 'w-7 h-5 text-[9px]',
    md: 'w-8 h-6 text-[10px]',
    lg: 'w-10 h-7 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded font-extrabold tracking-wider bg-navy text-gold-light shrink-0 ${sizeClasses[size]}`}
      title={teamId}
      aria-label={code}
    >
      {code}
    </span>
  );
}
