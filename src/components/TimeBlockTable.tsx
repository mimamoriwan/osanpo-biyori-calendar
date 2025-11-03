'use client';

import { TimeSlot } from '@/lib/recommend';
import { formatJST } from '@/lib/time';

interface TimeBlockTableProps {
  slots: TimeSlot[];
}

export default function TimeBlockTable({ slots }: TimeBlockTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">時間別の詳細</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2">時刻</th>
              <th className="text-center py-3 px-2">気温</th>
              <th className="text-center py-3 px-2">体感</th>
              <th className="text-center py-3 px-2">降水</th>
              <th className="text-center py-3 px-2">湿度</th>
              <th className="text-center py-3 px-2">UV</th>
              <th className="text-center py-3 px-2">風</th>
              <th className="text-center py-3 px-2">おすすめ</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, idx) => {
              const isRecommended = slot.score >= 7;
              const hasWarnings = slot.warnings.length > 0;

              return (
                <tr
                  key={idx}
                  className={`border-b border-gray-100 ${
                    isRecommended ? 'bg-primary-50' : ''
                  }`}
                >
                  <td className="py-3 px-2 font-medium">
                    {formatJST(slot.time, 'HH:mm')}
                  </td>
                  <td className="text-center py-3 px-2">
                    {Math.round(slot.temp)}°C
                  </td>
                  <td className="text-center py-3 px-2 text-gray-600 text-xs">
                    {Math.round(slot.apparentTemp)}°C
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="text-xs">
                      {slot.precipProb}%
                      <br />
                      <span className="text-gray-500">
                        {slot.precipitation.toFixed(1)}mm
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">{slot.humidity}%</td>
                  <td className="text-center py-3 px-2">
                    {slot.uv.toFixed(1)}
                    {slot.uv > 6 && <span className="text-orange-600 ml-1">⚠</span>}
                  </td>
                  <td className="text-center py-3 px-2">
                    {slot.wind.toFixed(1)}
                    {slot.wind > 6 && <span className="text-orange-600 ml-1">⚠</span>}
                  </td>
                  <td className="text-center py-3 px-2">
                    {isRecommended ? (
                      <span className="text-xl">✅</span>
                    ) : hasWarnings ? (
                      <span className="text-xl">⚠️</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {slots.length > 0 && (
        <div className="mt-4 text-xs text-gray-600">
          <p className="mb-1">✅: 散歩におすすめの時間帯</p>
          <p className="mb-1">⚠️: 注意が必要な時間帯</p>
          <p>⚠: UV指数または風速が高め</p>
        </div>
      )}
    </div>
  );
}
