# T03 — Tauri SQLite adapter + wake lock adapter

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** T02

## Brief

### Goal
Native storage via tauri-plugin-sql, plus the screen keep-awake adapter.

### Scope
- Rust: add `tauri-plugin-sql` (sqlite feature) in `src-tauri/Cargo.toml`, register in `src-tauri/src/lib.rs`, add permissions to `src-tauri/capabilities/`. npm: `@tauri-apps/plugin-sql`.
- `src/storage/sqlite.ts`: implements `StorageAdapter` (see `src/storage/types.ts`) on SQLite: tables `settings(key,value)`, `matches(id primary key, created_at, ended_at, data json)`; each save is one transaction/single statement upsert; create tables on first open. Lazy-import the plugin so the browser bundle doesn't break.
- Edit `src/storage/index.ts`: if `isTauri()` (from `@tauri-apps/api/core`) use the SQLite adapter, falling back to IndexedDB/memory on failure.
- `src/platform/wakeLock.ts`: `useWakeLock`-style plain API: `keepAwake(): Promise<void>` / `release()`; uses Screen Wake Lock API, re-acquires on `visibilitychange`, silently no-ops if unsupported. (Native keep-awake plugin is optional; browser API is acceptable in the Tauri webview if it works, note in handoff otherwise.)
- Ensure `cargo check` in `src-tauri` passes if cargo is available (report if not run).

### Out of scope
UI, stores.

### Context to read
`docs/SPEC.md` §2, §2.1, §4.5; `src/storage/*`, `src-tauri/`.

### Acceptance criteria
- [ ] Web build still passes and doesn't statically bundle Tauri-only code paths in a way that breaks the browser.
- [ ] Cargo check passes (or documented why not run).

### Verification

```sh
npm run typecheck && npm test && npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary
SQLite adapter (lazy-imported plugin, upsert-per-save), storage factory prefers SQLite in Tauri with fallback to IndexedDB/memory, wake lock adapter (keepAwake/release, re-acquire on visibilitychange).

### Files changed
src/storage/sqlite.ts, src/storage/index.ts, src/platform/wakeLock.ts, src-tauri/Cargo.toml (+Cargo.lock), src-tauri/src/lib.rs, src-tauri/capabilities/default.json, package.json/package-lock.json (@tauri-apps/plugin-sql).

### Verification results
cargo check (src-tauri): passed. npm run typecheck: passed. npm test: 39 passed. npm run build: passed. SQLite adapter not exercised at runtime (no tauri dev run).

### Notes for next tasks
Browser Wake Lock API used (no native plugin); untested in iOS/Android webviews. DB file: riftbound-scorer.db (app data dir).

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - Re-ran typecheck, tests (43 pass), build, and `cargo check` in src-tauri: all pass.
  - `src/storage/index.ts:9-17` — Tauri and sqlite imports are dynamic, so the browser bundle is safe. Falls back to IndexedDB, then memory.
  - `src/storage/sqlite.ts:27-45` — saveMatch is a single-statement upsert, as the brief asks.
  - `src/platform/wakeLock.ts` — re-acquires on visibilitychange, no-ops when unsupported, no leaked listener after release().
  - Non-blocking: the SQLite adapter and wake lock were not run on a device.
