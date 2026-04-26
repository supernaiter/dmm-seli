# dmm-seli Memory

## Recent lessons

- Linear plus local mirror plus automation memory caused duplicate source-of-truth overhead. Use GitHub Issues only.
- `autopilot-ready` in Linear stalled the runner because no issue had the label. GitHub uses the shorter `ready` label.
- GitHub automation now has a reusable global skill: `/Users/naoki/.codex/skills/workspace-autopilot-github/SKILL.md`.
- Add `in-progress` during each automation run to avoid duplicate issue ownership.
- Cloudflare deploy workflow is blocked by `CLOUDFLARE_API_TOKEN` auth error 10000. The required fix is a token that can read/edit Pages project `dmm-seli`.
- Manual deploy is live at `https://dmm-seli.pages.dev`; do not treat deploy workflow failure as site-down.
- While deploy is blocked, `[skip ci]` on doc-only/automation-only commits prevents `deploy-cloudflare-pages` runs on push and avoids noise.
- `deploy-cloudflare-pages` failure log shows `wrangler-action@v3` installed Wrangler `3.90.0` even when `wranglerVersion: "4"` is set; if deploy still fails after token fix, confirm actual Wrangler version used in Actions.

## Repeat checks

- Before automation work, confirm exactly one `ready` GitHub issue is selected.
- For deploy work, verify `/api/healthz` response body has `ok: true` and `db: "ok"`.
- Keep `current.txt` under 50 lines and use key-value or bullets only.

## Promotion candidates

- If GitHub-only issue flow works for several runs, remove stale Linear docs entirely.
- If direct-to-main automation causes bad commits twice, add a stronger pre-push check before commit.
