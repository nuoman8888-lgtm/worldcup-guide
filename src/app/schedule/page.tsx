'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PageTracker from '@/components/PageTracker';
import CountryCodeBadge from '@/components/CountryCodeBadge';
import { getTeam } from '@/data/teams';
import { tlaToTeamId } from '@/lib/use-api-data';

/* ── Stage map ── */
const STAGE_LABEL: Record<string, string> = {
  GROUP_STAGE:'小组赛', ROUND_OF_32:'32强', ROUND_OF_16:'16强',
  QUARTER_FINAL:'¼决赛', SEMI_FINAL:'半决赛', THIRD_PLACE:'三四名', FINAL:'决赛',
};

/* ── Date helpers ── */
function beijing(utc: string) {
  const d = new Date(utc);
  const b = new Date(d.getTime() + 8 * 3600000);
  return {
    date: `${b.getUTCFullYear()}-${String(b.getUTCMonth()+1).padStart(2,'0')}-${String(b.getUTCDate()).padStart(2,'0')}`,
    time: `${String(b.getUTCHours()).padStart(2,'0')}:${String(b.getUTCMinutes()).padStart(2,'0')}`,
  };
}
function fmtDate(d: string) {
  const dt = new Date(d + 'T00:00:00');
  const w = ['周日','周一','周二','周三','周四','周五','周六'];
  return `${dt.getMonth()+1}月${dt.getDate()}日 ${w[dt.getDay()]}`;
}

const FILTERS = [
  { v:'all', l:'全部' }, { v:'GROUP_STAGE', l:'小组赛' },
  { v:'ROUND_OF_32', l:'32强' }, { v:'ROUND_OF_16', l:'16强' },
  { v:'QUARTER_FINAL', l:'¼决赛' }, { v:'SEMI_FINAL', l:'半决赛' },
  { v:'THIRD_PLACE', l:'三四名' }, { v:'FINAL', l:'决赛' },
];

