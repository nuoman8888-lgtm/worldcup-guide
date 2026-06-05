import { Metadata } from 'next';
import BracketView from './BracketView';

export const metadata: Metadata = {
  title: '淘汰赛预测树 | 世界杯观赛指南 2026',
  description: '互动式世界杯淘汰赛预测，点击选择胜者，自动生成冠军预测',
};

export default function BracketPage() {
  return (
    <div className="max-w-full mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🏆 淘汰赛预测树</h1>
        <p className="text-gray-500 text-sm mt-1">
          点击比赛选择胜者 · 自动推进下一轮 · 预测你的冠军
        </p>
      </div>
      <BracketView />
    </div>
  );
}
