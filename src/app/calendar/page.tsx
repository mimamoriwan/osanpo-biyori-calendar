'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, ensureAuth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { fetchWeatherData, HourlyWeatherData } from '@/lib/openMeteo';
import { calculateRecommendations, RecommendationResult } from '@/lib/recommend';
import { UserProfile } from '@/types';
import WeatherNowCard from '@/components/WeatherNowCard';
import RecommendationCard from '@/components/RecommendationCard';

export default function CalendarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weatherData, setWeatherData] = useState<HourlyWeatherData | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const uid = await ensureAuth();
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists() || !docSnap.data()?.home) {
        router.push('/mypage');
        return;
      }

      const profileData = docSnap.data() as UserProfile;
      setProfile(profileData);

      // 天気データを取得
      const weather = await fetchWeatherData(profileData.home!.lat, profileData.home!.lng);

      if (!weather) {
        throw new Error('天気データの取得に失敗しました');
      }

      setWeatherData(weather.hourly);

      // おすすめ時間帯を計算
      const rec = calculateRecommendations(weather.hourly);
      setRecommendation(rec);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
      setError('データの読み込みに失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">天気データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md">
          <h2 className="text-lg font-bold text-red-800 mb-2">エラー</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => loadData()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData || !recommendation) {
    return null;
  }

  // 現在時刻に最も近いデータを取得
  const currentIndex = 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          今日の散歩日和カレンダー
        </h1>
        {profile?.home && (
          <p className="text-sm text-gray-600">
            📍 {profile.home.address}
          </p>
        )}
      </div>

      <WeatherNowCard
        weatherCode={weatherData.weather_code[currentIndex]}
        temp={weatherData.temperature_2m[currentIndex]}
        apparentTemp={weatherData.apparent_temperature[currentIndex]}
        humidity={weatherData.relative_humidity_2m[currentIndex]}
        uv={weatherData.uv_index[currentIndex] || 0}
        wind={weatherData.wind_speed_10m[currentIndex]}
        precipProb={weatherData.precipitation_probability[currentIndex] || 0}
      />

      <RecommendationCard recommendation={recommendation} />

      <div className="text-center mt-6">
        <button
          onClick={() => loadData()}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          🔄 更新
        </button>
      </div>
    </div>
  );
}
