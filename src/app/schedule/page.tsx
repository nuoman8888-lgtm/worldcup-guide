'use client';

import { useState, useMemo, useEffect } from 'react';
import MatchCard from '@/components/MatchCard';
import { allMatches, getUniqueDates, stageNames, formatDate } from '@/data/matches';
import type { MatchStage } from '@/data/matches';

/** Detect user timezone */
function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch { return 'Asia/Shanghai'; }
}

/** Convert Beijing time (HH:MM) to local time string */
function toLocalTime(beijingTime: string): string {
  const [h, m] = beijingTime.split(':').map(Number);
  // Create a date in Beijing timezone
  const bj = new Date(`2026-06-12T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00+08:00`);
  return bj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

const STAGES: { value: MatchStage | 'all'; label: string }[] = [
  { value: 'all', label: '全部比赛' },
  { value: 'group', label: '小组赛' },
  { value: 'round32', label: '32强赛' },
  { value: 'round16', label: '16强赛' },
  { value: 'quarterfinal', label: '四分之一决赛' },
  { value: 'semifinal', label: '半决赛' },
  { value: 'thirdPlace', label: '三四名决赛' },
  { value: 'final', label: '🏆 决赛' },
];

export default function SchedulePage() {
  const [selectedStage, setSelectedStage] = useState<MatchStage | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');

  const dates = useMemo(() => getUniqueDates(), []);
  const dateSet = useMemo(() => new Set(allMatches.filter(m => {
    if (selectedStage === 'all') return true;
    return m.stage === selectedStage;
  }).map(m => m.date)), [selectedStage]);

  const filteredDates = useMemo(() => {
    if (selectedDate !== 'all') return [selectedDate];
    return dates.filter(d => dateSet.has(d));
  }, [selectedDate, dates, dateSet]);

  const filterMatches = (date: string) => {
    let matches = allMatches.filter(m => m.date === date);
    if (selectedStage !== 'all') {
      matches = matches.filter(m => m.stage === selectedStage);
    }
    return matches;
  };

  const [showLocalTime, setShowLocalTime] = useState(false);
  const [userTz, setUserTz] = useState('');

  useEffect(() => {
    setUserTz(getUserTimezone());
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">📅 完整赛程</h1>
            <p className="text-gray-500 text-sm">共104场比赛 · 小组赛72场 + 淘汰赛32场</p>
          </div>
          {userTz && userTz !== 'Asia/Shanghai' && (
            <button
              onClick={() => setShowLocalTime(!showLocalTime)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                showLocalTime
                  ? 'bg-navy text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              🕐 {showLocalTime ? '本地时间' : '北京时间 (UTC+8)'}
              <span className="text-xs ml-1 opacity-70">{showLocalTime ? '✓' : '→ 切换'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stage Filter */}
      <div
        className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onWheel={(e) => {
          const el = e.currentTarget;
          el.scrollLeft += e.deltaY;
          e.preventDefault();
        }}
      >
        {STAGES.map(stage => (
          <button
            key={stage.value}
            onClick={() => { setSelectedStage(stage.value); setSelectedDate('all'); }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStage === stage.value
                ? 'bg-navy text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {stage.label}
          </button>
        ))}
      </div>

      {/* Date Navigation — horizontal scroll with fade masks */}
      <div className="relative mb-8 group/dates">
        <div
          className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}
          onWheel={(e) => {
            const el = e.currentTarget;
            el.scrollLeft += e.deltaY;
            e.preventDefault();
          }}
        >
        <button
          onClick={() => setSelectedDate('all')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedDate === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          全部日期
        </button>
        {dates.filter(d => dateSet.has(d)).map(date => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedDate === date
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {formatDate(date)}
          </button>
        ))}
        </div>
        {/* Gradient fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-50 to-transparent z-10" />
      </div>

      {/* Match List */}
      <div className="space-y-8">
        {filteredDates.map(date => {
          const matches = filterMatches(date);
          if (matches.length === 0) return null;

          return (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-900">{formatDate(date)}</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {matches.length}场比赛
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map(match => (
                  <MatchCard key={match.id} match={match} localTime={showLocalTime ? toLocalTime(match.time) : undefined} />
                ))}
              </div>
            </div>
          );
        })}
        {filteredDates.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            暂无该阶段的比赛
          </div>
        )}
      </div>
    </div>
  );
}
