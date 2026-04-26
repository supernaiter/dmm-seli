# dmm-seli GitHub-only operations

## Contract

- source_of_truth: GitHub Issues
- policy: `POLICY.md`
- memory: `MEMORY.md`
- implementation_facts: git commits
- verification_facts: local checks and GitHub Actions
- pull_requests: none
- automation_start_label: `ready`

## Labels

- `ready`: Codex may start this issue.
- `needs-human`: human input or external account action required.
- `blocked`: repo-local work cannot continue.
- `no-autopilot`: Codex must not start this issue.

## Automation loop

1. Query open issues with `ready`.
2. Pick one issue only.
3. Read `POLICY.md`, `MEMORY.md`, `current.txt`, and the issue.
4. Implement in the local repo.
5. Run deterministic checks.
6. Commit to `main` and push.
7. Comment result to the issue.
8. Close issue or mark blocked.

## Current blocker

- GitHub Actions deploy needs a valid `CLOUDFLARE_API_TOKEN` for Cloudflare Pages project `dmm-seli`.
- Until that token exists, deploy workflow work must use `needs-human`, not `ready`.
