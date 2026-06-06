import type { Metadata } from 'next';
import { getSimulatedStandings } from '@/data/standings';
import StandingsView from './StandingsView';

export const metadata: Metadata = {
  title: '小组积分榜 | 世界杯 2026',
  description: '2026美加墨世界杯12个小组积分榜。48支球队实时排名，前2名直接晋级32强，8个最佳第3名晋级。',
};

export default function StandingsPage() {
  const allStandings = getSimulatedStandings();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 小组积分榜</h1>
        <p className="text-gray-500 text-sm">
          12个小组 · 每组前2名直接晋级32强 · 8个最佳第3名晋级
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">数据待更新</span>
        </p>
      </div>

      {/* Tabbed group tables */}
      <StandingsView standings={allStandings} />

      {/* Rules */}
      <div className="mt-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">📋 晋级规则</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-qualify mt-1.5 shrink-0" />
              <span><strong>直接晋级</strong>：12个小组前2名（共24队）直接进入32强</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-playoff mt-1.5 shrink-0" />
              <span><strong>最佳第3名</strong>：8个成绩最好的小组第3名晋级32强</span>
            </div>
          </div>
          <div className="space-y-2">
            <p>• <strong>排名规则</strong>：积分 → 净胜球 → 进球数 → 相互战绩 → 公平竞赛积分</p>
            <p>• <strong>淘汰赛</strong>：单场淘汰制，平局 → 加时 → 点球</p>
          </div>
        </div>
      </div>
    </div>
  );
}
