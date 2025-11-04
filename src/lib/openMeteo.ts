const OPEN_METEO_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

export type HourlyWeather = {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  precipitation: number;
  precipitation_probability: number;
  uv_index: number;
  wind_speed_10m: number;
};

export type WeatherResponse = {
  latitude: number;
  longitude: number;
  hourly: HourlyWeather[];
};

export async function fetchWeather(lat: number, lng: number): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    hourly:
      'temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,uv_index,apparent_temperature,wind_speed_10m',
    forecast_days: '2',
    timezone: 'Asia/Tokyo'
  });

  const res = await fetch(`${OPEN_METEO_ENDPOINT}?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Open-Meteoの取得に失敗しました');
  }
  const json = (await res.json()) as {
    latitude: number;
    longitude: number;
    hourly: {
      time: string[];
      temperature_2m: number[];
      apparent_temperature: number[];
      relative_humidity_2m: number[];
      precipitation: number[];
      precipitation_probability: number[];
      uv_index: number[];
      wind_speed_10m: number[];
    };
  };

  const hourly: HourlyWeather[] = json.hourly.time.map((time, index) => ({
    time,
    temperature_2m: json.hourly.temperature_2m[index],
    apparent_temperature: json.hourly.apparent_temperature[index],
    relative_humidity_2m: json.hourly.relative_humidity_2m[index],
    precipitation: json.hourly.precipitation[index],
    precipitation_probability: json.hourly.precipitation_probability[index],
    uv_index: json.hourly.uv_index[index],
    wind_speed_10m: json.hourly.wind_speed_10m[index]
  }));

  return {
    latitude: json.latitude,
    longitude: json.longitude,
    hourly
  };
}
