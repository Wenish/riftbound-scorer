# PWA setup

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "can you setup the pwa support setup" (follow-up to the dev README, which noted `vite-plugin-pwa` isn't set up yet)

## Goal

The web build is an installable, fully-offline PWA per SPEC §2.1: manifest + icons, precaching Workbox service worker, user-confirmed update prompt (never auto-reload), `navigator.storage.persist()` on launch. None of this is active inside Tauri.

## Context

- Spec sections: §2 (stack, platform adapters), §2.1 (PWA requirements), §6
- Relevant files: `vite.config.ts`, `index.html`, `package.json`, `src/main.ts`, `src/App.vue`, `src/vite-env.d.ts`, `src-tauri/icons/icon.png` (512×512 source), `README.md`

## Tasks

| ID  | Title | Depends on | Status |
| --- | ----- | ---------- | ------ |
| T01 | vite-plugin-pwa config, manifest and icons | – | done |
| T02 | Service worker registration, update prompt, storage.persist | T01 | done |

## Decisions

- `registerType: 'prompt'` — reload only on explicit user tap, which satisfies "never reloads automatically during a running match" without needing match state (none exists yet).
- PWA plugin disabled for Tauri builds (`TAURI_ENV_PLATFORM` set) and registration skipped at runtime via `isTauri()` — native app must not ship/run a service worker.
- Service worker not enabled in `vite dev`; test PWA behaviour with `npm run build && npm run preview`.
- Screen Wake Lock is out of scope here — it belongs to the keep-awake adapter, built with the match screen.

## Outcome

The web build is now an installable, offline PWA; Tauri builds ship none of it.

- **T01:** `vite-plugin-pwa@2` (generateSW, `registerType: 'prompt'`, disabled when `TAURI_ENV_PLATFORM` is set), manifest per §2.1, icons in `public/` generated from `src-tauri/icons/icon.png` via `npm run generate-pwa-assets`, iOS meta tags, README note.
- **T02:** `src/platform/pwa.ts` (only place touching SW/StorageManager; inert in Tauri), `UpdatePrompt.vue` (Update available — Later / Reload; one-time offline-ready notice), `navigator.storage.persist()` on launch. Reload happens only on the user's tap in that tab, including when another tab activates the update.
- **Orchestrator fix after T02 review:** the offline-ready auto-hide timer re-checks `needRefresh` before dismissing, so it can't clear an update prompt that appeared in the meantime.

Verified: build, typecheck, tests pass; Tauri-env build emits no SW/manifest; worker's headless Chrome run confirmed SW registration, update prompt without auto-reload, Reload/Later, offline load. Both reviews approved.

Not verified: iOS Safari / Android Chrome, actual `persist()` grant, cross-tab update path in a browser, running inside `tauri dev`.

Follow-ups: icons are the Tauri placeholder (the separate app-icon plan will replace the source, then run `npm run generate-pwa-assets`); install-to-home-screen hint (SPEC should-have); consider holding the update prompt while a match runs; 6 build-time `npm audit` findings in transitive deps.
