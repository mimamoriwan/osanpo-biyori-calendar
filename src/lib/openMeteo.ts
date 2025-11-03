export interface HourlyWeatherData {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation: number[];
  precipitation_probability: number[];
  uv_index: number[];
  apparent_temperature: number[];
  wind_speed_10m: number[];
  weather_code: number[];
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  hourly: HourlyWeatherData;
  timezone: string;
}

/**
 * Open-Meteo API から気象データを取得
 * https://open-meteo.com/en/docs
 */
export const fetchWeatherData = async (
  lat: number,
  lng: number
): Promise<WeatherResponse | null> => {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'precipitation_probability',
        'uv_index',
        'apparent_temperature',
        'wind_speed_10m',
        'weather_code',
      ].join(','),
      timezone: 'Asia/Tokyo',
      forecast_days: '2',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API failed: ${response.statusText}`);
    }

    const data: WeatherResponse = await response.json();

    return data;
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
};

/**
 * 天気コードから天気アイコンと説明を取得
 * WMO Weather interpretation codes (WW)
 */
export const getWeatherInfo = (
  code: number
): { icon: string; description: string; emoji: string } => {
  if (code === 0) return { icon: 'sunny', description: '快晴', emoji: '☀️' };
  if (code === 1) return { icon: 'mostly-sunny', description: '晴れ', emoji: '🌤️' };
  if (code === 2) return { icon: 'partly-cloudy', description: '一部曇り', emoji: '⛅' };
  if (code === 3) return { icon: 'cloudy', description: '曇り', emoji: '☁️' };
  if (code >= 45 && code <= 48)
    return { icon: 'fog', description: '霧', emoji: '🌫️' };
  if (code >= 51 && code <= 57)
    return { icon: 'drizzle', description: '霧雨', emoji: '🌦️' };
  if (code >= 61 && code <= 67)
    return { icon: 'rain', description: '雨', emoji: '🌧️' };
  if (code >= 71 && code <= 77)
    return { icon: 'snow', description: '雪', emoji: '❄️' };
  if (code >= 80 && code <= 82)
    return { icon: 'showers', description: 'にわか雨', emoji: '🌦️' };
  if (code >= 85 && code <= 86)
    return { icon: 'snow-showers', description: 'にわか雪', emoji: '🌨️' };
  if (code >= 95 && code <= 99)
    return { icon: 'thunderstorm', description: '雷雨', emoji: '⛈️' };

  return { icon: 'unknown', description: '不明', emoji: '❓' };
};
