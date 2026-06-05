'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import SearchBox from './SearchBox';

const navItems = [
  { href: '/', label: '🏠 首页' },
  { href: '/schedule', label: '📅 赛程' },
  { href: '/standings', label: '📊 积分榜' },
  { href: '/odds', label: '💰 赔率' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <span className="text-2xl">🏆</span>
            <span className="hidden sm:inline">世界杯观赛指南</span>
            <span className="sm:hidden">观赛指南</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-white/20 text-white'
                    : 'hover:bg-white/10 text-white/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {/* Search in navbar */}
            <div className="ml-2">
              <SearchBox variant="navbar" />
            </div>
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              className="p-2 rounded-lg hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 border-t border-white/10">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-white/20 text-white'
                    : 'hover:bg-white/10 text-white/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {/* Mobile search hint */}
            <div className="px-3 py-2.5 text-xs text-white/50">
              🔍 返回首页搜索球队
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
