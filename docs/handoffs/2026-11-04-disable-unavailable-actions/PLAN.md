# Disable unavailable action buttons

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "make that visually the buttons help what the current player can do: after scoring 2 points (both battlefields) in a turn, Conquer/Hold can't be pressed again; when it's not your turn you can't pass the turn. Buttons need a disabled state."

## Goal

Per-player action buttons show a clear disabled state when the action is not currently possible.

## Context

- Relevant files: src/components/match/PlayerHalf.vue, src/views/MatchView.vue (has unrelated uncommitted layout edits by the user: do not revert, do not commit them), src/game/match.ts (`state.scoredThisTurn`, `state.activePlayer`)

## Tasks

| ID  | Title                                 | Depends on | Status |
| --- | ------------------------------------- | ---------- | ------ |
| T01 | Disabled states for Conquer/Hold/Pass | –          | done   |

## Decisions

- Conquer/Hold disabled when the player already scored both battlefields in the current turn (nothing left to score). Special +1 stays enabled.
- Pass Turn disabled when the player is not the active player.
- Past-turn corrections via the pop-up's turn picker are not available for a player who has both battlefields scored in the current turn (accepted trade-off; flag in outcome).

## Outcome

Conquer/Hold now grey out once the player scored both battlefields this turn; Pass Turn greys out for the non-active player. Typecheck + 53 tests pass; reviewer approved; not visually checked in a browser. Trade-off: the pop-up turn picker for past-turn corrections is also unreachable while both battlefields are scored in the current turn.
