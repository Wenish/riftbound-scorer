# T01 — Add extra top/bottom safe-area space

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

Add a small extra margin (start with `0.5rem`) on top and bottom on top of `env(safe-area-inset-top/bottom)`, defined once.

### Scope

- Files to change: `src/style.css` only.
- Define e.g. `--safe-extra: 0.5rem` on `:root`. In `.safe-area` use `padding-top: calc(env(safe-area-inset-top) + var(--safe-extra))` and likewise bottom; update `.min-h-safe-dvh` and `.h-safe-dvh` to subtract the same extended amounts so views still fit exactly without overflow.
- Apply the extra only when the inset is non-zero if it is straightforward (e.g. `max()`/conditional approach); otherwise applying it always is acceptable, but note the choice in the handoff.

### Out of scope

- Left/right insets, view files, popups, status-bar style.

### Context to read

- `src/style.css`

### Acceptance criteria

- [ ] Extra top and bottom margin defined via a single CSS variable.
- [ ] Height utilities stay consistent with the padding (no overflow/scroll in MatchView).
- [ ] `npm run build` and `npm test` pass.

### Verification

```sh
npm run build
npm test
```

(Device behaviour can't be tested here; say so.)

---

## Handoff

_(Filled by task-worker.)_

### Summary
Added `--safe-extra: 0.5rem` plus derived `--safe-top`/`--safe-bottom` on `:root`; `.safe-area` padding and both height utilities use them, so they stay consistent. Extra is applied always (not only when inset is non-zero), so it also appears in a normal browser tab.

### Files changed
- src/style.css

### Verification results
- `npm run build`: passed
- `npm test`: 53/53 passed
- Device behaviour not tested (not possible here).

### Notes for next tasks
None.

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - No blocking issues. `src/style.css:10-14` defines `--safe-extra` once; `.safe-area` padding (line 17-19) and both height utilities (lines 24, 28) use the same `--safe-top`/`--safe-bottom`, so heights stay consistent with padding. Only `src/style.css` changed. `npm run build` and `npm test` (53/53) pass when re-run. Extra applied always (accepted by brief, noted in handoff); device behaviour not verifiable here.
