# T01 — Replace pnpm with npm

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

The repo uses npm instead of pnpm, with a fresh `package-lock.json` and no remaining pnpm references
outside historical handoff files.

### Scope

- Files to create/change/delete:
  - delete `pnpm-lock.yaml` (`git rm`), delete the local `node_modules/` (pnpm layout) and reinstall with `npm install`
    → creates `package-lock.json`.
  - `src-tauri/tauri.conf.json`: `beforeDevCommand` → `npm run dev`, `beforeBuildCommand` → `npm run build`.
  - `.gitignore`: drop the `pnpm-debug.log*` line (keep `npm-debug.log*`; add it if missing).
  - `CLAUDE.md`: under **Conventions**, add one bullet: `- Package manager: npm (commit `package-lock.json`; don't use pnpm/yarn).`
    Change nothing else in CLAUDE.md.
  - `docs/handoffs/_templates/TASK.md`: in the Verification example, replace
    `pnpm test, pnpm vue-tsc --noEmit, pnpm build` with `npm test, npm run typecheck, npm run build`.
- `package.json`: should not need changes (scripts don't call pnpm). Do not add a `packageManager` field.
  Keep the dependency version ranges as they are, including `"typescript": "^6.0.3"` (vue-tsc 3.3 peer-requires
  `typescript@<7`). If `npm install` reports a peer-dependency conflict, resolve it without `--force` /
  `--legacy-peer-deps` and explain in the handoff; if not possible, set status `blocked`.

### Out of scope

- Upgrading or changing any dependency versions.
- Rewriting `docs/handoffs/2026-11-04-scaffold-app/*` (historical record).
- Any app code, `vite.config.ts`, Rust code.

### Context to read

- `package.json`, `src-tauri/tauri.conf.json`, `.gitignore`, `CLAUDE.md`
- `docs/handoffs/2026-11-04-scaffold-app/PLAN.md` (Outcome) for the checks that must keep passing

### Acceptance criteria

- [ ] `pnpm-lock.yaml` is gone; `package-lock.json` exists (lockfileVersion 3).
- [ ] `npm install` exits 0 without `--force` / `--legacy-peer-deps`.
- [ ] `npm run typecheck`, `npm test`, `npm run build` exit 0.
- [ ] `npm run tauri info` exits 0 and shows Tauri v2 packages; `(cd src-tauri && cargo check)` exits 0.
- [ ] `grep -rn pnpm` over the repo (excluding `node_modules`, `src-tauri/target`, `.git`, and
      `docs/handoffs/2026-11-04-scaffold-app/`, `docs/handoffs/2026-11-04-switch-to-npm/`) finds nothing
      except the new CLAUDE.md "don't use pnpm/yarn" bullet (expected; added by orchestrator after T01 handoff).
- [ ] Installed versions of the main packages (vue, vite, tailwindcss, pinia, vitest, typescript, vue-tsc, @tauri-apps/*) match the major/minor versions previously locked in `pnpm-lock.yaml` (report them).

### Verification

```sh
rm -rf node_modules && npm install
npm run typecheck && npm test && npm run build
npm run tauri info
(cd src-tauri && cargo check)
grep -rn pnpm . --exclude-dir=node_modules --exclude-dir=target --exclude-dir=.git | grep -v 'docs/handoffs/2026-11-04-'
git status --short
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Switched the repo from pnpm to npm. Removed `pnpm-lock.yaml` with `git rm` and deleted the pnpm-layout
`node_modules/`. A clean `npm install` (node 24.13.0, npm 11.6.2) then created `package-lock.json`
(lockfileVersion 3). It reported no peer-dependency conflicts, so neither `--force` nor
`--legacy-peer-deps` was needed, and `npm ls` exits 0. Pointed the Tauri before-commands at npm, dropped
`pnpm-debug.log*` from `.gitignore`, added the package-manager rule to CLAUDE.md and updated the
Verification example in the task template. `package.json` is unchanged: no `packageManager` field was
added and the version ranges are the same.

Installed versions match the old `pnpm-lock.yaml` exactly (not just major/minor):

| Package | pnpm-lock.yaml | npm install |
|---|---|---|
| vue | 3.5.44 | 3.5.44 |
| vite | 8.3.5 | 8.3.5 |
| tailwindcss | 4.3.4 | 4.3.4 |
| @tailwindcss/vite | 4.3.4 | 4.3.4 |
| pinia | 4.1.0 | 4.1.0 |
| vitest | 5.1.0 | 5.1.0 |
| typescript | 6.0.3 | 6.0.3 |
| vue-tsc | 3.3.14 | 3.3.14 |
| @tauri-apps/api | 2.12.4 | 2.12.4 |
| @tauri-apps/cli | 2.12.4 | 2.12.4 |
| @vitejs/plugin-vue | 6.0.10 | 6.0.10 |
| @vue/tsconfig | 0.9.1 | 0.9.1 |
| @types/node | 26.6.6 | 26.6.6 |

### Files changed

- `pnpm-lock.yaml`: deleted (`git rm`, staged as `D`)
- `package-lock.json`: new (untracked)
- `src-tauri/tauri.conf.json`: `beforeDevCommand` is now `npm run dev` and `beforeBuildCommand` is now `npm run build`
- `.gitignore`: removed `pnpm-debug.log*` (`npm-debug.log*` was already there)
- `CLAUDE.md`: added one Conventions bullet, `- Package manager: npm (commit `package-lock.json`; don't use pnpm/yarn).`
- `docs/handoffs/_templates/TASK.md`: Verification example now reads `npm test, npm run typecheck, npm run build`
- `node_modules/`: reinstalled locally (gitignored)

### Verification results

- `rm -rf node_modules && npm install`: exit 0. Added 96 packages, 0 vulnerabilities, no peer warnings.
- `npm run typecheck`: exit 0
- `npm test`: exit 0 (no test files yet; `--passWithNoTests`)
- `npm run build`: exit 0 (vite 8.3.5; built 5.49 kB CSS and 65.07 kB JS)
- `npm run tauri info`: exit 0. It shows tauri 2.12.5, tauri-build 2.7.4, @tauri-apps/api 2.12.4 and
  @tauri-apps/cli 2.12.4. It also flags "Xcode: not installed", which was already true before this task
  (only the Command Line Tools are installed, as noted in the scaffold plan). The Environment section
  still lists `pnpm: 10.12.1` because pnpm is installed on the machine globally; nothing in the repo uses it.
- `(cd src-tauri && cargo check)`: exit 0
- `grep -rn pnpm . --exclude-dir=node_modules --exclude-dir=target --exclude-dir=.git | grep -v 'docs/handoffs/2026-11-04-'`:
  the only match is `CLAUDE.md:25`, the "don't use pnpm/yarn" bullet. The brief asks for that exact text,
  so this match is expected, and no pnpm usage is left.
- `grep -m1 lockfileVersion package-lock.json`: `"lockfileVersion": 3`
- `npm ls --depth=0` / `npm ls`: exit 0, no missing or invalid deps
- `git status --short`: ` M .gitignore`, ` M CLAUDE.md`, ` M docs/handoffs/_templates/TASK.md`, `D  pnpm-lock.yaml`,
  ` M src-tauri/tauri.conf.json`, `?? docs/handoffs/2026-11-04-switch-to-npm/`, `?? package-lock.json`

### Notes for next tasks

- The brief contradicts itself on the CLAUDE.md bullet. The prescribed text contains "pnpm", but the grep
  criterion says the search should find nothing. I kept the prescribed text, which leaves one intentional
  grep hit. If a reviewer wants zero hits, the bullet could say "don't use other package managers" instead.
- `package-lock.json` is untracked and has to be added in the commit.
- `npm run tauri dev` / `npm run tauri build` were not run live.

### Proposed split

_(n/a)_

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - No blocking issues. I re-ran every acceptance criterion myself:
    - `rm -rf node_modules && npm install`: exit 0, 0 vulnerabilities, no peer warnings. `npm ls`: exit 0.
    - `package-lock.json:4`: `"lockfileVersion": 3`. `pnpm-lock.yaml` is staged as deleted, and `package-lock.json` is not gitignored (`git check-ignore` exits 1).
    - `npm run typecheck`, `npm test`, `npm run build`: all exit 0.
    - `npm run tauri info`: exit 0 and shows tauri 2.12.5, tauri-build 2.7.4, @tauri-apps/api 2.12.4, @tauri-apps/cli 2.12.4. `(cd src-tauri && cargo check)`: exit 0.
    - The repo-wide `grep -rn pnpm` (with the specified exclusions) only matches `CLAUDE.md:25`, the prescribed bullet, which the acceptance criterion explicitly allows.
    - `npm ls --depth=0` versions match the `importers` section of `git show HEAD:pnpm-lock.yaml` exactly, for all 13 direct dependencies.
  - Every diff stays in scope: `src-tauri/tauri.conf.json:9-10`, `.gitignore:15` (removed line), `CLAUDE.md:25` (only an added bullet), `docs/handoffs/_templates/TASK.md:33`. `package.json` is unchanged and has no `packageManager` field. The historical scaffold handoffs are untouched.
  - Non-blocking: `package-lock.json` is untracked, so the closing commit has to `git add` it. The worker already notes this.
