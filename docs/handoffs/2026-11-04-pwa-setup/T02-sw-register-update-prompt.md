# T02 — Service worker registration, update prompt, storage.persist

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** T01

## Brief

### Goal

In the browser build, the app registers the service worker, shows an unobtrusive "Update available — Reload" prompt when a new version is waiting (reloads only when the user taps it), optionally a one-time "ready to work offline" notice, and requests persistent storage on launch. Inside Tauri none of this runs.

### Scope

- Files to create/change:
  - `src/platform/pwa.ts` (new) — the single place that touches PWA/browser APIs: wraps `useRegisterSW` from `virtual:pwa-register/vue` and `navigator.storage.persist()`, and does nothing when `isTauri()` (from `@tauri-apps/api/core`) is true.
  - `src/components/UpdatePrompt.vue` (new) — small toast/banner using the composable from `src/platform/pwa.ts`.
  - `src/App.vue` — mount `<UpdatePrompt />`.
  - `src/main.ts` — only if needed (e.g. call the persist request at startup).
  - `src/vite-env.d.ts` — only if T01 didn't already add the needed types.

### Out of scope

- `vite.config.ts`, manifest, icons (T01). Wake Lock. Storage adapters / IndexedDB. Install-to-home-screen hint (SPEC should-have; leave for the Home screen work).

### Context to read

- `docs/SPEC.md` §2 ("Platform adapters"), §2.1 (safe updates, storage durability), §6
- T01 handoff: `docs/handoffs/2026-11-04-pwa-setup/T01-plugin-manifest-icons.md` (Notes for next tasks — how registration/types are set up, behaviour when plugin is disabled for Tauri)
- vite-plugin-pwa Vue guide: https://vite-pwa-org.netlify.app/frameworks/vue.html (`useRegisterSW`, `needRefresh`, `offlineReady`, `updateServiceWorker`)
- `src/App.vue`, `index.html` for existing styling (dark, Tailwind, `slate-950`)

### Requirements

- Never call `updateServiceWorker(true)` / reload automatically — only on the user's tap. A "Later"/dismiss button hides the prompt.
- Registration and `navigator.storage.persist()` are skipped inside Tauri (`isTauri()`), and must not throw in browsers without service worker / StorageManager support (feature-detect, best effort; log nothing noisy).
- Call `navigator.storage.persist()` only if `navigator.storage?.persisted` reports not yet persisted.
- UI and other code must not import `virtual:pwa-register/*` or touch `navigator.serviceWorker` / `navigator.storage` directly — only via `src/platform/pwa.ts`.
- Prompt: fixed at the bottom, safe-area aware (`env(safe-area-inset-bottom)`), touch targets ≥ 44 px, high contrast on the dark UI, `role="status"` / `aria-live="polite"`. Match surrounding code style (`<script setup lang="ts">`, Tailwind).
- Keep it small; no new dependencies.

### Acceptance criteria

