# One score per battlefield per turn

- **Created:** 2026-11-04
- **Status:** done
- **Request:** Help the player who tries to score a second point on the same battlefield in the same turn: tell them clearly they can't score twice on the same battlefield in one turn.

## Goal

A player cannot log a second Conquer/Hold on a battlefield they already scored in the same turn. The Score Pop-up shows a clear message and disables confirming; the game logic rejects it too.

## Context

- Spec sections: SPEC.md §3.5, §4.3
- Relevant files: src/game/match.ts, src/game/match.test.ts, src/components/match/ScorePopup.vue, src/views/MatchView.vue

## Tasks

| ID  | Title                                   | Depends on | Status |
| --- | --------------------------------------- | ---------- | ------ |
| T01 | Block and explain duplicate battlefield | –          | done   |

## Decisions

- A denied conquer (final point rule) still counts as scored for that battlefield, so it also blocks a repeat — matches SPEC §4.3.
- Check is per (player, battlefield, turn) where turn is the popup's selected turn, so late corrections are checked against that turn.

## Outcome

Duplicate Conquer/Hold on the same battlefield in the same turn is rejected in game logic (`addScore`) and the Score Pop-up shows a message and disables confirm. Tests added (53 pass), typecheck and build clean, reviewer approved. SPEC §3.5 and new §4.6 updated (note: §4.6 sits before §4.4).
