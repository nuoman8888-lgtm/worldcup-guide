import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI世界杯实验室 | 四大AI模型预测PK',
  description: 'Claude vs ChatGPT vs DeepSeek vs 千问 — 四大AI模型每日预测世界杯比赛，自动结算排名，看哪个AI最懂足球。',
};

export default function AiLabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
