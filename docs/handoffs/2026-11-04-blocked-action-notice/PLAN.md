# Blocked actions show a dismissable reason

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "the buttons should be disabled and not start the flow. it just should show on their side a small popup which is dismissable why it can't be done currently"

## Goal

Unavailable Conquer/Hold/Pass buttons look disabled and do NOT start the flow (no score pop-up, no pass). Tapping one shows a small dismissable notice on that player's half explaining why.

## Context

- Relevant files: src/components/match/PlayerHalf.vue (half is rotated for the top player, so a notice inside it faces the right way), docs/SPEC.md §3.4 "Disabled states" line. Do not touch src/views/MatchView.vue (unrelated uncommitted user edits) unless unavoidable, and never commit those.
- Supersedes the previous decision that greyed Conquer/Hold stay tappable for past-turn corrections (user reversed it).

## Tasks

| ID  | Title                           | Depends on | Status |
| --- | ------------------------------- | ---------- | ------ |
| T01 | Blocked-action notice           | –          | done   |

## Decisions

- Buttons keep `aria-disabled` (not native `disabled`) while blocked so the tap can show the reason; click handlers do not emit. Native `disabled` only when the match is over (no notice).
- Reasons: Conquer/Hold: "You already scored both battlefields this turn."; Pass Turn: "It's not your turn."
- Notice: small box in the player's half, with a dismiss (×) button; also dismissed automatically when the blocking condition ends (e.g. turn changes / undo) and replaced if another blocked button is tapped.

## Outcome

Blocked Conquer/Hold/Pass look disabled, emit nothing, and show a dismissable reason notice in the tapped player's half (auto-clears when the condition ends). Typecheck + 53 tests pass; reviewer approved; not visually checked. Past-turn corrections via the pop-up are no longer reachable while both battlefields are scored (user decision).
