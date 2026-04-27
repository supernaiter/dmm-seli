# POLICY.md

## Algorithmic Operating Policy

### 0. Source Of Truth Gate

1. Use GitHub Issues as the active work list.
2. Treat old task trackers as history only.
3. Do not create or update task state outside GitHub Issues.
4. Use commits on `main` as implementation records.
5. Use CI, tests, lint, build, or smoke checks as verification records.

### 1. Issue Intake Gate

1. List open GitHub Issues.
2. Select exactly one issue with label `ready`.
3. If no `ready` issue exists: stop and report `not ready`.
4. If issue has `blocked`, `needs-human`, `needs-contract`, or `no-autopilot`: skip it.
5. If issue lacks Goal, Scope, Acceptance, or Verification: remove `ready`, comment the missing fields, and stop.
6. If local work already exists, continue only when it maps to the selected ready issue.

### 2. Pre-Edit Gate

1. Read `current.txt` and fresh `SESSION_BRIEF.md` first.
2. If `SESSION_BRIEF.md` is missing or stale: regenerate from `POLICY.md`, `MEMORY.md`, `decisions.log`, and `lessons.md`.
3. Read the selected GitHub Issue.
4. Inspect repo state before editing.
5. If unrelated uncommitted changes exist: preserve them and do not stage them.
6. If the safe edit path is unclear: stop and comment the blocker.

### 3. Execution Flow

1. Implement the smallest change that satisfies the issue.
2. Do not expand scope for cleanup, refactor, or polish unless required by the issue.
3. Run the closest deterministic check first: test, lint, build, or smoke.
4. If verification fails and the fix is in scope: fix and rerun the check.
5. If verification fails and the cause is unclear: stop, mark blocked, and comment the failing command.
6. If verification passes: commit only the files changed for this issue.
7. Push `main`.
8. Comment on the issue with summary, changed files, verification, commit hash, and next action.
9. Close the issue when acceptance is met.

### 4. Safety Gates

1. Never overwrite or revert unrelated user changes.
2. No deploy, publish, billing, credential, production data, or destructive operation without explicit human approval.
3. If CI fails after a pushed local-code change and the responsible commit is clear: revert that commit and write the result to the issue.
4. If failure cause is unclear: stop and write a blocker comment.
5. If secrets or credentials appear in the diff: stop and remove them before commit.

### 5. Memory Promotion Flow

1. Put recent lessons, repeated mistakes, and local gotchas in `MEMORY.md`.
2. Promote a lesson to `POLICY.md` only when it should apply to future runs.
3. Keep `POLICY.md` durable and decision-oriented.
4. Keep `MEMORY.md` recent and actionable.

### 6. Human Communication Flow

1. Answer the question directly first.
2. Use normal plain sentences for human conversation.
3. Do not use genshijin compression for human-facing explanations unless the user explicitly asks.
4. Use genshijin compression only for state files, work logs, and internal task notes.
5. Avoid jargon. If a technical term is necessary, explain it immediately.
6. Separate facts, guesses, and open questions.
7. State missing or broken items exactly.
8. Do not overclaim or hide weak results.

### 7. Project Decision Flow

1. Find project-specific rules below.
2. Convert each value judgment into yes/no checks before acting.
3. If a rule says something must be rejected, blocked, or noindexed: treat it as a hard gate.
4. If project-specific rules conflict with this common policy: follow the stricter safety rule and write the conflict to the issue.
5. If the project-specific rule is too vague to execute: mark `needs-contract`, ask for the missing decision, and stop.

---

## Existing Project Policy

# dmm-seli Policy

## Source of truth

- GitHub Issues are the only source of truth for work, decisions, blockers, and execution results.
- Codex owns implementation only for `ready` issues. If no issue is `ready`, the implementation automation must pause and hand off roadmap/blocker judgment to Consult Pro.
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

1. If no `ready` issue exists, pause implementation automation and ask Consult Pro for blocker removal or north-star/roadmap update.
2. Pick one `ready` GitHub issue when available.
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
- Pausing implementation because no `ready` issue exists is a real state change.
- If local code or read-only CI fails after an automation commit, auto-revert is allowed and must be recorded on the issue.

## Reflection

- Daily reflection may update `MEMORY.md` and promote repeated lessons to `POLICY.md`.
- Reflection must not implement issue work, deploy, publish, or rotate secrets.

## Product priority

- Goal: DMM.com 電子書籍価格トラッカーを収益化し、キンセリから兄弟サイトまたはリンク導線を得る。
- Current north star: create a valid external DMM click path from the DMM-Seli detail page.
- Order: existing resource reuse, kinseri-like usability, affiliate click path, sibling-site path, live data stability, then polish.
- Close criteria: `/` and `/works/:workId` feel natural, data is fresh enough, major paths are not broken, DMM affiliate CTA is natural, sibling-site explanation is one sentence.
## Session Brief Rules

- Read `current.txt` and fresh `SESSION_BRIEF.md` at startup.
- `SESSION_BRIEF.md` compresses `POLICY.md`, `MEMORY.md`, `decisions.log`, and `lessons.md`.
- Regenerate only when source files changed.
- Keep under 40 lines.
- Use short bullets and concrete filenames.
- Do not hide blockers, failures, or weak results.
## Human Communication

- Human conversation uses normal plain sentences.
- Do not use genshijin compression for human-facing explanations unless the user explicitly asks.
- Use genshijin compression only for state files, work logs, and internal task notes.
- Answer directly first.
- Use plain language and short sentences.
- Avoid jargon; explain unavoidable technical terms immediately.
- Separate facts, guesses, and open questions.
- State missing or broken items exactly.
- Do not overclaim or hide weak results.
- Use concrete examples before abstract wording.
- Project explanations order: what it is, goal, why it matters, working now, blocked now, next question.
