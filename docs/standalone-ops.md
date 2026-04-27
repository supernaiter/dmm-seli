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
npm run test:public-qa
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

公開面QA:

```bash
npm run test:public-qa
```

## required GitHub secrets

collector:

- `DMM_API_ID`
- `DMM_AFFILIATE_ID`
- `DATABASE_URL`

deploy:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- workflow permission は `contents: read` と `deployments: write`
- `cloudflare/wrangler-action@v3` では `wranglerVersion: "4"` を固定する
- workflow は `concurrency` で branch ごとに1本へ絞り、`timeout-minutes: 15` を付ける
- workflow の Pages project 名は `CLOUDFLARE_PAGES_PROJECT` で1か所管理する
- deploy 成功後は `deployment-url` を `curl` で叩いて Pages URL の到達確認まで行う
- deploy 成功後は同じ URL から `/api/healthz` も叩いて API runtime の疎通まで確認する
- `/api/healthz` は 200 だけでなく JSON の `ok: true` と `db: "ok"` まで確認する
- deploy 後 verify は `scripts/verify-cloudflare-deployment.mjs` に寄せる
- deploy 後 verify script は 10 秒 timeout / 5 回 retry を持たせる
- alias URL が返る場合は、その URL 自体の到達確認も行う
- verify 失敗時も step summary に失敗理由を残す
- verify 成功時も step summary に `status: ok` を残す
- `CLOUDFLARE_API_TOKEN` は Pages project `dmm-seli` を読める token を使う
- token 権限は `Account > Cloudflare Pages > Edit` を含める

## required Cloudflare Pages secrets

Pages project: `dmm-seli`

- `DATABASE_URL`

## deployment checklist

- GitHub repo: `supernaiter/dmm-seli`
- Pages project: `dmm-seli`
- `DATABASE_URL` が GitHub secrets と Pages secrets の両方に入っている
- `collect-price-history` が成功している
- `deploy-cloudflare-pages` が成功している
- `npm run test:public-qa` が成功している

## monitoring

- collector: GitHub Actions の `collect-price-history` と `npm run collect:history` の JSON summary を見る
- deploy: GitHub Actions の `deploy-cloudflare-pages` と `/api/healthz` の `ok: true` / `db: "ok"` を見る
- public: `npm run test:public-qa`

## resolved blocker memo

- old failed runs: `24553853656`, `24555466221`, `24555692629`
- old error: `Authentication error [code: 10000]`
- status: Cloudflare deploy token is fixed and deploy workflow has recent successful runs

## do not do

- `av-hunt` 側の secret を流用する
- 兄弟リポジトリの `.env` を読む
- 兄弟リポジトリの `current.txt` を更新する
- 本番 DB 未設定のまま API runtime 版を deploy する
