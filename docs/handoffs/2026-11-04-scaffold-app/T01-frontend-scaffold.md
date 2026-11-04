# T01 — Vite + Vue 3 + TS + Tailwind frontend

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

A minimal Vite + Vue 3 (`<script setup>`) + TypeScript app at the repo root, styled with Tailwind CSS v4,
with Pinia installed and Vitest configured, that builds, type-checks and runs its tests.

### Scope

- Files to create/change (repo root): `package.json`, `pnpm-lock.yaml`, `index.html`, `vite.config.ts`,
  `tsconfig.json` (+ `tsconfig.app.json` / `tsconfig.node.json` if you use the split layout),
  `env.d.ts` or `src/vite-env.d.ts`, `src/main.ts`, `src/App.vue`, `src/style.css`, `.gitignore`,
  optionally `vitest.config.ts` (or a `test` block in `vite.config.ts`).
- Use **pnpm**. Use current stable versions of: `vue` 3, `vite`, `@vitejs/plugin-vue`, `typescript`,
  `vue-tsc`, `tailwindcss` v4 + `@tailwindcss/vite`, `pinia`, `vitest`. Add `@types/node` only if needed.
- Tailwind v4 the Vite way: `@tailwindcss/vite` plugin + `@import "tailwindcss";` in `src/style.css`.
  No `tailwind.config.js`, no PostCSS config.
- `src/main.ts`: create the app, install Pinia, mount, import the stylesheet.
- `src/App.vue`: one placeholder screen — dark background, light text, centred title "Riftbound Scorer"
  using Tailwind utility classes. No other components, no router.
- `index.html`: `<title>Riftbound Scorer</title>`, `lang="en"`,
  `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`,
  `<meta name="theme-color">` with the dark background colour. No external fonts/CDN links (app is fully offline).
- `package.json` scripts: `dev` (vite), `build` (`vue-tsc -b && vite build`, or equivalent type check + build),
  `preview`, `typecheck` (vue-tsc, no emit), `test` (`vitest run --passWithNoTests`).
  Set `"private": true`, `"type": "module"`, `"name": "riftbound-scorer"`.
- Vite: fixed dev port **1420** with `strictPort: true` (Tauri will point at it later), `clearScreen: false`.
  Vitest environment `node` is fine; include `src/**/*.test.ts`.
- `.gitignore`: `node_modules`, `dist`, `*.local`, editor/OS junk (`.DS_Store`, `.vscode/*` except
  `extensions.json`, `.idea`), `coverage`. Also add `src-tauri/target` and `src-tauri/gen/schemas`
  now so T02 doesn't need to touch it.

### Out of scope

- Tauri (`src-tauri/`, `@tauri-apps/*`) — that's T02.
- `vite-plugin-pwa`, manifest, icons, service worker.
- Router, screens, game logic, storage adapters, ESLint/Prettier.
- Don't edit `docs/` (except this task file's Handoff), `CLAUDE.md`, `.claude/`.

### Context to read

- `CLAUDE.md`
- `docs/SPEC.md` §2 (tech stack) and §6 (non-functional)

### Acceptance criteria

- [x] `pnpm install` succeeds; `pnpm-lock.yaml` is created.
- [x] `pnpm typecheck`, `pnpm test` and `pnpm build` all exit 0.
- [x] The built `dist/index.html` references a CSS file that contains Tailwind output (e.g. the utility classes used in `App.vue`).
- [x] Dev server is configured for port 1420 / strictPort.
- [x] No network URLs (CDN, fonts, analytics) in `index.html` or source.

### Verification

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
grep -l "bg-" dist/assets/*.css   # or another class used in App.vue
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Vite 8 + Vue 3.5 (`<script setup>`) + TypeScript frontend at the repo root. It uses Tailwind CSS v4 through
`@tailwindcss/vite` (no config file, no PostCSS), Pinia 4 is installed in `main.ts`, and Vitest 5 is set up
in the `test` block of `vite.config.ts` (env `node`, `src/**/*.test.ts`). Type checking uses `vue-tsc -b` over a
split tsconfig layout (`tsconfig.app.json` / `tsconfig.node.json`, both extending `@vue/tsconfig`, `noEmit`).
`App.vue` shows one placeholder screen: `bg-slate-950`, `text-slate-100`, with "Riftbound Scorer" centred.
`index.html` has `lang="en"`, the required viewport meta, `theme-color` `#020618` (the hex value of
Tailwind v4 `slate-950`), and `class="bg-slate-950"` on `<body>` so overscroll doesn't flash white.

Versions: vue 3.5.44, pinia 4.1.0, vite 8.3.5, @vitejs/plugin-vue 6.0.10, tailwindcss + @tailwindcss/vite 4.3.4,
vitest 5.1.0, vue-tsc 3.3.14, @vue/tsconfig 0.9.1, @types/node 26.6.6 (needed for `types: ["node"]` in
the node tsconfig), typescript **6.0.3**.

**Deviation: TypeScript is pinned to 6.x, not the latest 7.0.2.** The vue-tsc 3.3 / Volar stack declares
`typescript@<7` as a peer dependency. TS 7 is the native Go port and doesn't yet support the JS API that
vue-tsc relies on. `package.json` has `"typescript": "^6.0.3"`, so pnpm will not upgrade it to 7. Move to 7
once vue-tsc/Volar support it.

