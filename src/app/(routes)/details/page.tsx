'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { ensureAnonymousUser, initFirebase } from '@/lib/firebase';
import { fetchWeather } from '@/lib/openMeteo';
import { evaluateHourly, recommendTimeBlocks, type EvaluatedHour } from '@/lib/recommend';
import TimeBlockTable, { type TimeBlockRow } from '@/components/TimeBlockTable';
import { formatRangeToJst } from '@/lib/time';

export default function DetailsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluated, setEvaluated] = useState<EvaluatedHour[]>([]);
  const [home, setHome] = useState<{ lat: number; lng: number; address: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      const user = await ensureAnonymousUser();
      const services = initFirebase();
      if (!user || !services) {
        setError('Firebase環境変数を設定してからお試しください。');
        setIsLoading(false);
        return;
      }

      const ref = doc(services.db, 'users', user.uid);
      const snapshot = await getDoc(ref);
      const data = snapshot.data() as { home?: { lat: number; lng: number; address: string } } | undefined;
      if (!data?.home) {
        setError('マイページで住所を登録すると詳細を確認できます。');
        setIsLoading(false);
        return;
      }
      setHome(data.home);

      try {
        const weather = await fetchWeather(data.home.lat, data.home.lng);
        const evaluatedHours = evaluateHourly(weather.hourly);
        setEvaluated(evaluatedHours);
      } catch (err) {
        console.error(err);
        setError('天気データの取得に失敗しました。時間をおいて再度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const tableRows: TimeBlockRow[] = useMemo(
    () =>
      evaluated.map((hour) => ({
        time: hour.time,
        precipitationProbability: hour.weather.precipitation_probability,
        precipitation: hour.weather.precipitation,
        temperature: hour.weather.temperature_2m,
        apparentTemperature: hour.weather.apparent_temperature,
        humidity: hour.weather.relative_humidity_2m,
        windSpeed: hour.weather.wind_speed_10m,
        uvIndex: hour.weather.uv_index,
        isRecommended: hour.isComfortable,
        tips: hour.warnings.length > 0 ? hour.warnings : hour.tips
      })),
    [evaluated]
  );

  const recommendationTips = useMemo(() => recommendTimeBlocks(evaluated), [evaluated]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-800">詳細データ</h1>
        {home && <p className="text-xs text-slate-500">地点: {home.address}</p>}
      </header>

      {isLoading && <div className="skeleton h-48 w-full" />}

      {!isLoading && error && (
        <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600">
          <p>{error}</p>
          {error.includes('マイページ') && (
            <Link href="/mypage" className="mt-3 inline-block underline">
              マイページへ
            </Link>
          )}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-primary-dark">おすすめ帯まとめ</h2>
            <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
              {recommendationTips.length === 0 && <li>本日は条件が合う時間帯が見つかりませんでした。</li>}
              {recommendationTips.map((tip) => (
                <li key={`${tip.start}-${tip.end}`}>
                  {tip.tips.join(' / ')}（{formatRangeToJst(tip.start, tip.end)}）
                </li>
              ))}
            </ul>
          </section>
          <TimeBlockTable rows={tableRows} />
        </div>
      )}
    </div>
  );
}
