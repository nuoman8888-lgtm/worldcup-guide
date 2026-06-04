// Utility functions

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${days[date.getDay()]}`;
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentBeijingTime(): string {
  const now = new Date();
  // Beijing time is UTC+8
  const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return beijingTime.toISOString().replace('T', ' ').substring(0, 16);
}

export function countdownTo(targetDate: string, targetTime: string): string {
  const now = new Date();
  const [hours, minutes] = targetTime.split(':').map(Number);
  const target = new Date(targetDate + 'T00:00:00');
  target.setHours(hours, minutes, 0, 0);

  const diff = target.getTime() - now.getTime();

  if (diff < 0) return '已开始';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}天${hrs}小时`;
  if (hrs > 0) return `${hrs}小时${mins}分钟`;
  return `${mins}分钟`;
}

export function worldCupCountdown(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  // World Cup starts June 12, 2026 at 03:00 Beijing time (June 11 19:00 UTC)
  const kickoff = new Date('2026-06-11T19:00:00Z');
  const diff = kickoff.getTime() - now.getTime();

  if (diff < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}
