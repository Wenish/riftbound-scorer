# T05-fix — Don't allow a second unfinished match

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** T05

## Brief

### Goal
Fix the blocking review finding in `T05-home-flow-screens.md` (Review section): starting a new match while one is unfinished hides the older one (violates "never lose a match", SPEC §1).

### Scope
- `src/views/HomeView.vue` (and, if needed, `src/stores/matches.ts`).
- Required behaviour: while an unfinished match exists, the + button asks for confirmation ("Discard the unfinished match and start a new one?" with Resume / Discard & start new). Discarding deletes the old match via the store before navigating to New Match. Also make the store's startMatch defensive: it must never leave two unfinished matches (delete or finish any existing unfinished one first).
- Add a store test for this.

### Verification
```sh
npm run typecheck && npm test && npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary
+ button now shows a confirm dialog (Resume / Discard & start new) when an unfinished match exists; discard removes it via the store before navigating. Store startMatch removes any existing unfinished match first.

### Files changed
src/views/HomeView.vue, src/stores/matches.ts, src/stores/stores.test.ts

### Verification results
npm run typecheck, npm test (44 passed), npm run build: all pass.

### Notes for next tasks

---

## Review

- **Verdict:**
- **Findings:**

- **Verdict:** approved
- **Findings:**
  - Verified typecheck, tests and build pass.
  - `src/views/HomeView.vue:25-35,125` — + shows the confirm dialog when an unfinished match exists. Discard calls `matches.remove` before navigating. Resume works.
  - `src/stores/matches.ts:71-72` — `startMatch` removes every unfinished match before creating the new one.
  - `src/stores/stores.test.ts:72-80` — the new test covers the store behaviour.
  - Non-blocking: the template's empty "Verdict/Findings" placeholders above are left unfilled, and this section is the real review.
