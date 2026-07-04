import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPCXX 做T管理系统 V2.1",
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
        <div className="min-h-screen bg-gray-100 pb-24">
          <header className="sticky top-0 z-40 bg-gray-950 text-white px-4 py-4">
            <h1 className="text-2xl font-bold">SPCXX-T</h1>
            <p className="text-gray-400 text-sm">做T管理系统 V2.1</p>
          </header>

          <main className="p-4 max-w-5xl mx-auto">
            {children}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950 text-white border-t border-gray-800">
            <div className="grid grid-cols-6 text-xs">
              <Link href="/" className="py-3 text-center">
                <div className="text-xl">🏠</div>
                <div>首页</div>
              </Link>

              <Link href="/new" className="py-3 text-center">
                <div className="text-xl">➕</div>
                <div>新建</div>
              </Link>

              <Link href="/active" className="py-3 text-center">
                <div className="text-xl">⏳</div>
                <div>进行中</div>
              </Link>

              <Link href="/completed" className="py-3 text-center">
                <div className="text-xl">✅</div>
                <div>已完成</div>
              </Link>

              <Link href="/stats" className="py-3 text-center">
                <div className="text-xl">📈</div>
                <div>统计</div>
              </Link>

              <Link href="/settings" className="py-3 text-center">
                <div className="text-xl">⚙️</div>
                <div>设置</div>
              </Link>
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}