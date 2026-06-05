import { Metadata } from 'next';
import BracketView from './BracketView';

export const metadata: Metadata = {
  title: '淘汰赛对阵图 | 世界杯观赛指南 2026',
  description: '互动式世界杯淘汰赛对阵图，从16强到决赛，点击预测每轮胜者，自动生成冠军预测',
};

export default function BracketPage() {
  return (
    <div className="min-h-screen bg-navy">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">🏆 淘汰赛对阵图</h1>
          <p className="text-gray-400 text-sm">点击比赛选择胜者 · 自动推进 · 预测你的冠军</p>
        </div>
        <BracketView />
      </div>
    </div>
  );
}
