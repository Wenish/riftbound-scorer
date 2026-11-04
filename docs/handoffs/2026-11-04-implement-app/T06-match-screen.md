# T06 — Match score screen, score pop-up, keypad, result overlay

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** T03, T04

## Brief

### Goal
The core split-screen Match Score Screen per SPEC §3.4–3.5, §4 and the sketch.

### Scope
Fill `src/views/MatchView.vue` and components under `src/components/match/` (e.g. PlayerHalf, ScoreTrack, ScoreLog, ScorePopup, NumPad, ResultOverlay, Toast).
- Two halves; top half rotated 180°; centre divider with game timer, 'Turn N' and turn timer (readable from both sides, e.g. duplicated/rotated); active player's half emphasised.
- Each half: score track 0→8 along the side with current score highlighted, score log next to it with codes (denied entries muted/struck with 'no point — draw a card'), name, Conquer, Hold, Special Score (+1 direct), Pass Turn, Undo; final point hint on that player's half (§4.3).
- Score pop-up facing the opener (rotated for the top player): My/Opponent segmented toggle, Turn pre-filled with current turn, tap opens numeric keypad (value 1..current turn), 'Score Point +1', cancel on outside tap.
- Undo toast on the half that pressed it. Pause/resume. Keep awake via `src/platform/wakeLock.ts` while match is active.
- Win: timers stop, result overlay with winner and 'Back to Home'; undoing the winning point reopens.
- Use store actions from T04; no game rules in components.
- Touch targets ≥44px, dark high-contrast.

### Out of scope
Other screens.

### Context to read
`docs/SPEC.md` §3.4–3.6, §4, §6; sketch; T03 and T04 handoffs.

### Acceptance criteria
- [ ] Typecheck/build pass; all buttons wired to store actions; rotation verified in markup.

### Verification

```sh
npm run typecheck && npm test && npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary
Match screen: two halves (top wrapped in rotate-180), centre divider with duplicated/rotated game + turn timers, pause/resume and Home. Per half: score track 0-8, log (denied entries struck + "no point — draw a card"), Conquer/Hold/Special/Pass/Undo, final-point hint, undo toast on the pressing half. Score pop-up (My/Opponent, turn button, numpad 1..current turn, Score Point +1, outside tap cancels) rendered in the opener's half, rotated for the top player. Result overlay with Back to Home and Undo (reopens). Wake lock held while match not over. All logic via store actions.

### Files changed
src/views/MatchView.vue; src/components/match/{PlayerHalf,ScoreTrack,ScoreLog,NumPad,ScorePopup,ResultOverlay}.vue (toast is inline in PlayerHalf).

### Verification results
`npm run typecheck`, `npm test` (43 passed), `npm run build`: all pass. Not run visually in a browser/device; rotation verified in markup only.

### Notes for next tasks
Pass Turn is available to both halves (store passes for the active player). Home button in the divider leaves without ending the match (stays resumable).

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - Typecheck, tests (43) and build pass when run by the reviewer. Rotation (top half `rotate-180`, rotated popup panel, duplicated rotated timers) is correct in markup; all buttons call store actions.
  - Minor, non-blocking: `src/components/match/PlayerHalf.vue:43` and `src/views/MatchView.vue` (pass handlers) show Pass Turn on the inactive player's half too, and it passes the active player's turn. SPEC line 120 says it ends the current turn, so this matches the spec, but an accidental tap by the waiting player ends the opponent's turn. Consider disabling it when `!active`.
  - Minor, non-blocking: the Pause button does not disable Conquer/Hold/Special/Pass, so a paused match can still be scored. Check SPEC §6 and decide.
  - Not verified visually in a browser, as the handoff states.
