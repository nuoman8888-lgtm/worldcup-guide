'use client';

import dynamic from 'next/dynamic';

const BracketView = dynamic(() => import('./BracketView'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin text-4xl mb-4">⚽</div>
      <p className="text-gray-500 text-sm">加载淘汰赛预测器...</p>
    </div>
  ),
});

export default function BracketClient() {
  return <BracketView />;
}
