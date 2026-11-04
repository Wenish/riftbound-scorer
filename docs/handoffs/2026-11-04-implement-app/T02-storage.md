# T02 — StorageAdapter + IndexedDB + memory fallback

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal
Persistence layer behind an interface, IndexedDB implementation for the PWA/browser.

### Scope
Create `src/storage/types.ts`: `StorageAdapter` { getNickname/setNickname, listMatches(): Match[] (newest first), getMatch(id), saveMatch(match) (one atomic transaction, upsert), deleteMatch(id), getUnfinishedMatch() }. Use `Match` from `src/game/types.ts` — T01 is running in parallel and creates it; if absent when you start, define against the SPEC §5 shape via a type import and reconcile at the end (check the file exists again before finishing).
`src/storage/indexeddb.ts` using the `idb` package (add via npm), stores: `settings`, `matches` (index by createdAt). `src/storage/memory.ts` (in-memory, used by tests/fallback if IndexedDB fails). `src/storage/index.ts`: `createStorage()` factory — returns IndexedDB adapter (falling back to memory); leave a clearly marked spot where a Tauri/SQLite branch will be added by a later task (T03 will edit this file).
Vitest tests for the memory adapter; for IndexedDB add `fake-indexeddb` as devDependency and test it too.

### Out of scope
Tauri/SQLite, Pinia stores, UI.

### Context to read
`docs/SPEC.md` §2, §4.5, §5.

### Acceptance criteria
- [ ] Both adapters satisfy the same contract test suite.
- [ ] Nothing outside `src/storage/` (and package.json/lock) is changed.

### Verification

```sh
npm run typecheck && npm test && npm run build
```

---

## Handoff

_(Filled by task-worker.)_

### Summary
StorageAdapter interface, IndexedDB (idb) and memory adapters, `createStorage()` factory with fallback and a TODO(T03) marker for the Tauri branch, plus a shared contract test suite run against both adapters (fake-indexeddb).

### Files changed
src/storage/{types,memory,indexeddb,index}.ts, src/storage/storage.test.ts, package.json, package-lock.json (idb dep, fake-indexeddb devDep).

### Verification results
- `npm test`: 10/10 pass.
- `src/game/types.ts` (T01) did not exist when I finished, so `npm run typecheck` fails only with TS2307 on `../game/types` imports. With a temporary stub Match (since removed), `npm run typecheck` and `npm run build` passed. Re-run once T01 lands.

### Notes for next tasks
- `createStorage()` is async. `listMatches` is newest first; `getUnfinishedMatch` returns the newest match with no `endedAt`.
- Tests use `describe.each` over a factory map; T03 can add a SQLite factory there.
- IndexedDB saveMatch JSON-clones the match so reactive proxies are safe.

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - `npm run typecheck` and `npm test` (43/43) pass now that T01 exists. I did not re-run `npm run build`.
  - `src/storage/storage.test.ts` runs the shared contract suite against both the memory and IndexedDB adapters.
  - `src/storage/indexeddb.ts:35` saveMatch uses a single `db.put`, which is atomic. Upsert, newest-first ordering and `getUnfinishedMatch` are correct.
  - `src/storage/index.ts` already contains the Tauri/SQLite branch and `sqlite.ts` exists. That is T03's work, not T02's, so it is not a scope violation here.
