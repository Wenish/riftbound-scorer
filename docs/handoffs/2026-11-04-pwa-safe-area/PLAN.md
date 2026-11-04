# PWA safe-area insets

- **Created:** 2026-11-04
- **Status:** done
- **Request:** In PWA mode (installed, standalone) the screen ignores the mobile top bar, so there is no safe zone — content runs under the status bar / notch.

## Goal

When installed as a PWA (and in Tauri on iOS/Android), no interactive or readable content is hidden under the status bar, notch, home indicator or rounded corners.

## Context

- Spec sections: none expected (layout polish); check SPEC.md for any layout/safe-area wording.
- `index.html` already has `viewport-fit=cover` and `apple-mobile-web-app-status-bar-style=black-translucent`, so the page draws edge to edge but nothing uses `env(safe-area-inset-*)`.
- Relevant files: index.html, src/style.css, src/App.vue, src/views/*.vue (root layouts use `h-dvh`; MatchView has a rotated top half).

## Tasks

| ID  | Title                               | Depends on | Status |
| --- | ----------------------------------- | ---------- | ------ |
| T01 | Apply safe-area insets to all views | –          | done   |

## Decisions

- Keep `black-translucent` + `viewport-fit=cover` (full-bleed background) and pad content with `env(safe-area-inset-*)`, rather than switching to an opaque status bar.

## Outcome

Safe-area insets applied via a `.safe-area` class on the App root and `*-safe-dvh` height utilities in all views; html/body background set to slate-950. `npm run build` and `npm test` (53 tests) pass; reviewer approved. Not tested on a real notched device. Open: the MatchView score popup (`fixed inset-0`) does not apply insets itself.
