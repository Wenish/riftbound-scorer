# T05 — Onboarding, Home, New Match, Match Detail screens

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** T04

## Brief

### Goal
Build the non-match screens per the sketch and SPEC.

### Scope
Replace stubs in `src/views/OnboardingView.vue`, `HomeView.vue`, `NewMatchView.vue`, `MatchDetailView.vue` (+ small components under `src/components/` if needed). Do not touch MatchView.vue.
- Onboarding (§3.1): 'Hello Riftbounder', input 'Your Nickname', confirm.
- Home (§3.2): header 'Match History' with + button, list newest first as `Player1 (8) vs (6) Player2`, unfinished match on top with Resume, tap past match → detail, delete with confirm, change-nickname affordance, one-line hint about installing the PWA for storage durability (only when running in browser, not installed/standalone, not Tauri).
- New match (§3.3): 'Your Name vs. Frenemy', tap a name to edit for this match only, choose first player (default you), Start.
- Detail (§3.2 should-have): score log, total time, per-turn times, winner.
Dark, high-contrast Tailwind, portrait, touch targets ≥44px.

### Out of scope
Match screen.

### Context to read
`docs/SPEC.md` §3.1–3.3, §6; sketch `docs/Riftbound scorer App layout.png`; T04 handoff Notes.

### Acceptance criteria
- [ ] Typecheck/build pass; flows reachable via the stores' navigation contract.

### Verification

```sh
npm run typecheck && npm test && npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary
Implemented Onboarding, Home (unfinished+Resume, history, delete confirm, nickname change, PWA install hint), New Match, Match Detail.

### Files changed
src/views/{Onboarding,Home,NewMatch,MatchDetail}View.vue; src/platform/pwa.ts (added `shouldHintInstall()`).

### Verification results
`npm run typecheck && npm test && npm run build`: all pass (43 tests). Not checked visually in a browser.

### Notes for next tasks
- Home lists only finished matches in the history list; the unfinished one is the top Resume row. Match end should call `matches.closeActive()` and navigate('home').
- Delete icon is an emoji button (no icon lib).

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** changes-requested
- **Findings:**
  - Verified: `npm run typecheck && npm test && npm run build` pass (43 tests). Onboarding, New Match, Detail, nickname change, delete confirm and the install hint (`src/platform/pwa.ts:84`) match SPEC 3.1-3.3.
  - `src/views/HomeView.vue:76` (+ button) and `src/views/NewMatchView.vue:22` — The + button is always enabled. Starting a new match while one is unfinished calls `startMatch`, which unshifts a second unfinished match (`src/stores/matches.ts` `commit`). `matches.unfinished` then returns the newest one. `HomeView.vue:24` lists only matches with `endedAt`, so the older unfinished match is hidden and can't be resumed, opened or deleted. That breaks the "Never lose a match" goal (SPEC line 25). Fix one of these: hide or disable + while `matches.unfinished` exists (SPEC 3.2 only shows Resume), or show a confirm that discards or abandons the old match. Alternatively list the extra unfinished matches in the history with a delete option.
  - Minor, no change required: the delete button at `HomeView.vue:107` is `min-h-11 min-w-12` (44px), which is OK. Emoji icon is noted in the handoff.
