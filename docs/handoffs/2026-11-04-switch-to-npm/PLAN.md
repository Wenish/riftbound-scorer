# Switch package manager from pnpm to npm

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "i dont want to use pnpm i jsut want to use npm"

## Goal

The project uses npm only: `package-lock.json` replaces `pnpm-lock.yaml`, Tauri's before-dev/build
commands call npm, and agent-facing docs say npm. All scaffold checks still pass with npm.

## Context

- Previous plan: [2026-11-04-scaffold-app](../2026-11-04-scaffold-app/PLAN.md) (chose pnpm)
- Relevant files: `pnpm-lock.yaml`, `src-tauri/tauri.conf.json`, `.gitignore`, `CLAUDE.md`,
  `docs/handoffs/_templates/TASK.md`

## Tasks

| ID  | Title                    | Depends on | Status |
| --- | ------------------------ | ---------- | ------ |
| T01 | Replace pnpm with npm    | –          | done   |

## Decisions

- Package manager: **npm** (supersedes pnpm from the scaffold plan). — user
- Old handoff files keep their pnpm commands as history; not rewritten. — orchestrator
- Add a one-line npm convention to `CLAUDE.md` so future agents don't reach for pnpm. — orchestrator

## Outcome

npm replaces pnpm: `pnpm-lock.yaml` removed, `package-lock.json` (lockfileVersion 3) added, Tauri
before-dev/build commands use `npm run dev` / `npm run build`, `pnpm-debug.log*` dropped from `.gitignore`,
npm convention added to `CLAUDE.md`, task template verification example uses npm.

Verified by worker and re-run by reviewer (approved): clean `npm install` (no peer conflicts, no force flags),
`npm run typecheck`, `npm test`, `npm run build`, `npm run tauri info`, `cargo check` — all exit 0; all 13 direct
dependencies resolve to the exact versions previously locked by pnpm; only remaining `pnpm` mention outside
historical handoffs is the CLAUDE.md "don't use pnpm/yarn" rule.
