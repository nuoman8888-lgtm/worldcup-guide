import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "世界杯观赛指南 2026 | AI预测 · 赛程 · 积分榜 · 赔率",
  description: "2026美加墨世界杯全方位观赛指南。查看完整赛程、实时积分榜、AI胜率预测、赔率分析。",
  keywords: "世界杯,2026世界杯,世界杯赛程,世界杯积分榜,世界杯赔率,世界杯预测,AI预测,足球",
  openGraph: {
    title: "🏆 世界杯观赛指南 2026",
    description: "AI预测 · 完整赛程 · 实时积分榜 · 赔率分析",
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
              🏆 世界杯观赛指南 2026 — AI驱动的全方位世界杯数据平台
            </p>
            <p className="text-gray-500 text-xs">
              数据仅供参考 | AI预测基于历史数据和ELO模型 | 不构成任何投注建议
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
