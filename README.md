# ステラーゴ網干SC U-15 公式サイト

兵庫県姫路市網干エリアを拠点とするジュニアユース(U-15)サッカークラブ「ステラーゴ網干SC」の公式ホームページです。

GitHub Pages で公開しています。

## 構成

- `index.html` — トップページ
- `about.html` — クラブ概要・理念・スタッフ紹介
- `news.html` — お知らせ一覧
- `recruit.html` — 入団募集情報
- `contact.html` — お問い合わせフォーム
- `assets/css/style.css` — 共通スタイル
- `assets/js/main.js` — ナビ開閉・お知らせ読み込み
- `assets/data/news.json` — お知らせデータ(更新はこのファイルを編集するだけ)
- `assets/img/` — ロゴ・写真素材

## お知らせの更新方法

`assets/data/news.json` に以下の形式でオブジェクトを追加してください(日付降順で自動表示されます)。

```json
{
  "date": "2026-09-01",
  "tag": "募集",
  "title": "タイトル",
  "body": "本文"
}
```

## お問い合わせフォームについて

[FormSubmit.co](https://formsubmit.co/) を利用しており、`stellago.sc.u15@gmail.com` 宛にメールで届きます。初回送信時のみ確認メールが届くので、リンクを開いて有効化してください。

## ローカルでの確認方法

```bash
npx serve .
```
