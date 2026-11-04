# T01 — Pure game logic + tests

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal
Implement all game logic as plain TypeScript (no Vue/Tauri/browser imports) with thorough Vitest tests.

### Scope
Create under `src/game/`: `types.ts` (data model from SPEC §5 exactly), `match.ts`, `codes.ts`, `format.ts`, and `*.test.ts`.
Pure, immutable functions operating on a `Match`:
- `createMatch({id, now, names, firstPlayer})`
- `deriveState(match, now)` → scores, currentTurn, activePlayer, turns[] (number, activePlayer, startedAt, endedAt, duration), winner, finalPointHint (battlefield still needed, player) or null, battlefields scored this turn per player.
- `addScore(match, {player, type, battlefield?, turn?, now, id})`: Conquer/Hold/Special, turn defaults to current, validated 1..currentTurn; implements the final point rule (SPEC §4.3: denied conquer at 7 is logged with pointAwarded=false; resolved when other battlefield scored the same turn; Hold/Special never restricted); score capped 0..8; reaching 8 sets winner/endedAt; refuses actions once the match is over.
- `passTurn(match, {now, id})`, `undo(match)` (removes last action, reopens match if winning point undone, returns also the removed action for toast text).
- `scoreCode(event)` (SPEC §3.6, e.g. CMT2, HOT4, ST5, CMT7✕) and `describeAction` for the undo toast ("Undid: Conquer (Opponent) T7 — Frenemy"), `formatDuration(ms)` (mm:ss, h:mm:ss over an hour).
- Pause support: add optional pauses to the model only if needed for timers; if so add `PauseEvent`-free design: keep a `pausedAt`/`pausedTotal` list on Match (`pauses: {from:number,to?:number}[]`) and make turn/game durations exclude paused time. Provide `pauseMatch`/`resumeMatch`. Document the model addition in SPEC §5.
Point log for a player: ordered list of events for the score track/log.

### Out of scope
UI, storage, stores.

### Context to read
`docs/SPEC.md` §3.4–3.6, §4, §5.

### Acceptance criteria
- [ ] Tests cover: scoring, 8 ends match, no >8, denied conquer + hint + resolution (conquer and hold) + cleared by pass, hold/special at 7, undo of every action kind incl. pass, denied, winning point, turn correction range, codes, durations excluding pauses.
- [ ] No imports from vue/tauri/DOM in `src/game`.

### Verification

```sh
npm run typecheck && npm test && npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary
Pure game logic in `src/game/` (no Vue/Tauri/DOM imports). Invalid actions throw `GameError`. Match gained required `pauses: Pause[]` (documented in SPEC §5).

### Files changed
- /Users/jonasvoland/Developer/Github/riftbound-scorer/src/game/{types,match,codes,format,index}.ts, match.test.ts
- /Users/jonasvoland/Developer/Github/riftbound-scorer/docs/SPEC.md (pauses field in §5)

### Verification results
`npm run typecheck` OK; `npm test` 39 passed; `npm run build` OK.

### Notes for next tasks
- API: `createMatch`, `deriveState(match, now)` (scores, currentTurn, activePlayer, turns[], winner, isOver, isPaused, gameDuration, finalPointHint, scoredThisTurn), `addScore`, `passTurn`, `undo` -> `{match, undone|null}`, `pauseMatch`/`resumeMatch`, `pointLog(match, player)`, `scoreCode`, `describeAction(match, action)` (returns e.g. "Conquer (Opponent) T7 — Frenemy"; UI prepends "Undid: "), `formatDuration`. Import via `src/game/index.ts`.
- Final point rule uses the event's turn (corrected turn) to decide which battlefields count as scored.
- Winning closes any open pause; pauseMatch is a no-op when over. Actions are allowed while paused. Final turn's `endedAt` = match.endedAt when over.
- Stored matches need `pauses: []` default for any older data.

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - All acceptance criteria met. Re-ran `npm run typecheck && npm test && npm run build`: all pass. `src/game` has no vue/tauri/DOM imports.
  - Tests in `src/game/match.test.ts` cover every listed case: scoring, win at 8, no more than 8, denied conquer with hint, resolution by conquer and by hold, pass clearing the hint, hold/special at 7, undo of every action kind, turn correction range, codes, and pause-aware durations.
  - Final point rule (`match.ts:157-162`), the 0-8 bound (`match.ts:148,175`), turn counter, undo reopening a won match (`match.ts:195-198`) and timestamp-derived durations (`match.ts:38-47`) are correct.
  - Non-blocking: `undo` of the winning point does not reopen the pause that `closePauses` closed at the win (`match.ts:178`). This is acceptable, because the timer resumes running after the undo.
