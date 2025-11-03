import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lineUserId?: string | null;
  dogName?: string;
  home?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface UserSettings {
  uid: string;
  thresholds?: {
    rainProb?: number;
    tempMin?: number;
    tempMax?: number;
    uvMax?: number;
    windMax?: number;
    humidityMin?: number;
    humidityMax?: number;
  };
}
