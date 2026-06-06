import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 预测分析 | 世界杯 2026',
  description: '基于ELO评分和蒙特卡洛模拟的世界杯AI预测。冠军概率、比赛模拟、球队问答，数据驱动分析。',
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
