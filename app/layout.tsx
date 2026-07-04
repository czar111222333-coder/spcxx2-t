import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPCXX 做T管理系统 V2",
  description: "SPCXX 做T交易管理工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen bg-gray-100">
          <header className="bg-gray-950 text-white p-4">
            <h1 className="text-xl font-bold">SPCXX-T</h1>
            <p className="text-gray-400 text-xs">做T管理系统 V2</p>

            <nav className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <Link href="/" className="bg-gray-800 rounded-lg p-2 text-center">
                🏠 控制台
              </Link>
              <Link href="/new" className="bg-gray-800 rounded-lg p-2 text-center">
                ➕ 新建
              </Link>
              <Link href="/active" className="bg-gray-800 rounded-lg p-2 text-center">
                ⏳ 进行中
              </Link>
              <Link href="/completed" className="bg-gray-800 rounded-lg p-2 text-center">
                ✅ 已完成
              </Link>
              <Link href="/stats" className="bg-gray-800 rounded-lg p-2 text-center">
                📈 统计
              </Link>
              <Link href="/settings" className="bg-gray-800 rounded-lg p-2 text-center">
                ⚙️ 设置
              </Link>
            </nav>
          </header>

          <main className="p-4 md:p-8 max-w-6xl mx-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}