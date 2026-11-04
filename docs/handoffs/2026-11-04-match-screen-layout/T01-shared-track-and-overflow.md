# T01 — Shared score track + overflow fix

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

Fix the match screen so (a) nothing overflows in either player half (action buttons, hint, toast, log) on small phones (~360x640), and (b) the per-half mirrored score tracks are replaced by ONE shared vertical track on one side of the screen.

### Scope

- Files to change: `src/views/MatchView.vue`, `src/components/match/PlayerHalf.vue`, `src/components/match/ScoreTrack.vue` (may become a shared-track component), possibly `ScoreLog.vue`; update `docs/SPEC.md` §3.4 ("Score track" bullet) to describe the shared track.

### Design

- The top half is currently wrapped in `rotate-180`, so everything in it is mirrored. Keep the opponent's controls/name/log rotated toward them, but the score track must NOT be rotated: render one track spanning the full height of both halves along a single edge (e.g. the left), outside the rotated wrapper.
- Track: 0 at the bottom outer end, 0 at the top outer end, and **8 shown once at the centre** (at the divider). Bottom player's marker (highlighted current score) climbs from bottom toward the centre; top player's marker descends from the top toward the centre. Each half shows steps 0..7 on its side, the shared 8 in the middle. Markers must be clearly attributed per player (e.g. colour/label) and numbers readable.
- Overflow: use `min-h-0`/`overflow-hidden`/`overflow-y-auto` so the log scrolls instead of pushing buttons out; make buttons compact enough (e.g. reduce min height / text size, hint and toast compact) so all five buttons plus name fit inside a half at 360x640. Pass Turn / Undo / Special / Conquer / Hold must all stay reachable and ≥ ~40px tall.
- Keep component props/events contract used by MatchView; keep existing tests passing.

### Out of scope

- Game logic in `src/game`, stores, popup behaviour.

### Context to read

- `docs/SPEC.md` §3.4, the four files above.

### Acceptance criteria

- [ ] One shared track; "8" appears exactly once, centred at the divider; both players' scores visibly progress toward it.
- [ ] Track is not mirrored/rotated with the top half; opponent's name, log and buttons still face them.
- [ ] No overflow of buttons/log/hint/toast in either half at 360x640 (verify via a browser/screenshot check if feasible, otherwise reason through the CSS and say so).
- [ ] SPEC §3.4 updated.
- [ ] `npm run typecheck`, `npm test`, `npm run build` pass.

### Verification

```sh
npm run typecheck && npm test && npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

ScoreTrack is now one shared, upright column on the left of MatchView (outside the rotated wrapper). Top player's 0..7 run from the top edge, bottom player's 7..0 from the centre down; a single "8" cell (h-14, same fixed height as the divider) sits at the divider. Markers: bottom blue, top rose, with matching dots by the names. PlayerHalf: track removed, buttons min-h-10 text-sm, hint/toast text-xs line-clamp-2 shrink-0, log in a min-h-0 flex-1 overflow-hidden container (log itself scrolls), halves overflow-hidden.

### Files changed

src/components/match/ScoreTrack.vue, src/components/match/PlayerHalf.vue, src/views/MatchView.vue, docs/SPEC.md (3.4 Score track bullet).

### Verification results

npm run typecheck, npm test (44 passed), npm run build: all pass. No browser/screenshot check done; overflow reasoned from CSS (at 360x640 each half is ~292px; fixed content ~150px, rest goes to the scrolling log).

### Notes for next tasks

Divider height (h-14) and track centre cell (h-14) must stay in sync.

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - Re-ran typecheck, tests (44 pass) and build: all pass.
  - `ScoreTrack.vue` renders a single "8" cell (h-14) that matches the divider's h-14 in `MatchView.vue`. The two flex-1 halves are equal, so the 8 lines up with the divider. The track sits outside the `rotate-180` wrapper, so it is upright. Top player's scores map to `scores[1]` and bottom player's to `scores[0]`, which is correct.
  - Overflow is handled in `PlayerHalf.vue`: the log wrapper is `min-h-0 flex-1 overflow-hidden`, and the buttons, hint and toast are `shrink-0`. The buttons are min-h-10 (40px), which meets the criterion. I did not check this in a browser. The worker also reasoned from the CSS only.
  - Minor, not blocking: `docs/SPEC.md` 3.4 still says the score log is "next to the track", but the track is now a shared column on the left edge.
