# T01 — Red/blue recolour, 16-segment ring, simpler rift

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

Revise the existing master app icon so it reads as **red team vs blue team**, its ring shows **16 score
segments (8 per player)**, and the **rift line through the crystal is simplified**. Keep everything else
(dark navy background, faceted crystal, overall composition, safe zone) as is.

### Scope

- Files to change: `src-tauri/app-icon.svg` (edit the source), `src-tauri/app-icon.png` (re-render, 1024×1024).

### Out of scope

- Anything else in the repo. In particular do not touch `src-tauri/icons/`, `public/`, `pwa-assets.config.ts`,
  `vite.config.ts`, `index.html`, `package*.json`, `README.md`, `src/` (another plan has uncommitted work).
- No Riot / League of Legends / Riftbound logos or brand artwork — colours only.
- No new npm dependencies; render with `sharp` (already in `node_modules`).

### Context to read

- `src-tauri/app-icon.svg` (current design and its header comment) and look at `src-tauri/app-icon.png`.
- `docs/handoffs/2026-11-04-app-icon/T01-master-icon.md` — original brief and handoff (design rules: min.
  stroke ≈ 16 px, content within ~400 px radius of the centre, full-bleed opaque square, no text).

### Changes

1. **Colours: red vs blue team.**
   - Top half of the crystal (opponent) → **red** (MOBA "red team": crimson/scarlet, e.g. highlights around
     `#ff6b6b`, mid `#e53935`, shadows `#8e1b1b`).
   - Bottom half (you) → **blue** (MOBA "blue team": saturated azure, e.g. highlights `#7cc4ff`, mid
     `#2f80ed`, shadows `#123d8a`). Keep the faceted shading so it still looks like a gem.
   - Pick values so the two halves contrast clearly with each other and with the dark navy background
     (the blue must not blend into the background — make it bright enough). Glows/halos follow the new colours.
