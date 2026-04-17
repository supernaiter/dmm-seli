# dmm-seli standalone ops

## separation policy

- `dmm-seli` は `av-hunt` と別プロジェクト
- 環境変数はこのリポジトリ内の `.env.local` または `.env` だけを読む
- 兄弟リポジトリの `.env`、`current.txt`、DB、deploy 設定は参照しない
- GitHub repo、Cloudflare Pages project、DB は `dmm-seli` 専用で持つ

## required local env

`.env.local`

```bash
DMM_API_ID=
DMM_AFFILIATE_ID=dmmseli-990
DATABASE_URL=
```

## local setup

```bash
npm install
npm run test:live
npm run migrate
npm run collect:history
npm run build
```

## local preview

フロントだけを見る:

```bash
npm run dev
```

Pages Functions も含めて確認する:

```bash
npm run build
npm run preview:pages
```

標準URL:

- `http://127.0.0.1:4310`

## required GitHub secrets

collector:

- `DMM_API_ID`
- `DMM_AFFILIATE_ID`
- `DATABASE_URL`

deploy:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## required Cloudflare Pages secrets

Pages project: `dmm-seli`

- `DATABASE_URL`

## deployment checklist

- GitHub repo: `supernaiter/dmm-seli`
- Pages project: `dmm-seli`
- `DATABASE_URL` が GitHub secrets と Pages secrets の両方に入っている
- `collect-price-history` が成功している
- `deploy-cloudflare-pages` が成功している

## do not do

- `av-hunt` 側の secret を流用する
- 兄弟リポジトリの `.env` を読む
- 兄弟リポジトリの `current.txt` を更新する
- 本番 DB 未設定のまま API runtime 版を deploy する
