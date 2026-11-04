# T01 — Disabled states for Conquer/Hold/Pass

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

In `PlayerHalf`, Conquer and Hold are disabled once that player scored both battlefields ("mine" and "opponent") in the current turn; Pass Turn is disabled when that player is not the active player. Disabled buttons must look clearly disabled (stronger than the current `disabled:opacity-40`, e.g. greyed `disabled:bg-slate-700 disabled:text-slate-500`, `disabled:cursor-not-allowed`, no colour) and be non-clickable.

### Scope

- Files to change: `src/components/match/PlayerHalf.vue`, `src/views/MatchView.vue` (add props for both PlayerHalf usages, derived from `state.scoredThisTurn[p].length >= 2` and `state.activePlayer`). Optionally a test in `src/game/match.test.ts` is NOT needed (no game logic change).
- MatchView.vue has unrelated uncommitted edits in the centre divider; leave them untouched.

### Out of scope

- Game logic, Special +1, Undo, Resign, SPEC changes beyond a one-line note in the match-screen section of `docs/SPEC.md` describing the disabled states.

### Context to read

- `docs/SPEC.md` §3.5 / §4.2 / §4.6 (match screen, turns, one score per battlefield)

### Acceptance criteria

- [ ] Conquer & Hold disabled (visibly greyed) when both battlefields scored this turn by that player; enabled otherwise, and re-enabled after Undo / new turn.
- [ ] Pass Turn disabled (visibly greyed) for the non-active player; enabled for the active player.
- [ ] Everything also disabled when the match is over (existing behaviour).
- [ ] SPEC updated with one line.

### Verification

```sh
npm run typecheck && npm test
```

---

## Handoff

### Summary
Added `scoreDisabled`/`passDisabled` props to PlayerHalf; Conquer/Hold disabled when `scoredThisTurn[p].length >= 2`, Pass when not active player. Shared `btn` disabled style is now `disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500` (no colour). One line added to SPEC 3.4.

### Files changed
- src/components/match/PlayerHalf.vue, src/views/MatchView.vue (only the two PlayerHalf usages), docs/SPEC.md

### Verification results
`npm run typecheck` passed; `npm test` 53/53 passed. Not visually checked in a browser.

### Notes for next tasks

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - All acceptance criteria met. `src/components/match/PlayerHalf.vue:12-13,24,53-56` and `src/views/MatchView.vue:102-103,145-146` derive the disabled state from `scoredThisTurn[p].length >= 2` and `activePlayer`, so Undo and a new turn re-enable the buttons. Match-over disabling is kept. SPEC line added at `docs/SPEC.md:122`. `npm run typecheck` and `npm test` pass (53/53).
  - The centre-divider edits in `MatchView.vue` are the pre-existing uncommitted ones and were left alone.
