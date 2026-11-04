# T01 — Write developer README

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

Create a very short root `README.md` for developers: what's needed, how to install, and one-line commands to start the app in dev mode — (a) as the Tauri desktop app, (b) in the browser as the PWA, plus the mobile dev commands (iOS/Android) if the project is set up for them.

### Scope

- Files to create/change: `README.md` (new, repo root)

### Out of scope

- Any code/config changes, `docs/SPEC.md`, `CLAUDE.md`. Don't add new npm scripts.

### Context to read

- `package.json` (scripts: `dev` = vite, `build`, `preview`, `tauri`), `vite.config.ts` (dev server port 1420), `src-tauri/tauri.conf.json` (beforeDevCommand etc.)
- Check whether `src-tauri/gen/apple` / `src-tauri/gen/android` exist; if not, mobile needs `npx tauri ios init` / `npx tauri android init` once — mention that briefly.
- Check whether `vite-plugin-pwa` is actually installed/configured yet. If not, the browser dev server just runs the web build; say so accurately (e.g. "PWA features like the service worker are only active in a production build: `npm run build && npm run preview`") — only claim what is true in the repo right now.
- `docs/SPEC.md` §1 for a one-line description of the app.

### Acceptance criteria

- [ ] `README.md` exists at repo root, short (roughly ≤ 50 lines), English.
- [ ] Prerequisites listed: Node.js + npm, Rust toolchain, Tauri 2 platform prerequisites (link https://v2.tauri.app/start/prerequisites/); Xcode / Android Studio only for mobile.
- [ ] Install: `npm install`.
- [ ] One-line dev commands, each in a code block: Tauri desktop (`npm run tauri dev`), PWA in browser (`npm run dev` → http://localhost:1420), and production-like PWA preview (`npm run build && npm run preview`) if relevant; mobile dev (`npm run tauri ios dev` / `npm run tauri android dev`).
- [ ] Uses npm only (no pnpm/yarn). Every command mentioned actually works with the current `package.json` scripts.

### Verification

```sh
cat README.md
npm run build   # confirms the build/preview command referenced is valid
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Added a short root `README.md`: one-line app description + spec link, prerequisites (Node.js + npm, Rust via rustup, Tauri 2 prerequisites link, Xcode / Android Studio for mobile only), `npm install`, and one-line dev commands each in its own code block: `npm run tauri dev` (desktop), `npm run dev` (browser, http://localhost:1420), `npm run build && npm run preview` (production build, http://localhost:4173), `npm run tauri ios dev` / `npm run tauri android dev`. Also lists `npm test` / `npm run typecheck`.

Repo facts it reflects:
- `vite-plugin-pwa` is **not** installed or configured yet, so the README states plainly that PWA features (manifest, service worker) aren't set up and the browser commands serve the plain web build.
- `src-tauri/gen/apple` and `src-tauri/gen/android` don't exist (only `gen/schemas`), so the README says to run `npx tauri ios init` / `npx tauri android init` once first.

### Files changed

- `README.md` (new)

### Verification results

- `cat README.md`: 56 lines, so slightly over the "roughly ≤ 50" target. The extra lines are blank lines around code blocks plus the two-line "Other scripts" section.
- `npm run build`: passed (`vue-tsc -b && vite build`, built in 61ms, output in `dist/`).
- `npx tauri --help`: lists the `dev`, `ios` and `android` subcommands, so `npm run tauri dev|ios dev|android dev` resolve through the `tauri` script.
- Not run: `npm run tauri dev`, `npm run dev`, `npm run preview` (long-running servers), and the mobile commands (need init plus Xcode/Android SDK). The ports come from `vite.config.ts` (1420, strictPort) and Vite's default preview port (4173).

### Notes for next tasks

- When `vite-plugin-pwa` is added, update the PWA note in `README.md` (service worker only active in `build` + `preview`).
- When the mobile projects are generated (`src-tauri/gen/apple|android` committed), drop the "first time only" init hint.

### Proposed split

–

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved | changes-requested
- **Findings:**
