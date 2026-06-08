'use client';

import { useState } from 'react';

interface Story {
  title: string;
  content: string;
}

export default function TeamStories({ stories }: { stories: Story[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (!stories || stories.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-1">📖 球队故事</h3>
      <p className="text-xs text-gray-400 mb-4">世界杯历史、传奇与趣闻</p>

      <div className="space-y-3">
        {stories.map((story, idx) => {
          const isExp = expanded.has(idx);
          const short = story.content.length > 80
            ? story.content.slice(0, 80) + '...'
            : story.content;

          return (
            <div key={idx} className="border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">{story.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                {isExp ? story.content : short}
              </p>
              {story.content.length > 80 && (
                <button
                  onClick={() => toggle(idx)}
                  className="text-xs text-navy hover:text-navy-light font-medium mt-1"
                >
                  {isExp ? '收起' : '展开阅读全文'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
