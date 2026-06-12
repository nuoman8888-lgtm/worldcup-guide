'use client';

import { useEffect, useState } from 'react';
import { getAnalyticsLogs, getRetention, initFirstVisit } from '@/lib/analytics';

interface StatCard { label: string; value: string; sub?: string }

export default function AnalyticsPage() {
  const [cards, setCards] = useState<StatCard[]>([]);
  const [topPages, setTopPages] = useState<[string, number][]>([]);
  const [topTeams, setTopTeams] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    initFirstVisit();
    const logs = getAnalyticsLogs();
    const retention = getRetention();

    if (logs.length === 0) {
      setIsEmpty(true);
      setLoading(false);
      return;
    }

    // ── Summary cards ──
    const today = new Date().toDateString();
    const todayLogs = logs.filter((l) => new Date(l.ts).toDateString() === today);
    const uniquePages = [...new Set(logs.map((l) => l.name))];

    const pStart = logs.filter((l) => l.name === 'predictor_start').length;
    const pFinish = logs.filter((l) => l.name === 'predictor_finish').length;
    const shares = logs.filter((l) => l.name === 'predictor_share').length;
    const bracketViews = logs.filter((l) => l.name === 'bracket_view').length;
    const aiViews = logs.filter((l) => l.name === 'ai_page_view').length;

    setCards([
      { label: '📊 总事件数', value: String(logs.length) },
      { label: '📅 今日事件', value: String(todayLogs.length) },
      { label: '📄 事件类型', value: String(uniquePages.length) },
      { label: '🔮 淘汰赛预测', value: String(bracketViews) },
      { label: '🤖 AI预测点击', value: String(pStart) },
      {
        label: '✅ AI预测完成',
        value: String(pFinish),
        sub: pStart > 0 ? `完成率 ${Math.round((pFinish / pStart) * 100)}%` : '-',
      },
      { label: '📤 分享次数', value: String(shares) },
      { label: '🤖 AI页面访问', value: String(aiViews) },
      { label: '🔄 D1 留存', value: retention.d1 ? '✅ 已回访' : '—' },
      { label: '📆 D7 留存', value: retention.d7 ? '✅ 已回访' : '—' },
    ]);

    // ── Top pages ──
    const pageCounts: Record<string, number> = {};
    logs.forEach((l) => {
      pageCounts[l.name] = (pageCounts[l.name] || 0) + 1;
    });
    setTopPages(
      Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    );

    // ── Top teams ──
    const teamViews = logs.filter((l) => l.name === 'team_page_view');
    const teamCounts: Record<string, number> = {};
    teamViews.forEach((l) => {
      const t = (l.data?.team as string) || '?';
      teamCounts[t] = (teamCounts[t] || 0) + 1;
    });
    setTopTeams(
      Object.entries(teamCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    );

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin text-4xl">⚽</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">📊 数据统计</h1>
      <p className="text-sm text-gray-500 mb-6">
        💻 当前展示本设备本地数据 · 全量统计请查看下方说明
      </p>

      {/* ═══════ Cloudflare banner ═══════ */}
      <a
        href="https://dash.cloudflare.com"
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-8 p-5 bg-gradient-to-r from-navy to-navy-light rounded-xl text-white hover:shadow-lg transition-shadow group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-lg mb-1">
              🌐 Cloudflare Web Analytics — 全量统计
            </div>
            <p className="text-sm text-gray-300">
              PV · UV · 热门页面 · 来源渠道 · 国家分布 · 设备类型
            </p>
          </div>
          <span className="text-gold group-hover:translate-x-1 transition-transform text-2xl">→</span>
        </div>
      </a>

      {/* ═══════ Summary cards ═══════ */}
      {!isEmpty && (
        <>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
            本设备数据预览
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {cards.map((c) => (
              <div
                key={c.label}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
              >
                <div className="text-[11px] text-gray-400 mb-1">{c.label}</div>
                <div className="text-xl font-extrabold text-gray-900">{c.value}</div>
                {c.sub && (
                  <div className="text-[10px] text-gray-400 mt-0.5">{c.sub}</div>
                )}
              </div>
            ))}
          </div>

          {/* Top pages + Top teams */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {topPages.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-2">📄 热门事件</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {topPages.map(([name, count], i) => (
                    <div
                      key={name}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-300 w-5">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 font-mono text-xs">{name}</span>
                      </div>
                      <span className="text-gray-900 font-bold tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {topTeams.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-2">⚽ 热门球队</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {topTeams.map(([team, count], i) => (
                    <div
                      key={team}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-300 w-5">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 font-mono text-xs">{team}</span>
                      </div>
                      <span className="text-gray-900 font-bold tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-bold text-gray-500 mb-1">暂无本地数据</p>
          <p className="text-sm">浏览网站页面后，数据会自动出现在这里</p>
        </div>
      )}

      {/* ═══════ Setup guide ═══════ */}
      <div className="p-6 bg-amber-50 rounded-xl border border-amber-100">
        <h3 className="font-bold text-gray-900 mb-3">
          📖 如何查看全量统计数据？
        </h3>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <div className="font-semibold mb-1">
              方式一：Cloudflare Web Analytics（推荐）
            </div>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 text-xs">
              <li>
                登录{' '}
                <a
                  href="https://dash.cloudflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-dark underline"
                >
                  Cloudflare Dashboard
                </a>
              </li>
              <li>选择你的域名 → <strong>Analytics</strong> → <strong>Web Analytics</strong></li>
              <li>查看 PV、UV、热门页面、来源、国家、设备等全量数据</li>
              <li>
                在 <code className="bg-amber-100 px-1 rounded">src/app/layout.tsx</code> 中
                替换 <code className="bg-amber-100 px-1 rounded">YOUR_CF_TOKEN_HERE</code> 为
                你的 Beacon Token 后，自定义事件（AI预测、分享等）也会出现在后台
              </li>
            </ol>
          </div>
          <div>
            <div className="font-semibold mb-1">
              方式二：Google Analytics（备选）
            </div>
            <p className="text-xs text-gray-600">
              在 <code className="bg-amber-100 px-1 rounded">layout.tsx</code> 中添加 GA4
              的 <code className="bg-amber-100 px-1 rounded">&lt;Script&gt;</code> 标签即可。
              同样能统计 PV、UV、热门页面和自定义事件。
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        上方"本设备数据预览"仅显示当前浏览器本地记录 · 不同设备的浏览数据互相独立
      </p>
    </div>
  );
}
