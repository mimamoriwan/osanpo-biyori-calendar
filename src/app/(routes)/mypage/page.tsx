'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ensureAnonymousUser, initFirebase, serverTimestamp } from '@/lib/firebase';
import MapPreview from '@/components/MapPreview';
import { geocodeAddress } from '@/lib/geocode';
import Link from 'next/link';

const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

type Mode = 'address' | 'latlng';

type UserHome = {
  lat: number;
  lng: number;
  address: string;
};

export default function MyPage() {
  const [mode, setMode] = useState<Mode>('address');
  const [addressInput, setAddressInput] = useState('');
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [home, setHome] = useState<UserHome | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const user = await ensureAnonymousUser();
      const services = initFirebase();
      if (!user || !services) {
        setError('Firebaseの初期化に失敗しました。環境変数を確認してください。');
        setIsLoading(false);
        return;
      }

      const ref = doc(services.db, 'users', user.uid);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        const data = snapshot.data() as { home?: UserHome };
        if (data.home) {
          setHome(data.home);
          setAddressInput(data.home.address);
          setLatInput(data.home.lat.toString());
          setLngInput(data.home.lng.toString());
        }
      }
      setIsLoading(false);
    };

    void fetchData();
  }, []);

  const canSave = useMemo(() => {
    if (mode === 'address') {
      return Boolean(addressInput.trim());
    }
    return Boolean(latInput && lngInput);
  }, [mode, addressInput, latInput, lngInput]);

  const handleGeocode = async () => {
    setError(null);
    const result = await geocodeAddress(addressInput);
    if (!result) {
      setError('住所から緯度経度を取得できませんでした。表記を見直してください。');
      return;
    }
    setLatInput(result.lat.toString());
    setLngInput(result.lng.toString());
    setHome({ lat: result.lat, lng: result.lng, address: result.displayName });
    setMessage('位置を取得しました。内容を確認して保存してください。');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    setIsSaving(true);
    setError(null);

    const user = await ensureAnonymousUser();
    const services = initFirebase();
    if (!user || !services) {
      setError('Firebase未設定のため保存できません。');
      setIsSaving(false);
      return;
    }

    let homeData: UserHome | null = null;
    if (mode === 'address') {
      if (!latInput || !lngInput) {
        setError('位置情報が未取得です。住所から位置を取得してください。');
        setIsSaving(false);
        return;
      }
      homeData = {
        lat: Number.parseFloat(latInput),
        lng: Number.parseFloat(lngInput),
        address: addressInput
      };
    } else {
      const parsed = latLngSchema.safeParse({
        lat: Number.parseFloat(latInput),
        lng: Number.parseFloat(lngInput)
      });
      if (!parsed.success) {
        setError('緯度経度の形式が正しくありません。例: 35.68, 139.76');
        setIsSaving(false);
        return;
      }
      homeData = {
        lat: parsed.data.lat,
        lng: parsed.data.lng,
        address: addressInput || '緯度経度で登録'
      };
    }

    try {
      const ref = doc(services.db, 'users', user.uid);
      await setDoc(
        ref,
        {
          home: homeData,
          lineUserId: null,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        },
        { merge: true }
      );
      setHome(homeData);
      setMessage('保存しました。お散歩カレンダーを確認しましょう！');
    } catch (err) {
      console.error(err);
      setError('保存中にエラーが発生しました。通信状況をご確認ください。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">マイページ</h1>
      <p className="text-sm text-slate-600">
        登録した住所（または緯度経度）をもとに、最新の気象データを取得します。
        住所利用時はNominatimの規約に従い、正確な住所を入力してください。
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode('address')}
            className={`rounded-full px-4 py-2 ${
              mode === 'address' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            住所入力
          </button>
          <button
            type="button"
            onClick={() => setMode('latlng')}
            className={`rounded-full px-4 py-2 ${
              mode === 'latlng' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            緯度/経度直接入力
          </button>
        </div>

        {mode === 'address' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="address">
              住所
            </label>
            <input
              id="address"
              type="text"
              placeholder="例: 東京都新宿区西新宿2-8-1"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            <button
              type="button"
              onClick={handleGeocode}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              住所から位置を取得
            </button>
            <p className="text-xs text-slate-500">
              入力された住所はOpenStreetMap / Nominatimで検索します。利用規約に基づき、商用利用時は十分な注意が必要です。
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="lat">
              緯度
            </label>
            <input
              id="lat"
              type="number"
              step="0.000001"
              placeholder="35.680959"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="lng">
              経度
            </label>
            <input
              id="lng"
              type="number"
              step="0.000001"
              placeholder="139.767125"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSave || isSaving}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSaving ? '保存中…' : '保存する'}
        </button>
      </form>

      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">登録地点プレビュー</h2>
        {isLoading ? (
          <div className="skeleton mt-3 h-40 w-full" />
        ) : (
          <MapPreview lat={home?.lat ?? Number(latInput) || null} lng={home?.lng ?? Number(lngInput) || null} address={home?.address} />
        )}
      </div>

      <div className="flex justify-center">
        <Link
          href="/calendar"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow hover:bg-primary-dark"
        >
          カレンダーを開く
        </Link>
      </div>
    </div>
  );
}
