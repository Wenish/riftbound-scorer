# Change "TURN" badge to "YOUR TURN"

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "currently there is a badge yellow with "TURN" make that it says "YOUR TURN""

## Goal

The yellow active-player badge in the match screen reads "YOUR TURN" instead of "TURN".

## Context

- Spec sections: none expected (check SPEC.md for the literal "TURN" badge text)
- Relevant files: src/components/match/PlayerHalf.vue

## Tasks

| ID  | Title                     | Depends on | Status |
| --- | ------------------------- | ---------- | ------ |
| T01 | Rename badge to YOUR TURN | –          | done   |

## Decisions

- Single task — one-line text change.

## Outcome

Badge in PlayerHalf.vue now reads "YOUR TURN" (with whitespace-nowrap). Typecheck and 53 tests pass; reviewer approved.
