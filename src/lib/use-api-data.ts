'use client';

import { useState, useEffect, useCallback } from 'react';
import { allMatches } from '@/data/matches';

// ── Types from football-data.org ──

export interface ApiTeam {
  id: number; name: string; shortName: string; tla: string; crest?: string;
}

export interface ApiMatch {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED | TIMED | LIVE | IN_PLAY | PAUSED | FINISHED | POSTPONED
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: {
    winner: string | null;
    duration: string;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

export interface ApiStanding {
  stage: string; type: string; group: string | null;
  table: Array<{
    position: number;
    team: ApiTeam;
    playedGames: number;
    won: number; draw: number; lost: number;
    goalsFor: number; goalsAgainst: number;
    goalDifference: number; points: number;
  }>;
}

// ── Hooks ──

export function useApiMatches() {
  const [data, setData] = useState<ApiMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/matches');
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || `HTTP ${res.status}`);
        setData(null);
      } else {
        const json = await res.json();
        setData(json.matches || []);
        setError(null);
      }
    } catch {
      setError('实时数据获取失败');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  return { data, error, loading, refetch: fetchMatches };
}

export function useApiStandings() {
  const [data, setData] = useState<ApiStanding[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStandings = useCallback(async () => {
    try {
      const res = await fetch('/api/standings');
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || `HTTP ${res.status}`);
        setData(null);
      } else {
        const json = await res.json();
        setData(json.standings || []);
        setError(null);
      }
    } catch {
      setError('实时数据获取失败');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStandings(); }, [fetchStandings]);

  return { data, error, loading, refetch: fetchStandings };
}

/** Map football-data.org TLA to our team ID */
const TLA_MAP: Record<string, string> = {
  MEX:'mexico', KOR:'south-korea', CZE:'czech', RSA:'south-africa',
  CAN:'canada', QAT:'qatar', SUI:'switzerland', BIH:'bosnia',
  BRA:'brazil', HAI:'haiti', SCO:'scotland', MAR:'morocco',
  USA:'usa', AUS:'australia', TUR:'turkey', PAR:'paraguay',
  GER:'germany', CIV:'ivory-coast', ECU:'ecuador', CUW:'curacao',
  NED:'netherlands', SWE:'sweden', TUN:'tunisia', JPN:'japan',
  BEL:'belgium', IRN:'iran', NZL:'new-zealand', EGY:'egypt',
  ESP:'spain', KSA:'saudi-arabia', URY:'uruguay', CPV:'cape-verde',
  FRA:'france', IRQ:'iraq', NOR:'norway', SEN:'senegal',
  ARG:'argentina', AUT:'austria', JOR:'jordan', ALG:'algeria',
  POR:'portugal', UZB:'uzbekistan', COL:'colombia', COD:'dr-congo',
  ENG:'england', GHA:'ghana', PAN:'panama', CRO:'croatia',
};

export function tlaToTeamId(tla: string): string {
  return TLA_MAP[tla] || tla.toLowerCase();
}

/** Normalize group name: "GROUP_A" | "Group A" → "A" */
export function normalizeGroup(raw: string | null): string {
  if (!raw) return '';
  return raw.replace(/^GROUP_?/i, '').replace(/^Group\s*/i, '').trim();
}

/**
 * Map an API match to our internal match ID (m1-m104).
 * Uses team TLA codes to find the correct internal match by team matchup,
 * falling back to position-based lookup for TBD/unmatched teams.
 */
export function apiMatchToInternalId(apiMatch: ApiMatch, allApiMatches: ApiMatch[]): string {
  // Primary: match by home/away TLA → internal team IDs → find internal match ID
  const homeId = tlaToTeamId(apiMatch.homeTeam?.tla || '');
  const awayId = tlaToTeamId(apiMatch.awayTeam?.tla || '');
  if (homeId && awayId && homeId !== 'tbd' && awayId !== 'tbd') {
    const found = allMatches.find(m => m.homeTeamId === homeId && m.awayTeamId === awayId);
    if (found) return found.id;
  }

  // Fallback: position-based by API match ID
  const idx = allApiMatches.findIndex(m => m.id === apiMatch.id);
  if (idx >= 0 && idx < 104) return `m${idx + 1}`;
  return `m${(apiMatch.id % 1000)}`;
}

export type MatchStatus = 'SCHEDULED' | 'TIMED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED';
