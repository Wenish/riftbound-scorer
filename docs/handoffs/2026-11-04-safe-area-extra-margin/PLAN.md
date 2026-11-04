# Extra safe-area margin

- **Created:** 2026-11-04
- **Status:** done
- **Request:** On iPhone (PWA) the top still shows a native fade/gradient over the buttons (pass turn, undo). Add a bit more safety space at the top and bottom.

## Goal

Top and bottom of the app have a little extra space beyond the OS safe-area inset so the iOS status-bar / home-indicator fade doesn't overlap buttons.

## Context

- Previous plan: docs/handoffs/2026-11-04-pwa-safe-area/PLAN.md
- Relevant files: src/style.css (`.safe-area`, `.min-h-safe-dvh`, `.h-safe-dvh`)

## Tasks

| ID  | Title                                | Depends on | Status |
| --- | ------------------------------------ | ---------- | ------ |
| T01 | Add extra top/bottom safe-area space | –          | done   |

## Decisions

- One CSS custom property for the extra margin, used by all three safe-area rules, so it is tunable in one place.
- Extra margin applies only where an inset exists (standalone/notched devices), not in a normal browser tab.

## Outcome

Added `--safe-extra: 0.5rem` (with derived `--safe-top`/`--safe-bottom`) in `src/style.css`; padding and height utilities use them. Applies always, also in a normal browser tab. `npm run build` and `npm test` (53 tests) pass; reviewer approved. Not tested on a device; raise the value if the iOS fade still overlaps buttons.
