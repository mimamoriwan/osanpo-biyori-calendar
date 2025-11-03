'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🐕</span>
            <span className="font-bold text-lg text-primary-700">おさんぽ日和</span>
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              href="/calendar"
              className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                isActive('/calendar')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              カレンダー
            </Link>
            <Link
              href="/mypage"
              className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                isActive('/mypage')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              マイページ
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
