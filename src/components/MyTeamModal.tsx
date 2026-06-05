'use client';

import { useState, useEffect } from 'react';
import { getAllTeams } from '@/data/teams';

const POPULAR_IDS = [
  'argentina', 'brazil', 'france', 'germany', 'england',
  'spain', 'portugal', 'netherlands', 'japan', 'south-korea',
  'uruguay', 'croatia', 'belgium', 'mexico', 'usa',
];

const STORAGE_KEY = 'worldcup-my-team';

export function getMyTeam(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setMyTeam(teamId: string) {
  localStorage.setItem(STORAGE_KEY, teamId);
}

export function useMyTeam() {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTeamId(getMyTeam());
    setMounted(true);
  }, []);

  const save = (id: string) => {
    setMyTeam(id);
    setTeamId(id);
  };

  return { teamId, save, mounted };
}

export default function MyTeamModal() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const teams = getAllTeams();

  useEffect(() => {
    setMounted(true);
    // Show modal on first visit if no team selected
    const saved = getMyTeam();
    if (!saved) {
      // Delay to avoid flash
      const t = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!mounted || !show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShow(false)} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🏆</div>
          <h2 className="text-xl font-extrabold text-gray-900">选择你的主队</h2>
          <p className="text-sm text-gray-500 mt-1">关注你最支持的球队，获取个性化赛程提醒</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {POPULAR_IDS.map(id => {
            const team = teams.find(t => t.id === id);
            if (!team) return null;
            return (
              <button
                key={id}
                onClick={() => {
                  setMyTeam(id);
                  setShow(false);
                  window.location.reload();
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gold-50 hover:border-gold transition-all border border-gray-100"
              >
                <span className="text-2xl">{team.flag}</span>
                <span className="text-xs font-medium text-gray-700">{team.name}</span>
                <span className="text-[10px] text-gray-400">#{team.fifaRank}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShow(false)}
          className="block w-full mt-4 text-center text-xs text-gray-400 hover:text-gray-500"
        >
          稍后再说
        </button>
      </div>
    </div>
  );
}
