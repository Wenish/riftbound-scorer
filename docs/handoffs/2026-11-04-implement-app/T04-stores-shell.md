# T04 — Pinia stores + app shell/navigation

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** T01, T02

## Brief

### Goal
Wire game logic and storage into Pinia stores and a simple view switcher so screens (T05, T06) can plug in.

### Scope
- `src/stores/settings.ts` (nickname, loaded state), `src/stores/matches.ts` (history list, active match, actions: startMatch, score, special, passTurn, undo, pause/resume, delete; persists via storage adapter after every action; resumes unfinished match on load), `src/stores/clock.ts` or a composable giving a 250ms-ticking `now` ref used by timers (timers derive from timestamps).
- `src/storage/index.ts` is edited by T03 in parallel: only call `createStorage()`, don't edit it.
- `src/App.vue`: no vue-router; a `view` state: 'loading' | 'onboarding' | 'home' | 'new-match' | 'match' | 'detail'. Boot: load storage, show onboarding if no nickname, else home (or straight to the match screen if an unfinished match exists? — no: home with Resume row). Render placeholder components `src/views/OnboardingView.vue`, `HomeView.vue`, `NewMatchView.vue`, `MatchView.vue`, `MatchDetailView.vue` (each minimal stub with the props/emits contract documented in a comment; T05/T06 will fill them). Keep `UpdatePrompt` and make sure it never triggers reload during a match.
- Store tests with the memory adapter where cheap.

### Out of scope
Real screen UIs.

### Context to read
`docs/SPEC.md` §3, §4, §5; `src/game/*`, `src/storage/*`.

### Acceptance criteria
- [ ] Stub views contain a documented contract (how they read stores / navigate: a `navigate(view, params)` provided via store or emit — choose one and document in handoff Notes).
- [ ] Persist-after-every-action and resume are covered by a test.

### Verification

```sh
npm run typecheck && npm test && npm run build
```

---

## Handoff

### Summary
Pinia stores (settings, matches, nav, clock composable), view-switching App shell, five documented stub views, store tests.

### Files changed
src/stores/{storage,settings,matches,nav,clock}.ts, src/stores/stores.test.ts, src/views/{Onboarding,Home,NewMatch,Match,MatchDetail}View.vue, src/App.vue.

### Verification results
`npm run typecheck && npm test && npm run build`: all pass (43 tests, 3 files).

### Notes for next tasks
- Navigation: `useNavStore()` (src/stores/nav.ts) with `view`, `params`, `navigate(view, { matchId? })`. Views have no props/emits; each stub's comment documents what it reads/calls.
- `useMatchesStore`: `history`, `active`, `activeState` (derived at Date.now(); for live timers use `deriveState(active, now)` with `useNow()` from stores/clock.ts, 250 ms), `unfinished`, `startMatch(names, first)`, `resume(id)`, `closeActive()`, `score({player,type,battlefield?,turn?})`, `special(player, turn?)`, `passTurn()`, `undo()`, `pause()`, `resumeTimer()`, `remove(id)`. Every mutation is saved (ordered queue) before its promise resolves.
- Boot: App loads stores, clears `active` (resume is done from Home via `matches.resume(id)` then navigate('match')), goes to onboarding if no nickname.
- UpdatePrompt is unmounted while view is 'match' (state is a singleton so the prompt reappears after).
- Tests use `setStorage(memoryAdapter)` from stores/storage.ts.

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - Verified: typecheck, 43 tests, and build pass. Persist-after-every-action and resume are tested in `src/stores/stores.test.ts`. The navigation contract (`useNav().navigate`) is documented in the Handoff Notes and in each stub's header comment. `src/storage/index.ts` is only consumed through `createStorage()`. `UpdatePrompt` is unmounted during the match view (`src/App.vue`).
  - No blocking issues. Note: `activeState` in `src/stores/matches.ts` uses `Date.now()` and is not reactive to time. This is documented, and live views must use `useNow()`.
