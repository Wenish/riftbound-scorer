# Implement the full app

- **Created:** 2026-11-04
- **Status:** done
- **Request:** Implement the finished app per spec and sketch so the user can test everything.

## Goal

A fully working Riftbound Scorer (PWA + Tauri) covering SPEC §3–§5: onboarding, history, new match, split-screen match screen with final point rule, undo, timers, persistence.

## Context

- Spec sections: all of §2–§6
- Sketch: docs/Riftbound scorer App layout.png

## Tasks

| ID  | Title                                        | Depends on | Status |
| --- | -------------------------------------------- | ---------- | ------ |
| T01 | Pure game logic + tests                      | –          | done   |
| T02 | StorageAdapter + IndexedDB + memory          | –          | done   |
| T03 | Tauri SQLite adapter + wake lock             | T02        | done   |
| T04 | Pinia stores + app shell                     | T01, T02   | done   |
| T05 | Onboarding, Home, New Match, Detail screens  | T04        | done   |
| T06 | Match screen, pop-up, keypad, result overlay | T03, T04   | done   |
| T05-fix | Confirm before discarding unfinished match | T05 | done   |

Waves: (T01,T02) → (T03,T04) → (T05,T06) → reviews.

## Decisions

- No vue-router; view-state switcher in App.vue — tiny app, fewer deps.
- Pause support is a should-have; included via a `pauses` list in the Match model (SPEC §5 updated by T01).

## Outcome

All screens and logic implemented; all tasks reviewed and approved (T05 after a fix for a lost-unfinished-match case). Verified: `npm run typecheck`, `npm test` (44 passed), `npm run build`, `cargo check`. Not verified: visual run in browser/Tauri, SQLite adapter inside a live Tauri app.
