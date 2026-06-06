import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '我的世界杯冠军预测 | 淘汰赛推演结果',
  description: '查看我的世界杯淘汰赛预测结果 — 冠军、亚军、四强、八强完整推演。快来分享你的预测！',
  openGraph: {
    title: '🏆 我的世界杯冠军预测',
    description: '查看我的世界杯淘汰赛预测结果，一起来猜冠军！',
    type: 'website',
    siteName: '世界杯观赛指南',
  },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
