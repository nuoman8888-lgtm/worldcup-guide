import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '完整赛程 | 世界杯 2026',
  description: '2026美加墨世界杯完整赛程表。104场比赛：72场小组赛 + 32场淘汰赛。北京时间显示，支持本地时间切换。',
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
