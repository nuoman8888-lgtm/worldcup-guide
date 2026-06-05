import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "世界杯观赛指南 2026 | 赛程 · 积分榜 · 球队 · 赔率",
  description: "2026美加墨世界杯观赛指南。今日比赛、完整赛程、48支球队数据、实时积分榜、赔率对比。",
  keywords: "世界杯,2026世界杯,世界杯赛程,世界杯积分榜,世界杯球队,今日世界杯比赛,足球",
  openGraph: {
    title: "🏆 世界杯观赛指南 2026",
    description: "今日比赛 · 完整赛程 · 48支球队 · 实时积分榜",
    type: "website",
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
        <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm">
            <p className="mb-2">
              🏆 世界杯观赛指南 2026 — 今日比赛 · 完整赛程 · 48支球队
            </p>
            <p className="text-gray-500 text-xs">
              数据仅供参考 | 基于ELO模型和FIFA排名 | 不构成任何投注建议
            </p>
            <p className="text-gray-600 text-xs mt-3">
              Built with Next.js · Deployed on Vercel · © 2026
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
