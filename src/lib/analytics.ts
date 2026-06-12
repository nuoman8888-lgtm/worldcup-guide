'use client';

// ── Analytics — Cloudflare Web Analytics + localStorage fallback ──
//
// 1. Cloudflare Web Analytics (primary):
//    The beacon script in layout.tsx auto-collects PV, UV, top pages,
//    referrers, countries, etc.  The cf_beacon.push() calls below send
//    custom events.  View all data at:
//    https://dash.cloudflare.com → 域名 → Analytics → Web Analytics
//
// 2. localStorage (secondary / quick local view):
//    Stores last 500 events so /admin/analytics has an instant preview.
//    This is your own data only; for global stats see Cloudflare.

const STORAGE_KEY = 'wc_analytics';
const VISIT_KEY = 'wc_first_visit';

interface LogEntry {
  name: string;
  data?: Record<string, unknown>;
  ts: number;
}

/** Track a custom event → Cloudflare Web Analytics + localStorage */
export function trackEvent(name: string, data?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  // 1. Cloudflare Web Analytics custom event
  if ((window as any).cf_beacon) {
    try {
      (window as any).cf_beacon.push([name, data || {}]);
    } catch { /* ignore */ }
  }

  // 2. localStorage backup (quick local preview for /admin/analytics)
  try {
    const logs = getLogs();
    logs.push({ name, data, ts: Date.now() });
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch { /* ignore */ }
}

function getLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAnalyticsLogs(): LogEntry[] {
  if (typeof window === 'undefined') return [];
  return getLogs();
}

// ── First visit tracking ──

export function initFirstVisit(): void {
  if (typeof window === 'undefined') return;
  try {
    if (!localStorage.getItem(VISIT_KEY)) {
      localStorage.setItem(VISIT_KEY, String(Date.now()));
    }
  } catch { /* ignore */ }
}

export function getRetention(): { d1: boolean; d3: boolean; d7: boolean } {
  if (typeof window === 'undefined') return { d1: false, d3: false, d7: false };
  try {
    const raw = localStorage.getItem(VISIT_KEY);
    if (!raw) return { d1: false, d3: false, d7: false };
    const days = (Date.now() - Number(raw)) / (1000 * 60 * 60 * 24);
    return { d1: days >= 1, d3: days >= 3, d7: days >= 7 };
  } catch {
    return { d1: false, d3: false, d7: false };
  }
}

// ── Convenience wrappers ──

export function trackHomeView() { trackEvent('home_view'); }
export function trackMatchClick(matchId: string) { trackEvent('match_click', { matchId }); }
export function trackFeaturedClick() { trackEvent('featured_match_click'); }
export function trackFavoriteClick(team: string) { trackEvent('favorite_click', { team }); }
export function trackTeamView(team: string) { trackEvent('team_page_view', { team }); }
export function trackPlayerView(player: string) { trackEvent('player_page_view', { player }); }
export function trackPredictorStart() { trackEvent('predictor_start'); }
export function trackPredictorFinish() { trackEvent('predictor_finish'); }
export function trackPredictorShare() { trackEvent('predictor_share'); }
export function trackBracketView() { trackEvent('bracket_view'); }
export function trackAiPageView() { trackEvent('ai_page_view'); }
