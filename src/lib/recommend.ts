import { HourlyWeatherData } from './openMeteo';
import { diffMinutes, getCurrentJSTTime } from './time';

export interface Thresholds {
  rainProb: number; // 降水確率 (%)
  rainAmount: number; // 降水量 (mm/h)
  tempMin: number; // 最低気温 (℃)
  tempMax: number; // 最高気温 (℃)
  uvMax: number; // UV指数
  windMax: number; // 風速 (m/s)
  humidityMin: number; // 最低湿度 (%)
  humidityMax: number; // 最高湿度 (%)
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  rainProb: 30,
  rainAmount: 0.2,
  tempMin: 8,
  tempMax: 26,
  uvMax: 6,
  windMax: 6,
  humidityMin: 35,
  humidityMax: 75,
};

export interface TimeSlot {
  time: string;
  hour: number;
  score: number;
  temp: number;
  apparentTemp: number;
  humidity: number;
  precipitation: number;
  precipProb: number;
  uv: number;
  wind: number;
  warnings: string[];
}

export interface RecommendedPeriod {
  startTime: string;
  endTime: string;
  startHour: number;
  endHour: number;
  avgScore: number;
  comment: string;
}

export interface RecommendationResult {
  periods: RecommendedPeriod[];
  nextGoodTime: {
    minutes: number;
    hour: number;
    comment: string;
  } | null;
  allSlots: TimeSlot[];
}

/**
 * 時間帯スコアを計算
 */
const calculateScore = (
  idx: number,
  hourly: HourlyWeatherData,
  thresholds: Thresholds
): { score: number; warnings: string[] } => {
  let score = 0;
  const warnings: string[] = [];

  // 降水確率・降水量
  const precipProb = hourly.precipitation_probability[idx] || 0;
  const precip = hourly.precipitation[idx] || 0;
  if (precipProb <= thresholds.rainProb && precip <= thresholds.rainAmount) {
    score += 4;
  } else {
    if (precipProb > thresholds.rainProb) warnings.push('降水確率高め');
    if (precip > thresholds.rainAmount) warnings.push('雨が降る可能性');
  }

  // 気温（体感温度を優先）
  const apparentTemp = hourly.apparent_temperature[idx];
  if (apparentTemp >= thresholds.tempMin && apparentTemp <= thresholds.tempMax) {
    score += 3;
  } else {
    if (apparentTemp < thresholds.tempMin) warnings.push('寒い');
    if (apparentTemp > thresholds.tempMax) warnings.push('暑い');
  }

  // 湿度
  const humidity = hourly.relative_humidity_2m[idx];
  if (humidity >= thresholds.humidityMin && humidity <= thresholds.humidityMax) {
    score += 2;
  } else {
    if (humidity < thresholds.humidityMin) warnings.push('乾燥');
    if (humidity > thresholds.humidityMax) warnings.push('湿度高め');
  }

  // UV指数
  const uv = hourly.uv_index[idx] || 0;
  if (uv <= thresholds.uvMax) {
    score += 1;
  } else {
    warnings.push('日差し強め');
  }

  // 風速
  const wind = hourly.wind_speed_10m[idx];
  if (wind <= thresholds.windMax) {
    score += 1;
  } else {
    warnings.push('風強め');
  }

  return { score, warnings };
};

/**
 * おすすめ時間帯を算出
 */
export const calculateRecommendations = (
  hourly: HourlyWeatherData,
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
  maxHours: number = 12
): RecommendationResult => {
  const currentTime = getCurrentJSTTime();
  const slots: TimeSlot[] = [];

  // 現在時刻から最大maxHours分のスロットを作成
  const maxSlots = Math.min(hourly.time.length, maxHours);

  for (let i = 0; i < maxSlots; i++) {
    const slotTime = new Date(hourly.time[i]);
    if (slotTime < currentTime) continue;

    const hour = slotTime.getHours();
    const { score, warnings } = calculateScore(i, hourly, thresholds);

    slots.push({
      time: hourly.time[i],
      hour,
      score,
      temp: hourly.temperature_2m[i],
      apparentTemp: hourly.apparent_temperature[i],
      humidity: hourly.relative_humidity_2m[i],
      precipitation: hourly.precipitation[i],
      precipProb: hourly.precipitation_probability[i] || 0,
      uv: hourly.uv_index[i] || 0,
      wind: hourly.wind_speed_10m[i],
      warnings,
    });
  }

  // スコアしきい値（最大11点中7点以上を「おすすめ」とする）
  const scoreThreshold = 7;

  // 連続したおすすめ時間帯をまとめる
  const periods: RecommendedPeriod[] = [];
  let currentPeriod: TimeSlot[] = [];

  slots.forEach((slot) => {
    if (slot.score >= scoreThreshold) {
      currentPeriod.push(slot);
    } else {
      if (currentPeriod.length > 0) {
        periods.push(createPeriod(currentPeriod));
        currentPeriod = [];
      }
    }
  });

  // 最後の期間を追加
  if (currentPeriod.length > 0) {
    periods.push(createPeriod(currentPeriod));
  }

  // スコアが高い順にソート
  periods.sort((a, b) => b.avgScore - a.avgScore);

  // 次の散歩おすすめ時間を計算
  const nextGoodTime = calculateNextGoodTime(slots, currentTime, scoreThreshold);

  return {
    periods: periods.slice(0, 2), // 上位2つを返す
    nextGoodTime,
    allSlots: slots,
  };
};

/**
 * 連続スロットから期間オブジェクトを作成
 */
const createPeriod = (slots: TimeSlot[]): RecommendedPeriod => {
  const avgScore = slots.reduce((sum, s) => sum + s.score, 0) / slots.length;
  const warnings = Array.from(new Set(slots.flatMap((s) => s.warnings)));

  let comment = '散歩に最適な時間帯です。';
  if (warnings.length > 0) {
    if (warnings.includes('日差し強め')) {
      comment += ' 帽子と給水をお忘れなく。';
    }
    if (warnings.includes('風強め')) {
      comment += ' 風がやや強いです。';
    }
    if (warnings.includes('暑い')) {
      comment += ' 暑さに注意してください。';
    }
    if (warnings.includes('寒い')) {
      comment += ' 防寒対策をしましょう。';
    }
    if (warnings.includes('湿度高め')) {
      comment += ' 湿度が高めです。';
    }
  }

  return {
    startTime: slots[0].time,
    endTime: slots[slots.length - 1].time,
    startHour: slots[0].hour,
    endHour: slots[slots.length - 1].hour,
    avgScore,
    comment,
  };
};

/**
 * 「この後◯分後から散歩OK」を計算
 */
const calculateNextGoodTime = (
  slots: TimeSlot[],
  currentTime: Date,
  scoreThreshold: number
): RecommendationResult['nextGoodTime'] => {
  const goodSlot = slots.find((s) => s.score >= scoreThreshold);

  if (!goodSlot) {
    return null;
  }

  const minutes = diffMinutes(currentTime, goodSlot.time);

  let comment = '';
  if (minutes <= 0) {
    comment = '今すぐ散歩に行けます！';
  } else if (minutes <= 30) {
    comment = `${minutes}分後から散歩日和です。`;
  } else if (minutes <= 60) {
    comment = `約1時間後から散歩日和です。`;
  } else {
    const hours = Math.floor(minutes / 60);
    comment = `約${hours}時間後から散歩日和です。`;
  }

  return {
    minutes,
    hour: goodSlot.hour,
    comment,
  };
};
