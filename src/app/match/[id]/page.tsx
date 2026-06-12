import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMatch, stageNames, formatDate, allMatches } from '@/data/matches';
import { getTeam } from '@/data/teams';
import PageTracker from '@/components/PageTracker';
import MatchClient from './MatchClient';

export function generateStaticParams() {
  return allMatches.map(m => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) return { title: '比赛未找到' };
  const home = match.homeTeamId !== 'TBD' ? getTeam(match.homeTeamId) : null;
  const away = match.awayTeamId !== 'TBD' ? getTeam(match.awayTeamId) : null;
  return {
    title: home && away ? `${home.name} vs ${away.name} | ${stageNames[match.stage]} | 世界杯 2026` : `${stageNames[match.stage]} | 世界杯 2026`,
    description: `${formatDate(match.date)} ${match.time} · ${match.city} · ${match.venue}`,
  };
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) notFound();

  return (
    <>
      <PageTracker event="match_view" data={{ matchId: id }} />
      <MatchClient id={id} />
    </>
  );
}
