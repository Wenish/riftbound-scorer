# T02 — Seamless maskable + apple-touch icons (no padding)

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** T01

## Brief

### Goal

`public/maskable-icon-512x512.png` and `public/apple-touch-icon-180x180.png` currently show a visible square
seam: the generator shrinks the full-bleed master icon and pads it with flat `#020618`, which doesn't match
the master's radial-gradient background. Generate both **without padding** so they are the full-bleed master,
scaled.

Why that is safe: the master `src-tauri/app-icon.png` (1024×1024) is already full-bleed and opaque, and all
key content lies within r = 388 px of the centre. The maskable safe zone is a circle of radius 40 % =
409.6 px at 1024, so the master already fits it. iOS applies its own rounded mask to apple-touch icons, which
also only needs full-bleed artwork.

### Scope

- `pwa-assets.config.ts` — set `padding: 0` for `maskable` and `apple` (keep the opaque `background` resize
  option as a fallback, or drop it if it's now pointless; update the comments to explain why there is no padding).
- `public/maskable-icon-512x512.png`, `public/apple-touch-icon-180x180.png` (and any other `public/` icon the
  generator rewrites) — regenerate with `npm run generate-pwa-assets`.
- `src-tauri/icons/android/values/ic_launcher_background.xml` — change the adaptive-icon background from the
  CLI default `#FFFFFF` to the app's dark navy `#020618`, so any area outside the foreground layer isn't white.
  Note in the README "App icon" section (one line) that this value must be re-applied after `npm run tauri icon`,
  since the CLI overwrites it.

### Out of scope

- The master icon, other `src-tauri/icons/**` files, `vite.config.ts`, `index.html`, app code. In `README.md` only the one-line note above.

### Context to read

- `pwa-assets.config.ts`, `docs/handoffs/2026-11-04-use-app-icon/T01-regenerate-icons.md` (Handoff section).
- `@vite-pwa/assets-generator` preset options in `node_modules/@vite-pwa/assets-generator` (find where
  `padding` is defined for `minimal2023Preset`).

### Acceptance criteria

- [ ] Look at `public/maskable-icon-512x512.png` and `public/apple-touch-icon-180x180.png`: no square seam;
      they look like the master scaled down, edge to edge.
- [ ] Ring + crystal still lie inside the maskable safe zone (circle radius 40 % of the image width around the centre).
- [ ] `ic_launcher_background.xml` uses `#020618`; README mentions re-applying it.
- [ ] `public/pwa-source.png` not left behind; `npm run build` passes; `git status --short` shows only in-scope files
      (plus T01's not-yet-committed changes).

### Verification

```sh
npm run generate-pwa-assets
npm run build
git status --short
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

- In `pwa-assets.config.ts`, set `padding: 0` on the `maskable` and `apple` presets. The preset default is `0.3`, from `defaultPngOptions` in `node_modules/@vite-pwa/assets-generator/dist/utils-WVxdTzUh.mjs`, and `createSharp` scales the image to `size * (1 - padding)`. I kept `resizeOptions: { background }`: it is the canvas that `createSharp` composites the image onto, so without it the generator would fall back to `white`. It is never visible while the master is opaque. The comment above the two entries now explains why there is no padding.
- Ran `npm run generate-pwa-assets`. `maskable-icon-512x512.png` and `apple-touch-icon-180x180.png` are now the full-bleed master scaled down, with no seam. The transparent `pwa-*.png` and `favicon.ico` are produced by unchanged config and were regenerated alongside them.
- In `src-tauri/icons/android/values/ic_launcher_background.xml`, changed `#FFFFFF` to `#020618`.
- `README.md`, "App icon" section: added one line after the command block saying that `tauri icon` resets that XML to `#FFFFFF` and it must be set back to `#020618`.

### Files changed

- `pwa-assets.config.ts`
- `public/maskable-icon-512x512.png`, `public/apple-touch-icon-180x180.png`: regenerated. The other `public/` icons were rewritten by the same run.
- `src-tauri/icons/android/values/ic_launcher_background.xml`
- `README.md`: one line

### Verification results

- `npm run generate-pwa-assets`: OK, "PWA assets generated". `ls public/pwa-source.png` reports no such file.
- Visual check: I opened both PNGs. The artwork runs edge to edge, the background is a continuous gradient, and there is no square seam.
- Numeric check with a sharp script in the scratchpad:
  - Both files: every pixel is opaque (min alpha 255).
  - Farthest bright pixel (max RGB > 120, i.e. ring, crystal or glow) from the centre: maskable 194.2 px of 512 (37.9 %); apple 68.5 px of 180 (38.1 %). Both are under the 40 % safe-zone radius.
  - Edge pixels are the master's gradient (corner `4,10,32`, edge midpoint `8,16,44`), not flat `#020618`.
  - Maskable compared with the master resized to 512: mean channel difference 1.96, max 62. The max is PNG quantisation (preset `quality: 60`), not a layout shift.
- `npm run build`: OK, precache 11 entries.
- `git status --short`: only T01's paths plus `pwa-assets.config.ts`, `README.md`, the `public/` icons and `src-tauri/icons/android/` (already untracked from T01). Nothing else.

### Notes for next tasks

- The Android adaptive-icon ring clipping that T01 noted (foreground scale under circular launcher masks) is still out of scope and unchanged.

### Proposed split

_(n/a)_

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - All acceptance criteria are met; I checked each one myself.
    - The padding override works. The asset-level default comes from `defaultPngOptions[type].padding` (`node_modules/@vite-pwa/assets-generator/dist/utils-WVxdTzUh.mjs:60`) and is spread before the user's asset config. So `padding: 0` at `pwa-assets.config.ts:21` and `:26` wins, and the generator scales the image to `size * (1 - padding)` (`transparent-lM0a7r8e.mjs:98`).
    - I re-ran `npm run generate-pwa-assets`, and all 6 files in `public/` came out byte-identical to the committed-to-be versions (compared with shasum). `public/pwa-source.png` is not left behind.
    - Visual check of `public/maskable-icon-512x512.png` and `public/apple-touch-icon-180x180.png`: the master runs edge to edge with no square seam. A sharp scan of the middle row from the edge inwards shows a smooth gradient (`7,13,39` → `8,16,44` → `10,18,49` …), with no flat `#020618` band. Every pixel is opaque (min alpha 255).
    - Safe zone: the farthest bright pixel is 37.9 % (maskable) and 38.1 % (apple) of the width from the centre, which is under 40 %. The dim right-hand ring segments sit on the same circle, because the ring is symmetric. Only the faint corner decoration of the master lies outside the safe zone, and losing it to a mask is intended.
    - `src-tauri/icons/android/values/ic_launcher_background.xml:3` is `#020618`, and `README.md:72` has the one-line re-apply note.
    - `npm run build` passes, with a precache of 11 entries.
    - `git status --short` shows no T02 changes outside the scope: no changes in `src/`, `vite.config.ts`, `index.html` or the master icon.
  - Note for the orchestrator's commit, not a T02 defect: `package.json` (the `idb` dependency) and `package-lock.json` (`idb`, `fake-indexeddb`) are also modified in the working tree. Those edits come from the parallel `2026-11-04-implement-app` plan (T02-storage), not from this plan. When this plan is committed, stage only the `package.json` hunk for `generate-pwa-assets` (from T01), not the `idb` hunk or the lockfile changes.
