# Resolve spec open questions

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "turns whole match. so passing turn counts 1 app. so its counts turn 1, 2, 3, 4. the app should try to help on which turn you currently scoring automaticly. it should help with riftbound final point. so when conquering 1 battlefield and it would score for 8 it should log that conquer but say you need to conquer the other battlefield in the same turn... display it in the app so it fits. each player can undo a match action so just the last actions someone did in the app. the app data should be saved where its best fitting for such a app."

## Goal

`docs/SPEC.md` reflects the user's answers to all four open questions in §8, and §8 no longer lists them as open.

## Context

- Spec sections: SPEC.md §2, §3.4–3.6, §4, §5, §8

## Tasks

| ID  | Title                                   | Depends on | Status |
| --- | --------------------------------------- | ---------- | ------ |
| T01 | Update SPEC.md with resolved decisions  | –          | done   |

## Decisions

- Turns: one global counter for the whole match; every Pass Turn increments it (1, 2, 3, 4 …). — user
- Turn auto-fill: the Score Pop-up pre-fills the current global turn; the user only touches it to correct. — user
- Final point rule is enforced as a helper (log the conquer, no point, show hint). — user
- Undo: either player's Undo button reverts the most recent action in the match, whoever did it. — user ("just the last actions someone did in the app")
- Persistence: SQLite via the Tauri SQL plugin, in the app's private data directory. — orchestrator. Writes are atomic transactions, so a match isn't corrupted if the app is killed mid-write. It also handles a growing match history better than rewriting one JSON file, and needs no OS permissions.

## Outcome

`docs/SPEC.md` now covers all decisions: global turn counter (§4.2), turn pre-fill with bounds and on-screen turn number (§3.4, §3.5), new final point rule section (§4.3) with `✕` denied-log marker (§3.6), global Undo on both halves (§4.4), SQLite persistence (§2, §4.5), and a data model with one ordered `actions` history and `pointAwarded` (§5). §8 is empty.

Section renumbering: Undo is now §4.4, Persistence §4.5.

Verified by the orchestrator reading the full spec. No review agent was run (no code changed).

Follow-up: if a player at 7 back-dates a Conquer to an earlier turn, it's unclear whether the final point rule applies. Ask the user when the game-logic task starts.
