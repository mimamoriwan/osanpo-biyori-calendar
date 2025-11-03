'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, ensureAuth } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { geocodeAddress } from '@/lib/geocode';
import { UserProfile } from '@/types';
import MapPreview from '@/components/MapPreview';

export default function MyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form state
  const [inputMode, setInputMode] = useState<'address' | 'latLng'>('address');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [dogName, setDogName] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const uid = await ensureAuth();
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        setDogName(data.dogName || '');
        if (data.home) {
          setAddress(data.home.address);
          setLat(data.home.lat.toString());
          setLng(data.home.lng.toString());
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setMessage({ type: 'error', text: 'プロフィールの読み込みに失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const uid = await ensureAuth();

      let homeData: { lat: number; lng: number; address: string } | undefined;

      if (inputMode === 'address') {
        if (!address.trim()) {
          setMessage({ type: 'error', text: '住所を入力してください' });
          setSaving(false);
          return;
        }

        const result = await geocodeAddress(address);
        if (!result) {
          setMessage({ type: 'error', text: '住所から位置情報を取得できませんでした' });
          setSaving(false);
          return;
        }

        homeData = {
          lat: result.lat,
          lng: result.lng,
          address: result.address,
        };

        setLat(result.lat.toString());
        setLng(result.lng.toString());
      } else {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        if (isNaN(latNum) || isNaN(lngNum)) {
          setMessage({ type: 'error', text: '有効な緯度経度を入力してください' });
          setSaving(false);
          return;
        }

        homeData = {
          lat: latNum,
          lng: lngNum,
          address: address || `${latNum}, ${lngNum}`,
        };
      }

      const now = Timestamp.now();
      const profileData: UserProfile = {
        uid,
        createdAt: profile?.createdAt || now,
        updatedAt: now,
        dogName: dogName.trim() || undefined,
        home: homeData,
      };

      await setDoc(doc(db, 'users', uid), profileData, { merge: true });

      setProfile(profileData);
      setMessage({ type: 'success', text: '保存しました' });
    } catch (error) {
      console.error('Failed to save profile:', error);
      setMessage({ type: 'error', text: '保存に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">マイページ</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">自宅の登録</h2>

        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            入力方法
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setInputMode('address')}
              className={`flex-1 py-2 px-4 rounded-md font-medium ${
                inputMode === 'address'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              住所で入力
            </button>
            <button
              type="button"
              onClick={() => setInputMode('latLng')}
              className={`flex-1 py-2 px-4 rounded-md font-medium ${
                inputMode === 'latLng'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              緯度経度で入力
            </button>
          </div>
        </div>

        {inputMode === 'address' ? (
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              住所
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例: 東京都渋谷区..."
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-2">
                緯度
              </label>
              <input
                type="number"
                step="any"
                id="lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="35.6812"
              />
            </div>
            <div>
              <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-2">
                経度
              </label>
              <input
                type="number"
                step="any"
                id="lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="139.7671"
              />
            </div>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="dogName" className="block text-sm font-medium text-gray-700 mb-2">
            愛犬の名前（任意）
          </label>
          <input
            type="text"
            id="dogName"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="例: ポチ"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-md transition-colors"
        >
          {saving ? '保存中...' : '保存する'}
        </button>

        {profile?.home && (
          <MapPreview
            lat={profile.home.lat}
            lng={profile.home.lng}
            address={profile.home.address}
          />
        )}
      </div>

      {profile?.home && (
        <div className="text-center">
          <button
            onClick={() => router.push('/calendar')}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-md transition-colors"
          >
            カレンダーを開く
          </button>
        </div>
      )}
    </div>
  );
}
