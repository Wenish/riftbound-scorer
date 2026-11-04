# T01 — Render log codes inside the shared track

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

Show each player's score log aligned with the shared score track: each track row (step n of a player) displays the score code (`scoreCode(e)` from `src/game`) of the event that raised that player's score to n, next to the step number.

### Scope

- Files to change: `src/components/match/ScoreTrack.vue` (new `events: [ScoreEvent[], ScoreEvent[]]` prop, widen the column to fit codes e.g. `font-mono text-xs`), `src/components/match/PlayerHalf.vue` (remove the `ScoreLog` and its `events` prop; reclaim the space, e.g. keep name/hint/toast on top and buttons at the bottom), `src/views/MatchView.vue` (pass `pointLog(match, 0/1)` to the track, drop `events` from halves), delete `ScoreLog.vue` if unused, update `docs/SPEC.md` §3.4 ("Score log" bullet).
- Mapping: step 0 row has no code. For a player, the k-th event with `pointAwarded: true` goes on row k. Events with `pointAwarded: false` are rendered struck-through (muted) on the row of the player's score at that time (append to that row's code, e.g. `HOT4 ~~CMT2~~`). Rows are fixed-height; codes must not wrap or overflow (truncate if needed). The "8" win row shows the winning code of whichever player reached 8.
- Keep the track upright/unrotated, markers highlighting the current score as now.

### Out of scope

- `src/game`, stores, popup.

### Context to read

- `docs/SPEC.md` §3.4, §3.6; the four files above; `src/game/codes.ts`.

### Acceptance criteria

- [ ] Codes appear on the same row as the step they produced, for both players.
- [ ] Non-scoring events shown struck-through on the right row.
- [ ] No overflow at 360x640; buttons still reachable.
- [ ] SPEC §3.4 updated; typecheck, tests and build pass.

### Verification

```sh
npm run typecheck && npm test && npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

ScoreTrack now takes `events` and renders codes per row (k-th awarded event on row k; denied events appended struck-through on the current row; row 8 shows the winner's codes). Track widened to w-24, codes truncate. Log removed from PlayerHalf (spacer keeps buttons at bottom); ScoreLog.vue deleted; SPEC 3.4 updated.

### Files changed

src/components/match/ScoreTrack.vue, PlayerHalf.vue, src/views/MatchView.vue, docs/SPEC.md, ScoreLog.vue (deleted, staged via git rm).

### Verification results

`npm run typecheck`, `npm test` (44 passed), `npm run build`: all pass. Not visually checked at 360x640 in a browser.

### Notes for next tasks

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - Typecheck, tests (44) and build pass when re-run. Mapping in `ScoreTrack.vue` `rows` computed is correct (k-th awarded event on row k, denied on current row, capped at 8); win row picks the winner. No stray ScoreLog references, no out-of-scope changes.
  - Minor, non-blocking: 360x640 layout not visually verified; by arithmetic rows are ~36px and the code column ~68px, so only about two codes fit before truncation.
