'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, ensureAuth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { fetchWeatherData, HourlyWeatherData } from '@/lib/openMeteo';
import { calculateRecommendations, RecommendationResult } from '@/lib/recommend';
import { UserProfile } from '@/types';
import TimeBlockTable from '@/components/TimeBlockTable';
import Link from 'next/link';

export default function DetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

      // おすすめ時間帯を計算
      const rec = calculateRecommendations(weather.hourly, undefined, 24); // 24時間分
      setRecommendation(rec);
    } catch (err) {
      console.error('Failed to load details data:', err);
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
          <p className="text-gray-600">詳細データを読み込み中...</p>
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

  if (!recommendation) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">詳細データ</h1>
          {profile?.home && (
            <p className="text-sm text-gray-600">📍 {profile.home.address}</p>
          )}
        </div>
        <Link
          href="/calendar"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          ← カレンダーに戻る
        </Link>
      </div>

      {recommendation.periods.length > 0 && (
        <div className="bg-primary-50 rounded-lg p-4 mb-6">
          <h2 className="font-bold text-primary-900 mb-2">
            おすすめ時間帯 TOP {recommendation.periods.length}
          </h2>
          <div className="space-y-2">
            {recommendation.periods.map((period, idx) => (
              <div key={idx} className="text-sm text-primary-800">
                <span className="font-semibold">
                  {period.startHour}:00 〜 {period.endHour}:00
                </span>{' '}
                - {period.comment}
              </div>
            ))}
          </div>
        </div>
      )}

      <TimeBlockTable slots={recommendation.allSlots} />

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