### Files changed

- `package.json` (new): name/private/type module, scripts `dev`, `build` (`vue-tsc -b && vite build`), `preview`, `typecheck` (`vue-tsc -b`; noEmit comes from `@vue/tsconfig`), `test` (`vitest run --passWithNoTests`)
- `pnpm-lock.yaml` (new)
- `.gitignore` (new): includes `src-tauri/target`, `src-tauri/gen/schemas`, `*.tsbuildinfo`, `coverage`, `.vscode/*` with `!.vscode/extensions.json`
- `index.html` (new)
- `vite.config.ts` (new): `defineConfig` from `vitest/config`, plugins vue + tailwindcss, `clearScreen: false`, `server.port 1420`, `strictPort: true`, `test` block
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` (new)
- `src/vite-env.d.ts`, `src/main.ts`, `src/App.vue`, `src/style.css` (new)

### Verification results

- `pnpm install`: OK, no unmet-peer warnings after the TS 6 pin. `pnpm-lock.yaml` was created.
- `pnpm typecheck`: exit 0.
- `pnpm test`: exit 0 ("No test files found, exiting with code 0"). As a one-off check I added a throwaway `src/sanity.test.ts`; it was picked up and passed (1/1), then I deleted it.
- `pnpm build`: exit 0. Output: `dist/index.html`, `dist/assets/index-*.css` (5.46 kB), `dist/assets/index-*.js` (65 kB).
- `dist/index.html` links `/assets/index-*.css`. `grep -l "bg-slate-950" dist/assets/*.css` matches, and the file contains `.bg-slate-950`, `.text-slate-100`, `.min-h-dvh` and `.text-3xl`.
- `grep -rnE 'https?://' index.html src vite.config.ts tsconfig*.json package.json` finds no URLs. I removed the usual `// https://vite.dev/config/` comment for this reason.
- Dev server on port 1420: **not run live**. My attempt to start it and kill it afterwards was refused by the sandbox permission classifier. Port and strictPort are checked only by reading `vite.config.ts`.
- vue-tsc emitted no files: `git status` shows only the intended new files.

### Notes for next tasks

- T02: `vite.config.ts` already has port 1420, `strictPort` and `clearScreen: false`. You will probably add
  `server.host` from `TAURI_DEV_HOST`, `server.watch.ignored: ['**/src-tauri/**']` and `envPrefix`.
  `vite.config.ts` is in `tsconfig.node.json`, which already has `types: ["node"]`, so `process.env` type-checks.
- `.gitignore` already covers `src-tauri/target` and `src-tauri/gen/schemas`.
- Build output uses absolute `/assets/...` paths (default `base: '/'`). This works for Tauri and a root-hosted PWA.
  It needs revisiting only if the PWA is served from a sub-path.
- Test files go in `src/**/*.test.ts` and are type-checked by `tsconfig.app.json` (`types: []`, so import `vitest` APIs explicitly; there are no globals).

### Proposed split

–

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - I re-ran the verification myself. `pnpm install` (lockfile up to date), `pnpm typecheck`, `pnpm test` ("No test files found", exit 0) and `pnpm build` all exit 0. `dist/index.html` links `/assets/index-*.css`, and that file contains `.bg-slate-950`, `.text-slate-100`, `.min-h-dvh` and `.text-3xl`.
  - `vite.config.ts:11,15-16`: `clearScreen: false`, `port: 1420` and `strictPort: true` are set. `vite.config.ts:30-33`: Vitest uses env `node` and includes `src/**/*.test.ts`.
  - `src/style.css:1`: Tailwind v4 is set up through `@import "tailwindcss"` plus the `@tailwindcss/vite` plugin (`vite.config.ts:9`). There is no `tailwind.config.*` and no PostCSS config.
  - `index.html:2,5-7`: `lang="en"`, the viewport with `viewport-fit=cover`, `theme-color` `#020618` (Tailwind v4 slate-950) and the title are all correct. A grep of `index.html`, `src/`, `vite.config.ts` and `tsconfig*.json` finds no network URLs.
  - `src/main.ts:1-9`: creates the app, installs Pinia, imports the stylesheet and mounts. `src/App.vue:4-5`: one dark placeholder screen with a centred title, no router and no extra components.
  - `.gitignore:1-31`: covers every required entry, including `src-tauri/target` and `src-tauri/gen/schemas`. `tsconfig.app.json` / `tsconfig.node.json` take `noEmit` from `@vue/tsconfig`, and no stray emitted files show up in `git status`.
  - `package.json:12,15,21` (`tauri` script, `@tauri-apps/api`, `@tauri-apps/cli`) and `vite.config.ts:5-6,12-13,17-28` (`TAURI_DEV_HOST`, `envPrefix`, `hmr`, `watch.ignored`) are Tauri content that is out of scope for T01. They are in T02's scope, and T02 is marked done, so I don't count them as T01 scope creep.
  - The TypeScript 6.x pin (`package.json:26`) differs from "current stable". The handoff explains why (vue-tsc/Volar peer dep `typescript@<7`), and the reason is acceptable.
  - Not checked: the dev server on port 1420 was not started live, by the worker or by me. Only the config was reviewed.
