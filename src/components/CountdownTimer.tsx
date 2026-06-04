'use client';

import { useState, useEffect } from 'react';
import { worldCupCountdown } from '@/lib/utils';

export default function CountdownTimer() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setTime(worldCupCountdown());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-4 gap-3 text-center">
        {['天', '时', '分', '秒'].map(label => (
          <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-4 min-w-[70px]">
            <div className="text-3xl font-bold text-white">--</div>
            <div className="text-xs text-white/60 mt-1">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  const items = [
    { value: time.days, label: '天' },
    { value: time.hours, label: '时' },
    { value: time.minutes, label: '分' },
    { value: time.seconds, label: '秒' },
  ];

  if (time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
    return (
      <div className="text-center text-white">
        <div className="text-4xl font-bold animate-pulse">🏆 世界杯已开幕！</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 text-center">
      {items.map(item => (
        <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-4 min-w-[70px]">
          <div className="text-3xl font-bold text-white tabular-nums">
            {String(item.value).padStart(2, '0')}
          </div>
          <div className="text-xs text-white/60 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
