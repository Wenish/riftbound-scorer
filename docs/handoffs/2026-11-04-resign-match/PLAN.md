# Resign a match

- **Created:** 2026-11-04
- **Status:** done
- **Request:** A player can resign so the other player wins the match and it is registered as resigned. The action can be undone if pressed accidentally.

## Goal

Either player can resign from the match screen (with protection against accidental taps). The opponent wins, the match is saved as "resigned" and shown as such in history/detail, and Undo reverts the resignation and reopens the match.

## Context

- Spec sections: SPEC.md §3.2, §3.4, §4.1, §4.4, §5
- Relevant files: src/game/{types,match,codes,index}.ts, src/game/match.test.ts, src/stores/matches.ts, src/views/{MatchView,HomeView,MatchDetailView}.vue, src/components/match/*

## Tasks

| ID  | Title                                  | Depends on | Status |
| --- | -------------------------------------- | ---------- | ------ |
| T01 | Resign action in game logic + spec     | –          | done   |
| T02 | Resign UI, result overlay, history     | T01        | done   |

## Decisions

- Resign is a new `MatchAction` (`kind: 'resign'`, `player` = who resigned) in the single history, so Undo (remove last action) works unchanged and storage needs no schema change.
- Scores stay as they were; winner = the other player; match is over (timers stop, `endedAt` set).
- Undo must remain reachable after resigning (on the result overlay), since the match is "over".

## Outcome

Resign action added to game logic, store, UI (confirm prompt per half, result overlay with Undo, "resigned" marker in history/detail) and SPEC. Verified: npm test (50), typecheck, build all pass; both tasks reviewed and approved. Not checked manually in a browser.
