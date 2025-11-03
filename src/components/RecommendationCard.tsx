'use client';

import { RecommendationResult } from '@/lib/recommend';
import { formatJST } from '@/lib/time';
import Link from 'next/link';

interface RecommendationCardProps {
  recommendation: RecommendationResult;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { periods, nextGoodTime } = recommendation;

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-primary-900 mb-4">
        おすすめ時間帯
      </h2>

      {nextGoodTime && (
        <div className="bg-white rounded-md p-4 mb-4">
          <p className="text-sm text-gray-600 mb-1">この後お散歩行くなら</p>
          <p className="text-2xl font-bold text-primary-700">{nextGoodTime.comment}</p>
        </div>
      )}

      {periods.length > 0 ? (
        <div className="space-y-3">
          {periods.map((period, idx) => (
            <div key={idx} className="bg-white rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-lg font-bold text-gray-800">
                  {formatJST(period.startTime, 'HH:mm')} 〜{' '}
                  {formatJST(period.endTime, 'HH:mm')}
                </p>
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-sm text-gray-700">{period.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-md p-4">
          <p className="text-gray-700">
            今日はあまり散歩に適した時間帯がありません。
            <br />
            詳細を確認してみてください。
          </p>
        </div>
      )}

      <Link
        href="/details"
        className="block mt-4 text-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-md transition-colors"
      >
        詳細を見る
      </Link>
    </div>
  );
}
