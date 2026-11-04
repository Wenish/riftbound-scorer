# T01 — Design master app icon (SVG + 1024 px PNG)

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

Create an original, polished master app icon for **Riftbound Scorer** — an offline 1v1 score & match-timer
app for the Riftbound trading card game. Deliver a hand-written SVG source and a 1024×1024 PNG rendered from it.

### Scope

- Files to create:
  - `src-tauri/app-icon.svg` — the editable source, `viewBox="0 0 1024 1024"`.
  - `src-tauri/app-icon.png` — 1024×1024 RGBA PNG rendered from the SVG.
  - Optionally a tiny one-off render script **in the scratchpad / via `node -e`**, not committed.

### Out of scope

- Do **not** regenerate or modify anything in `src-tauri/icons/`, `public/`, `pwa-assets.config.ts`,
  `vite.config.ts`, `index.html`, `package.json`, `package-lock.json`, `README.md` (another plan has
  uncommitted work there). No new npm dependencies.
- No Riot Games / Riftbound / League of Legends logos, wordmarks, fonts, champion or card art — the app is
  unofficial; the icon must be fully original.

### Context to read

- `docs/SPEC.md` §1 (concept: phone lies between two players, each sees their half), §3.3 (score track 0 → 8,
  current score highlighted, divider in the middle), §7 (dark, high-contrast UI for dim tables).
- `pwa-assets.config.ts` — the app's dark background colour `#020618` (Tailwind slate-950).

### Design direction

The icon should read instantly as "two-player score keeping + match timer" and still feel like a fantasy
card game tool. Suggested concept (refine freely, keep it simple and bold):

- Full-bleed square, background in the app's dark navy (`#020618` → slightly lighter navy radial/linear
  gradient for depth). No transparency at the edges, no pre-rounded corners (iOS/Android mask it themselves).
- A central emblem: a faceted crystal/rune-like gem or shield split diagonally/horizontally into two halves
  in two contrasting accent colours (e.g. cool cyan/teal vs. warm amber/gold) — the two players, mirrored
  like the phone's split screen. A thin bright "rift" line separates the halves.
- A subtle score/timer cue: e.g. a ring of 8 pips/notches around the emblem (score track to 8) with some
  of them lit, or a stopwatch-like arc. Keep it secondary.
- No text, or at most a single bold glyph — it must stay legible at 32 px. Avoid thin hairlines that vanish
  when small; minimum stroke ≈ 16 px at 1024.
- Keep all key content inside the central ~80 % (safe zone ≈ 820 px circle) so masks (circle, squircle,
  Android adaptive) don't clip it.

### Acceptance criteria

- [ ] `src-tauri/app-icon.svg` exists, valid SVG, `viewBox="0 0 1024 1024"`, no external refs (no fonts, images, links).
- [ ] `src-tauri/app-icon.png` exists, exactly 1024×1024, rendered from the SVG, opaque edges.
- [ ] Look at the PNG yourself (Read tool on the image) and also a downscaled 64 px preview (render to the
      scratchpad, not the repo) — the emblem is still recognisable small. Iterate if not.
- [ ] Nothing outside the two files above is changed (`git status`).

### Verification

```sh
node -e "require('sharp')('src-tauri/app-icon.svg',{density:72}).resize(1024,1024).png().toFile('src-tauri/app-icon.png')"
node -e "require('sharp')('src-tauri/app-icon.png').metadata().then(m=>console.log(m.width,m.height,m.format))"
git status --short
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Hand-written SVG master icon plus a 1024×1024 PNG rendered from it with `sharp`. Design:

- Full-bleed square, dark navy radial gradient (`#16244a` centre → `#020618` edges), soft halo behind the emblem. No transparency, no rounded corners.
- Central emblem: an elongated faceted crystal (hexagonal silhouette, facet shading lit from top-left) split by a
  zigzag "rift" into a **cyan** top half (opponent) and an **amber** bottom half (you). The rift is point-symmetric
  about the centre, so the two halves are 180° rotations of each other, like the split match screen. Rift = dark cut
  (34 px) + white glow + 14 px bright white core, slightly overshooting the crystal edge like a spark.
