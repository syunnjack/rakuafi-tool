# task-dashboard

## プロジェクト概要

（プロジェクトの目的・概要をここに記載してください）

## Git運用ルール

- **コードに変更を加えるたびに、必ずGitHubへプッシュすること。**
  - 変更内容が小さくても、作業が一段落したタイミングでコミット & プッシュを行う。
  - コミットメッセージは変更内容が分かるように簡潔に記載する。
  - プッシュ前に `git status` / `git diff` で変更内容を確認する。
  - force push（`git push --force`）は明示的な指示がない限り行わない。
  - `main`/`master` ブランチへの直接pushではなく、作業用ブランチを切ってPRを作成する運用を基本とする（指示があればこの限りではない）。

## デプロイ先

https://syunnjack.github.io/task-dashboard/

GitHub Actions（`.github/workflows/deploy.yml`）により、`main` ブランチへのpush時に自動でビルド & デプロイされる。

## 技術スタック

- 言語: JavaScript (JSX)
- フレームワーク: React 19
- ビルドツール: Vite
- Lint: oxlint
- パッケージ管理: npm
- データ永続化: ブラウザの localStorage（`task-dashboard.tasks` キーにタスク配列をJSON保存）
- ランタイム: Node.js v24 / npm v11

### 主なコマンド

- `npm run dev`: 開発サーバー起動
- `npm run build`: 本番ビルド
- `npm run preview`: ビルド結果のプレビュー
- `npm run lint`: oxlintによる静的解析

## コンポーネントの命名規約

- コンポーネントファイルはパスカルケース + `.jsx`（例: `App.jsx`）。
- コンポーネント本体の関数名はファイル名と一致させる（例: `App.jsx` → `function App()`）。
- 対応するスタイルシートはコンポーネントと同名の `.css`（例: `App.jsx` ↔ `App.css`）とし、同一ディレクトリに配置する。
- アプリ全体のグローバルスタイル・CSS変数（テーマカラー等）は `index.css` に記載し、コンポーネント固有のスタイルは各コンポーネントの `.css` に閉じ込める。
- イベントハンドラ関数はキャメルケースの動詞始まり（例: `addTask`, `toggleTask`, `deleteTask`）。
- CSSクラス名はケバブケース（例: `task-form`, `delete-button`）。状態を表すクラスは要素の基本クラスに追加するモディファイア形式とする（例: 完了タスクは `task done`）。
