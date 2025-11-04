import { formatToJstLabel } from '@/lib/time';

export type WeatherNow = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  precipitation: number;
  precipitationProbability: number;
};

type WeatherNowCardProps = {
  data: WeatherNow;
  isLoading?: boolean;
};

export default function WeatherNowCard({ data, isLoading }: WeatherNowCardProps) {
  if (isLoading) {
    return <div className="skeleton h-32 w-full" aria-hidden="true" />;
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-primary-dark">今日のお天気サマリ</h2>
      <p className="mt-1 text-sm text-slate-500">最終更新: {formatToJstLabel(data.time)}</p>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500">気温</p>
          <p className="text-lg font-semibold">{data.temperature.toFixed(1)}℃</p>
          <p className="text-xs text-slate-400">体感 {data.apparentTemperature.toFixed(1)}℃</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">湿度</p>
          <p className="text-lg font-semibold">{data.humidity}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">UV</p>
          <p className="text-lg font-semibold">{data.uvIndex.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">風速</p>
          <p className="text-lg font-semibold">{data.windSpeed.toFixed(1)} m/s</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">降水確率</p>
          <p className="text-lg font-semibold">{data.precipitationProbability}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">降水量</p>
          <p className="text-lg font-semibold">{data.precipitation.toFixed(1)} mm</p>
        </div>
      </div>
    </section>
  );
}
