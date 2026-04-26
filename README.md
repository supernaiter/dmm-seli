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
- [docs/github-only-ops.md](/Volumes/lyssr_workspace/2025_2/dmm-seli/docs/github-only-ops.md)
- [docs/close-criteria.md](/Volumes/lyssr_workspace/2025_2/dmm-seli/docs/close-criteria.md)

## 自動運用

- GitHub Issues を唯一の正本にします
- `ready` label が付いた issue だけ Codex が実行します
- PR は使わず、検証後に `main` へ直接 commit / push します
- 継続ルールは [POLICY.md](/Volumes/lyssr_workspace/2025_2/dmm-seli/POLICY.md)、最近の学びは [MEMORY.md](/Volumes/lyssr_workspace/2025_2/dmm-seli/MEMORY.md) に置きます

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
- workflow permission は `contents: read` と `deployments: write` を持たせる
- `cloudflare/wrangler-action@v3` では `wranglerVersion: "4"` を固定して deploy 時の版ぶれを避ける
- workflow は `concurrency` で branch ごとに1本へ絞り、`timeout-minutes: 15` を付ける
- workflow の Pages project 名は `CLOUDFLARE_PAGES_PROJECT` で1か所管理する
- deploy 成功後は `deployment-url` を `curl` で叩いて Pages URL の到達確認まで行う
- deploy 成功後は同じ URL から `/api/healthz` も叩いて API runtime の疎通まで確認する
- `/api/healthz` は 200 だけでなく JSON の `ok: true` と `db: "ok"` まで確認する
- deploy 後 verify は `scripts/verify-cloudflare-deployment.mjs` に寄せ、workflow 側の shell を肥大化させない
- deploy 後 verify script は 10 秒 timeout / 5 回 retry を持たせ、直後の反映待ちを吸収する
- alias URL が返る場合は、その URL 自体の到達確認も同じ script で行う
- verify 失敗時も step summary に失敗理由を残す
- verify 成功時も step summary に `status: ok` を残す
- `deploy-cloudflare-pages` で `Authentication error [code: 10000]` が出る場合は、Pages project `dmm-seli` を読める Cloudflare token に差し替える
- Cloudflare Docs の Pages CI / REST API 手順どおり、token 権限は `Account > Cloudflare Pages > Edit` を含める

collector:

- `DMM_API_ID`
- `DMM_AFFILIATE_ID`
- `DATABASE_URL`

Pages Functions runtime:

- Cloudflare Pages project 側に `DATABASE_URL` secret を設定する
- GitHub secrets に `DATABASE_URL` が入っていても、Pages project 側に同じ値が別途必要です

deploy blocker memo:

- 失敗 run: `24553853656`, `24555466221`, `24555692629`
- 共通エラー: `A request to the Cloudflare API (/accounts/.../pages/projects/dmm-seli) failed` / `Authentication error [code: 10000]`
- 対応: GitHub secret `CLOUDFLARE_API_TOKEN` を Pages project `dmm-seli` に対して有効な token へ更新する
- 必要権限: `Account > Cloudflare Pages > Edit`
- 補足: GitHub Actions 側は `deployments: write` と `gitHubToken: ${{ secrets.GITHUB_TOKEN }}` を付けて deployment 反映を許可する
- 補足: `wrangler-action` は `wranglerVersion` 指定に対応しているので `4` に固定して実行環境差分を減らす
