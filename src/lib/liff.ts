import liff from '@liff/liff-sdk';

let isLiffInitialized = false;

/**
 * LIFF初期化
 */
export const initializeLiff = async (): Promise<boolean> => {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  if (!liffId || liffId === '') {
    console.log('LIFF ID not configured. Skipping LIFF initialization.');
    return false;
  }

  try {
    if (!isLiffInitialized) {
      await liff.init({ liffId });
      isLiffInitialized = true;
    }

    return liff.isLoggedIn();
  } catch (error) {
    console.error('LIFF initialization failed:', error);
    return false;
  }
};

/**
 * LIFFログイン
 */
export const liffLogin = () => {
  if (isLiffInitialized && !liff.isLoggedIn()) {
    liff.login();
  }
};

/**
 * LIFFログアウト
 */
export const liffLogout = () => {
  if (isLiffInitialized && liff.isLoggedIn()) {
    liff.logout();
  }
};

/**
 * LINEユーザーIDを取得
 */
export const getLiffUserId = async (): Promise<string | null> => {
  if (!isLiffInitialized || !liff.isLoggedIn()) {
    return null;
  }

  try {
    const profile = await liff.getProfile();
    return profile.userId;
  } catch (error) {
    console.error('Failed to get LIFF profile:', error);
    return null;
  }
};

/**
 * LIFF環境かどうかを判定
 */
export const isInLiffBrowser = (): boolean => {
  if (!isLiffInitialized) return false;
  return liff.isInClient();
};
