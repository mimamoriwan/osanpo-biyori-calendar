'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { ensureAnonymousUser, initFirebase } from '@/lib/firebase';
import WeatherNowCard from '@/components/WeatherNowCard';
import RecommendationCard from '@/components/RecommendationCard';
import { fetchWeather } from '@/lib/openMeteo';
import { evaluateHourly, recommendTimeBlocks, type EvaluatedHour } from '@/lib/recommend';
import { formatRangeToJst } from '@/lib/time';

export default function CalendarPage() {
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
        setError('ホーム登録の前にFirebase環境変数を設定してください。');
        setIsLoading(false);
        return;
      }

      const ref = doc(services.db, 'users', user.uid);
      const snapshot = await getDoc(ref);
      const data = snapshot.data() as { home?: { lat: number; lng: number; address: string } } | undefined;
      if (!data?.home) {
        setError('まずはマイページで住所または緯度経度を登録してください。');
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
        setError('天気データの取得に失敗しました。時間をおいて再試行してください。');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const recommendations = useMemo(() => recommendTimeBlocks(evaluated, 2), [evaluated]);
  const topRecommendation = recommendations[0] ?? null;

  const weatherNow = useMemo(() => {
    if (!evaluated.length) return null;
    const current = evaluated[0];
    return {
      time: current.time,
      temperature: current.weather.temperature_2m,
      apparentTemperature: current.weather.apparent_temperature,
      humidity: current.weather.relative_humidity_2m,
      uvIndex: current.weather.uv_index,
      windSpeed: current.weather.wind_speed_10m,
      precipitation: current.weather.precipitation,
      precipitationProbability: current.weather.precipitation_probability
    };
  }, [evaluated]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-800">今日のおさんぽカレンダー</h1>
        {home && <p className="text-xs text-slate-500">地点: {home.address}</p>}
      </header>

      {isLoading && (
        <div className="space-y-4">
          <div className="skeleton h-32 w-full" />
          <div className="skeleton h-28 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600">
          <p>{error}</p>
          {error.includes('マイページ') && (
            <Link href="/mypage" className="mt-3 inline-block underline">
              マイページで登録する
            </Link>
          )}
        </div>
      )}

      {!isLoading && !error && weatherNow && (
        <div className="space-y-4">
          <WeatherNowCard data={weatherNow} />
          <RecommendationCard recommendation={topRecommendation} />
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-primary-dark">その他の候補</h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {recommendations.length === 0 && <li>条件に合う時間帯が見つかりませんでした。</li>}
              {recommendations.map((rec) => (
                <li key={`${rec.start}-${rec.end}`}>
                  {formatRangeToJst(rec.start, rec.end)} / {rec.tips.join('、')}
                </li>
              ))}
            </ul>
            <Link
              href="/details"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow hover:bg-primary-dark"
            >
              詳細を見る
            </Link>
          </section>
        </div>
      )}
    </div>
  );
}
