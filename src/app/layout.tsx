import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "世界杯观赛指南 2026 | 赛程 · 积分榜 · 球队 · 赔率",
  description: "2026美加墨世界杯观赛指南。今日比赛、完整赛程、48支球队数据、实时积分榜、赔率对比。",
  keywords: "世界杯,2026世界杯,世界杯赛程,世界杯积分榜,世界杯球队,今日世界杯比赛,足球",
  authors: [{ name: "诺曼" }],
  openGraph: {
    title: "🏆 世界杯观赛指南 2026",
    description: "今日比赛 · 完整赛程 · 48支球队 · 实时积分榜",
    type: "website",
    siteName: "世界杯观赛指南",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-navy text-gray-400 py-10 mt-auto border-t border-navy-600">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm">
            <p className="mb-2 font-semibold text-white">
              🏆 世界杯观赛指南 2026
            </p>
            <p className="text-gray-400 text-xs">
              今日比赛 · 完整赛程 · 48支球队 · 12个小组
            </p>
            <p className="text-gray-500 text-xs mt-3">
              数据仅供参考 · 基于ELO模型和FIFA排名 · 不构成任何投注建议
            </p>

            {/* Author info */}
            <div className="mt-5 pt-5 border-t border-navy-600">
              <p className="text-white/80 text-sm font-medium">
                Made with ❤️ by <span className="text-gold">诺曼</span>
              </p>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                <span>微信：HY2377119002</span>
                <span className="hidden sm:inline text-gray-600">|</span>
                <span>邮箱：2377119002@qq.com</span>
              </div>
              <p className="text-gray-600 text-[10px] mt-4">
                Built with Next.js · Deployed on Cloudflare Pages · © 2026
              </p>
            </div>
          </div>
        </footer>

        {/* Schema.org Person */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "世界杯观赛指南 2026",
              "url": "https://worldcup-guide.pages.dev",
              "author": {
                "@type": "Person",
                "name": "诺曼"
              },
              "description": "2026美加墨世界杯观赛指南 - 今日比赛、完整赛程、48支球队数据"
            })
          }}
        />

        {/* Cloudflare Web Analytics */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "CF_TOKEN_PLACEHOLDER"}'
        />
      </body>
    </html>
  );
}
