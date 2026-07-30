# LINE daily report (Xサーバー用)

rakuafi-tool のレポート数値を、毎朝1回LINEへ自動送信するための小さなPHPスクリプト一式。
GitHub Pages(静的サイト)にはブラウザ外の定期実行を持てないため、Xサーバー側で動かす。

## 仕組み

1. ブラウザで日次レポートを保存するたびに、rakuafi-tool が `api.php` にレポート配列をPOSTする。
2. `api.php` は `data/reports.json` に上書き保存するだけ。
3. Xサーバーのcronが毎朝1回 `send-line-report.php` をCLI実行し、`reports.json` を読んで
   LINE Messaging APIへプッシュ送信する。

## セキュリティについて(必ず読んでください)

`api.php` を呼ぶための共有シークレットは、rakuafi-tool のJSバンドルに埋め込まれます。
GitHub Pages は誰でも閲覧・ダウンロードできる公開サイトなので、**このシークレットは
「本当の秘密」にはなりません**(ブラウザの開発者ツールやソースを見れば読み取れます)。

- 目的は完全な不正防止ではなく、無関係な第三者からの誤送信を減らすことです。
- `api.php` は日付+4つの数値という固定フォーマットしか受け付けないため、悪用されても
  実害は「LINEの日報が変な数字になる」程度に限定されます。
- 気になる場合は `config.php` の `sync_shared_secret` を随時ローテーションしてください
  (ローテーションしたら rakuafi-tool 側の同期設定も同じ値に変更する必要があります)。

## セットアップ手順

### 1. LINE公式アカウント(Messaging API)を作る

1. https://developers.line.biz/ja/ にログイン(LINEアカウントでOK)。
2. 新規プロバイダーを作成し、「Messaging API」チャネルを作成。
3. チャネル基本設定の「チャネルアクセストークン(長期)」を発行してコピーしておく。
4. 作成した公式アカウントを自分のLINEで友だち追加する。
5. 自分のuserIdを確認する: チャネル基本設定の「あなたのユーザーID」欄、または
   LINE Official Account Manager の「アカウント設定」からも確認できます。

### 2. Xサーバーへアップロード

1. `server/line-report/` フォルダ一式(`api.php`, `send-line-report.php`,
   `config.php.example`)を、Xサーバーの好きなドメイン配下のサブディレクトリに
   FTP/ファイルマネージャーでアップロード(例: `/home/xxxx/xxxx.com/public_html/rakuafi-report/`)。
2. `config.php.example` を `config.php` にコピーし、実際の値を入力:
   - `sync_shared_secret`: 好きなランダム文字列(長め推奨)
   - `line_channel_access_token`: 手順1で発行したトークン
   - `line_user_id`: 手順1で確認したuserId
3. `data/` ディレクトリがWebサーバーから書き込み可能なパーミッションになっていることを確認
   (`api.php`が自動で作成しますが、権限エラーになる場合は手動で755/777等に調整)。
4. ブラウザまたはcurlで `https://あなたのドメイン/rakuafi-report/api.php` にGETアクセスし、
   `{"ok":false,"error":"method_not_allowed"}` が返れば設置成功(POST以外は拒否される仕様)。

### 3. Xサーバーのcron設定

1. Xサーバーの「サーバーパネル」→「cron設定」を開く。
2. 実行間隔: 毎朝送りたい時刻に1日1回(例: 7:00)。
3. 実行するコマンド: `php /home/xxxx/xxxx.com/public_html/rakuafi-report/send-line-report.php`
   (アップロード先の実際のパスに置き換える)。
4. 保存後、翌朝の実行を待つか、SSHが使えるなら手動で一度実行して動作確認する。

### 4. rakuafi-tool側の設定

rakuafi-tool の「日報メール」セクション付近にある「LINE同期設定」で、以下を入力:
- 同期先URL: `https://あなたのドメイン/rakuafi-report/api.php`
- 共有シークレット: `config.php` に設定したものと同じ値

日次レポートを保存するたびに、自動でこのURLへ送信されます。

## 動作確認(このリポジトリ内で完結する範囲)

ローカルでPHPが使える場合、`server/line-report/` で以下を実行して手元検証できます。

```bash
cp config.php.example config.php
php -S 127.0.0.1:8090
```

別ターミナルから:

```bash
curl -i -X POST http://127.0.0.1:8090/api.php \
  -H "Content-Type: application/json" \
  -H "X-Sync-Token: CHANGE_ME" \
  -H "Origin: https://syunnjack.github.io" \
  -d '{"reports":[{"date":"2026-07-31","clicks":10,"orders":1,"sales":3000,"reward":90}]}'
```

`{"ok":true,"count":1}` が返り、`data/reports.json` が作成されれば受信側は正常です。

LINEへの実送信そのものは、実際のチャネルアクセストークンとuserIdを設置した後、
Xサーバー上で試してください(このリポジトリ内では実トークンを扱えないため)。
