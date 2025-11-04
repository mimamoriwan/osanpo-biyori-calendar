# osanpo-biyori-calendar

おさんぽ日和カレンダーは、LINEのリッチメニューから開くことを想定したモバイル向けLIFF WebアプリのMVPです。登録した自宅（住所または緯度経度）にもとづいてOpen-Meteoの最新気象データを取得し、今日のお散歩におすすめの時間帯を提案します。

## セットアップ

### 前提
- Node.js 18以上（推奨: v18 LTS）
- npm 9以上

### 依存関係のインストール
```bash
npm install
```

### 環境変数の設定
1. `.env.sample` を `.env.local` にコピーします。
   ```bash
   cp .env.sample .env.local
   ```
2. Firebase コンソールでプロジェクトを作成し、Webアプリを追加して以下を取得します。
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID
3. `.env.local` に取得した値を入力します。LIFFを利用する場合は `NEXT_PUBLIC_LIFF_ID` も設定してください（未設定でも匿名認証で動作します）。

## Firebase 設定

1. **Authentication**
   - 匿名認証 (Anonymous) を有効化します。

2. **Firestore**
   - データベースを作成し、ネイティブモードを選択します。
   - セキュリティルール例（開発用。運用では適切なルールに更新してください）:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         match /settings/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
     ```

3. **Hosting**
   - Firebase CLI をインストールしログインします: `npm install -g firebase-tools && firebase login`
   - 初回のみ `firebase init hosting` を実行し、既存設定 (frameworks) を選択します。
   - デプロイ手順:
     ```bash
     npm run build
     firebase deploy
     ```

## 開発コマンド
- `npm run dev` : 開発サーバー (http://localhost:3000)
- `npm run build` : 本番ビルド
- `npm run lint` : ESLint 実行
- `npm run format` : Prettier で整形

## Open-Meteo API について
- エンドポイント: `https://api.open-meteo.com/v1/forecast`
- 主なパラメータ例:
  ```
  latitude=35.680959
  longitude=139.767125
  hourly=temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,uv_index,apparent_temperature,wind_speed_10m
  forecast_days=2
  timezone=Asia/Tokyo
  ```
- Open-MeteoはAPIキー不要ですが、利用規約に従い適切なアクセス制御を行ってください。

## Nominatim (OpenStreetMap) 利用時の注意
- リクエストには必ず固有の User-Agent を設定してください（本プロジェクトでは `osanpo-biyori-calendar/0.1` を設定済み）。
- レート制限が厳しく商用利用には追加許可が必要です。大量リクエストやバッチ処理は避け、キャッシュなどの対応を検討してください。
- 住所検索が失敗する場合は、緯度経度を手動で入力できるUIを提供しています。

## 画面フロー
1. **/** トップページ
   - サービス概要とCTA（LINEで開く / マイページへ / 今すぐカレンダー）
   - Skeleton UI で読み込み中もスムーズに表示
2. **/mypage** マイページ
   - 住所入力と緯度経度入力を切り替え可能
   - 住所→緯度経度変換 (Nominatim) / Mapプレビュー（Leaflet）
   - Firestore `users/{uid}` に `home` 情報を保存
3. **/calendar** カレンダー
   - 登録地点の最新気象を取得し、現在のサマリ＋おすすめ時間帯を表示
   - 推奨時間帯は自然文とともにTIPを提示。詳細ページへの遷移リンクあり
4. **/details** 詳細
   - 1時間ごとの気象データをテーブル表示（横スクロール対応）
   - 推奨帯には✅、注意は⚠で明示

### 主要コンポーネント
- `Header` / `Footer`: 共通レイアウト
- `WeatherNowCard`: 現在の気象サマリ
- `RecommendationCard`: 推奨時間帯の自然文提示
- `TimeBlockTable`: 詳細テーブル（✅/⚠表示）
- `MapPreview`: Leafletによる登録地点プレビュー

## おすすめ時間帯ロジック
- `src/lib/recommend.ts` に実装。デフォルト閾値を元に各スロットのスコアを計算し、連続した快適時間帯を結合して上位1〜2件を返します。
- 純関数なので簡単なユニットテスト例:
  ```bash
  node -e "const { recommendTimeBlocks, evaluateHourly } = require('./dist/recommend');"
  ```
  TypeScriptのままテストする場合は `tsx` や `ts-node` を利用してください。

## 受け入れ基準 (Definition of Done)
- `/mypage` で住所→緯度経度または直接入力を保存し、Firestore `users/{uid}.home` に登録できる
- `/calendar` で登録地点の最新データを取得し「現在のサマリ」と「おすすめ時間帯」を表示する
- 「この後◯分後」「◯時〜◯時は晴れ」形式の自然文TIPが表示される
- `/details` で時間帯ごとのテーブルが表示され、✅/⚠とTIPが付与される
- ページを開くたびにAPIから最新値で再計算する（キャッシュしない）
- スマホ表示でレイアウトが崩れず、操作性が良い

## ローカル開発・デプロイ・LIFF
1. **ローカル起動**
   ```bash
   npm run dev
   ```
2. **本番ビルド**
   ```bash
   npm run build
   ```
3. **Firebase Hosting デプロイ**
   ```bash
   firebase deploy
   ```
4. **LIFF 有効化 (任意)**
   - LINE Developers コンソールでLIFFアプリを作成し、LIFF IDを取得
   - `.env.local` の `NEXT_PUBLIC_LIFF_ID` に設定
   - アプリ起動時に `useLiff` フックが `liff.init()` を呼び出します（未設定なら no-op）

