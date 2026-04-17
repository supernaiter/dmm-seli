# dmm-seli

DMM.com の電子書籍 4 フロアを、キンセリ寄りの密度感で追う価格トラッカーです。

## このリポジトリの扱い

- `dmm-seli` は `av-hunt` と別プロジェクトです
- 環境変数、DB、Cloudflare Pages、GitHub Actions は `dmm-seli` 専用で持ちます
- 兄弟リポジトリの `.env` や状態ファイルは読みません

## 構成

- 配信: Cloudflare Pages
- API: Cloudflare Pages Functions
- DB: Postgres / Neon (`DATABASE_URL`)
- 収集: GitHub Actions の hourly collector
- 対象: `DMM.com / ebook / comic, novel, otherbooks, photo`

## セットアップ

```bash
cp .env.example .env.local
npm install
npm run test:live
npm run migrate
npm run collect:history
npm run build
```

## 主要コマンド

```bash
npm run dev
npm run build
npm run preview:pages
```

- `npm run dev`: フロントだけを確認
- `npm run preview:pages`: Cloudflare Pages Functions を含めて `http://127.0.0.1:4310` で確認

詳しい運用手順:

- [docs/standalone-ops.md](/Volumes/lyssr_workspace/2025_2/dmm-seli/docs/standalone-ops.md)

## 必要な環境変数

```bash
DMM_API_ID=
DMM_AFFILIATE_ID=dmmseli-990
DATABASE_URL=
```

旧名でも動きます。

```bash
api_id=
affiliate_ID_header=
```

`affiliate_id` は末尾が `-990..-999` でない場合、自動で `-990` を補います。

## API

- `GET /api/healthz`
- `GET /api/floors`
- `GET /api/products`
- `GET /api/products/:workId`

## GitHub Actions secrets

deploy:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

collector:

- `DMM_API_ID`
- `DMM_AFFILIATE_ID`
- `DATABASE_URL`

Pages Functions runtime:

- Cloudflare Pages project 側に `DATABASE_URL` secret を設定する
- GitHub secrets に `DATABASE_URL` が入っていても、Pages project 側に同じ値が別途必要です
