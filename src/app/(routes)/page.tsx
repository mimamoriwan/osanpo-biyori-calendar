'use client';

'use client';

import Link from 'next/link';
import { useState } from 'react';

const ctaLinks = [
  { href: 'https://line.me/R/ti/p/', label: 'LINEで開く', primary: true },
  { href: '/mypage', label: 'マイページへ', primary: false },
  { href: '/calendar', label: '今すぐカレンダー', primary: false }
];

export default function HomePage() {
  const [isReady] = useState(true);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-lg">
        <h1 className="text-2xl font-semibold">おさんぽ日和カレンダー</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/90">
          わんちゃんとのお散歩にぴったりな時間帯を、最新の気象データから自動で提案します。
          雨や暑さ、強い紫外線を避けて、快適なお散歩時間を見つけましょう。
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {ctaLinks.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className={`rounded-full px-5 py-3 text-center text-sm font-semibold shadow-sm transition ${
                cta.primary
                  ? 'bg-white text-primary-dark hover:bg-slate-100'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">できること</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {isReady ? (
            [
              {
                title: '今日のお天気をチェック',
                description: '登録した場所の気温・湿度・風・UVをまとめて表示。今すぐ出発できるか判断できます。'
              },
              {
                title: 'おすすめの時間帯',
                description: '気温や雨の確率をもとに、お散歩に適した時間帯を自然な日本語でご提案します。'
              },
              {
                title: '詳細な時間割',
                description: '1時間ごとの天気や注意事項をテーブルで確認。横スクロールでスマホでも見やすい設計です。'
              }
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl bg-white p-4 shadow-sm">
                <h3 className="text-base font-semibold text-primary-dark">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))
          ) : (
            <div className="space-y-3">
              <div className="skeleton h-24 w-full" />
              <div className="skeleton h-24 w-full" />
              <div className="skeleton h-24 w-full" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
