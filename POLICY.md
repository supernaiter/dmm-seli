# dmm-seli Policy

## Source of truth

- GitHub Issues are the only source of truth for work, decisions, blockers, and execution results.
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

1. Pick one `ready` GitHub issue.
2. Read `POLICY.md`, `MEMORY.md`, `current.txt`, and the issue body/comments.
3. Inspect the local repo before editing.
4. Implement the shortest useful change.
5. Run deterministic checks closest to the change.
6. Commit to `main` and push when checks pass.
7. Comment on the issue with summary, changed files, verification, commit, and next action.
8. Close the issue when done.

Implementation automation uses the global `workspace-autopilot-github` skill.

## Safety

- Never revert unrelated uncommitted changes.
- Never deploy, publish, rotate secrets, or perform irreversible external operations unless the issue explicitly asks for it and required credentials are present.
- Never add mock data, fake timers, fake ratings, or placeholder history.
- If there is no `ready` issue, do not edit `current.txt` or commit unless a real state change occurred.
- If local code or read-only CI fails after an automation commit, auto-revert is allowed and must be recorded on the issue.

## Reflection

- Daily reflection may update `MEMORY.md` and promote repeated lessons to `POLICY.md`.
- Reflection must not implement issue work, deploy, publish, or rotate secrets.

## Product priority

- Goal: DMM.com 電子書籍価格トラッカーを収益化し、キンセリから兄弟サイトまたはリンク導線を得る。
- Order: existing resource reuse, kinseri-like usability, live data stability, affiliate path, then polish.
- Close criteria: `/` and `/works/:workId` feel natural, data is fresh enough, major paths are not broken, DMM affiliate CTA is natural, sibling-site explanation is one sentence.
