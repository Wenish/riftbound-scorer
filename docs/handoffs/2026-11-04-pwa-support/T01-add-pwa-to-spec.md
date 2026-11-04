# T01 — Add PWA target to spec & CLAUDE.md

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

Specify that the app also works as a Progressive Web App, next to the Tauri iOS/Android apps, from one codebase.

### Scope

- Files to change: `docs/SPEC.md`, `CLAUDE.md`.

### Out of scope

- Any code or config, `.claude/`, other handoff files.
- Changing existing product behaviour (scoring, turns, undo, final point rule).

### Context to read

- `docs/SPEC.md` (whole file — short)
- `CLAUDE.md`
- `docs/handoffs/2026-11-04-pwa-support/PLAN.md` → Decisions

### What to write

**SPEC.md**

1. **§1 Goal:** targets are iOS + Android (Tauri native) **and** a PWA (installable from the browser, e.g. Add to Home Screen). Same features and same offline guarantee on every target.
2. **§2 Tech stack:**
   - Add a row "Web / PWA: `vite-plugin-pwa` (web app manifest + Workbox service worker)".
   - Change the Persistence row: storage sits behind a `StorageAdapter` interface. Native (Tauri) uses SQLite via `tauri-plugin-sql`. PWA uses IndexedDB (a small wrapper like `idb` is allowed).
   - Adjust the "Why SQLite" note so it's clearly about the native target. Add one line on why IndexedDB for the web: the Tauri plugin isn't available in browsers; IndexedDB is transactional, persistent, and works offline.
   - Note the architecture rule: platform-specific code (storage, keep-awake, anything from Tauri) lives behind small adapters chosen at runtime (detect Tauri, e.g. `isTauri()` from `@tauri-apps/api/core`). Game logic and UI don't import Tauri directly.
3. **New subsection §6.x (or §2.x, your call) "PWA requirements":**
   - Fully offline after the first load: the service worker precaches all app assets; no runtime network requests.
   - Installable: manifest with name "Riftbound Scorer", icons (192/512 + maskable), `display: standalone`, portrait orientation, theme/background colours matching the dark UI.
   - Updates: new versions are picked up by the service worker. The app shows an unobtrusive "Update available — reload" prompt and **never reloads automatically during a running match**.
   - Storage durability: call `navigator.storage.persist()` on first launch. Note that browsers (especially iOS Safari) may still evict data of a non-installed site; installing to the home screen is recommended. A short hint on first launch / Home is a should-have.
   - Screen keep-awake: Screen Wake Lock API in the PWA, Tauri equivalent natively; re-acquire on `visibilitychange`. Best effort — if unsupported, the app still works.
   - Must work in current Safari (iOS) and Chrome (Android), plus desktop browsers for development.
4. **§4.5 Persistence:** reference both adapters. The atomic-per-action guarantee holds on both (one SQLite transaction / one IndexedDB transaction per action). Data is per device/browser, and there's no sync between the native app and the PWA (consistent with §7).
5. **§6 Non-functional:** replace the "No network permissions … Tauri" line with something that covers both targets.
6. **§7 Out of scope:** add "Syncing data between devices or between the native app and the PWA".

**CLAUDE.md**

- First line: mention PWA as a target (e.g. "Tauri 2 (iOS/Android) + PWA, Vue 3 + TypeScript + Tailwind CSS").
- Under Conventions add one bullet: platform-specific APIs (Tauri plugins, browser APIs like Wake Lock/IndexedDB) only behind adapters in one place; everything must run in both Tauri and a plain browser.

### Acceptance criteria

- [ ] §1 and §2 list PWA as a target alongside Tauri.
- [ ] Persistence is described as a `StorageAdapter` with SQLite (native) and IndexedDB (PWA), consistently in §2 and §4.5.
- [ ] PWA requirements cover: offline precache, installability/manifest, safe update prompt (no reload mid-match), storage persistence + eviction caveat, wake lock fallback, target browsers.
- [ ] §7 excludes cross-device / native↔PWA sync.
- [ ] CLAUDE.md mentions PWA and the adapter convention, and stays short.
- [ ] No leftover statements implying Tauri-only (search for "Tauri").

### Verification

```sh
grep -n -i "tauri\|pwa\|indexeddb" docs/SPEC.md CLAUDE.md
git status --short   # only docs/SPEC.md, CLAUDE.md and this task file changed (docs/ may still be untracked)
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Added the PWA as a second target (alongside Tauri iOS/Android) to the spec and CLAUDE.md.
- §1: targets list (native via Tauri + installable PWA, one codebase, same features/offline guarantee).
- §2: new "Web / PWA" row (`vite-plugin-pwa`); Persistence row now describes `StorageAdapter` with
  SQLite (native) / IndexedDB (PWA, `idb` allowed); "Platform adapters" paragraph (runtime `isTauri()`
  detection, no direct Tauri imports in game logic/UI); "Why SQLite (native target)" + one-line "Why IndexedDB".
- New §2.1 "PWA requirements": offline precache, manifest/installability, update prompt that never
  auto-reloads mid-match, `navigator.storage.persist()` + eviction caveat + should-have install hint,
  Wake Lock with `visibilitychange` re-acquire (best effort), target browsers.
- §4.5: both adapters, atomic transaction per action on both, data per device/browser, no sync.
- §6: network line rewritten to cover both targets.
- §7: added "Syncing data between devices or between the native app and the PWA".
- CLAUDE.md: first line mentions PWA; new Conventions bullet on platform adapters.

### Files changed

- `docs/SPEC.md`
- `CLAUDE.md`
- this task file (status + handoff)

### Verification results

- `grep -n -i "tauri\|pwa\|indexeddb" docs/SPEC.md CLAUDE.md` — all remaining "Tauri" mentions are
  either target-qualified (native/app shell/adapter) or in the "no Vue/Tauri imports" rule; no
  Tauri-only statements left.
- `git status --short` — only `?? .claude/`, `?? CLAUDE.md`, `?? docs/` (everything still untracked,
  so per-file diff not visible; I only edited the two files above plus this task file).
- No code, so no tests/build to run.

### Notes for next tasks

- PWA requirements live in **§2.1** (chose §2.x so they sit next to the tech stack); §6 references it.
- §3.4's should-have "keep the screen awake" was left as is; §2.1 defines how it's done on the PWA.

### Proposed split

–

---

## Review

_(Filled by task-reviewer.)_
