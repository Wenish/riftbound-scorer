# T01 — Rename badge to YOUR TURN

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

The yellow badge shown for the active player reads "YOUR TURN" instead of "TURN".

### Scope

- Files to change: `src/components/match/PlayerHalf.vue` (line ~34, the `<span v-if="active" ...>TURN</span>`), plus any test or `docs/SPEC.md` text that references the badge literal.

### Out of scope

- `src/views/MatchView.vue` has unrelated uncommitted changes — do not touch it.
- Styling changes, other labels.

### Context to read

- `src/components/match/PlayerHalf.vue`

### Acceptance criteria

- [ ] Badge text is "YOUR TURN"; layout still fits (badge should not wrap — add `whitespace-nowrap` if needed).
- [ ] Typecheck and tests pass.

### Verification

```sh
npm run typecheck && npm test
```

---

## Handoff

_(Filled by task-worker.)_

### Summary
Badge text changed to YOUR TURN with whitespace-nowrap. No test/SPEC references to the literal found.

### Files changed
- src/components/match/PlayerHalf.vue

### Verification results
`npm run typecheck` passed; `npm test` 53/53 passed.

### Notes for next tasks

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - `src/components/match/PlayerHalf.vue:34` — badge reads YOUR TURN with `whitespace-nowrap`; only that line changed in this file. Typecheck and tests (53/53) pass when re-run. No other literal references in src or SPEC.
  - Note: `src/views/MatchView.vue` shows a diff, but it was already uncommitted before this task (per brief) and is not part of T01.
