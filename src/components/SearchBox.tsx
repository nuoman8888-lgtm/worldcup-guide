'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAllTeams } from '@/data/teams';
import { getMatchesByTeam } from '@/data/matches';

interface SearchBoxProps {
  variant?: 'navbar' | 'hero';
}

export default function SearchBox({ variant = 'hero' }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const teams = useMemo(() => getAllTeams(), []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return teams
      .filter(
        t =>
          t.name.includes(q) ||
          t.nameEn.toLowerCase().includes(q) ||
          t.group.toLowerCase() === q
      )
      .slice(0, 8);
  }, [query, teams]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
      if (!open || results.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const team = results[activeIndex];
        if (team) {
          window.location.href = `/team/${team.id}`;
          setOpen(false);
          setQuery('');
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, results, activeIndex]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  const isNavbar = variant === 'navbar';
  const showDropdown = open && query.trim().length > 0;

  const inputClasses = isNavbar
    ? 'w-36 lg:w-48 pl-8 pr-3 py-1.5 text-sm rounded-lg bg-navy-light border border-navy-600 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold'
    : 'w-full max-w-xl mx-auto pl-12 pr-12 py-4 text-lg rounded-2xl border-2 border-navy-600 bg-navy-light text-white placeholder-gray-400 shadow-2xl shadow-black/30 focus:outline-none focus:ring-4 focus:ring-gold/30 focus:border-gold transition-all';

  return (
    <div ref={containerRef} className="relative">
      <div className={isNavbar ? '' : 'flex justify-center'}>
        <div className="relative" style={isNavbar ? {} : { width: '100%', maxWidth: '36rem' }}>
          <svg
            className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${
              isNavbar
                ? 'left-2.5 w-4 h-4 text-gray-500'
                : 'left-5 w-6 h-6 text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) setOpen(true);
            }}
            placeholder={isNavbar ? '搜索球队' : '搜索你关注的球队...'}
            className={inputClasses}
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setOpen(false);
                inputRef.current?.focus();
              }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-navy-600 transition-colors ${
                isNavbar ? 'text-gray-500' : 'right-3 text-gray-400'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)} />
          <div
            className={`absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden ${
              isNavbar
                ? 'right-0 mt-2 w-80'
                : 'left-1/2 -translate-x-1/2 mt-2 w-[calc(100%-2rem)] max-w-xl'
            }`}
          >
            {results.length > 0 ? (
              <div className="py-1 max-h-96 overflow-y-auto">
                {results.map((team, idx) => {
                  const teamMatches = getMatchesByTeam(team.id);
                  const upcoming = teamMatches
                    .filter(m => m.status !== 'finished')
                    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0];

                  return (
                    <Link
                      key={team.id}
                      href={`/team/${team.id}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery('');
                      }}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                        idx === activeIndex ? 'bg-gold-50' : ''
                      }`}
                    >
                      <span className="text-2xl shrink-0">{team.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">
                          {team.name}
                          <span className="text-xs text-gray-400 font-normal ml-1.5">{team.nameEn}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {team.group}组 · FIFA #{team.fifaRank} · ELO {team.elo}
                        </div>
                        {upcoming && (
                          <div className="text-xs text-gold-dark mt-0.5 font-medium">
                            📅 下场: {upcoming.date} {upcoming.time}
                          </div>
                        )}
                      </div>
                      <span className="text-gray-300 text-sm shrink-0">→</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="text-2xl mb-2">🔍</div>
                <p className="text-gray-500 text-sm">未找到 &ldquo;{query}&rdquo; 相关的球队</p>
                <p className="text-gray-400 text-xs mt-1">试试中文名或英文名，如：日本、Brazil</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
