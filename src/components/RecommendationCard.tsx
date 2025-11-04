import { formatRangeToJst, minutesUntil } from '@/lib/time';
import type { Recommendation } from '@/lib/recommend';

type RecommendationCardProps = {
  recommendation: Recommendation | null;
  isLoading?: boolean;
};

export default function RecommendationCard({ recommendation, isLoading }: RecommendationCardProps) {
  if (isLoading) {
    return <div className="skeleton h-28 w-full" aria-hidden="true" />;
  }

  if (!recommendation) {
    return (
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-primary-dark">おすすめ時間帯</h2>
        <p className="mt-2 text-sm text-slate-500">
          申し訳ありません、今日の条件ではおすすめできる時間帯が見つかりませんでした。
          お散歩の際は天候に十分お気をつけください。
        </p>
      </section>
    );
  }

  const minutes = minutesUntil(recommendation.start);
  const startEnd = formatRangeToJst(recommendation.start, recommendation.end);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-primary-dark">おすすめ時間帯</h2>
      <p className="mt-2 text-base font-medium text-slate-700">
        {minutes <= 0
          ? '今すぐお散歩に行けます！'
          : `この後${minutes}分後からがおすすめです。`}
      </p>
      <p className="mt-1 text-sm text-slate-600">{startEnd} は特に快適に過ごせそうです。</p>
      {recommendation.tips.length > 0 && (
        <ul className="mt-3 list-inside list-disc text-xs text-slate-500">
          {recommendation.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
