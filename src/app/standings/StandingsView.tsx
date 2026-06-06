'use client';

import { useState } from 'react';
import Link from 'next/link';
import GroupTable from '@/components/GroupTable';
import { getTeam } from '@/data/teams';
import type { GroupStandings } from '@/data/standings';

export default function StandingsView({ standings }: { standings: GroupStandings[] }) {
  const [activeGroup, setActiveGroup] = useState(standings[0]?.groupName || 'A');
  const current = standings.find(g => g.groupName === activeGroup) || standings[0];

  return (
    <div>
      {/* Group tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
        {standings.map(group => (
          <button
            key={group.groupName}
            onClick={() => setActiveGroup(group.groupName)}
            className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeGroup === group.groupName
                ? 'bg-navy text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {group.groupName} 组
          </button>
        ))}
      </div>

      {/* Active group table */}
      <div className="mb-6">
        {current && <GroupTable data={current} />}
      </div>

      {/* Quick grid: all groups at a glance */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">全部小组一览</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {standings.map(group => (
            <button
              key={group.groupName}
              onClick={() => setActiveGroup(group.groupName)}
              className={`text-left p-3 rounded-lg border transition-all ${
                activeGroup === group.groupName
                  ? 'border-navy bg-navy text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-navy-600'
              }`}
            >
              <div className={`font-bold text-sm mb-1.5 ${activeGroup === group.groupName ? 'text-gold' : ''}`}>
                {group.groupName} 组
              </div>
              {group.standings.slice(0, 2).map((row, i) => {
                const team = getTeam(row.teamId);
                return (
                  <Link
                    key={row.teamId}
                    href={`/team/${row.teamId}`}
                    className="flex items-center justify-between text-xs py-0.5 hover:opacity-80 transition-opacity"
                  >
                    <span className={activeGroup === group.groupName ? 'text-white/80' : 'text-gray-600'}>
                      {i + 1}. {team?.flag} {team?.name || row.teamId}
                    </span>
                    <span className={`font-semibold tabular-nums ${activeGroup === group.groupName ? 'text-gold-light' : 'text-gray-500'}`}>
                      {row.points}
                    </span>
                  </Link>
                );
              })}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