- Score cue: a ring of 8 thick (36 px, round-capped) arc segments = the 0 → 8 score track. Gaps sit on the
  horizontal line of the rift; the top 4 are cyan (3 lit), the bottom 4 amber (2 lit), unlit ones in a dim tint.
- No text. All content within r ≈ 390 px of the centre (ring outer edge 388 px; inside the ~820 px safe-zone circle).
- Iterated once: first version's facets read as an isometric cube; switched to a taller crystal with a narrow central face.

### Files changed

- `src-tauri/app-icon.svg` (new) — editable source, `viewBox="0 0 1024 1024"`, comments explain the concept; facets are a shared `<g id="facets">` reused for both halves.
- `src-tauri/app-icon.png` (new) — 1024×1024 RGBA, rendered from the SVG.

### Verification results

- `node -e "require('sharp')('src-tauri/app-icon.svg',{density:72}).resize(1024,1024).png().toFile('src-tauri/app-icon.png')"` — OK.
- metadata check → `1024 1024 png` (4 channels); additionally checked the minimum alpha over all pixels → `255` (fully opaque).
- `xmllint --noout src-tauri/app-icon.svg` → valid. `grep` for `xlink|<image|font|http` → only the `xmlns` namespace URI; no external refs.
- Viewed the 1024 px PNG and a 64 px downscale (scratchpad only): crystal, two colours, rift and ring are all clearly recognisable at 64 px.
- `git status --short` → only `src-tauri/app-icon.png` / `src-tauri/app-icon.svg` are new from this task. The other
  entries (README.md, index.html, package*.json, vite.config.ts, tsconfig.node.json, src/vite-env.d.ts, public/,
  pwa-assets.config.ts, src/platform/, plus now also `src/App.vue`, `src/main.ts`, `src/components/`) belong to the
  parallel `2026-11-04-pwa-setup` plan and were not touched by this task.

### Notes for next tasks

- Platform sizes are not generated (per plan). Later: `npm run tauri icon` (defaults to `src-tauri/app-icon.png`)
  regenerates `src-tauri/icons/`; `pwa-assets.config.ts`'s script copies `src-tauri/icons/icon.png`, so run it after.
- Re-render the PNG from the SVG with the first verification command after any SVG edit (librsvg via `sharp` supports
  the gradients/blur filters used).
- Android adaptive icons crop harder (~66 % safe circle ≈ r 338 px); the crystal fits (tips at r 300) but the outer
  ring would be partly clipped there. If that matters, a foreground variant without the ring could be added later.

### Proposed split

– (not needed)

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - All acceptance criteria met, checked independently:
    - `src-tauri/app-icon.svg:1`: `viewBox="0 0 1024 1024"`, and `xmllint --noout` passes. Every `href`/`url()` points to an internal `#id`. There are no fonts, `<image>` elements, `xlink` or `http` refs apart from the `xmlns` URI.
    - `src-tauri/app-icon.png`: `1024 1024 png`, 4 channels, minimum alpha 255 (opaque). Re-rendering the SVG with the brief's `sharp` command produces a byte-identical raw buffer (0 differing bytes), so the PNG matches the current SVG.
    - Viewed at 1024, 64 and 32 px (previews in the scratchpad only). The two-colour crystal, the white rift and the cyan/amber ring are clearly recognisable even at 32 px. Ring outer edge is r = 388, inside the ~410 px safe circle. The background is full-bleed with no rounded corners.
    - `git status --short src-tauri/` shows only the two new files. `src-tauri/icons/` and the pwa-setup plan's files are untouched by this task.
  - The design is original: no Riot/Riftbound marks, fonts or text.
  - Non-blocking: the gem outline at `src-tauri/app-icon.svg:102` is 6 px wide (35 % opacity). The brief says strokes should be at least about 16 px. This outline is only a decorative edge, though, and the silhouette still reads at 32 px through the fill contrast. No change needed.
  - Non-blocking: the comment at `src-tauri/app-icon.svg:5` says the halves are 180° rotations of each other. That is true for the silhouette and the rift (`:107-108`, point-symmetric about 512,512). It is not true for the shared facet shading (`:38-46`, lit from the top left). This is cosmetic and only affects the accuracy of the comment.
