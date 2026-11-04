# Fix unused `players` build error

- **Created:** 2026-11-04
- **Status:** done
- **Request:** Coolify Railpack deploy fails at `npm run build` (vue-tsc): `src/views/MatchView.vue(83,7): error TS6133: 'players' is declared but its value is never read.` Fix so `npm run build` passes.

## Goal

`npm run build` (`vue-tsc -b && vite build`) succeeds so the app can be deployed.

## Context

- Spec sections: none (no behaviour change)
- Relevant files: src/views/MatchView.vue

## Tasks

| ID  | Title                          | Depends on | Status |
| --- | ------------------------------ | ---------- | ------ |
| T01 | Remove unused `players` const  | –          | done   |

## Decisions

- Remove the dead constant rather than silence the compiler — it is genuinely unused.

## Outcome

Removed the unused `players` const from `MatchView.vue`. `npm run build` and `npm test` (53 tests) pass; reviewer approved. Follow-up: push and redeploy in Coolify.
