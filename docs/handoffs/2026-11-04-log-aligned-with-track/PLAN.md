# Align score log with the shared score track

- **Created:** 2026-11-04
- **Status:** done
- **Request:** The log of how each point was scored should align with the score track on the side.

## Goal

Each score code (e.g. `CMT2`) appears on the same row as the track step it produced, instead of in a separate list inside each half.

## Context

- Spec sections: SPEC.md §3.4
- Relevant files: src/components/match/ScoreTrack.vue, ScoreLog.vue, PlayerHalf.vue, src/views/MatchView.vue

## Tasks

| ID  | Title                         | Depends on | Status |
| --- | ----------------------------- | ---------- | ------ |
| T01 | Render log codes inside track | –          | done   |

## Decisions

- The k-th point-awarding event of a player is shown on that player's track row k; events without a point (`pointAwarded: false`) are shown struck-through on the row of the score at that time. — keeps log and track in sync.

## Outcome

Score codes now render on the shared track row of the point they produced; typecheck, 44 tests and build pass; reviewer approved. Not visually checked at 360x640.
