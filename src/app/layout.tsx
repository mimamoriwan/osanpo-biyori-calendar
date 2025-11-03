import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'おさんぽ日和カレンダー | みまもりWAN!!',
  description: '愛犬との散歩に最適な時間帯をお知らせします。気象データから快適な散歩タイムを提案。',
  openGraph: {
    title: 'おさんぽ日和カレンダー',
    description: '愛犬との散歩に最適な時間帯をお知らせします',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
