# T01 — Remove unused `players` const

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

`npm run build` passes: remove the unused `players` declaration that triggers TS6133.

### Scope

- Files to change: `src/views/MatchView.vue` (the `const players: PlayerIndex[] = [1, 0]` line near line 83, plus the `PlayerIndex` import only if it becomes unused).

### Out of scope

- Any other refactor, tsconfig changes, or disabling `noUnusedLocals`.

### Context to read

- `src/views/MatchView.vue` (script block, and check the template doesn't reference `players`)

### Acceptance criteria

- [ ] `players` is removed (confirm via grep it is not used in the template).
- [ ] No other unused symbols introduced.
- [ ] `npm run build` exits 0.

### Verification

```sh
npm run build
npm test
```

---

## Handoff

_(Filled by task-worker.)_

### Summary
Removed unused `const players` (template uses only `match.players`); `PlayerIndex` import still used.

### Files changed
- src/views/MatchView.vue

### Verification results
- `npm run build`: passes
- `npm test`: 53 passed

### Notes for next tasks

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:** None. `players` const removed; only `match.players` is used in the template; `PlayerIndex` still used (lines 20, 36-61). `npm run build` exits 0, `npm test` 53 passed. Minor: a stray blank line remains before `</script>` (`src/views/MatchView.vue:82`), harmless.
