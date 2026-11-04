# T01 — Soft-disabled Conquer/Hold

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

In `PlayerHalf.vue`, when `scoreDisabled` is true, Conquer/Hold render with the grey disabled look (bg-slate-700, text-slate-500) and `aria-disabled="true"` but are NOT `disabled` and still emit `conquer`/`hold` on click, so the pop-up opens for past-turn corrections. They remain truly `disabled` only when the `disabled` prop (match over) is true. Pass Turn behaviour is unchanged.

### Scope

- Files: `src/components/match/PlayerHalf.vue`, `docs/SPEC.md` (reword the "Disabled states" line in 3.4: Conquer/Hold look greyed out but stay tappable so past turns can be corrected in the pop-up). MatchView.vue needs no change; it has unrelated uncommitted user edits, don't touch it.

### Acceptance criteria

- [ ] Greyed Conquer/Hold still open the pop-up when tapped; hover/active styles don't re-colour them.
- [ ] Match over → truly disabled as before.
- [ ] SPEC line updated.

### Verification

```sh
npm run typecheck && npm test
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Conquer/Hold now use a `scoreBtn` helper: when `scoreDisabled`, they get grey classes (bg-slate-700 text-slate-500) and `aria-disabled="true"`, but stay clickable. They are natively `disabled` only when the `disabled` prop is set. The buttons have no hover/active colour styles, so none re-colour them.

### Files changed

- src/components/match/PlayerHalf.vue
- docs/SPEC.md (Disabled states line in 3.4)

### Verification results

`npm run typecheck` passed; `npm test` passed (53 tests). Not checked in a browser.

### Notes for next tasks

### Proposed split

---

## Review

- **Verdict:** approved
- **Findings:**
  - `src/components/match/PlayerHalf.vue:24,54-55` — Conquer/Hold get grey classes and `aria-disabled` when `scoreDisabled`, are natively `disabled` only via the `disabled` prop, and still emit on click. No hover/active styles exist. Meets all criteria.
  - `docs/SPEC.md:122` — Disabled states line reworded as briefed.
  - `npm run typecheck` and `npm test` (53 tests) pass when I ran them.
  - `src/views/MatchView.vue` has uncommitted diffs (centre divider layout), but they are the user's own edits noted in the brief and are not part of this task.
