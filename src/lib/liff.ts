'use client';

import { useEffect, useState } from 'react';

type LiffInstance = {
  init: (config: { liffId: string }) => Promise<void>;
  getProfile: () => Promise<unknown>;
};

declare global {
  interface Window {
    liff?: LiffInstance;
  }
}

async function ensureLiffSdk(): Promise<LiffInstance | null> {
  if (typeof window === 'undefined') return null;
  if (window.liff) return window.liff;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('LIFF SDKの読み込みに失敗しました'));
    document.head.appendChild(script);
  });

  return window.liff ?? null;
}

export type UseLiffResult = {
  isReady: boolean;
  error: Error | null;
  profile: unknown | null;
};

export function useLiff(): UseLiffResult {
  const [state, setState] = useState<UseLiffResult>({ isReady: false, error: null, profile: null });

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      setState({ isReady: true, error: null, profile: null });
      return;
    }

    let cancelled = false;

    const setup = async () => {
      try {
        const liff = await ensureLiffSdk();
        if (!liff) {
          throw new Error('LIFF SDKが利用できません');
        }
        await liff.init({ liffId });
        if (!cancelled) {
          const profile = await liff.getProfile().catch(() => null);
          setState({ isReady: true, error: null, profile });
        }
      } catch (error) {
        console.error('LIFF 初期化エラー', error);
        if (!cancelled) {
          setState({ isReady: true, error: error as Error, profile: null });
        }
      }
    };

    void setup();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
