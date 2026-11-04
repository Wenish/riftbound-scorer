# Scaffold the Tauri + Vue + Tailwind app

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "scaffold the Tauri + Vue + Tailwind app"

## Goal

The repo has a working project skeleton: a Vite + Vue 3 + TypeScript frontend with Tailwind CSS, Pinia
and Vitest, wrapped in a Tauri 2 shell. `pnpm build`, `pnpm test`, the type check and `cargo check`
in `src-tauri/` all pass. No product features yet.

## Context

- Spec sections: SPEC.md §2 (tech stack), §2.1 (PWA, follow-up only), §6 (dark UI, no network)
- Relevant files: `CLAUDE.md`, `.gitattributes`

## Tasks

| ID  | Title                                   | Depends on | Status |
| --- | --------------------------------------- | ---------- | ------ |
| T01 | Vite + Vue 3 + TS + Tailwind frontend   | –          | done   |
| T02 | Tauri 2 shell around the frontend       | T01        | done   |

## Decisions

- Package manager: **pnpm** (installed locally, v10). — orchestrator: fast, strict, lockfile committed.
- Tailwind CSS **v4** via `@tailwindcss/vite` (no `tailwind.config.js`, no PostCSS config). — orchestrator: current major, simplest Vite setup.
- Pinia and Vitest set up in the scaffold, since SPEC §2 lists them. — orchestrator.
- Out of this plan, separate follow-ups: `vite-plugin-pwa` / manifest / icons (SPEC §2.1), `tauri ios init` / `tauri android init` (need Xcode / Android SDK), platform adapters, routing and screens. — orchestrator: keeps the scaffold small and verifiable.
- Bundle identifier `app.riftboundscorer` — orchestrator: neutral placeholder, change before store release.
- TypeScript pinned to `^6.0.3`: vue-tsc 3.3 / Volar peer-requires `typescript@<7`. — T01 worker; revisit when Volar supports TS 7.
- CSP adds `connect-src ipc: http://ipc.localhost` — T02 worker: Tauri IPC custom protocol (local, not network), per Tauri's documented example.
- T01 → T02 sequential: both change `package.json`.

## Outcome

Project skeleton delivered. Frontend: Vite 8, Vue 3.5 (`<script setup>`), TypeScript 6, Tailwind CSS 4
(`@tailwindcss/vite`), Pinia, Vitest; placeholder dark `App.vue`; dev server on port 1420 (strict). Shell:
Tauri 2.12 in `src-tauri/` (mobile-ready `lib.rs` entry point, no plugins, `core:default` only, restrictive CSP,
identifier `app.riftboundscorer`, default icons); Tauri dev settings in `vite.config.ts`.

Verified by workers and independently re-run by reviewers (both approved): `pnpm install`, `pnpm typecheck`,
`pnpm test`, `pnpm build`, `cargo check`, `pnpm tauri info` — all exit 0; built CSS contains Tailwind output;
no network URLs in source.

Not verified: `pnpm dev` / `pnpm tauri dev` were not started live; no `pnpm tauri build` bundle.

Follow-ups: PWA (`vite-plugin-pwa`, manifest, icons — SPEC §2.1); `tauri ios init` (needs full Xcode, only
CLT installed) / `tauri android init`; real app icon; platform adapters; router and screens; move to TS 7
once vue-tsc supports it; replace placeholder bundle identifier before store release.
