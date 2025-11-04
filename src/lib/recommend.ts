import type { HourlyWeather } from './openMeteo';

export type Thresholds = {
  rainProb: number;
  precipitation: number;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  uvMax: number;
  windMax: number;
};

export const DEFAULT_THRESHOLDS: Thresholds = {
  rainProb: 30,
  precipitation: 0.2,
  tempMin: 8,
  tempMax: 26,
  humidityMin: 35,
  humidityMax: 75,
  uvMax: 6,
  windMax: 6
};

export const SCORE_WEIGHTS = {
  rain: 4,
  temperature: 3,
  humidity: 2,
  uv: 1,
  wind: 1
} as const;

export type EvaluatedHour = {
  weather: HourlyWeather;
  time: string;
  score: number;
  isComfortable: boolean;
  tips: string[];
  warnings: string[];
};

export type Recommendation = {
  start: string;
  end: string;
  score: number;
  tips: string[];
};

const HOURS_AHEAD = 24;

function withinRange(now: Date, isoTime: string): boolean {
  const slot = new Date(`${isoTime}:00+09:00`);
  const diff = slot.getTime() - now.getTime();
  return diff >= 0 && diff <= HOURS_AHEAD * 60 * 60 * 1000;
}

export function evaluateHourly(
  hourly: HourlyWeather[],
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
  now: Date = new Date()
): EvaluatedHour[] {
  return hourly
    .filter((slot) => withinRange(now, slot.time))
    .map((slot) => {
      const tips: string[] = [];
      const warnings: string[] = [];
      let score = 0;

      if (
        slot.precipitation_probability <= thresholds.rainProb &&
        slot.precipitation <= thresholds.precipitation
      ) {
        score += SCORE_WEIGHTS.rain;
      } else {
        warnings.push(`⚠ 小雨の可能性 (${slot.precipitation_probability}% / ${slot.precipitation.toFixed(1)}mm)`);
      }

      if (slot.temperature_2m >= thresholds.tempMin && slot.temperature_2m <= thresholds.tempMax) {
        score += SCORE_WEIGHTS.temperature;
      } else if (slot.temperature_2m < thresholds.tempMin) {
        warnings.push(`⚠ 気温が低め (${slot.temperature_2m.toFixed(1)}℃)`);
      } else {
        warnings.push(`⚠ 気温が高め (${slot.temperature_2m.toFixed(1)}℃)`);
      }

      if (
        slot.relative_humidity_2m >= thresholds.humidityMin &&
        slot.relative_humidity_2m <= thresholds.humidityMax
      ) {
        score += SCORE_WEIGHTS.humidity;
      } else if (slot.relative_humidity_2m < thresholds.humidityMin) {
        warnings.push(`⚠ 空気が乾燥 (${slot.relative_humidity_2m}% )`);
      } else {
        warnings.push(`⚠ 湿度が高め (${slot.relative_humidity_2m}% )`);
      }

      if (slot.uv_index <= thresholds.uvMax) {
        score += SCORE_WEIGHTS.uv;
      } else {
        warnings.push(`⚠ 日差し注意 (UV ${slot.uv_index.toFixed(1)})`);
      }

      if (slot.wind_speed_10m <= thresholds.windMax) {
        score += SCORE_WEIGHTS.wind;
      } else {
        warnings.push(`⚠ 風が強め (${slot.wind_speed_10m.toFixed(1)}m/s)`);
      }

      if (warnings.length === 0) {
        tips.push('各条件が整っていて快適なお散歩ができそうです');
      }

      return {
        weather: slot,
        time: slot.time,
        score,
        isComfortable: warnings.length === 0,
        tips,
        warnings
      };
    });
}

export function recommendTimeBlocks(
  evaluated: EvaluatedHour[],
  limit = 2
): Recommendation[] {
  const segments: Recommendation[] = [];
  let current: { start: string; end: string; score: number; temps: number[]; precipProb: number[] } | null = null;

  evaluated.forEach((hour) => {
    if (!hour.isComfortable) {
      if (current) {
        segments.push({
          start: current.start,
          end: current.end,
          score: current.score,
          tips: buildTips(current.temps, current.precipProb)
        });
        current = null;
      }
      return;
    }

    if (!current) {
      current = {
        start: hour.time,
        end: hour.time,
        score: hour.score,
        temps: [hour.weather.temperature_2m],
        precipProb: [hour.weather.precipitation_probability]
      };
    } else {
      current.end = hour.time;
      current.score += hour.score;
      current.temps.push(hour.weather.temperature_2m);
      current.precipProb.push(hour.weather.precipitation_probability);
    }
  });

  if (current) {
    segments.push({
      start: current.start,
      end: current.end,
      score: current.score,
      tips: buildTips(current.temps, current.precipProb)
    });
  }

  return segments
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function buildTips(temps: number[], precipProb: number[]): string[] {
  if (temps.length === 0) return [];
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const maxRainProb = Math.max(...precipProb);
  return [
    `気温は${minTemp.toFixed(1)}〜${maxTemp.toFixed(1)}℃で過ごしやすいでしょう`,
    `降水確率は最大${maxRainProb}%です`
  ];
}
