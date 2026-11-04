# T01 — Block Hold off-turn

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

In `PlayerHalf.vue`, Hold gets the blocked look (grey, `aria-disabled`), emits nothing, and shows the dismissable notice "You can only hold on your turn." when `!active` (and the match is not over, i.e. `!disabled`). If both this and `scoreDisabled` apply, show the not-your-turn reason. Conquer is unchanged (blocked only by `scoreDisabled`). The notice clears when the player becomes active again (watch `active`), consistent with the existing notice clearing; the existing mechanism has `kind: 'score' | 'pass'`, add a kind for hold. Update the SPEC §3.4 "Disabled states" line.

### Scope

- Files: `src/components/match/PlayerHalf.vue`, `docs/SPEC.md`. Do not touch `src/views/MatchView.vue`.

### Acceptance criteria

- [ ] Non-active player's Hold looks blocked, emits nothing, shows the reason notice; active player's Hold works as before (unless scoreDisabled).
- [ ] Conquer works on either turn as before.
- [ ] Notice auto-clears when the player becomes active; match over → natively disabled, no notice.
- [ ] SPEC updated.

### Verification

```sh
npm run typecheck && npm test
```

---

## Handoff

_(Filled by task-worker.)_

### Summary
Hold is blocked (grey, aria-disabled, no emit) when not active; shows 'You can only hold on your turn.' (takes precedence over scoreDisabled). New notice kind 'hold' clears when player becomes active. Conquer unchanged. SPEC 3.4 updated.

### Files changed
src/components/match/PlayerHalf.vue, docs/SPEC.md

### Verification results
npm run typecheck: pass. npm test: 53 passed.

### Notes for next tasks

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:**
- **Findings:**
- **Verdict:** approved
- **Findings:**
  - Verified: typecheck and 53 tests pass. `PlayerHalf.vue` tapScore checks not-active first for hold (precedence over scoreDisabled), Conquer unchanged, aria-disabled/grey styling correct, `watch(active)` clears only the 'hold' notice, `disabled` still clears all notices. SPEC 3.4 updated.
  - Note (not a defect of this task): `src/views/MatchView.vue` has uncommitted changes (centre divider layout) that predate this task and are out of its scope; keep them out of this task's commit.
