# dmm-seli

DMM.com の電子書籍だけを扱う、Cloudflare Pages 向けの静的サイトです。

## 概要

- 対象: `DMM.com / ebook / comic, novel, otherbooks, photo`
- 形式: React + Vite + TypeScript の SPA
- データ: DMM アフィリエイト API から毎時ライブ取得し、静的 JSON を生成
- 配信: Cloudflare Pages
- 特徴: キンセリ系の密度感を残しつつ、DMM 電子書籍だけを別サービスで扱う

## 主要コマンド

```bash
npm install
npm run test:live
npm run build
npm run dev
```

## 必要な環境変数

どちらの名前でも動きます。

```bash
DMM_API_ID=
DMM_AFFILIATE_ID=
```

または

```bash
api_id=
affiliate_ID_header=
```

`affiliate_id` は末尾が `-990..-999` でない場合、自動で `-990` を補います。

## 生成される公開データ

- `public/data/top.json`
- `public/data/works-index.json`
- `public/data/works/<encoded-work-id>.json`

これらはビルド時に毎回生成され、Git 管理には含めません。

## Cloudflare Pages / GitHub Actions

workflow で必要な secret:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `DMM_API_ID`
- `DMM_AFFILIATE_ID`

deploy workflow は `main` push / 手動実行 / 毎時スケジュールで動く前提です。
