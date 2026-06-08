import { Metadata } from 'next';
import BracketClient from './BracketClient';

export const metadata: Metadata = {
  title: '淘汰赛预测器 | 世界杯观赛指南 2026',
  description: '互动式世界杯淘汰赛预测器。逐场选择晋级球队，自动生成你的冠军预测。',
};

export default function BracketPage() {
  return (
    <div className="min-h-screen bg-[#0c1a2d]">
      <div className="max-w-full mx-auto px-3 sm:px-4 py-4 md:py-6">
        <BracketClient />
      </div>
    </div>
  );
}
