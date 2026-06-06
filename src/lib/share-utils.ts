// Share prediction — encode/decode picks for shareable URLs
import { getTeam } from '@/data/teams';
import type { Team } from '@/data/teams';

/** Slot IDs in the exact order used by BracketView.tsx manual picks */
const R32_IDS = Array.from({ length: 16 }, (_, i) => `r32-${i + 1}`);
const R16_IDS = Array.from({ length: 8 }, (_, i) => `r16-${i + 1}`);
const QF_IDS = Array.from({ length: 4 }, (_, i) => `qf-${i + 1}`);
const SF_IDS = ['sf-1', 'sf-2'];
const FINAL_ID = 'final';

export const ALL_SLOT_IDS = [...R32_IDS, ...R16_IDS, ...QF_IDS, ...SF_IDS, FINAL_ID];

export interface ShareData {
  picks: Record<string, string>;
  timestamp: number;
}

/** Encode prediction picks → URL-safe base64 string */
export function encodeShareData(picks: Record<string, string>): string {
  const teamIds = ALL_SLOT_IDS.map(sid => picks[sid] || '');
  const data = { d: teamIds, t: Date.now() };
  const raw = JSON.stringify(data);
  // UTF-8 safe base64 → URL-safe
  const base64 = btoa(unescape(encodeURIComponent(raw)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode URL-safe base64 string → ShareData */
export function decodeShareData(encoded: string): ShareData | null {
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const raw = decodeURIComponent(escape(atob(b64)));
    const data = JSON.parse(raw);
    const picks: Record<string, string> = {};
    ALL_SLOT_IDS.forEach((sid, i) => {
      if (data.d?.[i]) picks[sid] = data.d[i];
    });
    return { picks, timestamp: data.t || Date.now() };
  } catch {
    return null;
  }
}

export interface ShareResults {
  champion: Team | null;
  runnerUp: Team | null;
  semiFinalists: Team[];
  quarterFinalists: Team[];
}

/** Extract champion / runner-up / semi-finalists / quarter-finalists from picks */
export function extractResults(picks: Record<string, string>): ShareResults {
  const championId = picks['final'];
  const champion = championId ? (getTeam(championId) ?? null) : null;

  // Runner-up: the SF winner that lost the final
  let runnerUp: Team | null = null;
  if (championId) {
    const sf1 = picks['sf-1'];
    const sf2 = picks['sf-2'];
    const loserId = championId === sf1 ? sf2 : sf1;
    runnerUp = loserId ? (getTeam(loserId) ?? null) : null;
  }

  // Semi-finalists = all 4 QF winners
  const semiFinalists = ['qf-1', 'qf-2', 'qf-3', 'qf-4']
    .map(id => picks[id])
    .filter(Boolean)
    .map(id => getTeam(id!))
    .filter(Boolean) as Team[];

  // Quarter-finalists = all 8 R16 winners
  const quarterFinalists = ['r16-1', 'r16-2', 'r16-3', 'r16-4', 'r16-5', 'r16-6', 'r16-7', 'r16-8']
    .map(id => picks[id])
    .filter(Boolean)
    .map(id => getTeam(id!))
    .filter(Boolean) as Team[];

  return { champion, runnerUp, semiFinalists, quarterFinalists };
}

/** Build full share URL for the current origin */
export function getShareUrl(encoded: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/share?d=${encoded}`;
}
