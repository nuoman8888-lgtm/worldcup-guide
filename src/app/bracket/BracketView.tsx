'use client';

import { useState } from 'react';
import { getAllTeams } from '@/data/teams';
import type { Team } from '@/data/teams';

/* ═══════════════════════════════════
   Bracket data: 2026 World Cup knockout
   ═══════════════════════════════════ */

interface BracketSlot {
  id: string;
  round: 'round32' | 'round16' | 'quarterfinal' | 'semifinal' | 'thirdPlace' | 'final';
  matchIndex: number; // position within round
  feedsFrom: [string, string]; // IDs of the two matches feeding this one (empty for round32)
  date: string;
  time: string;
  city: string;
}

// Build bracket structure
const ROUNDS = ['round32', 'round16', 'quarterfinal', 'semifinal', 'final'] as const;

const bracketSlots: BracketSlot[] = [
  // ── Semi-finals (2 matches) ──
  { id: 'sf-1', round: 'semifinal', matchIndex: 0, feedsFrom: ['qf-1', 'qf-2'], date: '7/15', time: '03:00', city: '达拉斯' },
  { id: 'sf-2', round: 'semifinal', matchIndex: 1, feedsFrom: ['qf-3', 'qf-4'], date: '7/16', time: '03:00', city: '亚特兰大' },

  // ── Final + 3rd place ──
  { id: '3rd', round: 'thirdPlace', matchIndex: 0, feedsFrom: ['sf-1', 'sf-2'], date: '7/19', time: '05:00', city: '迈阿密' },
  { id: 'final', round: 'final', matchIndex: 0, feedsFrom: ['sf-1', 'sf-2'], date: '7/20', time: '03:00', city: '纽约' },

  // ── Quarter-finals (4 matches) ──
  { id: 'qf-1', round: 'quarterfinal', matchIndex: 0, feedsFrom: ['r16-1', 'r16-2'], date: '7/10', time: '04:00', city: '墨西哥城' },
  { id: 'qf-2', round: 'quarterfinal', matchIndex: 1, feedsFrom: ['r16-3', 'r16-4'], date: '7/11', time: '03:00', city: '多伦多' },
  { id: 'qf-3', round: 'quarterfinal', matchIndex: 2, feedsFrom: ['r16-5', 'r16-6'], date: '7/12', time: '05:00', city: '洛杉矶' },
  { id: 'qf-4', round: 'quarterfinal', matchIndex: 3, feedsFrom: ['r16-7', 'r16-8'], date: '7/12', time: '09:00', city: '纽约' },

  // ── Round of 16 (8 matches) ──
  { id: 'r16-1', round: 'round16', matchIndex: 0, feedsFrom: ['r32-1', 'r32-2'], date: '7/5', time: '01:00', city: '墨西哥城' },
  { id: 'r16-2', round: 'round16', matchIndex: 1, feedsFrom: ['r32-3', 'r32-4'], date: '7/5', time: '05:00', city: '多伦多' },
  { id: 'r16-3', round: 'round16', matchIndex: 2, feedsFrom: ['r32-5', 'r32-6'], date: '7/6', time: '04:00', city: '洛杉矶' },
  { id: 'r16-4', round: 'round16', matchIndex: 3, feedsFrom: ['r32-7', 'r32-8'], date: '7/6', time: '08:00', city: '纽约' },
  { id: 'r16-5', round: 'round16', matchIndex: 4, feedsFrom: ['r32-9', 'r32-10'], date: '7/7', time: '03:00', city: '达拉斯' },
  { id: 'r16-6', round: 'round16', matchIndex: 5, feedsFrom: ['r32-11', 'r32-12'], date: '7/7', time: '08:00', city: '亚特兰大' },
  { id: 'r16-7', round: 'round16', matchIndex: 6, feedsFrom: ['r32-13', 'r32-14'], date: '7/8', time: '00:00', city: '费城' },
  { id: 'r16-8', round: 'round16', matchIndex: 7, feedsFrom: ['r32-15', 'r32-16'], date: '7/8', time: '04:00', city: '迈阿密' },

  // ── Round of 32 (16 matches) ──
  ...[...Array(16)].map((_, i) => ({
    id: `r32-${i + 1}`,
    round: 'round32' as const,
    matchIndex: i,
    feedsFrom: ['', ''] as [string, string],
    date: ['6/29','6/30','6/30','6/30','7/1','7/1','7/1','7/2','7/2','7/2','7/3','7/3','7/3','7/4','7/4','7/4'][i],
    time: ['03:00','01:00','04:30','09:00','01:00','05:00','09:00','00:00','04:00','08:00','03:00','07:00','11:00','02:00','06:00','09:30'][i],
    city: ['墨西哥城','多伦多','洛杉矶','纽约','达拉斯','亚特兰大','费城','迈阿密','墨西哥城','多伦多','洛杉矶','纽约','达拉斯','亚特兰大','费城','迈阿密'][i],
  })),
];

