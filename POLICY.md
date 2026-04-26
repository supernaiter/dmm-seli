# dmm-seli Policy

## Source of truth

- GitHub Issues are the only source of truth for work, decisions, blockers, and execution results.
- Codex owns keeping the GitHub backlog seeded from the north star and close criteria. Humans should not need to manually invent the next issue.
- Linear is frozen and reference-only. Do not create new Linear work or mirror GitHub state back to Linear.
- Pull requests are not used. Codex works on `main`, commits directly, pushes, and writes results back to the GitHub issue.

## Start gate

- Codex may start only GitHub issues with the `ready` label.
- Issues without `ready` are untouched.
- Use `in-progress` while an automation run owns an issue; other runs must skip it.
- Remove `ready` before closing an issue or when the issue becomes blocked.
- Use `needs-contract` when the issue lacks a clear goal or acceptance criteria.
- Use `needs-human` for external credentials, account changes, product judgment, or unclear requirements.
- Use `blocked` when work cannot continue from repo-local facts.

## Work loop

1. If no `ready` issue exists, create missing GitHub issues from the goal and close criteria, then mark the next highest priority issue `ready`.
2. Pick one `ready` GitHub issue.
3. Read `POLICY.md`, `MEMORY.md`, `current.txt`, and the issue body/comments.
4. Inspect the local repo before editing.
5. Implement the shortest useful change.
6. Run deterministic checks closest to the change.
7. Commit to `main` and push when checks pass.
8. Comment on the issue with summary, changed files, verification, commit, and next action.
9. Close the issue when done.

Implementation automation uses the global `workspace-autopilot-github` skill.

## Safety

- Never revert unrelated uncommitted changes.
- Never deploy, publish, rotate secrets, or perform irreversible external operations unless the issue explicitly asks for it and required credentials are present.
- Never add mock data, fake timers, fake ratings, or placeholder history.
- While `CLOUDFLARE_API_TOKEN` is blocked and `deploy-cloudflare-pages` is known to fail, it is acceptable to use `[skip ci]` on documentation-only or automation-only commits to avoid wasted deploy runs.
- If there is no `ready` issue, do not edit `current.txt` or commit unless a real state change occurred.
- Creating or promoting the next issue from the north star is a real state change.
- If local code or read-only CI fails after an automation commit, auto-revert is allowed and must be recorded on the issue.

## Reflection

- Daily reflection may update `MEMORY.md` and promote repeated lessons to `POLICY.md`.
- Reflection must not implement issue work, deploy, publish, or rotate secrets.

## Product priority

- Goal: DMM.com 電子書籍価格トラッカーを収益化し、キンセリから兄弟サイトまたはリンク導線を得る。
- Order: existing resource reuse, kinseri-like usability, live data stability, affiliate path, then polish.
- Close criteria: `/` and `/works/:workId` feel natural, data is fresh enough, major paths are not broken, DMM affiliate CTA is natural, sibling-site explanation is one sentence.