2. **Ring: 16 segments, 8 per side.** Replace the 8-segment ring with 16 evenly spaced, rounded segments:
   the 8 segments of the upper half are red (opponent's score track), the 8 of the lower half are blue (yours).
   The split between the two groups must line up horizontally with the rift (gaps at 9 and 3 o'clock).
   Light a few segments per side (e.g. red 3/8, blue 5/8, lit from the left end of each half going
   clockwise for red / counter-clockwise for blue — or any consistent rule, documented in the SVG comment);
   unlit segments are dim versions of their team colour. Segments must stay chunky enough to read at 64 px
   — reduce gaps rather than making segments hairline.
3. **Simpler rift.** Replace the zigzag with a single clean line across the crystal — a straight horizontal
   line or one straight diagonal — still glowing white, still the boundary between red and blue. Fewer kinks,
   cleaner silhouette.
4. Update the SVG header comment to describe the new design accurately.

### Acceptance criteria

- [ ] Crystal top half is red, bottom half blue; clearly distinct at 32 px.
- [ ] Ring has exactly 16 segments: 8 red on the top half, 8 blue on the bottom half, some lit per side,
      group split aligned with the rift.
- [ ] Rift is a single straight line (no zigzag).
- [ ] SVG valid, `viewBox="0 0 1024 1024"`, no external refs; PNG 1024×1024, fully opaque, rendered from the SVG.
- [ ] You looked at the PNG at full size and at 64 px and 32 px previews (scratchpad only) and iterated if needed.
- [ ] `git status --short` shows only the two icon files changed by you (other pre-existing changes are fine; list them).

### Verification

```sh
xmllint --noout src-tauri/app-icon.svg
node -e "require('sharp')('src-tauri/app-icon.svg',{density:72}).resize(1024,1024).png().toFile('src-tauri/app-icon.png')"
node -e "require('sharp')('src-tauri/app-icon.png').stats().then(s=>console.log('min alpha',s.channels[3]?.min))"
git status --short
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Revised the master icon. The background, faceted crystal silhouette, facet shading, composition and safe zone
are unchanged.

- **Colours:** the top half of the crystal is red (gradient `#ff5f5f` → `#e53935` → `#b02525`). The bottom half is
  blue (`#7cc4ff` → `#2f80ed` → `#1f5fcf`). The same facet overlay is used, and the darkest facet was softened
  slightly (0.34 → 0.30, 0.12 → 0.10) so the blue never sinks into the navy. The gem outline tint changed from
  cyan-white to a neutral `#f1f5ff`. The single cyan halo is now one red-over-blue halo: a vertical linear
  gradient, faded radially by a mask, so there is no hard seam in the background.
- **Ring:** 16 round-capped arcs (r 370, stroke 36, 22.5° slots, 13° arcs, about 23 px visible gaps). The upper 8
  are red and the lower 8 blue. The groups split at 9 and 3 o'clock, on the rift line. Lit segments count from
  9 o'clock: red runs clockwise over the top (3 of 8 lit), blue runs counter-clockwise under the bottom (5 of 8
  lit). Lit segments are `#ff4f4f` / `#3d9bff` with a soft glow. Unlit segments are dim team tints `#5c1f2b` /
  `#1c3a6e`.
- **Rift:** one straight horizontal line at y = 512 (a dark cut, a white glow and a 14 px white core). It
  overshoots the crystal edges slightly. The half clip paths are now simple rectangles.
- **Comment:** the SVG header comment describes the new design, including the lit-segment rule.
- **Iteration:**
  - The first render showed a hard horizontal seam where two separately clipped halos met. I replaced them with
    one gradient halo plus a mask.
  - The first render also had no rift glow. librsvg computes the default `objectBoundingBox` filter region from
    a horizontal line's bounding box, which has zero height, so the region was empty. The rift now uses its own
    `rift-glow` filter in `userSpaceOnUse`. The old `glow` filter was no longer used and is removed.

### Files changed

- `src-tauri/app-icon.svg`: edited as described above.
- `src-tauri/app-icon.png`: re-rendered from the SVG at 1024×1024.

### Verification results

- `xmllint --noout src-tauri/app-icon.svg`: valid, no output.
- `node -e "require('sharp')('src-tauri/app-icon.svg',{density:72}).resize(1024,1024).png().toFile('src-tauri/app-icon.png')"`: OK.
- Alpha check: `min alpha 255`, so the image is fully opaque. Metadata: `1024 1024 png 4`.
- `grep -nE 'xlink|<image|font|http'`: only matches the `xmlns` URI, so there are no external refs.
  `viewBox="0 0 1024 1024"` is kept.
- Element counts: 24 `<path>` elements = 16 ring segments plus 8 glow duplicates for the lit ones (3 red, 5 blue).
  There are 0 `<polyline>` elements; the rift is drawn with `<line>` only.
- Visual check: I viewed the full-size PNG plus 64 px and 32 px downscales, which were written to the scratchpad
  only. At 32 px the red top and blue bottom are clearly distinct, and the white rift and the red/blue ring still
  read.
- `git status --short` shows ` M src-tauri/app-icon.png`, ` M src-tauri/app-icon.svg` and
  `?? docs/handoffs/2026-11-04-app-icon-red-blue/` (this plan's folder). There were no other pre-existing changes.

### Notes for next tasks

- Platform icons in `src-tauri/icons/` and the PWA icons were not regenerated (out of scope). Run
  `npm run tauri icon` and then the PWA asset step to propagate the new design.
- Any future glow on a perfectly horizontal or vertical line needs a `userSpaceOnUse` filter region, as explained
  in the Iteration note above.

### Proposed split

– (not needed)

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - All acceptance criteria are met. No blocking issues.
  - **Colours:** `src-tauri/app-icon.svg:32-41` sets the red (`#ff5f5f` → `#b02525`) and blue (`#7cc4ff` →
    `#1f5fcf`) gradients. They are applied through the half clips at `:118-127`. In the 32 px preview (nearest-upscaled,
    scratchpad only) the red top and blue bottom are clearly distinct, and the blue stands out from the navy.
  - **Ring:** `src-tauri/app-icon.svg:76-115` has 16 base arcs. The top has 5 dim plus 3 lit, and the bottom has 3 dim
    plus 5 lit. The other 8 paths are glow duplicates of the lit arcs. The arcs sit on r = 370 and are symmetric about
    y = 512: the endpoints nearest 9 and 3 o'clock are at y 481.4 and 542.6, so the group gaps line up with the rift.
    The lit-segment rule is documented at `:8-10` and matches the geometry. Ring extent is 370 + 18 = 388 px, which is
    inside the ~400 px safe radius.
  - **Rift:** `src-tauri/app-icon.svg:131-135` uses three `<line>` elements at y = 512. There are no `<polyline>`
    elements and no zigzag. The 14 px core is the same width as in the previous design (`HEAD`), so it is not a
    regression against the ≈16 px stroke rule. The `userSpaceOnUse` filter region at `:63-65` is correct for a
    zero-height bounding box.
  - **Verification, re-run by the reviewer:**
    - `xmllint` reports the SVG as valid.
    - I rendered the SVG to the scratchpad with the brief's sharp command. Compared with the committed PNG it is
      byte-identical (0 differing bytes), so the PNG really is rendered from this SVG.
    - The PNG is 1024×1024 with min alpha 255 (fully opaque).
    - `viewBox="0 0 1024 1024"` is kept, and there are no external refs (only the `xmlns` URI and `url(#…)` refs).
  - **Scope:** `git status --short` shows only `src-tauri/app-icon.png`, `src-tauri/app-icon.svg` and this plan's
    folder, so nothing outside scope changed.
