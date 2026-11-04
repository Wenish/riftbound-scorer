# Hold only on your own turn

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "can you also make that you can't hold when it's not your turn"

## Goal

Hold is blocked (disabled look, no flow, dismissable reason notice) for the non-active player. Conquer stays available on either turn.

## Context

- Relevant files: src/components/match/PlayerHalf.vue (already has `active` prop = active player and match not over; already has blocked-notice mechanism), docs/SPEC.md §3.4 "Disabled states" line. Do not touch src/views/MatchView.vue (unrelated uncommitted user edits).
- Previous plan: docs/handoffs/2026-11-04-blocked-action-notice/

## Tasks

| ID  | Title                    | Depends on | Status |
| --- | ------------------------ | ---------- | ------ |
| T01 | Block Hold off-turn      | –          | done   |

## Decisions

- UI-only rule (no game-logic change); reuse `active` prop, no new props.
- Notice text: "You can only hold on your turn." Hold is blocked if either this or the both-battlefields-scored condition applies (show the not-your-turn reason first).

## Outcome

Hold is blocked for the non-active player (grey, no flow, notice "You can only hold on your turn."); Conquer unchanged. Typecheck + 53 tests pass; reviewer approved; not visually checked.
