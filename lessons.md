# Lessons

## Git Pilot
- 作業開始: GitHub issue契約確認→ready 1件だけ実装 (理由: scope拡散防止)
- 完了時: commit hash + verificationをissue commentへ書く (理由: 再開可能)

## Session Brief
- 人間へ説明する時: 直接答え、短文、平易語、事実/推測/未解決を分ける (理由: 非専門家も追える説明にするため)
- 人間と会話する時: genshijin圧縮を使わず、平易な普通文で返す。圧縮は状態ファイル・作業ログだけに使う (理由: 読みやすさを壊さないため)



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
- Collector fetches at most 800 items per run (4 floors x rank/date x 100). Do not compare the per-run registry size against total historical DB rows.
- Public QA should check `/`, `/works`, `/api/healthz`, `/api/floors`, `/api/products`, first detail API, and DMM `af_id` before closing traffic/affiliate issues.
- Use `[skip ci]` on documentation-only or automation-only commits when no deploy verification is needed.
- `deploy-cloudflare-pages` failure log previously showed `wrangler-action@v3` installed Wrangler `3.90.0` even when `wranglerVersion: "4"` was set; if deploy fails again, confirm actual Wrangler version used in Actions.
- On 2026-04-27, GH-13 filled the remaining GitHub-only operation files: `AGENTS.md`, `CLAUDE.md`, and `.github/ISSUE_TEMPLATE/codex-ready.yml`.
- The repo can have local non-issue artifacts like `.playwright-mcp/` and `dmm-seli-live-publish-ready.png`; do not stage them unless an issue explicitly scopes them.
- `autonomous-harness` is not installed on PATH in this workspace; treat the skill instruction as an execution contract unless a harness binary appears.

## Repeat checks

- Before automation work, confirm exactly one `ready` GitHub issue is selected.
- For deploy work, verify `/api/healthz` response body has `ok: true` and `db: "ok"`.
- Keep `current.txt` under 50 lines and use key-value or bullets only.

## Promotion candidates

- If GitHub-only issue flow works for several runs, remove stale Linear docs entirely.
- If direct-to-main automation causes bad commits twice, add a stronger pre-push check before commit.
- Human explanation rule: direct answer, plain words, facts/guesses/questions separated, missing or broken items named.
- Human conversation rule: normal plain sentences. Genshijin compression only for state files and work notes.


updated: 2026-04-27
style: short bullets, plain words, no jargon

[FACTS]
- GitHub Issues = active work list.
- current.txt = local startup cache, max 50 lines.
- decisions.log = decision history.
- lessons.md = reusable behavior rules.

[STARTUP]
- Read current.txt first.
- Use source files directly only when brief lacks needed detail.

[WORK]
- Only ready GitHub issue can be automation work.
- One run = one issue.
- Success: commit hash + verification to issue.
- Blocker: state exact missing piece.
- No deploy/delete/publish unless issue permits.

[LANGUAGE]
- Human conversation: normal plain Japanese sentences.
- Do not use genshijin compression for human explanations unless user asks.
- Genshijin compression: state files, work logs, internal task notes only.
- Avoid jargon, coined words, inner jokes.
- If technical term needed: explain immediately.
- Separate facts, guesses, open questions.
- Say missing/broken items exactly.

## Compacted Rules
- セッション開始: 本体は `current.txt` だけを読む。必要なら別エージェントが `current.txt` / `decisions.log` / `lessons.md` を20-40行に要約する (理由: 起動時token削減)
- 作業終了: 進捗は `current.txt`、判断は `decisions.log`、再発防止は `lessons.md` へ必ず追記する (理由: 次回作業を止めない)
- GitHub作業: `ready` issue を1件だけ選び、検証後に main へ commit/push し、issue へ commit hash と検証結果を書く (理由: 実行結果を追跡するため)
- 安全: unrelated changes / secrets / deploy / publish / delete / billing / production data を勝手に触らない (理由: 破壊事故防止)
- 人間向け会話: 平易な普通文で返す。圧縮文は状態ファイルと作業ログだけに使う (理由: 説明品質を落とさない)
- Use GitHub Issues as the active work list.
- Treat old task trackers as history only.
- Do not create or update task state outside GitHub Issues.
- Use commits on `main` as implementation records.
- Use CI, tests, lint, build, or smoke checks as verification records.
- List open GitHub Issues.
- Select exactly one issue with label `ready`.
- If no `ready` issue exists: stop and report `not ready`.
- If issue has `blocked`, `needs-human`, `needs-contract`, or `no-autopilot`: skip it.
- If issue lacks Goal, Scope, Acceptance, or Verification: remove `ready`, comment the missing fields, and stop.
- If local work already exists, continue only when it maps to the selected ready issue.
- Read the selected GitHub Issue.
- Inspect repo state before editing.
- If unrelated uncommitted changes exist: preserve them and do not stage them.
- If the safe edit path is unclear: stop and comment the blocker.
- Implement the smallest change that satisfies the issue.
- Do not expand scope for cleanup, refactor, or polish unless required by the issue.
- Run the closest deterministic check first: test, lint, build, or smoke.
- If verification fails and the fix is in scope: fix and rerun the check.
- If verification fails and the cause is unclear: stop, mark blocked, and comment the failing command.
- If verification passes: commit only the files changed for this issue.
- Push `main`.
- Comment on the issue with summary, changed files, verification, commit hash, and next action.
- Close the issue when acceptance is met.
- Never overwrite or revert unrelated user changes.
- No deploy, publish, billing, credential, production data, or destructive operation without explicit human approval.
- If CI fails after a pushed local-code change and the responsible commit is clear: revert that commit and write the result to the issue.
- If failure cause is unclear: stop and write a blocker comment.
- If secrets or credentials appear in the diff: stop and remove them before commit.
- Answer the question directly first.
- Use normal plain sentences for human conversation.
- Do not use genshijin compression for human-facing explanations unless the user explicitly asks.
- Use genshijin compression only for state files, work logs, and internal task notes.
- Avoid jargon. If a technical term is necessary, explain it immediately.
- Separate facts, guesses, and open questions.
- State missing or broken items exactly.
- Do not overclaim or hide weak results.
- Find project-specific rules below.
- Convert each value judgment into yes/no checks before acting.
- If a rule says something must be rejected, blocked, or noindexed: treat it as a hard gate.
- If project-specific rules conflict with this common policy: follow the stricter safety rule and write the conflict to the issue.
- If the project-specific rule is too vague to execute: mark `needs-contract`, ask for the missing decision, and stop.
- GitHub Issues are the only source of truth for work, decisions, blockers, and execution results.
- Codex owns implementation only for `ready` issues. If no issue is `ready`, the implementation automation must pause and hand off roadmap/blocker judgment to Consult Pro.
- Linear is frozen and reference-only. Do not create new Linear work or mirror GitHub state back to Linear.
