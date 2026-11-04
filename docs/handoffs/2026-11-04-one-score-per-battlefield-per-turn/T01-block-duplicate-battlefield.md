# T01 — Block and explain duplicate battlefield score

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

In Riftbound a battlefield can be scored only once per player per turn. If a player tries to Conquer/Hold a battlefield they already scored (Conquer or Hold, including a conquer denied by the final point rule) in the selected turn, the Score Pop-up must clearly tell them so and not allow confirming; the game logic must also reject it.

### Scope

- `src/game/match.ts`: in `scorePoint` (the function around line 140), after the turn/battlefield validation, throw `GameError` (e.g. "Battlefield already scored this turn") when `type !== 'special'` and `scoredBattlefields(match.actions, player, turn)` includes the battlefield. Export a small pure helper if useful (e.g. `canScore(match, player, battlefield, turn)` or reuse `scoredThisTurn` from derived state) via `src/game/index.ts`.
- `src/components/match/ScorePopup.vue` + `src/views/MatchView.vue`: pass the popup the information it needs (e.g. a prop `scoredBattlefields` per turn, or a `isScored(battlefield, turn)` function) so that when the selected battlefield+turn is already scored by this player, the popup shows a visible message such as "You already scored this battlefield this turn — each battlefield can only be scored once per turn." (use "your/opponent's battlefield" wording if easy), styled like the existing amber hint, and the "Score Point +1" button is disabled (and visibly so). Must update reactively when the user toggles My/Opponent or changes the turn via the numpad. Keep text readable facing the player like the rest of the popup.
- `src/game/match.test.ts`: tests: second conquer/hold on same battlefield same turn throws; other battlefield OK; same battlefield on a different turn OK; special score unaffected; other player unaffected; a denied conquer blocks repeat.
- `docs/SPEC.md`: document the rule in §3.5 (popup message) and §4.x (one score per battlefield per turn).

### Out of scope

- Undo behaviour, other UI, storage.

### Context to read

- `docs/SPEC.md` §3.5, §4.3, §4.4
- `src/game/match.ts` (`scoredBattlefields`, `scorePoint`, `deriveState.scoredThisTurn`)
- `src/views/MatchView.vue` where ScorePopup is used

### Acceptance criteria

- [ ] Game logic rejects duplicate (player, battlefield, turn) conquer/hold; special unaffected.
- [ ] Popup shows a clear message and disables confirm in that case; reactive to battlefield and turn changes.
- [ ] Tests cover the cases above; existing tests pass.
- [ ] SPEC updated.

### Verification

```sh
npm test
npm run typecheck
npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

`addScore` (the brief's `scorePoint`) throws GameError on repeat conquer/hold for the same player/battlefield/turn (denied conquers count; special unaffected). `scoredBattlefields` is now exported. ScorePopup takes a `scoredIn(turn)` prop, shows an amber message and disables confirm; reactive to battlefield/turn. SPEC 3.5 and new 4.6 added.

### Files changed

src/game/match.ts, src/game/match.test.ts, src/components/match/ScorePopup.vue, src/views/MatchView.vue, docs/SPEC.md

### Verification results

npm test: 53 passed. npm run typecheck: clean. npm run build: succeeded.

### Notes for next tasks

### Proposed split

---

## Review

- **Verdict:** approved
- **Findings:**
  - All acceptance criteria met. I ran `npm test` (53 passed), `npm run typecheck` (clean) and `npm run build` (ok).
  - `src/game/match.ts:159` rejects duplicate conquer/hold per player, battlefield and turn. Special scores are unaffected. Denied conquers are counted because `scoredBattlefields` reads all score actions, not only those that awarded a point.
  - `src/components/match/ScorePopup.vue` computes `alreadyScored` from the selected battlefield and turn, so it stays reactive. It shows the amber message and disables confirm.
  - `src/views/MatchView.vue:166` re-evaluates `scoredIn` against `match.actions` on each render, so it also updates after undo.
  - Minor, not blocking: in `docs/SPEC.md` the new section 4.6 sits before 4.4 (line 212 vs 218), so the numbering is out of order.
