# App icon: red vs blue revision

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "can you make that its like red vs blue colorwise like in league of legends the team colors. and then each side has 8 score points to get. so in total there would be 16 in the circle. and simplify the rift in the middle"

## Goal

The master icon (`src-tauri/app-icon.svg` / `.png`, from plan `2026-11-04-app-icon`) uses red vs blue team
colours, its ring has 16 segments (8 per player), and the rift through the crystal is simpler.

## Context

- Previous plan: [2026-11-04-app-icon](../2026-11-04-app-icon/PLAN.md)
- Relevant files: `src-tauri/app-icon.svg`, `src-tauri/app-icon.png`

## Tasks

| ID  | Title | Depends on | Status |
| --- | ----- | ---------- | ------ |
| T01 | Red/blue recolour, 16-segment ring, simpler rift | – | done |

## Decisions

- Blue = you (bottom half), red = opponent (top half) — mirrors the MOBA convention of blue side bottom-left / red side top-right, and matches the app's bottom = you layout.
- Generic team-style red and blue; no Riot logos or brand assets.

## Outcome

- `src-tauri/app-icon.svg` / `.png` revised: red crystal top (opponent), blue bottom (you), single straight glowing rift, 16-segment ring (8 red with 3 lit on top, 8 blue with 5 lit below, split at 9 and 3 o'clock).
- Verified by worker and reviewer: valid self-contained SVG, PNG 1024×1024 opaque and pixel-identical on re-render, halves distinct at 32 px. Review: approved.
- Follow-up unchanged: generate platform sizes via `npm run tauri icon`, then `npm run generate-pwa-assets`.
