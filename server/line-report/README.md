# LINE daily report for X Server

GitHub Pages だけでは、メールやLINEの自動送信はできません。
このフォルダは、XサーバーなどPHPが動くレンタルサーバーで毎朝LINE通知を送るための補助スクリプトです。

## 仕組み

1. rakuafi-tool の日次レポートを保存すると、ブラウザから `api.php` へレポート数値をPOSTします。
2. `api.php` は `data/reports.json` に直近レポートを保存します。
3. Xサーバーのcronが毎日 `send-line-report.php` を実行します。
4. `send-line-report.php` がLINE Messaging APIへ日報をpush送信します。

## 必須設定

通知が届くには、以下がすべて必要です。

- LINE DevelopersでMessaging APIチャネルを作る
- チャネルアクセストークンを発行する
- 自分のLINE userIdを確認する
- Xサーバーへ `server/line-report/` の中身をアップロードする
- `config.php.example` を `config.php` にコピーして実値を入れる
- Xサーバーのcronで `send-line-report.php` を毎日実行する
- rakuafi-tool画面の「LINE通知設定」に `api.php` のURLと共有トークンを保存する

## config.php

`config.php.example` を `config.php` にコピーして、以下を設定します。

```php
return [
    'sync_shared_secret' => '任意の長い共有トークン',
    'allowed_origin' => 'https://syunnjack.github.io',
    'line_channel_access_token' => 'LINEのチャネルアクセストークン',
    'line_user_id' => '通知を受け取るLINE userId',
    'line_api_base' => 'https://api.line.me',
];
```

`sync_shared_secret` は、rakuafi-tool画面の「共有シークレット」と同じ値にしてください。

## Xサーバーへの配置例

例:

```text
/home/xxxx/xxxx.com/public_html/rakuafi-report/api.php
/home/xxxx/xxxx.com/public_html/rakuafi-report/send-line-report.php
/home/xxxx/xxxx.com/public_html/rakuafi-report/config.php
```

rakuafi-tool画面に入れる同期先URL:

```text
https://あなたのドメイン/rakuafi-report/api.php
```

## cron設定例

Xサーバーのサーバーパネルでcronを開き、毎朝9:00などに以下を実行します。

```bash
php /home/xxxx/xxxx.com/public_html/rakuafi-report/send-line-report.php
```

パスは実際にアップロードした場所へ置き換えてください。

## 動作確認

ブラウザで `api.php` をGETすると、正常なら次のようなJSONが返ります。

```json
{"ok":false,"error":"method_not_allowed"}
```

これは「POST以外を拒否している」だけなので、設置自体は見えています。

ローカルでPHPが使える場合は、次のように確認できます。

```bash
cd server/line-report
cp config.php.example config.php
php -S 127.0.0.1:8090
```

別ターミナル:

```bash
curl -i -X POST http://127.0.0.1:8090/api.php \
  -H "Content-Type: application/json" \
  -H "X-Sync-Token: CHANGE_ME" \
  -H "Origin: https://syunnjack.github.io" \
  -d '{"reports":[{"date":"2026-08-04","clicks":10,"orders":1,"sales":3000,"reward":90}]}'
```

`{"ok":true,"count":1}` が返れば受信側は正常です。

## 届かない時に見る場所

- rakuafi-tool画面のLINE同期ステータス
- Xサーバー上の `data/reports.json`
- Xサーバー上の `data/send-log.txt`
- `config.php` のアクセストークン、userId、共有トークン
- Xサーバーcronの実行パス

## 注意

この仕組みはLINE通知を送るためのものです。クリック、売上、報酬を保証するものではありません。
報酬改善には、商品別リンク、楽天キャンペーン、クーポン訴求、投稿後24時間のクリック確認を継続して回してください。
