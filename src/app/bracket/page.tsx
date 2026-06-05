import { Metadata } from 'next';
import BracketView from './BracketView';

export const metadata: Metadata = {
  title: '淘汰赛预测器 | 世界杯观赛指南 2026',
  description: '互动式世界杯淘汰赛预测器。逐场选择晋级球队，自动生成你的冠军预测。',
};

export default function BracketPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-[1800px] mx-auto px-4 py-8">
        <BracketView />
      </div>
    </div>
  );
}
