# T01 — Resign action in game logic + spec

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

Add a `resign` action to the pure game logic so a player can resign, the other player wins, the match is flagged as resigned, and Undo reverts it. Update the spec.

### Scope

- Files to create/change: `src/game/types.ts`, `src/game/match.ts`, `src/game/index.ts`, `src/game/match.test.ts`, `src/game/codes.ts` (only if needed for undo-toast labels), `src/stores/matches.ts` (add a `resign(player)` store action mirroring the other actions, persisted atomically like them; make sure Undo works when the match is over due to resignation), `docs/SPEC.md`.
- Add `ResignAction { kind: 'resign'; id; player: PlayerIndex /* who resigned */; at }` to `MatchAction`.
- `MatchState`: winner = opponent of the resigner, `isOver = true`, add `resigned: boolean` (or equivalent). Scores unchanged. Game/turn timers stop at the resign `at`; open turn ends there. Resign is only allowed while the match is not over and ignores pauses sensibly (follow how the winning point is handled).
- Undo removes the resign action and reopens the match; check `Match.endedAt`/`winner` handling in the store so they are cleared/re-derived on undo.
- SPEC: update §3.2 (history shows resigned), §3.4 (Resign button, confirm to avoid accidental taps), §4.1 (resign ends match), §4.4 (undo of resign reopens), §5 data model.

### Out of scope

- Any Vue component/UI changes (T02).

### Context to read

- `docs/SPEC.md` §4, §5; `src/game/match.ts`; `src/stores/matches.ts`

### Acceptance criteria

- [ ] Resigning player 0 → winner 1, `isOver`, resigned flag set; vice versa; scores unchanged.
- [ ] Resign after the match is over is rejected/no-op.
- [ ] Timers stop at resign time.
- [ ] Undo after resign reopens the match (winner null, not over, same state as before).
- [ ] Vitest tests cover the above incl. store persistence of resign and undo.
- [ ] No Vue/Tauri imports in game logic.

### Verification

```sh
npm test
npm run typecheck
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Added `ResignAction` and `resign(match, {player, now, id})` in game logic (sets `winner` = opponent, `endedAt`, closes open pause; throws `GameError` if match is over). `MatchState.resigned` is derived from the presence of a resign action. `undo` now also reopens the match when a resign is undone. `describeAction` returns `Resign — <name>`. Store gets `resign(player)` (persisted via `mutate`; rejects with GameError if already over). SPEC updated (§3.2, 3.4, 4.1, 4.4, 5).

### Files changed

`src/game/types.ts`, `src/game/match.ts`, `src/game/codes.ts`, `src/game/match.test.ts`, `src/stores/matches.ts`, `src/stores/stores.test.ts`, `docs/SPEC.md`. (`index.ts` needed no change: it re-exports everything.)

### Verification results

`npm test`: 50 passed. `npm run typecheck`: clean.

### Notes for next tasks

- UI: `store.resign(player)` where player = who resigned; `activeState.resigned` flags resigned matches; for history, derive via `match.actions.some(a => a.kind === 'resign')` (resigner = that action's `player`).
- Any component that exhaustively switches on `MatchAction.kind` is not affected by typecheck currently.
- Store resign rejects when match is over, so UI should hide/disable the button then.

### Proposed split

n/a

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - All acceptance criteria met. `npm test` (50 passed) and `npm run typecheck` re-run by reviewer: clean.
  - `src/game/match.ts:192-203` resign rejects when over, sets winner/endedAt, closes open pause; `undo` (match.ts:206-) clears winner/endedAt for resign. Store `resign` (`src/stores/matches.ts:88`) goes through `mutate`/persist; store test covers persist, rejection, undo.
  - Non-blocking note: undoing a resign (like undoing the winning point) leaves a pause that was closed at resign time closed, so the match reopens unpaused. This matches existing winning-point behaviour and the spec wording; no change needed.
  - No Vue/Tauri imports in game logic, no out-of-scope changes.
