'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import SearchBox from './SearchBox';

const navItems = [
  { href: '/', label: '首页' },
  { href: '/schedule', label: '赛程' },
  { href: '/standings', label: '积分榜' },
  { href: '/bracket', label: '淘汰赛' },
  { href: '/ai-lab', label: 'AI实验室' },
  { href: '/odds', label: '赔率' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[9999] bg-navy text-white shadow-lg shadow-black/20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo — use <a> for hard navigation to avoid RSC client-nav issues */}
          <a href="/" className="flex items-center gap-2 font-bold text-base shrink-0">
            <span>🏆</span>
            <span className="hidden sm:inline text-sm tracking-wide">世界杯 2026</span>
            <span className="sm:hidden text-sm">WC 2026</span>
          </a>

          {/* Desktop nav — use <a> instead of <Link> to force full page loads */}
          <div className="hidden md:flex items-center gap-0">
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-gold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gold rounded-full" />
                  )}
                </a>
              );
            })}
            {/* Search */}
            <div className="ml-3">
              <SearchBox variant="navbar" />
            </div>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <SearchBox variant="navbar" />
            <button
              className="p-2 rounded-lg hover:bg-navy-light transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu — use <a> for hard navigation */}
        {menuOpen && (
          <div className="md:hidden pb-3 border-t border-navy-light">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-navy-light text-gold'
                      : 'text-gray-300 hover:text-white hover:bg-navy-light'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
