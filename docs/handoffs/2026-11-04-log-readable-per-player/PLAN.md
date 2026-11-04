# Make track log readable for each player

- **Created:** 2026-11-04
- **Status:** done
- **Request:** The log should be readable for the specific player (the opponent's codes currently read upside-down for them).

## Goal

On the shared track, the top player's step numbers and score codes are rotated 180° so they read upright from the top player's side; the bottom player's stay as they are.

## Context

- Spec sections: SPEC.md §3.4
- Relevant files: src/components/match/ScoreTrack.vue

## Tasks

| ID  | Title                              | Depends on | Status |
| --- | ---------------------------------- | ---------- | ------ |
| T01 | Rotate top player's track entries  | –          | done   |

## Decisions

- Rotate each top-player cell's content individually (not the column or row order) so the layout/alignment stays identical. — only the text orientation changes.

## Outcome

Top player track entries rotated 180°; typecheck, 44 tests and build pass; reviewer approved. Not checked in a browser.
