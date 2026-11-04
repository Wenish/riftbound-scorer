# Use the new app icon everywhere

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "now make that it uses the new app icon everywhere"

## Goal

Every icon the app ships — Tauri desktop/mobile icon set, PWA manifest icons, apple-touch icon and
favicon — is generated from the master icon `src-tauri/app-icon.png`, and regenerating them is one documented step.

## Context

- Master icon: `src-tauri/app-icon.svg` / `.png` (plans `2026-11-04-app-icon`, `2026-11-04-app-icon-red-blue`)
- Tauri: `src-tauri/icons/`, `src-tauri/tauri.conf.json` (`bundle.icon`)
- PWA: `pwa-assets.config.ts`, `package.json` script `generate-pwa-assets`, `public/*`, `vite.config.ts` manifest icons, `index.html` links
- `README.md` (dev commands)

## Tasks

| ID  | Title | Depends on | Status |
| --- | ----- | ---------- | ------ |
| T01 | Regenerate Tauri + PWA icons from the master icon | – | done |
| T02 | Seamless maskable + apple-touch icons (no padding) | T01 | done |

## Decisions

- One task: both generators are mechanical and the PWA generator should read the master directly, so the steps are tightly coupled.
- PWA generator reads `src-tauri/app-icon.png` instead of `src-tauri/icons/icon.png` — one source of truth, no ordering dependency.

## Outcome

- T01: Tauri icon set (`src-tauri/icons/**`, incl. new `64x64.png`, `android/`, `ios/`) regenerated via `npm run tauri icon src-tauri/app-icon.png`; `generate-pwa-assets` now reads the master directly; all `public/` icons + favicon regenerated; README gained an "App icon" section.
- T02: maskable + apple-touch icons generated with `padding: 0` (master already fits the 40 % safe zone, content at ~38 %), removing the visible square seam; Android adaptive background set to `#020618`.
- Verified: `npm run build` passes, manifest references existing icons, icons inspected visually at several sizes; both reviews approved.
- Follow-ups: `tauri icon` resets the Android background to white (documented in README). The README re-render command relies on `sharp` as a transitive dependency of `@vite-pwa/assets-generator`.
