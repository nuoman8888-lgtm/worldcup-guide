'use client';

import { useEffect, useState } from 'react';
// import Link from 'next/link';
import { decodeShareData, extractResults } from '@/lib/share-utils';
import type { ShareResults } from '@/lib/share-utils';

export default function SharePage() {
  const [results, setResults] = useState<ShareResults | null>(null);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('d');
    if (!encoded) {
      setError('未找到预测数据。请通过分享链接访问。');
      return;
    }
    const data = decodeShareData(encoded);
    if (!data || Object.keys(data.picks).length === 0) {
      setError('预测数据无效或已损坏。');
      return;
    }
    const res = extractResults(data.picks);
    setResults(res);
    setTimestamp(data.timestamp);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin text-4xl">⚽</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">无法加载预测</h1>
          <p className="text-gray-500 text-sm">{error}</p>
          <a href="/bracket" className="inline-block mt-6 px-6 py-3 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy-light transition-colors">
            去预测淘汰赛 →
          </a>
        </div>
      </div>
    );
  }

  if (!results || !results.champion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin text-4xl">⚽</div>
      </div>
    );
  }

  const { champion, runnerUp, semiFinalists, quarterFinalists } = results;
  const timeStr = timestamp
    ? new Date(timestamp).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6 md:py-10">
        {/* Page title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-extrabold text-gray-900 mb-1">🏆 我的世界杯冠军预测</h1>
          <p className="text-sm text-gray-500">淘汰赛完整推演结果</p>
          {timeStr && <p className="text-xs text-gray-400 mt-1">预测时间：{timeStr}</p>}
        </div>

        {/* ═══ Champion Card ═══ */}
        <div
          className="rounded-2xl p-6 shadow-xl text-center mb-4"
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%)',
            border: '2px solid #D4AF37',
          }}
        >
          <div className="text-xs font-bold tracking-widest uppercase text-navy/50 mb-2">
            🏆 预测冠军
          </div>
          <div className="text-7xl mb-3">{champion.flag}</div>
          <div className="text-2xl font-extrabold text-navy mb-1">{champion.name}</div>
          <div className="text-sm text-navy/50">{champion.nameEn}</div>
        </div>

        {/* ═══ Runner-up ═══ */}
        {runnerUp && (
          <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm text-center mb-4">
            <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
              🥈 预测亚军
            </div>
            <div className="text-5xl mb-2">{runnerUp.flag}</div>
            <div className="text-lg font-extrabold text-gray-900">{runnerUp.name}</div>
            <div className="text-xs text-gray-400">{runnerUp.nameEn}</div>
          </div>
        )}

        {/* ═══ Semi-finalists ═══ */}
        {semiFinalists.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-700">🥉 四强</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              {semiFinalists.map((team, i) => {
                const isChamp = team.id === champion.id;
                const isRunner = runnerUp && team.id === runnerUp.id;
                return (
                  <div
                    key={team.id}
                    className={`flex items-center gap-3 px-4 py-3.5 ${i > 1 ? 'border-t border-gray-100' : ''}`}
                  >
                    <span className="text-3xl shrink-0">{team.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-sm">{team.name}</span>
                        {isChamp && (
                          <span className="text-[10px] bg-gold/20 text-gold-dark px-1.5 py-0.5 rounded-full font-bold">冠军</span>
                        )}
                        {isRunner && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">亚军</span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400">{team.nameEn}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ Quarter-finalists ═══ */}
        {quarterFinalists.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-700">⚽ 八强</span>
            </div>
            <div className="divide-y divide-gray-50">
              {quarterFinalists.map((team) => {
                const isSemi = semiFinalists.some(s => s.id === team.id);
                return (
                  <div
                    key={team.id}
                    className={`flex items-center gap-3 px-4 py-3 ${isSemi ? 'bg-gray-50/50' : ''}`}
                  >
                    <span className="text-2xl shrink-0">{team.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{team.name}</div>
                      <div className="text-[11px] text-gray-400">{team.nameEn}</div>
                    </div>
                    {isSemi && (
                      <span className="text-[10px] bg-navy/10 text-navy px-1.5 py-0.5 rounded-full font-bold shrink-0">
                        四强
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ Actions ═══ */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
          <button
            onClick={handleCopy}
            className="px-6 py-3 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy-light transition-colors shadow-sm"
          >
            {copied ? '✅ 已复制' : '📋 复制链接'}
          </button>
          <a
            href="/bracket"
            className="px-6 py-3 bg-white text-navy rounded-xl text-sm font-bold border-2 border-navy/15 hover:bg-navy/5 transition-colors text-center"
          >
            🏆 我也来预测 →
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          分享给你的朋友，看看谁的预测更准！
        </p>
      </div>
    </div>
  );
}
