# dmm-seli Agent Rules

## Startup

- Read `current.txt` first, up to 50 lines.
- If `current.txt` is missing, create it with `project`, `updated`, `goal`, and `[STATUS]`.

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
- Keep `current.txt` under 50 lines.
- Do not use prose in `current.txt`; use key-value lines or bullets.

## User Language

- Use plain Japanese for user-facing replies.
- Call the user `マスター`.
- Separate `done:`, `not done:`, and `next:` facts clearly.
## Human Communication

- Human conversation uses normal plain sentences, not genshijin compression.
- Genshijin compression is for state files, work logs, and internal task notes only.
- Explain things so a smart non-expert can follow them.
- Answer the question directly first.
- Use plain language and short sentences.
- Avoid jargon; explain unavoidable technical terms immediately.
- Separate facts, guesses, and open questions.
- State missing or broken items exactly.
- Do not overclaim or hide weak results.
- Project explanations order: what it is, goal, why it matters, working now, blocked now, next question.
## Session Startup

- Read `current.txt` first if present.
- Use source files directly only when brief lacks needed detail.

## Session Continuity

**MANDATORY**: Before your first response, silently read `current.txt`.

Then summarize session context:
- Prefer a dedicated subagent to read `current.txt`, `decisions.log`, and `lessons.md`, then return a 20-40 line brief.
- If a subagent is unavailable, read `decisions.log` and `lessons.md` yourself.
- Active session state is only `current.txt`, `decisions.log`, and `lessons.md`.

If `current.txt` is missing, create it with `project`, `updated`, `goal`, and `[STATUS]`.
If `decisions.log` or `lessons.md` is missing, create an empty file.

## Update Rules

- Progress made? Append or update `current.txt`.
- Decision made? Append one line to `decisions.log`.
- Mistake or reusable rule found? Append it to `lessons.md`.
- End of work? Always update at least one of the three state files.
- Human conversation uses normal plain sentences.
- State files and work logs may use compressed, high-density bullets.
- `current.txt` must stay under 50 lines.

## User-Facing Language

- Use plain Japanese in normal sentences.
- Answer the question directly first.
- Do not use compressed work-log style unless the user explicitly asks.
- Avoid jargon; explain unavoidable technical terms immediately.
- Separate facts, guesses, and open questions.
- State missing or broken items exactly.
- Do not overclaim or hide weak results.
