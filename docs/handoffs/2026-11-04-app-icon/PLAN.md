# Base app icon

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "create a base app icon for the app that make sense. just add somewhere the finished HD picture. the different sizes you do not need to generate already just the base image"

## Goal

An original, high-resolution (1024×1024) master app icon for Riftbound Scorer exists in the repo as an
editable SVG source plus a rendered PNG. Platform sizes (Tauri icon set, PWA icons) are **not** regenerated yet.

## Context

- Spec sections: SPEC.md §1 (what the app is), §2.1 (manifest icons, dark UI colours), §3.3 (score track 0 → 8), §7 (dark, high-contrast UI)
- Relevant files: `pwa-assets.config.ts` (dark background `#020618`), `src-tauri/icons/` (current default Tauri icons — untouched)

## Tasks

| ID  | Title | Depends on | Status |
| --- | ----- | ---------- | ------ |
| T01 | Design master app icon (SVG + 1024 px PNG) | – | done |

## Decisions

- Master files live at `src-tauri/app-icon.svg` / `src-tauri/app-icon.png` — `app-icon.png` is the default input of `npm run tauri icon`, so generating all sizes later is a single command.
- Original artwork only — no Riot/Riftbound logos, fonts or card art (the app is unofficial).
- Rendered with `sharp` (already in `node_modules` via `@vite-pwa/assets-generator`), no new dependencies.
- Does not touch the in-progress `2026-11-04-pwa-setup` plan's files.

## Outcome

- Delivered `src-tauri/app-icon.svg` (source) and `src-tauri/app-icon.png` (1024×1024, opaque): faceted crystal split by a glowing rift into a cyan (opponent) and amber (you) half, ringed by 8 score-track segments, on the app's dark navy.
- Verified by worker and reviewer: valid self-contained SVG, PNG re-renders pixel-identical via `sharp`, legible at 64 px and 32 px, content inside the safe zone (outer ring r ≈ 388). Review: approved; the comment nit about 180° symmetry was fixed in the SVG comment (no visual change).
- Follow-ups: generate platform sizes with `npm run tauri icon` (writes `src-tauri/icons/`) and then `npm run generate-pwa-assets`. Android adaptive masks may clip the outer ring; a ring-less foreground variant could be added if needed.
