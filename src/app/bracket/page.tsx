import { Metadata } from 'next';
import BracketView from './BracketView';

export const metadata: Metadata = {
  title: '淘汰赛预测器 | 世界杯观赛指南 2026',
  description: '互动式世界杯淘汰赛预测。从16强到决赛，逐场选择晋级球队，生成你的冠军预测',
};

export default function BracketPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/30">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">🏆 淘汰赛预测器</h1>
          <p className="text-gray-500 text-sm">选择每场比赛的晋级球队 · 预测你的世界杯冠军</p>
        </div>
        <BracketView />
      </div>
    </div>
  );
}
