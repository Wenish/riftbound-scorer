# Developer README

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "can you add a very simple readme which just shows how to start the tauri app in dev mode and how to start it so it represents the pwa app. so like very simple developer setup and one line commands to run when everything installed for development to start the app in dev mode"

## Goal

A short root `README.md` with prerequisites, install, and one-line commands to run the app in dev mode as a Tauri app and as the PWA (browser).

## Context

- Spec sections: §1 (targets), §2 / §2.1 (stack, PWA)
- Relevant files: `package.json`, `vite.config.ts`, `src-tauri/tauri.conf.json`

## Tasks

| ID  | Title | Depends on | Status |
| --- | ----- | ---------- | ------ |
| T01 | Write developer README | – | done |

## Decisions

- Keep the README minimal (setup + dev commands only); details stay in `docs/SPEC.md` — user asked for "very simple".

## Outcome

Added root `README.md`: prerequisites, `npm install`, one-line dev commands for Tauri desktop (`npm run tauri dev`), browser (`npm run dev`, :1420), production preview (`npm run build && npm run preview`, :4173) and iOS/Android (`npm run tauri ios|android dev`, after a one-time `npx tauri ios|android init`). Notes that PWA features aren't set up yet (`vite-plugin-pwa` not installed).

Verified: `npm run build` passes; `npx tauri --help` lists the used subcommands; orchestrator read the README against `package.json`/`vite.config.ts`. Dev servers and mobile commands were not run. No review agent (docs only).

Follow-ups: update the PWA note when `vite-plugin-pwa` lands; drop the init hint once `src-tauri/gen/apple|android` exist.
