# T01 — Global user-select: none in CSS

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

Make all app text non-selectable (including iOS long-press callout / tap highlight), while `input`/`textarea` remain selectable and editable.

### Scope

- Files to change: `src/style.css` only.
- Add a rule such as: `html, body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }` and `input, textarea { -webkit-user-select: text; user-select: text; }`. Match the file's existing comment style.

### Out of scope

- Components, game logic, SPEC.

### Acceptance criteria

- [ ] Rules present in src/style.css; inputs still selectable.
- [ ] `npm run build` passes.

### Verification

```sh
npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary
Added global user-select/touch-callout/tap-highlight none on html, body; inputs/textarea selectable.

### Files changed
- src/style.css

### Verification results
- `npm run build`: passed.

### Notes for next tasks

### Proposed split

---

## Review

- **Verdict:** approved
- **Findings:**
  - `src/style.css:8-22` — rules match the brief; only that file changed; inputs (HomeView, NewMatchView, OnboardingView) re-enabled via `user-select: text`. `npm run build` passes (re-run by reviewer).
