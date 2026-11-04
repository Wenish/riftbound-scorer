# PWA support

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "can you also add that the app should also work as a progressive web app"

## Goal

`docs/SPEC.md` and `CLAUDE.md` specify that the same Vue app ships both as Tauri native apps (iOS/Android) and as an installable, offline-capable PWA, including how platform-specific features (storage, wake lock) work on each target.

## Context

- Spec sections: SPEC.md §1, §2, §3.4 (keep screen awake), §4.5, §6

## Tasks

| ID  | Title                          | Depends on | Status |
| --- | ------------------------------ | ---------- | ------ |
| T01 | Add PWA target to spec & CLAUDE.md | –      | done   |

## Decisions

- One codebase, two targets: Tauri build (iOS/Android) and a static PWA build of the same Vite/Vue app. — user
- PWA via `vite-plugin-pwa` (manifest + Workbox service worker, precache all assets → fully offline after first load). — orchestrator: standard for Vite, minimal config.
- Storage behind a `StorageAdapter` interface: SQLite (`tauri-plugin-sql`) in Tauri, **IndexedDB** in the PWA. — orchestrator: the Tauri SQL plugin doesn't exist in a browser; IndexedDB is the native, transactional, persistent browser store. Request `navigator.storage.persist()` to reduce eviction risk.
- Platform features detected at runtime (`isTauri()`), e.g. screen keep-awake via Screen Wake Lock API in the PWA. — orchestrator.

## Outcome

PWA added as a second target from one codebase. SPEC.md: §1 targets, §2 `vite-plugin-pwa` row + `StorageAdapter` (SQLite native / IndexedDB PWA) + platform-adapter rule, new §2.1 PWA requirements (offline precache, manifest, no auto-reload mid-match, `storage.persist()` + eviction caveat, Wake Lock, target browsers), §4.5 both adapters and no sync, §6 network line, §7 no native↔PWA sync. CLAUDE.md: PWA in the stack line and an adapter convention.

Verified by the orchestrator reading the changed sections. No review agent was run (no code changed).