type Picks = Record<string, string>; // slotId → winning teamId

const ROUND_NAMES: Record<string, string> = {
  round32: '32强',
  round16: '16强',
  quarterfinal: '¼决赛',
  semifinal: '半决赛',
  thirdPlace: '三四名',
  final: '🏆 决赛',
};

export default function BracketView() {
  const [picks, setPicks] = useState<Picks>({});
  const [selectingSlot, setSelectingSlot] = useState<string | null>(null);
  const teams = getAllTeams();

  // Get winner for a slot (either picked, or derived from feeder slots)
  function getWinner(slotId: string): Team | null {
    if (picks[slotId]) return teams.find(t => t.id === picks[slotId]) || null;
    const slot = bracketSlots.find(s => s.id === slotId);
    if (!slot) return null;
    // If no pick but feeder slots have winners, check if both feeders have winners
    if (slot.feedsFrom[0] && slot.feedsFrom[1]) {
      const w1 = getWinner(slot.feedsFrom[0]);
      const w2 = getWinner(slot.feedsFrom[1]);
      if (w1 && w2) {
        // Auto-pick the higher ELO team if not manually picked
        return null; // Don't auto-advance — user must click
      }
    }
    return null;
  }

  function handlePick(teamId: string) {
    if (!selectingSlot) return;
    const newPicks = { ...picks, [selectingSlot]: teamId };
    setPicks(newPicks);
    setSelectingSlot(null);
  }

  // Find the predicted champion
  const finalSlot = bracketSlots.find(s => s.id === 'final');
  const champion = finalSlot ? getWinner('final') || picks['final'] ? teams.find(t => t.id === picks['final']) : null : null;
  const hasChampion = champion != null;

  // Calculate picks for third place (losers of SF)
  const thirdPlaceSlot = bracketSlots.find(s => s.id === '3rd');
  const thirdPlaceWinner = thirdPlaceSlot ? (picks['3rd'] ? teams.find(t => t.id === picks['3rd']) : null) : null;

  // Round order for display
  const displayRounds = ['round32', 'round16', 'quarterfinal', 'semifinal', 'final'];

  return (
    <div>
      {/* Team picker modal */}
      {selectingSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectingSlot(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[70vh] overflow-y-auto p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-center">选择胜者</h3>
            <div className="grid grid-cols-4 gap-2">
              {teams.map(t => (
                <button
                  key={t.id}
                  onClick={() => handlePick(t.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gold-50 hover:border-gold transition-all border border-gray-100"
                >
                  <span className="text-2xl">{t.flag}</span>
                  <span className="text-[10px] font-medium text-gray-700">{t.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectingSlot(null)}
              className="block w-full mt-3 text-xs text-gray-400 hover:text-gray-500"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Champion banner */}
      {hasChampion && champion && (
        <div className="mb-6 p-6 bg-gradient-to-r from-gold to-yellow-400 rounded-xl text-center shadow-lg">
          <div className="text-sm text-navy font-bold mb-1">🏆 你的预测冠军</div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl">{champion.flag}</span>
            <div>
              <div className="text-3xl font-extrabold text-navy">{champion.name}</div>
              <div className="text-sm text-navy/70">{champion.nameEn}</div>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPicks({})}
              className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
            >
              🔄 重新预测
            </button>
            <button
              className="px-4 py-2 bg-white text-navy rounded-lg text-sm font-medium border border-navy/20 hover:bg-gray-50 transition-colors"
              title="图片分享功能即将上线"
            >
              📸 保存分享
            </button>
          </div>
        </div>
      )}

      {/* Bracket tree — horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-6 scrollbar-hide">
        <div className="flex gap-3 min-w-[900px] justify-center">
          {displayRounds.map(roundKey => {
            const slots = bracketSlots
              .filter(s => s.round === roundKey)
              .sort((a, b) => a.matchIndex - b.matchIndex);

            // Calculate spacing: each round has fewer slots, so more vertical space
            const roundCount = slots.length;

            return (
              <div key={roundKey} className="flex-1 min-w-[120px] max-w-[180px]">
                {/* Round header */}
                <div className="text-center mb-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {ROUND_NAMES[roundKey] || roundKey}
                  </div>
                  <div className="text-[10px] text-gray-400">{roundCount}场</div>
                </div>

                {/* Match slots */}
                <div
                  className="flex flex-col justify-around"
                  style={{
                    minHeight: roundCount <= 2 ? 180 : roundCount <= 4 ? 400 : roundCount <= 8 ? 600 : 900,
                    gap: roundCount <= 2 ? '60px' : roundCount <= 4 ? '24px' : '8px',
                  }}
                >
                  {slots.map(slot => {
                    const winner = getWinner(slot.id);
                    const feed1 = slot.feedsFrom[0] ? getWinner(slot.feedsFrom[0]) : null;
                    const feed2 = slot.feedsFrom[1] ? getWinner(slot.feedsFrom[1]) : null;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => !winner && setSelectingSlot(slot.id)}
                        className={`relative p-2 rounded-lg border text-center transition-all ${
                          winner
                            ? 'bg-gold-50 border-gold cursor-default'
                            : 'bg-white border-gray-200 hover:border-navy-600 hover:shadow cursor-pointer'
                        } ${slot.round === 'final' ? 'ring-2 ring-gold' : ''}`}
                      >
                        {/* Match info */}
                        <div className="text-[9px] text-gray-400 font-mono mb-1">
                          {slot.date} {slot.time}
                        </div>

                        {/* Teams */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="text-center flex-1">
                            {feed1 ? (
                              <>
                                <div className="text-lg">{feed1.flag}</div>
                                <div className="text-[9px] font-medium text-gray-900 truncate">{feed1.name}</div>
                              </>
                            ) : (
                              <div className="text-lg text-gray-300">❓</div>
                            )}
                          </div>

                          <span className="text-[9px] text-gray-400 font-bold">VS</span>

                          <div className="text-center flex-1">
                            {feed2 ? (
                              <>
                                <div className="text-lg">{feed2.flag}</div>
                                <div className="text-[9px] font-medium text-gray-900 truncate">{feed2.name}</div>
                              </>
                            ) : (
                              <div className="text-lg text-gray-300">❓</div>
                            )}
                          </div>
                        </div>

                        {/* Winner indicator */}
                        {winner && (
                          <div className="mt-1.5 text-[10px] font-bold text-gold-dark">
                            → {winner.name}
                          </div>
                        )}

                        {/* City */}
                        <div className="text-[8px] text-gray-400 mt-1">{slot.city}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help text */}
      {!hasChampion && (
        <div className="text-center mt-8 p-6 bg-white rounded-xl border border-gray-100">
          <div className="text-2xl mb-2">👆</div>
          <p className="text-sm text-gray-600 font-medium">从32强赛开始，点击每场比赛选择你认为会晋级的球队</p>
          <p className="text-xs text-gray-400 mt-1">胜者自动进入下一轮 · 一路选择直到冠军</p>
          <button
            onClick={() => {
              // Quick-pick: auto-select based on ELO
              const newPicks: Picks = {};
              const allSlots = bracketSlots;
              // Process rounds in order
              const order = ['round32', 'round16', 'quarterfinal', 'semifinal', 'final', 'thirdPlace'];
              for (const round of order) {
                for (const slot of allSlots.filter(s => s.round === round)) {
                  const f1 = slot.feedsFrom[0] ? newPicks[slot.feedsFrom[0]] : null;
                  const f2 = slot.feedsFrom[1] ? newPicks[slot.feedsFrom[1]] : null;
                  const t1 = f1 ? teams.find(t => t.id === f1) : null;
                  const t2 = f2 ? teams.find(t => t.id === f2) : null;
                  if (t1 && t2) {
                    newPicks[slot.id] = (t1.elo > t2.elo ? t1.id : t2.id);
                  }
                }
              }
              // Fill round32 with top 32 ELO teams
              const top32 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 32);
              const r32Slots = allSlots.filter(s => s.round === 'round32');
              r32Slots.forEach((slot, i) => {
                if (i * 2 < top32.length) {
                  const t1 = top32[i * 2];
                  const t2 = top32[i * 2 + 1];
                  newPicks[slot.id] = t1.elo > t2.elo ? t1.id : t2.id;
                }
              });
              setPicks(newPicks);
            }}
            className="mt-4 px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
          >
            ⚡ 快速预测（基于ELO）
          </button>
        </div>
      )}
    </div>
  );
}
