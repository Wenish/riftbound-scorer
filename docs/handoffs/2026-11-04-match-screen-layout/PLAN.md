# Match screen layout: no overflow, shared score track

- **Created:** 2026-11-04
- **Status:** done
- **Request:** On the match screen the player buttons overflow with the scoring. The layout should not be perfectly mirrored: the score numbers should sit on the same side for both players so the 8 is shown only once and the score visibly progresses toward 8.

## Goal

Match screen halves fit on small phones without overflow, and a single shared 0→8 score track replaces the two mirrored per-half tracks.

## Context

- Spec sections: SPEC.md §3.4
- Relevant files: src/views/MatchView.vue, src/components/match/PlayerHalf.vue, ScoreTrack.vue, ScoreLog.vue

## Tasks

| ID  | Title                                  | Depends on | Status |
| --- | -------------------------------------- | ---------- | ------ |
| T01 | Shared score track + overflow fix      | –          | done   |

## Decisions

- One shared vertical track along one screen edge (not rotated with the top half): 0 at each outer end, 8 once at the centre divider. Bottom player's marker climbs up, top player's descends, both toward 8. — only one 8, visual progress.

## Outcome

Shared 0→8 track (8 once at the divider) and compact halves implemented; typecheck, 44 tests and build pass; reviewer approved. Overflow not checked in a real browser.
