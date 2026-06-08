import { Metadata } from 'next';
import BracketClient from './BracketClient';

export const metadata: Metadata = {
  title: '淘汰赛预测器 | 世界杯观赛指南 2026',
  description: '互动式世界杯淘汰赛预测器。逐场选择晋级球队，自动生成你的冠军预测。',
};

export default function BracketPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950">
      <div className="max-w-full mx-auto px-2 sm:px-4 py-6 md:py-8">
        <BracketClient />
      </div>
    </div>
  );
}
