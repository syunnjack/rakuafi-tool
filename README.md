# rakuafi-tool

正規アフィリエイト情報を扱うReact/Viteサイトと、公式API準拠のデータ収集ツールです。

## DMMリストビルダー改良版

旧版の「頭文字＋件数」抽出を、全件ページング・再開・重複排除・JSON/CSV同時出力へ更新しています。HTMLスクレイピングは行わず、DMMアフィリエイトAPI v3の `ActressSearch` だけを使用します。

### 初期設定

1. `.env.example` を `.env.local` にコピーします。
2. DMMアフィリエイトで発行された `DMM_API_ID` と `DMM_AFFILIATE_ID` を設定します。
3. `.env.local` はGitへコミットしないでください。

### 全女優データの取得

```powershell
npm run data:actresses
```

出力先は `output/actress-catalog/` です。

- `actresses.json`: 正規化済みプロフィール
- `actresses.csv`: Excel対応UTF-8 BOM付きCSV
- `metadata.json`: 取得日時、件数、SHA-256、スキーマ
- `.checkpoint.json`: 中断後の再開位置

同じコマンドを再実行するとチェックポイントから再開します。最初から取得するときは、出力フォルダをバックアップ後に削除するか、`.env.local`で `DMM_RESUME=false` を指定します。

### 収録項目

ID、名前、読み、生年月日、年齢、身長、B/W/H、カップ、出身地、公式一覧URL、出典、確認日時を保存します。APIに存在しない値は空欄です。非公開情報の推測や外部プロフィールの無断結合は行いません。

### 安全設計

- 公式APIのみを使用
- 750msの既定リクエスト間隔
- 一時失敗時の指数バックオフ
- ページごとのチェックポイント保存
- ID単位の重複排除
- 認証情報と生成データはGit管理外
- 出典と取得日時を各レコードに保存

API仕様・利用規約・アフィリエイト審査条件が変更された場合は、最新の公式条件を優先してください。

## 作品・JANコードの取得

女優プロフィールAPIにはJANコードが含まれないため、公式 `ItemList` APIを別工程で巡回します。

```powershell
npm run data:works
```

`output/work-catalog/` に次を生成します。

- `works.json` / `works.csv`: 作品、JAN、content ID、product ID、メーカー、価格、URL
- `actress-works.json`: 女優IDと作品ID・JANの中間テーブル
- `metadata.json`: 作品数、JAN取得数、データ範囲、ハッシュ

デジタル作品にはJANが付与されない場合があります。その場合も他アプリで照合できるよう、`contentId` と `productId` を保存し、`identifierType` と `primaryIdentifier` で優先識別子を明示します。全プロフィールと作品を続けて取得する場合は `npm run data:all` を使用します。

## サイト開発

- `npm run dev`: 開発サーバー
- `npm run build`: 本番ビルド
- `npm run lint`: 静的解析
