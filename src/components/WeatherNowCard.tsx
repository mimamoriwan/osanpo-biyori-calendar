'use client';

import { getWeatherInfo } from '@/lib/openMeteo';

interface WeatherNowCardProps {
  weatherCode: number;
  temp: number;
  apparentTemp: number;
  humidity: number;
  uv: number;
  wind: number;
  precipProb: number;
}

export default function WeatherNowCard({
  weatherCode,
  temp,
  apparentTemp,
  humidity,
  uv,
  wind,
  precipProb,
}: WeatherNowCardProps) {
  const weatherInfo = getWeatherInfo(weatherCode);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">現在の天気</h2>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-6xl">{weatherInfo.emoji}</span>
          <div>
            <p className="text-3xl font-bold text-gray-800">{Math.round(temp)}°C</p>
            <p className="text-sm text-gray-600">
              体感 {Math.round(apparentTemp)}°C
            </p>
            <p className="text-lg text-gray-700 mt-1">{weatherInfo.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs text-gray-600 mb-1">降水確率</p>
          <p className="text-lg font-semibold text-gray-800">{precipProb}%</p>
        </div>

        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs text-gray-600 mb-1">湿度</p>
          <p className="text-lg font-semibold text-gray-800">{humidity}%</p>
        </div>

        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs text-gray-600 mb-1">UV指数</p>
          <p className="text-lg font-semibold text-gray-800">
            {uv.toFixed(1)}
            {uv > 6 && <span className="text-orange-600 ml-1">⚠</span>}
          </p>
        </div>

        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs text-gray-600 mb-1">風速</p>
          <p className="text-lg font-semibold text-gray-800">
            {wind.toFixed(1)} m/s
            {wind > 6 && <span className="text-orange-600 ml-1">⚠</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
