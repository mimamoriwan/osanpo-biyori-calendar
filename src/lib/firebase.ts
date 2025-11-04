import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, type Auth, type User } from 'firebase/auth';
import { getFirestore, serverTimestamp, type Firestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export function initFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} | null {
  if (firebaseApp) {
    return { app: firebaseApp, auth: auth!, db: firestore! };
  }

  if (!firebaseConfig.projectId) {
    console.warn('Firebase 環境変数が設定されていません');
    return null;
  }

  firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  return { app: firebaseApp, auth, db: firestore };
}

export async function ensureAnonymousUser(): Promise<User | null> {
  const services = initFirebase();
  if (!services) return null;

  const { auth } = services;

  if (auth.currentUser) {
    return auth.currentUser;
  }

  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('匿名認証に失敗しました', error);
    return null;
  }
}

export { serverTimestamp };
