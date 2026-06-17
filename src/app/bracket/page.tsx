import { Metadata } from 'next';
import BracketClient from './BracketClient';
// import PageTracker from '@/components/PageTracker';

export const metadata: Metadata = {
  title: '淘汰赛预测器 | 世界杯观赛指南 2026',
  description: '互动式世界杯淘汰赛预测器。逐场选择晋级球队，自动生成你的冠军预测。',
};

export default function BracketPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #071426 0%, #0a1f38 50%, #071426 100%)',
      }}
    >
      {/* <PageTracker event="bracket_view" /> */}
      <div className="max-w-full mx-auto px-3 sm:px-4 py-4 md:py-6">
        <BracketClient />
      </div>
    </div>
  );
}
