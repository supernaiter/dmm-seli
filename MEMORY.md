# dmm-seli Memory

## Recent lessons

- Linear plus local mirror plus automation memory caused duplicate source-of-truth overhead. Use GitHub Issues only.
- `autopilot-ready` in Linear stalled the runner because no issue had the label. GitHub uses the shorter `ready` label.
- GitHub automation now has a reusable global skill: `/Users/naoki/.codex/skills/workspace-autopilot-github/SKILL.md`.
- Add `in-progress` during each automation run to avoid duplicate issue ownership.
- If no `ready` issue exists, implementation automation must pause and hand off to Consult Pro for roadmap/blocker judgment.
- Consult Pro selected GH-7 as the next `ready` issue: create a real DMM external purchase path before sibling-site traffic work.
- Cloudflare deploy token was fixed; `deploy-cloudflare-pages` has recent successful runs.
- Manual deploy is live at `https://dmm-seli.pages.dev`; do not treat collector failure as site-down.
- Use `[skip ci]` on documentation-only or automation-only commits when no deploy verification is needed.
- `deploy-cloudflare-pages` failure log previously showed `wrangler-action@v3` installed Wrangler `3.90.0` even when `wranglerVersion: "4"` was set; if deploy fails again, confirm actual Wrangler version used in Actions.

## Repeat checks

- Before automation work, confirm exactly one `ready` GitHub issue is selected.
- For deploy work, verify `/api/healthz` response body has `ok: true` and `db: "ok"`.
- Keep `current.txt` under 50 lines and use key-value or bullets only.

## Promotion candidates

- If GitHub-only issue flow works for several runs, remove stale Linear docs entirely.
- If direct-to-main automation causes bad commits twice, add a stronger pre-push check before commit.
