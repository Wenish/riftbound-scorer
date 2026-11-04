# Keep greyed Conquer/Hold tappable for corrections

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "yes correct when there is a bug" (past-turn corrections via the pop-up must stay possible when Conquer/Hold look disabled)

## Goal

When a player scored both battlefields this turn, Conquer/Hold look greyed out but remain tappable and open the pop-up (turn picker) so past turns can be corrected. Pass Turn stays truly disabled for the non-active player.

## Context

- Relevant files: src/components/match/PlayerHalf.vue, src/views/MatchView.vue (has unrelated uncommitted layout edits by the user: leave untouched, do not commit them), docs/SPEC.md (line "Disabled states" in 3.4)

## Tasks

| ID  | Title                           | Depends on | Status |
| --- | ------------------------------- | ---------- | ------ |
| T01 | Soft-disabled Conquer/Hold      | –          | done   |

## Decisions

- "Soft disabled": same grey style, `aria-disabled="true"`, but no `disabled` attribute; click still emits. Only the match-over state truly disables them.

## Outcome

Greyed Conquer/Hold keep emitting and open the pop-up (aria-disabled, not natively disabled) so past turns can be corrected; truly disabled only when the match is over. Typecheck + 53 tests pass; reviewer approved; not visually checked.
