// import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚽</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">页面未找到</h1>
        <p className="text-gray-500 text-sm mb-6">404 — 你访问的页面不存在或已被移除</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/" className="px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-bold hover:bg-navy-light transition-colors">返回首页</a>
          <a href="/schedule" className="px-6 py-2.5 bg-white text-navy rounded-lg text-sm font-bold border-2 border-navy/15 hover:bg-navy/5 transition-colors">浏览赛程</a>
        </div>
      </div>
    </div>
  );
}
