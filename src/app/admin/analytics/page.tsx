'use client';

import { useEffect, useState } from 'react';
import { getAnalyticsLogs, getRetention, initFirstVisit } from '@/lib/analytics';

interface StatCard { label: string; value: string; sub?: string }

export default function AnalyticsPage() {
  const [cards, setCards] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initFirstVisit();
    const logs = getAnalyticsLogs();
    const retention = getRetention();

    // Aggregate stats
    const today = new Date().toDateString();
    const todayLogs = logs.filter(l => new Date(l.ts).toDateString() === today);
    const uniquePages = [...new Set(logs.map(l => l.name))];
    const pageCounts: Record<string, number> = {};
    logs.forEach(l => { pageCounts[l.name] = (pageCounts[l.name] || 0) + 1; });

    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const teamViews = logs.filter(l => l.name === 'team_page_view');
    const teamCounts: Record<string, number> = {};
    teamViews.forEach(l => { const t = (l.data?.team as string) || 'unknown'; teamCounts[t] = (teamCounts[t] || 0) + 1; });
    const topTeams = Object.entries(teamCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const predictorStarts = logs.filter(l => l.name === 'predictor_start').length;
    const predictorFinishes = logs.filter(l => l.name === 'predictor_finish').length;
    const shares = logs.filter(l => l.name === 'predictor_share').length;

    setCards([
      { label: '总事件数', value: String(logs.length) },
      { label: '今日事件', value: String(todayLogs.length) },
      { label: '页面类型', value: String(uniquePages.length) },
      { label: 'AI预测开始', value: String(predictorStarts) },
      { label: 'AI预测完成', value: String(predictorFinishes), sub: predictorStarts > 0 ? Math.round(predictorFinishes / predictorStarts * 100) + '%' : '-' },
      { label: '分享次数', value: String(shares) },
      { label: 'D1留存', value: retention.d1 ? '✅' : '—' },
      { label: 'D3留存', value: retention.d3 ? '✅' : '—' },
      { label: 'D7留存', value: retention.d7 ? '✅' : '—' },
    ]);

    setLoading(false);
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin text-4xl">⚽</div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">📊 数据统计</h1>
      <p className="text-sm text-gray-500 mb-6">基于本地存储的事件数据</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-xs text-gray-400 mb-1">{c.label}</div>
            <div className="text-2xl font-extrabold text-gray-900">{c.value}</div>
            {c.sub && <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-8">
        数据存储在浏览器 localStorage 中，不同设备/浏览器不会共享。接入 Cloudflare Web Analytics 后可查看全量数据。
      </p>
    </div>
  );
}
