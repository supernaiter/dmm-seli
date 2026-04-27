# dmm-seli Agent Rules

## Startup

- Read `current.txt` first, up to 50 lines.
- Read `POLICY.md` next.
- Read `MEMORY.md` next.
- If `current.txt` is missing, create it with `project`, `updated`, `goal`, and `[STATUS]`.
- If `POLICY.md` or `MEMORY.md` is missing, create a minimal GitHub-only version before project work.

## Work Source

- GitHub Issues are the only active source for work, decisions, blockers, and execution results.
- Linear is frozen historical reference only.
- Pull requests are not used for normal automation.
- Commits to `main` and CI results are facts.
- `current.txt` is a local startup cache only.

## Execution

- Start only open GitHub issues labeled `ready`.
- Do not start issues labeled `blocked`, `needs-human`, `needs-contract`, or `no-autopilot`.
- Use `in-progress` while claiming an issue.
- Keep edits scoped to the issue.
- Do not revert unrelated dirty worktree changes.
- Stage only files changed for the current issue.
- Commit directly to `main`, push, comment the commit hash and verification result on the issue, then close the issue when complete.

## Local Files

- Progress made: update `current.txt`.
- Durable rule changed: update `POLICY.md`.
- Reusable lesson or watchpoint found: update `MEMORY.md`.
- Keep `current.txt` under 50 lines.
- Do not use prose in `current.txt`; use key-value lines or bullets.

## User Language

- Use plain Japanese for user-facing replies.
- Call the user `マスター`.
- Separate `done:`, `not done:`, and `next:` facts clearly.
