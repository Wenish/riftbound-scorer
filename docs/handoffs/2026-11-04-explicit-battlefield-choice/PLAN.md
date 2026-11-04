# Explicit battlefield choice in score pop-up

- **Created:** 2026-11-04
- **Status:** done
- **Request:** The battlefield in the score pop-up must be clicked explicitly (no preselected value), and be clearly labelled as my battlefield vs. opponent's battlefield.

## Goal

The score pop-up opens with no battlefield selected; Score Point +1 stays disabled until the player taps "My battlefield" or "Opponent's battlefield". Labels are unambiguous.

## Context

- Spec sections: SPEC.md §3.5
- Relevant files: src/components/match/ScorePopup.vue

## Tasks

| ID  | Title                                   | Depends on | Status |
| --- | --------------------------------------- | ---------- | ------ |
| T01 | Require explicit battlefield selection  | –          | done   |

## Decisions

- No default selection — user asked that it must be clicked.

## Outcome

Score pop-up now opens with no battlefield selected; labels "My battlefield" / "Opponent's battlefield"; Score Point +1 disabled until chosen. SPEC §3.5 updated. Tests (53), typecheck, build pass; review approved.
