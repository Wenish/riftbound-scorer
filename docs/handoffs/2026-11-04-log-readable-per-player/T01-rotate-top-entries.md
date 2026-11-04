# T01 — Rotate top player's track entries

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

In `src/components/match/ScoreTrack.vue`, render the top player's (player 1) step numbers and score codes rotated 180° (e.g. `rotate-180` on the cell content) so they are readable by the player sitting at the top of the screen. Bottom player's entries stay upright. The shared "8" cell: rotate its content toward the player who reached 8 if any, otherwise leave upright.

### Scope

- Files to change: `src/components/match/ScoreTrack.vue`; one line in `docs/SPEC.md` §3.4 noting each player's entries face them.

### Out of scope

- Row order, alignment, sizes, game logic.

### Acceptance criteria

- [ ] Top player's numbers/codes are rotated 180°; layout and row alignment unchanged; truncation/struck-through styling still works when rotated.
- [ ] typecheck, tests, build pass.

### Verification

```sh
npm run typecheck && npm test && npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Top player's step numbers and code spans get `rotate-180` individually (li layout/order unchanged, so row alignment is unchanged). The 8 cell's number and codes rotate only when player 1 reached 8; otherwise upright.

### Files changed

- src/components/match/ScoreTrack.vue
- docs/SPEC.md (3.4 one sentence)

### Verification results

`npm run typecheck`, `npm test` (44 passed), `npm run build` all pass. Not visually checked in a browser.

### Notes for next tasks

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved | changes-requested
- **Findings:**

### Review (task-reviewer)

- **Verdict:** approved
- **Findings:**
  - `src/components/match/ScoreTrack.vue:44-45` — top player's number and code spans have `rotate-180`; li layout/order untouched, so alignment is unchanged. Struck-through/truncate classes are retained on the same elements.
  - `src/components/match/ScoreTrack.vue:57-61` — 8 cell rotates only when player 1 has reached 8; otherwise upright. Matches brief.
  - `docs/SPEC.md` 3.4 has the one-line note. typecheck, tests (44) and build pass when I ran them.
  - Non-blocking: with a rotated truncated span, the ellipsis and text start appear on the visual right/left flipped (text hugs the cell's right edge). Not visually checked in a browser.