/* ── Page ── */
export default function SchedulePage() {
  const [raw, setRaw] = useState<any[] | null>(null);
  const [stage, setStage] = useState('all');
  const [dFilter, setDFilter] = useState('all');
  const [status, setStatus] = useState<'loading'|'error'|'ok'>('loading');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetch('/api/matches')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (cancelled) return;
        const arr = json?.matches;
        if (!arr || !Array.isArray(arr) || arr.length === 0) {
          setStatus('error');
          setErrMsg(`数据异常: matches=${typeof arr} len=${arr?.length ?? 'null'}`);
          return;
        }
        setRaw(arr);
        setStatus('ok');
      })
      .catch(e => {
        if (cancelled) return;
        setStatus('error');
        setErrMsg(e.message || String(e));
      });
    return () => { cancelled = true; };
  }, []);

  // Filter + group
  const groups = useMemo(() => {
    if (!raw) return [];
    let ms = stage === 'all' ? raw : raw.filter((m: any) => m.stage === stage);
    if (dFilter !== 'all') ms = ms.filter((m: any) => beijing(m.utcDate).date === dFilter);
    const map = new Map<string, any[]>();
    ms.forEach((m: any) => {
      const d = beijing(m.utcDate).date;
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(m);
    });
    return [...map.entries()].sort((a,b) => a[0].localeCompare(b[0])).map(([d,ms]) => ({date:d, matches:ms}));
  }, [raw, stage, dFilter]);

  // Date list
  const dates = useMemo(() => {
    if (!raw) return [];
    const s = new Set<string>();
    raw.forEach((m: any) => { const d = beijing(m.utcDate).date; if (d) s.add(d); });
    return [...s].sort();
  }, [raw]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageTracker event="schedule_view" />
      <h1 className="text-2xl font-bold text-gray-900 mb-1">📅 完整赛程</h1>
      <p className="text-gray-500 text-sm mb-4">104场 · 72小组+32淘汰</p>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-hide">
        {FILTERS.map(f => (
          <button key={f.v} onClick={()=>{setStage(f.v);setDFilter('all');}}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${stage===f.v?'bg-navy text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
            {f.l}
          </button>
        ))}
      </div>
      {dates.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-4 mb-2 scrollbar-hide">
          <button onClick={()=>setDFilter('all')} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${dFilter==='all'?'bg-gray-900 text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>全部日期</button>
          {dates.map(d => (
            <button key={d} onClick={()=>setDFilter(d)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${dFilter===d?'bg-gray-900 text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{fmtDate(d)}</button>
          ))}
        </div>
      )}

      {/* Status */}
      {status === 'loading' && <div className="flex justify-center py-20"><div className="animate-spin text-4xl">⚽</div></div>}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-lg mx-auto">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-red-600 font-bold mb-2">数据加载失败</p>
          <p className="text-red-500 text-sm mb-4 font-mono">{errMsg}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2 bg-navy text-white rounded-lg text-sm font-bold">重新加载</button>
        </div>
      )}
      {status === 'ok' && groups.length === 0 && (
        <div className="text-center py-16 text-gray-400">{stage!=='all'?'该阶段暂无比赛':'暂无比赛'}</div>
      )}

      {/* Match grid */}
      {status === 'ok' && groups.length > 0 && (
        <div className="space-y-6">
          {groups.map(g => (
            <div key={g.date}>
              <h2 className="text-lg font-bold text-gray-900 mb-3 sticky top-12 bg-gray-50 py-2 z-10">
                {fmtDate(g.date)}
                <span className="text-xs text-gray-400 font-normal ml-2">{g.matches.length}场</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {g.matches.map((m: any) => {
                  const hi = tlaToTeamId(m.homeTeam?.tla || '');
                  const ai = tlaToTeamId(m.awayTeam?.tla || '');
                  const ht = getTeam(hi); const at = getTeam(ai);
                  const done = m.status === 'FINISHED';
                  const live = m.status === 'IN_PLAY' || m.status === 'LIVE';
                  const bj = beijing(m.utcDate);
                  const mid = `m${(raw||[]).findIndex((x:any)=>x.id===m.id)+1}`;
                  return (
                    <Link key={m.id} href={`/match/${mid || `m${m.id%100}`}`}
                      className={`block rounded-lg border p-3 transition-all ${live?'border-green-300 bg-green-50/50':done?'border-gray-100 bg-gray-50/60':'border-gray-100 bg-white hover:shadow hover:border-navy-600'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1.5">
                          {m.group && <span className="text-[10px] bg-navy text-gold-light px-1.5 py-0.5 rounded font-semibold">{m.group.replace(/^(GROUP_|Group\s)/i,'')}</span>}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${done?'bg-blue-100 text-blue-700':live?'bg-green-500 text-white':'bg-gray-100 text-gray-500'}`}>{done?'完赛':live?'LIVE':STAGE_LABEL[m.stage]||m.stage}</span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{bj.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          {ht ? <CountryCodeBadge teamId={ht.id} size="lg" /> : <span className="text-2xl">❓</span>}
                          <span className="font-semibold text-gray-900 text-xs text-center truncate w-full mt-0.5">{ht?.name || m.homeTeam?.shortName || 'TBD'}</span>
                        </div>
                        <div className="flex-shrink-0 mx-3 text-center min-w-[48px]">
                          {done ? <><span className="text-lg font-bold text-gray-900 tabular-nums">{m.score?.fullTime?.home}-{m.score?.fullTime?.away}</span><div className="text-[9px] text-blue-600 mt-0.5">FT</div></>
                          : live ? <><span className="text-lg font-bold text-green-600 animate-pulse tabular-nums">{m.score?.fullTime?.home??0}-{m.score?.fullTime?.away??0}</span><div className="text-[9px] text-green-600 mt-0.5">LIVE</div></>
                          : <span className="text-sm font-bold text-gray-300">VS</span>}
                        </div>
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          {at ? <CountryCodeBadge teamId={at.id} size="lg" /> : <span className="text-2xl">❓</span>}
                          <span className="font-semibold text-gray-900 text-xs text-center truncate w-full mt-0.5">{at?.name || m.awayTeam?.shortName || 'TBD'}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
