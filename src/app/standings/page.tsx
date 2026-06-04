import { getSimulatedStandings } from '@/data/standings';
import GroupTable from '@/components/GroupTable';

export default function StandingsPage() {
  const standings = getSimulatedStandings();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 小组积分榜</h1>
        <p className="text-gray-500 text-sm">
          12个小组 · 每组前2名+8个最佳第3名晋级32强
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">模拟数据</span>
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {standings.map(group => (
          <GroupTable key={group.groupName} data={group} />
        ))}
      </div>

      <div className="mt-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">📋 晋级规则说明</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>小组赛排名</strong>：积分 → 净胜球 → 进球数 → 相互战绩 → 公平竞赛积分 → 抽签</p>
          <p>• <strong>32强晋级</strong>：12个小组前2名（24队） + 成绩最好的8个小组第3名</p>
          <p>• <strong>淘汰赛</strong>：单场淘汰制，常规时间打平进入加时赛，仍平局则点球决胜</p>
          <p>• <strong>最佳第3名</strong>：比较各小组第3名的积分、净胜球、进球数</p>
        </div>
      </div>
    </div>
  );
}
