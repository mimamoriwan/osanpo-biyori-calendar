import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-md">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">
            <span className="text-5xl mr-2">🐕</span>
            <br />
            おさんぽ日和カレンダー
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            愛犬との散歩に最適な時間帯を
            <br />
            気象データから自動でお知らせします
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/calendar"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all hover:shadow-xl"
            >
              今すぐカレンダーを見る
            </Link>
            <Link
              href="/mypage"
              className="bg-white hover:bg-gray-50 text-primary-700 font-bold py-4 px-8 rounded-lg shadow-lg border-2 border-primary-600 transition-all hover:shadow-xl"
            >
              マイページで設定
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-4xl mb-3">☀️</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            リアルタイム気象データ
          </h3>
          <p className="text-gray-600 text-sm">
            気温、湿度、UV指数、風速など詳細な気象データに基づいて散歩に最適な時間帯を提案します。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-4xl mb-3">⏰</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            おすすめ時間帯表示
          </h3>
          <p className="text-gray-600 text-sm">
            「この後◯分後」「◯時〜◯時は晴れ」など、わかりやすく最適な時間帯をお知らせします。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-4xl mb-3">🏠</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            お住まいの地域に対応
          </h3>
          <p className="text-gray-600 text-sm">
            マイページで自宅を登録すれば、お住まいの地域の気象データで散歩タイムを提案します。
          </p>
        </div>
      </section>

      {/* How to Use */}
      <section className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          使い方
        </h2>

        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-1">
                マイページで自宅を登録
              </h4>
              <p className="text-sm text-gray-600">
                住所または緯度経度を入力して、お散歩の基点となる場所を登録します。
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-1">
                カレンダーで天気を確認
              </h4>
              <p className="text-sm text-gray-600">
                現在の天気と、これからの時間帯別の気象データをチェック。
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-1">
                おすすめ時間帯で散歩へ
              </h4>
              <p className="text-sm text-gray-600">
                提案された時間帯に、愛犬と快適な散歩を楽しみましょう！
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <Link
          href="/calendar"
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-12 rounded-lg shadow-lg transition-all hover:shadow-xl text-lg"
        >
          さっそく使ってみる
        </Link>
      </section>
    </div>
  );
}
