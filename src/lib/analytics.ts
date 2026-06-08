'use client';

// ── Analytics helper — Cloudflare Web Analytics + localStorage backup ──

const STORAGE_KEY = 'wc_analytics';
const VISIT_KEY = 'wc_first_visit';

interface LogEntry {
  name: string;
  data?: Record<string, unknown>;
  ts: number;
}

/** Track a custom event */
export function trackEvent(name: string, data?: Record<string, unknown>): void {
  // 1. Cloudflare Web Analytics (if available)
  if (typeof window !== 'undefined' && (window as any).cf_beacon) {
    try {
      (window as any).cf_beacon.push([name, data || {}]);
    } catch { /* ignore */ }
  }

  // 2. localStorage backup
  try {
    const logs = getLogs();
    logs.push({ name, data, ts: Date.now() });
    // Keep last 500 entries
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch { /* ignore */ }
}

/** Read all logs from localStorage */
function getLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/** Expose logs for admin page */
export function getAnalyticsLogs(): LogEntry[] {
  if (typeof window === 'undefined') return [];
  return getLogs();
}

// ── First visit / retention ──

export function initFirstVisit(): void {
  if (typeof window === 'undefined') return;
  try {
    if (!localStorage.getItem(VISIT_KEY)) {
      localStorage.setItem(VISIT_KEY, String(Date.now()));
    }
  } catch { /* ignore */ }
}

/** Returns D1/D3/D7 retention status */
export function getRetention(): { d1: boolean; d3: boolean; d7: boolean } {
  if (typeof window === 'undefined') return { d1: false, d3: false, d7: false };
  try {
    const raw = localStorage.getItem(VISIT_KEY);
    if (!raw) return { d1: false, d3: false, d7: false };
    const first = Number(raw);
    const days = (Date.now() - first) / (1000 * 60 * 60 * 24);
    return { d1: days >= 1, d3: days >= 3, d7: days >= 7 };
  } catch { return { d1: false, d3: false, d7: false }; }
}

// ── Convenience wrappers ──

export function trackHomeView() { trackEvent('home_view'); }
export function trackMatchClick(matchId: string) { trackEvent('today_match_click', { matchId }); }
export function trackFeaturedClick() { trackEvent('featured_match_click'); }
export function trackFavoriteClick(team: string) { trackEvent('favorite_click', { team }); }
export function trackTeamView(team: string) { trackEvent('team_page_view', { team }); }
export function trackPlayerView(player: string) { trackEvent('player_page_view', { player }); }
export function trackPredictorStart() { trackEvent('predictor_start'); }
export function trackPredictorFinish() { trackEvent('predictor_finish'); }
export function trackPredictorShare() { trackEvent('predictor_share'); }
