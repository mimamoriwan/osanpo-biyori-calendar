import { formatToHourJst } from '@/lib/time';

export type TimeBlockRow = {
  time: string;
  precipitationProbability: number;
  precipitation: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  isRecommended: boolean;
  tips: string[];
};

type TimeBlockTableProps = {
  rows: TimeBlockRow[];
  isLoading?: boolean;
};

export default function TimeBlockTable({ rows, isLoading }: TimeBlockTableProps) {
  if (isLoading) {
    return <div className="skeleton h-48 w-full" aria-hidden="true" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-3 py-2 font-medium">時刻</th>
            <th className="px-3 py-2 font-medium">降水確率</th>
            <th className="px-3 py-2 font-medium">降水量</th>
            <th className="px-3 py-2 font-medium">気温</th>
            <th className="px-3 py-2 font-medium">体感</th>
            <th className="px-3 py-2 font-medium">湿度</th>
            <th className="px-3 py-2 font-medium">風</th>
            <th className="px-3 py-2 font-medium">UV</th>
            <th className="px-3 py-2 font-medium">TIP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row.time} className={row.isRecommended ? 'bg-emerald-50' : ''}>
              <td className="px-3 py-2 font-medium text-slate-700">
                {row.isRecommended ? '✅ ' : ''}
                {formatToHourJst(row.time)}
              </td>
              <td className="px-3 py-2">{row.precipitationProbability}%</td>
              <td className="px-3 py-2">{row.precipitation.toFixed(1)} mm</td>
              <td className="px-3 py-2">{row.temperature.toFixed(1)}℃</td>
              <td className="px-3 py-2">{row.apparentTemperature.toFixed(1)}℃</td>
              <td className="px-3 py-2">{row.humidity}%</td>
              <td className="px-3 py-2">{row.windSpeed.toFixed(1)} m/s</td>
              <td className="px-3 py-2">{row.uvIndex.toFixed(1)}</td>
              <td className="px-3 py-2">
                {row.tips.length > 0 ? (
                  <ul className="list-inside list-disc text-[11px] text-slate-500">
                    {row.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[11px] text-slate-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
