# rakuafi-tool

楽天アフィリエイト運用を支援する React + Vite アプリです。

成果や報酬の増加を保証するものではありません。初期表示は2026-08-04時点で確認済みの直近30日実績（クリック9件、売上0円、成果報酬0円、売上件数0件、CVR 0.00%）だけです。

## 実装状況

- 実装済み: 手入力、公式レポートCSVインポート、商品別リンク検証、24時間後の数値比較、ブラウザ保存
- 条件付きで実装済み: Xサーバー + cron + LINE Messaging APIによる日報送信。外部配置、認証情報、共有トークン設定後のみ動作
- 未実装: 楽天レポートの自動取得、楽天側で成果報酬を発生・増加させる処理
- 未確認: 実環境のLINE認証情報を使った到達確認

## Deploy

このリポジトリは GitHub Pages へのデプロイを前提としています。
現在、独自ドメインは割り当てていません。`darekore.jp` は `task-dashboard` 専用です。

- Build command: `npm run build`
- Build output directory: `dist`
- Deploy trigger: `main` ブランチへの push

## Commands

- `npm run dev`: 開発サーバー起動
- `npm run build`: 本番ビルド
- `npm run lint`: 静的解析
- `npm run perf`: localStorage書き込みの再現ベンチマーク
- `npm test`: CSVと保存処理のテスト
- `npm run preview`: ビルド結果のプレビュー