- [x] `npm run build`, `npm run typecheck`, `npm test` pass.
- [x] `TAURI_ENV_PLATFORM=macos npm run build` passes (app still compiles when the PWA plugin is disabled).
- [x] With `npm run build && npm run preview`, the service worker registers (check by building and inspecting, or via a headless browser if available — report honestly what was and wasn't checked in a real browser).
- [x] Update prompt only appears on `needRefresh`; reload only on button tap.
- [x] No PWA code path runs when `isTauri()` is true.

### Verification

```sh
npm run typecheck && npm test && npm run build
TAURI_ENV_PLATFORM=macos npm run build && npm run build
grep -rn "virtual:pwa-register\|navigator.serviceWorker\|navigator.storage" src
```

---

## Handoff

### Summary

`src/platform/pwa.ts` is now the only place that touches PWA and browser APIs. It exports two functions:

- **`usePwaUpdate()`** is a module-level singleton. It registers the service worker once, wrapping `useRegisterSW` from `virtual:pwa-register/vue`. It exposes read-only `needRefresh` / `offlineReady` refs plus `applyUpdate()` and `dismiss()`. Registration only happens when `!isTauri()` and `'serviceWorker' in navigator`. Otherwise it returns inert refs and a no-op `applyUpdate`. Registration errors are swallowed (best effort, no logging).
- **`requestPersistentStorage()`** feature-detects `navigator.storage.persisted`/`persist`. It calls `persist()` only when `persisted()` is false. It does nothing inside Tauri and never throws. `main.ts` calls it after mount.

`UpdatePrompt.vue` is a fixed bottom toast, mounted in `App.vue`:

- It sits above the safe area: `pb-[calc(env(safe-area-inset-bottom)+1rem)]`. The wrapper has `role="status"` and `aria-live="polite"`, and is always rendered so screen readers announce the content when it changes. Buttons are ≥ 44 px tall (`min-h-11`). It uses `slate-800` on `slate-950` with a `sky-400` primary button.
- It shows "Update available" with **Later** (dismiss) and **Reload** (`applyUpdate`) only when `needRefresh` is true.
- It shows a one-time "Ready to work offline" notice with **OK** on the first install. The notice auto-hides after 4 s. The plugin fires `offlineReady` only on the first install, not on updates.

**Guard against reloads the user didn't ask for.** The plugin's default `controlling` handler calls `window.location.reload()` whenever the new worker takes control. That includes the case where the user tapped Reload in *another tab*, which would reload this tab mid-match. So I pass `onNeedReload`:

- It reloads only if the user tapped Reload in this tab.
- Otherwise it keeps (or re-shows) the prompt.
- If the new worker is already in control, tapping Reload just calls `location.reload()`. A skip-waiting message would have nothing left to act on.

### Files changed

- `src/platform/pwa.ts` (new)
- `src/components/UpdatePrompt.vue` (new)
- `src/App.vue`: imports and mounts `<UpdatePrompt />`
- `src/main.ts`: `void requestPersistentStorage()` after mount
- `src/vite-env.d.ts`: unchanged (T01 already references `vite-plugin-pwa/vue`)

### Verification results

- `npm run typecheck`: exit 0.
- `npm test`: exit 0 (no test files yet).
- `npm run build`: passed. Output includes the `workbox-window` chunk, `sw.js`, and 11 precache entries.
- `rm -rf dist && TAURI_ENV_PLATFORM=macos npm run build`: passed. There is no `sw.js`, no manifest and no `workbox-window` chunk. The only `serviceWorker` string in the bundle is my own `'serviceWorker' in navigator` check, which comes after `isTauri()`. I ran `npm run build` again last, so `dist` is the web build.
- `grep -rn "virtual:pwa-register\|navigator.serviceWorker\|navigator.storage" src`: the only matches are in `src/platform/pwa.ts` (line 5 import, line 74 `navigator.storage`).
- **Real browser check.** I used headless Chrome 156 driven over CDP by a scratchpad script against `vite preview` on port 4317:
  - First load: `sw.js` registered and became active. "Ready to work offline OK" appeared and auto-hid after about 4 s.
  - Second load: the page was controlled by the service worker.
  - Update: I simulated a new version by appending a comment to `dist/sw.js`. On the next load the registration had `waiting: true` and "Update available Later Reload" showed. A window marker set in the page was still there after waiting 6 s, so nothing reloaded automatically.
  - Tapping Reload: the waiting worker activated and the page reloaded (marker gone). The prompt disappeared.
  - Second simulated update: tapping Later hid the prompt and the page did not reload.
  - Offline: with the network emulated offline, a reload still rendered the app from the precache.
  - Afterwards I rebuilt `dist`, stopped Chrome and the preview server, and deleted the temporary profile.
- **Not verified:**
  - Whether `persist()` gets granted. Headless Chrome reports `persisted: false`, which is expected because Chrome grants it heuristically. I confirmed the call path doesn't throw, but did not observe a grant.
  - iOS Safari and Android Chrome were not tested.
  - The cross-tab `onNeedReload` path is reasoned from the plugin source, not exercised.
  - No `isTauri() === true` runtime run (no `tauri dev`). It is covered by the code guard and the Tauri build check.

### Notes for next tasks

- Other code that needs PWA state should use `usePwaUpdate()`, which is a singleton and safe to call from several components. It should never import `virtual:pwa-register/*`.
- When match state exists, consider holding the update prompt back (or making it even less prominent) while a match is running. Today the reload still needs a tap, so the spec is satisfied.
- The install-to-home-screen hint (SPEC should-have) is still open. It could live in `src/platform/pwa.ts` too, e.g. a standalone-display check.

### Proposed split

n/a

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - No blocking issues. I re-ran the verification commands myself:
    - `npm run typecheck` exited 0. `npm test` exited 0 (no test files yet).
    - `rm -rf dist && TAURI_ENV_PLATFORM=macos npm run build` passed. There is no `sw.js`, no `manifest.webmanifest` and no `workbox-window` chunk. The only `serviceWorker` string in the bundle is the guarded `'serviceWorker' in navigator` check from `src/platform/pwa.ts:31`.
    - `npm run build` passed: `sw.js` and `workbox-2fbc6a65.js` were generated, the precache has 11 entries (now including the `workbox-window` chunk), and the manifest is present. `dist` is the web build again.
    - The grep check matches only `src/platform/pwa.ts:5` and `src/platform/pwa.ts:74`. No UI code touches the virtual module, `navigator.serviceWorker` or `navigator.storage`.
    - I did not repeat the worker's headless-Chrome run. I checked the reload logic against the installed client source instead.
  - `src/platform/pwa.ts:34-57`: checked against `node_modules/vite-plugin-pwa/dist/client/build/register.js` (v2.0.0). In prompt mode, `updateServiceWorker()` only posts skip-waiting, and the reload comes from the `controlling` listener, which calls `onNeedReload` if one is given. So the `userRequestedReload` gate does mean the page reloads only after a tap in this tab, and the default `window.location.reload()` is never reached. `applyUpdate` never passes `true`/reload automatically. This meets SPEC §2.1 "never reloads automatically".
  - `src/platform/pwa.ts:31,73`: both entry points return early when `isTauri()` is true. They are feature-detected (`'serviceWorker' in navigator`, `storage?.persisted`/`persist`). `persist()` is called only when `persisted()` is false, and errors are swallowed silently, as required.
  - `src/components/UpdatePrompt.vue:14-18`: the wrapper is always mounted with `role="status"` and `aria-live="polite"`. It is `pointer-events-none`, so it can't block taps on the app beneath. It has safe-area bottom padding, and every button is `min-h-11` (44 px). The prompt renders only on `needRefresh` (`:20`), and Reload calls only `applyUpdate` (`:34`).
  - The changed files match the Scope. `src/vite-env.d.ts` was touched by T01, not here. There are no new dependencies and no network calls.
  - Non-blocking: `src/components/UpdatePrompt.vue:9`: the 4 s auto-hide calls `dismiss`, which also clears `needRefresh` (`src/platform/pwa.ts:64-67`). If an update became waiting less than 4 s after the first-install "offline ready" notice, the update prompt would be hidden silently until the next load. This is very unlikely and not harmful: nothing reloads, and the prompt returns on the next launch. A dedicated `dismissOfflineReady` would avoid it if this code is touched again.
  - Non-blocking: `src/platform/pwa.ts:45-46`: the cross-tab `controlling` path (`onNeedReload` without a local tap) was not tested at runtime, as the Handoff says. The code path is consistent with the plugin source.
