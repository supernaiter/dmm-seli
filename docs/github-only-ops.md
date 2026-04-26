# dmm-seli GitHub-only operations

## Contract

- source_of_truth: GitHub Issues
- policy: `POLICY.md`
- memory: `MEMORY.md`
- implementation_facts: git commits
- verification_facts: local checks and GitHub Actions
- pull_requests: none
- automation_start_label: `ready`
- automation_claim_label: `in-progress`
- skill: `/Users/naoki/.codex/skills/workspace-autopilot-github/SKILL.md`

## Labels

- `ready`: Codex may start this issue.
- `in-progress`: automation has claimed this issue; other runs skip it.
- `needs-contract`: issue lacks enough goal or acceptance criteria for automation.
- `needs-human`: human input or external account action required.
- `blocked`: repo-local work cannot continue.
- `no-autopilot`: Codex must not start this issue.

## Automation loop

1. Query open issues with `ready`.
2. Skip issues with `in-progress`, `blocked`, `needs-contract`, `needs-human`, or `no-autopilot`.
3. Pick one issue only and add `in-progress`.
4. Read `POLICY.md`, `MEMORY.md`, `current.txt`, and the issue.
5. Implement in the local repo.
6. Run deterministic checks.
7. Commit to `main` and push.
8. Comment result to the issue.
9. Remove `ready` and `in-progress`, then close issue or mark blocked.

## Reflection loop

- cadence: daily
- reads: recent closed issues, commits, CI failures, `MEMORY.md`
- writes: `MEMORY.md`; repeated rules may be promoted to `POLICY.md`
- forbidden: implementation, deploy, publish, secret rotation

## Current blocker

- GitHub Actions deploy needs a valid `CLOUDFLARE_API_TOKEN` for Cloudflare Pages project `dmm-seli`.
- Until that token exists, deploy workflow work must use `needs-human`, not `ready`.
