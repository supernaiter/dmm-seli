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
2. If none exist, pause implementation automation and hand off to Consult Pro / roadmap automation.
3. Skip issues with `in-progress`, `blocked`, `needs-contract`, `needs-human`, or `no-autopilot`.
4. Pick one issue only and add `in-progress`.
5. Read `POLICY.md`, `MEMORY.md`, `current.txt`, and the issue.
6. Implement in the local repo.
7. Run deterministic checks.
8. Commit to `main` and push.
9. Comment result to the issue.
10. Remove `ready` and `in-progress`, then close issue or mark blocked.

## Monitoring

- collector: confirm the latest `collect-price-history` run and the JSON summary line from `npm run collect:history`.
- deploy: confirm the latest `deploy-cloudflare-pages` run and `npm run test:cloudflare-deploy` result.
- public QA: run `npm run test:public-qa` against `https://dmm-seli.pages.dev` or set `QA_BASE_URL` for another Pages URL.
- failure writeback: record the failing run URL on the relevant GitHub issue, then update `MEMORY.md` for one-off lessons or `POLICY.md` for repeated rules.

## No ready handoff

- source: `current.txt` goal, `POLICY.md` product priority, `docs/close-criteria.md`
- action: pause `dmm-seli-github-implementation`
- consult: ask Pro for blocker removal, roadmap order, or north-star update
- ready: only after a concrete issue is selected by roadmap judgment
- forbidden: implementation, deploy, publish, secret rotation

## Reflection loop

- cadence: daily
- reads: recent closed issues, commits, CI failures, `MEMORY.md`
- writes: `MEMORY.md`; repeated rules may be promoted to `POLICY.md`
- forbidden: implementation, deploy, publish, secret rotation

## Current blocker

- none
