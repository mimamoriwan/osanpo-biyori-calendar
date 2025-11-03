# おさんぽ日和カレンダー 🐕

愛犬との散歩に最適な時間帯を、気象データから自動で提案するWebアプリケーションです。

「みまもりWAN!!」の関連ミニサービスとして、LINEのリッチメニューから開くLIFF対応のWeb Appとして設計されています。

## 主な機能

- **リアルタイム気象データ**: Open-Meteo APIから最新の天気情報を取得
- **おすすめ時間帯の提案**: 気温、湿度、UV指数、風速、降水確率を総合的に分析
- **わかりやすい表示**: 「この後◯分後から散歩OK」「◯時〜◯時は晴れ」など自然言語で表示
- **詳細データ**: 時間ごとの気象データを一覧表示
- **自宅登録**: 住所または緯度経度で散歩の基点を登録

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, React, Tailwind CSS
- **バックエンド**: Firebase (Authentication, Firestore, Hosting)
- **気象API**: Open-Meteo (無料・APIキー不要)
- **ジオコーディング**: Nominatim (OpenStreetMap)
- **地図表示**: Leaflet + React-Leaflet
- **LINE連携**: LIFF SDK (プレースホルダ実装済み)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Authentication を有効化（匿名認証を有効に）
3. Firestore Database を作成（テストモードで開始）
4. プロジェクト設定から Firebase SDK の設定情報を取得

### 3. 環境変数の設定

`.env.sample` を `.env.local` にコピーして、Firebase の設定情報を記入します：

```bash
cp .env.sample .env.local
```

`.env.local` を編集：

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# LIFF ID (オプション - LINE連携時に設定)
NEXT_PUBLIC_LIFF_ID=""
```

### 4. Firebase CLI のセットアップ

Firebase Hosting へのデプロイのため、Firebase CLI をインストールします：

```bash
npm install -g firebase-tools
firebase login
```

プロジェクトを初期化：

```bash
firebase init hosting
# "Use an existing project" を選択
# Public directory: "out"
# Single-page app: No
# GitHub Actions: No (任意)
```

`.firebaserc.sample` を `.firebaserc` にコピーして、プロジェクトIDを記入：

```bash
cp .firebaserc.sample .firebaserc
```

`.firebaserc` を編集：

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 5. ローカル開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 使い方

1. **マイページで自宅を登録**
   - 住所または緯度経度を入力
   - 保存ボタンをクリック

2. **カレンダーページで確認**
   - 現在の天気情報を表示
   - おすすめ時間帯を確認
   - 「詳細を見る」で時間別データを確認

3. **散歩に出かける**
   - おすすめ時間帯に愛犬と散歩へ！

## デプロイ

### Firebase Hosting へのデプロイ

1. プロジェクトをビルド：

```bash
npm run build
```

2. Firebase にデプロイ：

```bash
firebase deploy --only hosting
```

デプロイが完了すると、Firebase Hosting の URL が表示されます。

## LIFF 連携の有効化

LINE Developers Console で LIFF アプリを作成し、環境変数に LIFF ID を設定することで、LINE アプリ内で利用できます。

### LIFF アプリの作成手順

1. [LINE Developers Console](https://developers.line.biz/) にログイン
2. チャネルを作成（LINE Login チャネル）
3. LIFF タブから「追加」をクリック
4. 以下の設定を入力：
   - **LIFF app name**: おさんぽ日和カレンダー
   - **Size**: Full
   - **Endpoint URL**: Firebase Hosting の URL
   - **Scope**: profile, openid
   - **Bot link feature**: Off

5. 作成された LIFF ID を `.env.local` に追加：

```env
NEXT_PUBLIC_LIFF_ID="1234567890-abcdefgh"
```

6. 再ビルドしてデプロイ：

```bash
npm run build
firebase deploy --only hosting
```

## テスト

ユニットテストを実行：

```bash
npm test
```

ウォッチモードで実行：

```bash
npm run test:watch
```

## プロジェクト構成

```
osanpo-biyori-calendar/
├── src/
│   ├── app/                    # Next.js App Router ページ
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── page.tsx            # トップページ
│   │   ├── mypage/             # マイページ
│   │   ├── calendar/           # カレンダーページ
│   │   └── details/            # 詳細ページ
│   ├── components/             # React コンポーネント
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── WeatherNowCard.tsx
│   │   ├── RecommendationCard.tsx
│   │   ├── TimeBlockTable.tsx
│   │   └── MapPreview.tsx
│   ├── lib/                    # ユーティリティ・ロジック
│   │   ├── firebase.ts         # Firebase 初期化
│   │   ├── geocode.ts          # ジオコーディング
│   │   ├── openMeteo.ts        # 気象API
│   │   ├── recommend.ts        # おすすめ時間帯算出
│   │   ├── time.ts             # 日時処理
│   │   └── liff.ts             # LIFF SDK ラッパー
│   └── types/                  # TypeScript 型定義
├── public/                     # 静的ファイル
├── .env.sample                 # 環境変数サンプル
├── firebase.json               # Firebase 設定
├── .firebaserc.sample          # Firebase プロジェクト設定
└── README.md                   # このファイル
```

## おすすめ時間帯の算出ロジック

`src/lib/recommend.ts` で実装されています。

### 評価基準（デフォルト）

- **降水確率**: 30% 以下
- **降水量**: 0.2mm/h 以下
- **気温（体感）**: 8〜26°C
- **湿度**: 35〜75%
- **UV指数**: 6 以下
- **風速**: 6 m/s 以下

### スコアリング

各条件を満たすと加点され、合計スコアが高い時間帯を「おすすめ」として提案します：

- 降水条件クリア: +4点
- 気温条件クリア: +3点
- 湿度条件クリア: +2点
- UV条件クリア: +1点
- 風速条件クリア: +1点

合計11点満点中、7点以上を「おすすめ時間帯」としています。

## API について

### Open-Meteo API

- **利用規約**: [Open-Meteo Terms](https://open-meteo.com/en/terms)
- **APIキー**: 不要
- **レート制限**: 1万リクエスト/日（非商用）

### Nominatim API (OpenStreetMap)

- **利用規約**: [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- **APIキー**: 不要
- **レート制限**: 1リクエスト/秒
- **注意**: User-Agent ヘッダーの設定が必須（実装済み）

## ライセンス

MIT License

## お問い合わせ

みまもりWAN!! プロジェクトチーム

---

**注意**: このアプリケーションは気象データに基づく参考情報を提供するものです。実際の散歩の判断は、飼い主様の責任で行ってください。
