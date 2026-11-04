# T01 — Require explicit battlefield selection

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

In the score pop-up, no battlefield is preselected; the player must tap one. The two options are clearly labelled "My battlefield" and "Opponent's battlefield".

### Scope

- Files to change: `src/components/match/ScorePopup.vue`, `docs/SPEC.md` §3.5 (Battlefield bullet + note that Score Point +1 is disabled until one is chosen).

### Out of scope

- Game logic, stores, other components.

### Context to read

- `docs/SPEC.md` §3.5, §4.6
- `src/components/match/ScorePopup.vue`, and its usage in `src/views/MatchView.vue`

### Acceptance criteria

- [ ] `battlefield` ref starts as `null`; neither segment is highlighted on open.
- [ ] Segment labels read "My battlefield" and "Opponent's battlefield" (a small heading "Which battlefield was scored?" above is fine); layout still fits the narrow popup.
- [ ] Score Point +1 is disabled until a battlefield is chosen; confirm never emits a null battlefield.
- [ ] The "already scored" message only shows once a battlefield is chosen.
- [ ] Existing tests, typecheck and build pass; add a component test only if a component test setup already exists.

### Verification

```sh
npm test && npm run typecheck && npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

battlefield ref starts null; labels now "My battlefield"/"Opponent's battlefield" with a small heading; confirm disabled until chosen (and when already scored); already-scored message only after choice. SPEC 3.5 updated.

### Files changed

- src/components/match/ScorePopup.vue
- docs/SPEC.md

### Verification results

npm test (53 passed), npm run typecheck, npm run build: all pass. No component test setup exists, none added.

### Notes for next tasks

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - All acceptance criteria met: `ScorePopup.vue` battlefield ref starts `null`; labels and heading updated; `canConfirm` disables Score Point +1 until chosen; `confirm()` guards null; `alreadyScored` is false while null. SPEC 3.5 updated. Scope respected, no network code.
  - npm test (53 pass), typecheck, build all pass when re-run.
