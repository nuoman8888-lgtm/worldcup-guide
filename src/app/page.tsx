'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageTracker from '@/components/PageTracker';
import { CountdownBar } from '@/components/CountdownBar';
import CountryCodeBadge from '@/components/CountryCodeBadge';
import { MyTeamWidget } from '@/components/MyTeamWidget';
import MyTeamModal from '@/components/MyTeamModal';
import { getTeam } from '@/data/teams';
import { allMatches as staticMatches } from '@/data/matches';
import { predictMatchAdvanced } from '@/lib/ai';
import { getStats, recordPrediction, checkResults } from '@/lib/prediction-tracker';

/* ── inline helpers ── */
function bj(u: string) { try { const d = new Date(u), b = new Date(d.getTime()+8*3600000); return { date: `${b.getUTCFullYear()}-${String(b.getUTCMonth()+1).padStart(2,'0')}-${String(b.getUTCDate()).padStart(2,'0')}`, time: `${String(b.getUTCHours()).padStart(2,'0')}:${String(b.getUTCMinutes()).padStart(2,'0')}` }; } catch { return { date: '', time: '' }; } }
function ng(r: string|null) { return r ? r.replace(/^(GROUP_|Group\s)/i,'').trim() : ''; }
function tb() { return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
const TL: Record<string,string> = {MEX:'mexico',KOR:'south-korea',CZE:'czech',RSA:'south-africa',CAN:'canada',QAT:'qatar',SUI:'switzerland',BIH:'bosnia',BRA:'brazil',HAI:'haiti',SCO:'scotland',MAR:'morocco',USA:'usa',AUS:'australia',TUR:'turkey',PAR:'paraguay',GER:'germany',CIV:'ivory-coast',ECU:'ecuador',CUW:'curacao',NED:'netherlands',SWE:'sweden',TUN:'tunisia',JPN:'japan',BEL:'belgium',IRN:'iran',NZL:'new-zealand',EGY:'egypt',ESP:'spain',KSA:'saudi-arabia',URY:'uruguay',CPV:'cape-verde',FRA:'france',IRQ:'iraq',NOR:'norway',SEN:'senegal',ARG:'argentina',AUT:'austria',JOR:'jordan',ALG:'algeria',POR:'portugal',UZB:'uzbekistan',COL:'colombia',COD:'dr-congo',ENG:'england',GHA:'ghana',PAN:'panama',CRO:'croatia'};
function ti(tla: string) { return TL[tla] || tla?.toLowerCase() || ''; }

export default function HomePage() {
  const [raw, setRaw] = useState<any[]>([]);
  const [st, setSt] = useState<any[]>([]);
  const [ag, setAg] = useState('A');
  const [as, setAs] = useState<'loading'|'ok'|'err'>('loading');

  useEffect(() => {
    Promise.all([
      fetch('/api/matches').then(r => r.ok?r.json():null),
      fetch('/api/standings').then(r => r.ok?r.json():null),
    ]).then(([mj,sj]) => {
      if (mj?.matches) { setRaw(mj.matches); checkResults(mj.matches); }
      if (sj?.standings) setSt(sj.standings);
      setAs('ok');
    }).catch(() => setAs('err'));
  }, []);

  // Merge: static data for initial display, API data for real-time updates
  const all = raw.length > 0 ? raw : staticMatches.map((m: any, i: number) => ({
    id: i + 537300, utcDate: `${m.date}T${m.time}:00+08:00`,
    status: 'SCHEDULED', matchday: 1, stage: m.stage === 'group' ? 'GROUP_STAGE' : m.stage?.toUpperCase(),
    group: m.group ? `GROUP_${m.group}` : null,
    homeTeam: { tla: m.homeTeamId === 'TBD' ? 'TBD' : Object.entries(TL).find(([k,v]) => v === m.homeTeamId)?.[0] || m.homeTeamId.toUpperCase(), shortName: m.homeTeamId, name: m.homeTeamId },
    awayTeam: { tla: m.awayTeamId === 'TBD' ? 'TBD' : Object.entries(TL).find(([k,v]) => v === m.awayTeamId)?.[0] || m.awayTeamId.toUpperCase(), shortName: m.awayTeamId, name: m.awayTeamId },
    score: { winner: null, fullTime: { home: null, away: null } },
  }));
  const today = tb();
  const todayAll = all.filter((m:any) => bj(m.utcDate).date === today);
  const upcoming = todayAll.filter((m:any) => m.status !== 'FINISHED');
  const finished = todayAll.filter((m:any) => m.status === 'FINISHED');

  // Build AI predictions for all upcoming matches
  const matchPreds = new Map<number, any>();
  upcoming.forEach((m:any) => {
    const hi = ti(m.homeTeam?.tla), ai = ti(m.awayTeam?.tla);
    const h = getTeam(hi), a = getTeam(ai);
    if (h && a) {
      const p = predictMatchAdvanced(h.id, a.id);
      if (p) matchPreds.set(m.id, p);
    }
  });

  // Record predictions for tracking
  useEffect(() => {
    upcoming.forEach((m:any) => {
      const p = matchPreds.get(m.id);
      if (p) recordPrediction(m.id, p.winner, p.topScores[0]?.home ?? 0, p.topScores[0]?.away ?? 0);
    });
  }, [upcoming, matchPreds]);

  const stats = getStats();
  const groups = st.filter((s:any) => s.type==='TOTAL' && s.group);
  const ags = groups.find((g:any) => ng(g.group)===ag);

  // AI精选推荐
  const hero = upcoming[0];
  const heroPred = hero ? matchPreds.get(hero.id) : null;

  // 最稳: highest confidence among upcoming
  const allUpcoming = all.filter((m:any) => m.status !== 'FINISHED');
  const allPreds = allUpcoming.map((m:any) => {
    const hi = ti(m.homeTeam?.tla), ai = ti(m.awayTeam?.tla);
    const h = getTeam(hi), a = getTeam(ai);
    if (!h || !a) return null;
    const p = predictMatchAdvanced(h.id, a.id);
    return p ? { match: m, pred: p } : null;
  }).filter(Boolean);

  const bestBet = [...allPreds].sort((a:any,b:any) => b.pred.confidence - a.pred.confidence)[0];
  const upset = [...allPreds].filter((x:any) => x.pred.confidence < 55).sort((a:any,b:any) => a.pred.confidence - b.pred.confidence)[0];
  const over25 = [...allPreds].filter((x:any) => (x.pred.topScores[0]?.home||0)+(x.pred.topScores[0]?.away||0) >= 3)[0];

  const midIdx = (id: number) => { const i = all.findIndex((x:any) => x.id === id); return i >= 0 ? `m${i+1}` : `m${id%100}`; };

  return (
    <div className="min-h-screen" style={{background:'linear-gradient(180deg, #081224 0%, #0b1730 40%, #0d1b3d 100%)'}}>
      <PageTracker event="home_view" /><MyTeamModal />
      <section className="bg-[#040810] border-b border-white/[0.06]"><div className="max-w-7xl mx-auto px-3 py-2"><CountdownBar /></div></section>
      {as === 'err' && <div className="max-w-7xl mx-auto px-3 py-1.5"><div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center text-red-400 text-xs">⚠️ 数据加载失败，显示缓存数据</div></div>}

      {/* ═══════ Hero ═══════ */}
      <section className="max-w-7xl mx-auto px-3 py-4 relative">
        {/* Radial glow behind hero */}
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(circle at 50% 30%, rgba(59,130,246,0.08) 0%, transparent 60%)'}} />
        {hero && heroPred ? (() => { const m = hero; const p = heroPred; const hi=ti(m.homeTeam?.tla), ai=ti(m.awayTeam?.tla); const h=getTeam(hi), a=getTeam(ai); return (
          <div className="relative bg-navy/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] bg-gold/20 text-gold px-2.5 py-1 rounded-full font-bold">今日焦点</span>
                {m.group && <span className="text-[11px] bg-white/10 text-white/60 px-2 py-0.5 rounded">{ng(m.group)}组</span>}
                <span className="text-[11px] text-white/30 ml-auto">{bj(m.utcDate).date} {bj(m.utcDate).time}</span>
              </div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-4xl sm:text-5xl mb-2">{h?.flag}</span>
                  <h2 className="text-white font-extrabold text-lg sm:text-xl">{h?.name||m.homeTeam?.shortName}</h2>
                  <p className="text-white/30 text-[11px] mt-0.5">{h ? `FIFA #${h.fifaRank} · ELO ${h.elo}` : ''}</p>
                </div>
                <div className="flex-shrink-0 mx-6 sm:mx-10 text-center">
                  <div className="text-3xl sm:text-4xl font-extrabold text-white/10 mb-3">VS</div>
                  <div className="flex gap-3 justify-center">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1.5 text-center">
                      <div className="text-[9px] text-purple-400 mb-0.5">Claude</div>
                      <div className="text-sm font-bold text-purple-300 font-mono">{p.claude.predictedScore}</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 text-center">
                      <div className="text-[9px] text-blue-400 mb-0.5">千问</div>
                      <div className="text-sm font-bold text-blue-300 font-mono">{p.qwen.predictedScore}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-4xl sm:text-5xl mb-2">{a?.flag}</span>
                  <h2 className="text-white font-extrabold text-lg sm:text-xl">{a?.name||m.awayTeam?.shortName}</h2>
                  <p className="text-white/30 text-[11px] mt-0.5">{a ? `FIFA #${a.fifaRank} · ELO ${a.elo}` : ''}</p>
                </div>
              </div>
              {/* Win probability bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
                  <span>{h?.name||'?'} {p.homeWinProb}%</span>
                  <span>平 {p.drawProb}%</span>
                  <span>{a?.name||'?'} {p.awayWinProb}%</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500/70" style={{width:`${p.homeWinProb}%`}} />
                  <div className="bg-white/10" style={{width:`${p.drawProb}%`}} />
                  <div className="bg-orange-500/70" style={{width:`${p.awayWinProb}%`}} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gold font-bold">{p.winner}胜</span>
                  <span className="text-white/30">置信度 {p.confidence}%</span>
                </div>
                <div className="flex gap-1.5">
                  {p.topScores.map((s: any, i: number) => (
                    <span key={i} className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${i===0?'bg-gold/20 text-gold':'bg-white/[0.06] text-white/40'}`}>{s.home}:{s.away}</span>
                  ))}
                </div>
              </div>
            </div>
            <Link href={`/match/${midIdx(m.id)}`} className="block text-center py-2.5 bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-gold text-xs font-medium transition-colors">查看完整 AI 分析 →</Link>
          </div>
        );})() : (
          <div className="bg-navy/80 backdrop-blur-xl rounded-2xl border border-white/10 p-16 text-center text-white/20"><div className="text-5xl mb-4">⚽</div><p className="text-lg">今日无焦点比赛</p><Link href="/schedule" className="text-gold text-sm hover:underline mt-3 inline-block">浏览赛程 →</Link></div>
        )}
      </section>

      {/* ═══════ AI精选推荐 ═══════ */}
      {bestBet && (
        <section className="max-w-7xl mx-auto px-3 py-2">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">🔥 AI精选推荐</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {/* Best bet */}
            {bestBet && (() => { const m=bestBet.match, p=bestBet.pred; const hi=ti(m.homeTeam?.tla), ai=ti(m.awayTeam?.tla); const h=getTeam(hi), a=getTeam(ai); return (
              <Link href={`/match/${midIdx(m.id)}`} className="bg-gradient-to-br from-emerald-900/30 via-emerald-950/20 to-navy/80 backdrop-blur-sm rounded-xl border border-emerald-500/25 p-4 hover:border-emerald-400/50 transition-all group shadow-lg shadow-emerald-900/10">
                <div className="text-[10px] text-emerald-300 font-bold mb-2 flex items-center gap-1">🎯 今日最稳</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white text-xs font-bold">{h?.name||m.homeTeam?.shortName}</span>
                  <span className="text-white/20 text-[10px]">VS</span>
                  <span className="text-white text-xs font-bold">{a?.name||m.awayTeam?.shortName}</span>
                </div>
                <div className="text-2xl font-extrabold text-green-400 mb-1">{p.winner}胜</div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/40">置信度 {p.confidence}%</span>
                  <span className="text-[10px] text-green-400/60 font-mono">{p.claude.predictedScore} / {p.qwen.predictedScore}</span>
                </div>
              </Link>
            );})()}
            {/* Upset */}
            {upset && (() => { const m=upset.match, p=upset.pred; const hi=ti(m.homeTeam?.tla), ai=ti(m.awayTeam?.tla); const h=getTeam(hi), a=getTeam(ai); return (
              <Link href={`/match/${midIdx(m.id)}`} className="bg-gradient-to-br from-amber-900/30 via-amber-950/20 to-navy/80 backdrop-blur-sm rounded-xl border border-amber-500/25 p-4 hover:border-amber-400/50 transition-all group shadow-lg shadow-amber-900/10">
                <div className="text-[10px] text-amber-300 font-bold mb-2 flex items-center gap-1">⚡ 今日冷门</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white text-xs font-bold">{h?.name||m.homeTeam?.shortName}</span>
                  <span className="text-white/20 text-[10px]">VS</span>
                  <span className="text-white text-xs font-bold">{a?.name||m.awayTeam?.shortName}</span>
                </div>
                <div className="text-2xl font-extrabold text-orange-400 mb-1">{p.winner}胜</div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/40">仅 {p.confidence}% 把握</span>
                  <span className="text-[10px] text-orange-400/60 font-mono">{p.claude.predictedScore} / {p.qwen.predictedScore}</span>
                </div>
              </Link>
            );})()}
            {/* Over 2.5 */}
            {over25 ? (() => { const m=over25.match, p=over25.pred; const hi=ti(m.homeTeam?.tla), ai=ti(m.awayTeam?.tla); const h=getTeam(hi), a=getTeam(ai); return (
              <Link href={`/match/${midIdx(m.id)}`} className="bg-gradient-to-br from-sky-900/30 via-sky-950/20 to-navy/80 backdrop-blur-sm rounded-xl border border-sky-500/25 p-4 hover:border-sky-400/50 transition-all group shadow-lg shadow-sky-900/10">
                <div className="text-[10px] text-sky-300 font-bold mb-2 flex items-center gap-1">⚽ 今日大球</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white text-xs font-bold">{h?.name||m.homeTeam?.shortName}</span>
                  <span className="text-white/20 text-[10px]">VS</span>
                  <span className="text-white text-xs font-bold">{a?.name||m.awayTeam?.shortName}</span>
                </div>
                <div className="text-2xl font-extrabold text-blue-400 mb-1">{(p.topScores[0]?.home||0)+(p.topScores[0]?.away||0)}+ 球</div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/40">预计进球 3+</span>
                  <span className="text-[10px] text-blue-400/60 font-mono">{p.claude.predictedScore} / {p.qwen.predictedScore}</span>
                </div>
              </Link>
            );})() : (
              <div className="bg-navy/60 backdrop-blur-sm rounded-xl border border-white/[0.06] p-4 text-center text-white/20 text-sm flex items-center justify-center">暂无大球推荐</div>
            )}
          </div>
        </section>
      )}

      {/* ═══════ 今日赛程 (每场带AI) ═══════ */}
      {upcoming.length > (hero ? 1 : 0) && (
        <section className="max-w-7xl mx-auto px-3 py-3">
          <h2 className="text-sm font-bold text-white mb-3">📅 今日赛程</h2>
          <div className="space-y-1.5">
            {upcoming.filter((m:any) => m.id !== hero?.id).map((m:any) => {
              const hi=ti(m.homeTeam?.tla), ai=ti(m.awayTeam?.tla);
              const h=getTeam(hi), a=getTeam(ai);
              const pred = matchPreds.get(m.id);
              const live = m.status==='IN_PLAY'||m.status==='LIVE';
              return (
                <Link key={m.id} href={`/match/${midIdx(m.id)}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${live?'bg-green-500/5 border border-green-500/20':'hover:bg-white/[0.04]'}`}>
                  <div className="w-11 text-center shrink-0">
                    <div className="text-xs font-bold text-white/70 font-mono">{bj(m.utcDate).time}</div>
                    {live && <div className="text-[9px] text-green-400 font-bold animate-pulse mt-0.5">LIVE</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">
                    <span className="text-white/80 text-xs font-medium truncate max-w-[80px] text-right">{h?.name||m.homeTeam?.shortName}</span>
                    {h && <CountryCodeBadge teamId={h.id} size="sm" />}
                    <span className="text-white/15 text-[10px] font-bold shrink-0 mx-0.5">VS</span>
                    {a && <CountryCodeBadge teamId={a.id} size="sm" />}
                    <span className="text-white/80 text-xs font-medium truncate max-w-[80px]">{a?.name||m.awayTeam?.shortName}</span>
                  </div>
                  {pred && (
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-gold font-medium">{pred.winner}胜</span>
                      <div className="w-16 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-gold/60 rounded-full" style={{width:`${pred.confidence}%`}} />
                      </div>
                      <span className="text-[10px] text-white/30 font-mono">{pred.topScores[0]?.home}:{pred.topScores[0]?.away}</span>
                    </div>
                  )}
                  <span className="text-white/10 group-hover:text-gold transition-colors text-sm shrink-0">→</span>
                </Link>
              );
            })}
          </div>
          {upcoming.length === 0 && <div className="text-white/20 text-sm text-center py-6">今日暂无比赛</div>}
        </section>
      )}

      {/* ═══════ 今日赛果 ═══════ */}
      {finished.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 py-3">
          <h2 className="text-sm font-bold text-white mb-3">✅ 今日赛果</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {finished.map((m:any) => {
              const hi=ti(m.homeTeam?.tla), ai=ti(m.awayTeam?.tla);
              const h=getTeam(hi), a=getTeam(ai);
              return (
                <Link key={m.id} href={`/match/${midIdx(m.id)}`} className="bg-white/[0.04] rounded-lg p-3 text-center hover:bg-white/[0.04] border border-white/[0.02] transition-colors">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-white/70 text-xs truncate max-w-[60px]">{h?.name||m.homeTeam?.shortName}</span>
                    {h && <CountryCodeBadge teamId={h.id} size="sm" />}
                  </div>
                  <div className="text-xl font-extrabold text-white tabular-nums mb-1.5">{m.score?.fullTime?.home}-{m.score?.fullTime?.away}</div>
                  <div className="flex items-center justify-center gap-2">
                    {a && <CountryCodeBadge teamId={a.id} size="sm" />}
                    <span className="text-white/70 text-xs truncate max-w-[60px]">{a?.name||m.awayTeam?.shortName}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════ 积分榜 + MyTeam + AI战绩 (3-col) ═══════ */}
      <section className="max-w-7xl mx-auto px-3 py-3">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Standings (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-navy/80 backdrop-blur-xl rounded-xl border border-white/[0.06]">
              <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">📊 小组积分榜</h2>
                <Link href="/standings" className="text-[10px] text-gold hover:underline">全部 →</Link>
              </div>
              <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-hide border-b border-white/[0.06]">
                {groups.map((g:any) => { const n=ng(g.group); return <button key={g.group} onClick={()=>setAg(n)} className={`shrink-0 w-8 h-8 rounded-lg text-xs font-bold ${ag===n?'bg-gold text-[#080c14]':'text-white/40 hover:text-white/70'}`}>{n}</button>; })}
              </div>
              {ags && (
                <div className="overflow-x-auto"><table className="w-full text-xs">
                  <thead><tr className="text-white/25 border-b border-white/[0.06]"><th className="text-left py-2 pl-4 w-6">#</th><th className="text-left py-2">球队</th><th className="text-center py-2 w-7">赛</th><th className="text-center py-2 w-7">胜</th><th className="text-center py-2 w-7">平</th><th className="text-center py-2 w-7">负</th><th className="text-center py-2 w-12 hidden sm:table-cell">进/失</th><th className="text-center py-2 w-7 hidden sm:table-cell">净胜</th><th className="text-center py-2 pr-4 w-7 font-bold text-white/50">分</th></tr></thead>
                  <tbody>{ags.table.map((row:any,i:number)=>{const tid=ti(row.team?.tla);const t=getTeam(tid);return(<tr key={row.team?.tla} className={`border-b border-white/[0.02] ${i<2?'bg-white/[0.04]':''}`}><td className="py-2 pl-4"><span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${i<2?'bg-green-500/20 text-green-400':i===2?'bg-blue-500/20 text-blue-400':'text-white/25'}`}>{row.position}</span></td><td className="py-2"><Link href={`/team/${tid}`} className="flex items-center gap-1.5 hover:text-gold"><span className="text-sm">{t?.flag}</span><span className="text-white/80 font-medium">{t?.name||row.team?.shortName}</span></Link></td><td className="text-center py-2 text-white/45">{row.playedGames}</td><td className="text-center py-2 text-white/45">{row.won}</td><td className="text-center py-2 text-white/45">{row.draw}</td><td className="text-center py-2 text-white/45">{row.lost}</td><td className="text-center py-2 text-white/35 hidden sm:table-cell">{row.goalsFor}-{row.goalsAgainst}</td><td className="text-center py-2 hidden sm:table-cell"><span className={row.goalDifference>0?'text-green-400':row.goalDifference<0?'text-red-400':'text-white/25'}>{row.goalDifference>0?'+':''}{row.goalDifference}</span></td><td className="text-center py-2 pr-4 font-bold text-white">{row.points}</td></tr>);})}</tbody>
                </table></div>
              )}
            </div>
          </div>

          {/* Right: MyTeam + AI战绩 */}
          <div className="space-y-4">
            <MyTeamWidget />
            <div className="bg-navy/80 backdrop-blur-xl rounded-xl border border-white/[0.06] p-4">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">🤖 AI预测战绩</h3>
              {stats.total > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.04] rounded-lg p-3 text-center">
                      <div className="text-2xl font-extrabold text-white tabular-nums">{stats.total}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">累计预测</div>
                    </div>
                    <div className="bg-white/[0.04] rounded-lg p-3 text-center">
                      <div className="text-2xl font-extrabold text-green-400 tabular-nums">{stats.winHitPct}%</div>
                      <div className="text-[10px] text-white/30 mt-0.5">胜负命中</div>
                    </div>
                  </div>
                  <div className="bg-white/[0.04] rounded-lg p-3 text-center">
                    <div className="text-2xl font-extrabold text-gold tabular-nums">{stats.scoreHitPct}%</div>
                    <div className="text-[10px] text-white/30 mt-0.5">比分命中</div>
                  </div>
                  {stats.recent.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[9px] text-white/20 uppercase tracking-wider">最近预测</div>
                      {stats.recent.slice(0,3).map((r:any,i:number) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                          <span className="text-white/50">#{r.matchId}</span>
                          <span className="font-mono text-white/30">{r.predicted.homeScore}:{r.predicted.awayScore}</span>
                          <span className="font-mono text-white/30">→</span>
                          <span className={`font-mono font-bold ${r.actual ? (r.predicted.homeScore===r.actual.homeScore&&r.predicted.awayScore===r.actual.awayScore ? 'text-green-400' : r.predicted.homeScore>r.predicted.awayScore===r.actual.homeScore>r.actual.awayScore ? 'text-yellow-400' : 'text-red-400') : 'text-white/20'}`}>
                            {r.actual ? `${r.actual.homeScore}:${r.actual.awayScore}` : '待定'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-white/15 text-xs">比赛结束后<br/>自动统计AI预测准确率</div>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="pb-6" />
    </div>
  );
}
