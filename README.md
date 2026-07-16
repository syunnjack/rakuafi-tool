# task-dashboard

React + Vite で作成したタスクダッシュボードです。

## Deploy

このリポジトリは Cloudflare Pages での公開を前提にしています。

- Production domain: `darekore.jp`
- Cloudflare Pages project: `darekore`
- Build command: `npm run build`
- Build output directory: `dist`

GitHub Actions からデプロイする場合は、Repository secrets に以下を設定してください。

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Commands

- `npm run dev`: 開発サーバー起動
- `npm run build`: 本番ビルド
- `npm run lint`: 静的解析
- `npm run preview`: ビルド結果のプレビュー
- `npm run deploy:cloudflare`: Cloudflare Pages へ手動デプロイ
