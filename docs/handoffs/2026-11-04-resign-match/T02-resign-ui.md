# T02 — Resign UI, result overlay, history

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** T01

## Brief

### Goal

Expose resign in the UI: a Resign control on each player's half (with a confirm step), a result overlay that says who resigned and offers Undo, and "resigned" shown in history and match detail.

### Scope

- Files to create/change: `src/components/match/PlayerHalf.vue`, `src/components/match/ResultOverlay.vue`, `src/views/MatchView.vue`, `src/views/HomeView.vue`, `src/views/MatchDetailView.vue` (+ a small confirm component if needed).
- Resign button on each half, visually secondary/low-key (not next to the primary actions where it can be hit by mistake), ≥ 44pt target, rotated to face its player like the rest of that half. Tapping opens a confirm prompt facing that player ("Resign? <Opponent> wins") with Confirm / Cancel. Calls the store's `resign(player)` from T01.
- ResultOverlay: when resigned, show "<Name> resigned — <Winner> wins" and keep an **Undo** button that reverts the resignation and reopens the match (it must not trap the user on the overlay). Keep the existing overlay behaviour for normal wins.
- Home history list + match detail: show a "resigned" marker on resigned matches (e.g. `Player1 (3) vs (8) Player2 · resigned`); the winner is the non-resigner.
- Match detail: show the resign in whatever per-turn/log info exists, if natural.
- Follow existing style (Tailwind, Vue 3 `<script setup>`), no network/analytics.

### Out of scope

- Game logic changes (done in T01); add only what's missing if T01's handoff says so.

### Context to read

- T01 handoff in `T01-resign-game-logic.md`; `docs/SPEC.md` §3; existing components listed above.

### Acceptance criteria

- [ ] Both halves have a Resign control with a confirm step; cancel does nothing.
- [ ] Confirming ends the match with the opponent as winner; overlay states who resigned.
- [ ] Overlay Undo reopens the match and the match screen is playable again.
- [ ] History and detail show resigned matches distinctly.
- [ ] `npm run build`, typecheck and tests pass.

### Verification

```sh
npm test
npm run typecheck
npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Each PlayerHalf has a low-key "Resign" text button (min-h-11) in its header row, away from the action grid. It opens an in-half confirm panel ("Resign? <Opponent> wins", Cancel/Resign); because the half is rotated, it faces its player. Confirm calls `matches.resign(player)`. ResultOverlay takes optional `resignedName`, shows "<Name> resigned" and relabels Undo "Undo resignation" (undo reopens the match). Home history and match detail show a "resigned" marker.

### Files changed

`src/components/match/PlayerHalf.vue`, `src/components/match/ResultOverlay.vue`, `src/views/MatchView.vue`, `src/views/HomeView.vue`, `src/views/MatchDetailView.vue`.

### Verification results

`npm test` 50 passed; `npm run typecheck` clean; `npm run build` succeeded. Not checked visually in a browser.

### Notes for next tasks

Per-turn/log info in detail not changed (no natural place).

### Proposed split

---

## Review

- **Verdict:** approved
- **Findings:**
  - No blocking issues. Ran `npm test` (50 pass), `npm run typecheck` and `npm run build`: all clean.
  - Both halves have a Resign button (`PlayerHalf.vue`, min-h-11, in the header row away from the action grid). The confirm panel is inside the rotated half, so it faces its player. Cancel only closes the panel.
  - `MatchView.vue` wires `resign` to `matches.resign(player)`. The winner is the other player (`match.ts` `resign`).
  - `ResultOverlay.vue` shows "<Name> resigned" and an "Undo resignation" button. `undo` removes the resign action and clears `winner` and `endedAt` in `match.ts`, so the match is playable again.
  - Home and detail views show the resigned marker. Home derives it from the actions list, detail from `state.resigned`.
  - Minor, non-blocking: the Resign button is disabled while `disabled` is true (likely paused), so a player can't resign during a pause. Also, the browser visual check was not done, as the worker noted.
