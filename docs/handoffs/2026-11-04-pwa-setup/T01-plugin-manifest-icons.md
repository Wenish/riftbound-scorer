# T01 — vite-plugin-pwa config, manifest and icons

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

`npm run build` produces an installable PWA: web app manifest, PWA icons, and a Workbox service worker that precaches all app assets. Nothing PWA-related is emitted when building for Tauri.

### Scope

- Files to create/change: `package.json` + `package-lock.json` (add `vite-plugin-pwa` devDependency; optionally `@vite-pwa/assets-generator` for icons), `vite.config.ts`, `index.html`, `public/` (new: icons, favicon, apple-touch-icon), optionally `pwa-assets.config.ts`, `src/vite-env.d.ts` (add `vite-plugin-pwa/vue` / `vite-plugin-pwa/client` types so T02 can import `virtual:pwa-register/vue`), `README.md` (update the PWA note).

### Out of scope

- Registering the service worker in app code / update prompt UI (T02). Don't touch `src/main.ts` or `src/App.vue`.
- Wake Lock, storage adapters, Tauri config.

### Context to read

- `docs/SPEC.md` §2.1 (PWA requirements), §6
- `vite.config.ts` (note `TAURI_DEV_HOST`, `envPrefix` with `TAURI_ENV_*`), `index.html` (theme-color `#020618`, `bg-slate-950`), `src-tauri/icons/icon.png` (512×512 — source image for icons)
- vite-plugin-pwa docs: https://vite-pwa-org.netlify.app/

### Requirements

- Use npm only. Pick current stable versions compatible with Vite 8 (check peer deps; if `vite-plugin-pwa` doesn't declare Vite 8 support yet, report it and use `--legacy-peer-deps` only if it builds and works — say so in the handoff).
- `VitePWA({...})` with:
  - `registerType: 'prompt'`, `injectRegister: false` (T02 registers manually), `devOptions.enabled: false`.
  - `disable: !!process.env.TAURI_ENV_PLATFORM` (Tauri CLI sets it for `tauri dev/build`) so no SW/manifest is emitted for the native bundle. Verify `virtual:pwa-register/vue` still resolves when disabled (build T02's import would break otherwise); if it doesn't, use another approach and document it.
  - `manifest`: name and short_name "Riftbound Scorer" (short_name may be shorter, e.g. "Riftbound"), description, `display: 'standalone'`, `orientation: 'portrait'`, `theme_color` and `background_color` `#020618`, `start_url`/`scope` `/` (or relative), icons 192, 512, and a 512 `purpose: 'maskable'` icon (padded so the logo sits in the safe zone).
  - Workbox `globPatterns` covering all built assets (js, css, html, ico, png, svg, webmanifest, fonts if any); no runtime caching of external origins; `navigateFallback` to `index.html`.
- Icons in `public/` generated from `src-tauri/icons/icon.png`: e.g. `@vite-pwa/assets-generator` with the `minimal-2023` preset, or `sips` + a padded maskable variant. Include `apple-touch-icon` (180×180) and a favicon; link them in `index.html` (`<link rel="icon">`, `<link rel="apple-touch-icon">`). Commit the generated PNGs; if you add the generator, add an npm script like `"generate-pwa-assets"`.
- Add iOS meta tags to `index.html` where useful (`apple-mobile-web-app-capable` / `mobile-web-app-capable`, status bar style `black-translucent` or `black`).
- No network calls at runtime (no Google Fonts, no CDN).
- Update the PWA note in `README.md`: PWA (manifest + offline service worker) is only active in the production build — test with `npm run build && npm run preview`; `npm run dev` has no service worker.

### Acceptance criteria

- [ ] `npm run build` passes and `dist/` contains `sw.js`, a workbox runtime file, `manifest.webmanifest`, and the referenced icons; `dist/index.html` links the manifest.
- [ ] `TAURI_ENV_PLATFORM=macos npm run build` passes and emits no `sw.js` / `manifest.webmanifest`.
- [ ] Manifest fields match SPEC §2.1 (name, 192/512/maskable icons, standalone, portrait, colours).
- [ ] Precache manifest in `sw.js` includes `index.html` and the JS/CSS bundles.
- [ ] `npm run typecheck` and `npm test` pass.
- [ ] README PWA note updated and accurate.

### Verification

```sh
npm run build && ls dist && cat dist/manifest.webmanifest && grep -o 'index.html' dist/sw.js | head -1
rm -rf dist && TAURI_ENV_PLATFORM=macos npm run build && ls dist
npm run build   # leave dist as the normal web build
npm run typecheck && npm test
```

---

## Handoff

### Summary

Added `vite-plugin-pwa@^2.0.0` (declares `vite ^8.0.0` in its peer deps, so `--legacy-peer-deps` was not needed) and `@vite-pwa/assets-generator@^2.0.0` (devDependencies). `vite.config.ts` now runs `VitePWA` in `generateSW` mode with `registerType: 'prompt'`, `injectRegister: false`, `devOptions.enabled: false`, `disable: !!process.env.TAURI_ENV_PLATFORM`, the SPEC §2.1 manifest, and Workbox precaching with `navigateFallback: 'index.html'` and no runtime caching. Icons were generated into `public/` from `src-tauri/icons/icon.png` with the `minimal-2023` preset. The maskable and apple-touch icons are padded onto `#020618` (30% generator default padding, so the logo sits inside the safe zone; I checked them visually). `index.html` links the favicon and apple-touch icon and has the iOS/Android standalone meta tags. The README PWA note is updated.

Deviations and choices:
- **`globPatterns` leaves out `webmanifest`**, and `includeManifestIcons: false` is set. The plugin always adds `manifest.webmanifest` to the precache and by default also adds the manifest icons, so with the brief's glob list the precache held 5 duplicate entries (same revision, so harmless, but untidy). The precache now has 10 unique entries and still covers the manifest and every icon.
- **The generator writes its output next to the source image**, so `npm run generate-pwa-assets` copies `src-tauri/icons/icon.png` to `public/pwa-source.png`, runs `pwa-assets-generator`, then deletes the copy. It uses `node -e` so it works on any OS. That keeps the Tauri icon as the single source and keeps the 50 KB source PNG out of `dist`/the precache. If the generator fails midway, the copy stays behind; delete it by hand.
- **An extra 64×64 icon** (part of the `minimal-2023` preset) is in the manifest besides 192, 512 and maskable 512.
- **`tsconfig.node.json`** now includes `pwa-assets.config.ts` so the typecheck covers it. That file wasn't in the scope list, but the change is one line and directly tied to the new config file.
- **I checked `virtual:pwa-register/vue` resolution when the plugin is disabled.** I used a probe build in the scratchpad (a temporary entry importing `useRegisterSW`, built with the repo's vite config; no repo files touched). With `TAURI_ENV_PLATFORM=macos` it builds and the plugin emits its no-op ("dev") variant: 0 `serviceWorker` references, no workbox-window chunk. Without the variable it bundles `workbox-window`. So T02 can import it unconditionally.

### Files changed

- `package.json` — devDeps `vite-plugin-pwa`, `@vite-pwa/assets-generator`; script `generate-pwa-assets`
- `package-lock.json`
- `vite.config.ts` — `VitePWA({...})` config
- `pwa-assets.config.ts` (new) — `minimal-2023` preset, dark background for maskable/apple
- `public/` (new): `favicon.ico` (48), `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`
- `index.html` — description, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style=black-translucent`, `apple-mobile-web-app-title`, icon + apple-touch-icon links
- `src/vite-env.d.ts` — `/// <reference types="vite-plugin-pwa/vue" />`
- `tsconfig.node.json` — include `pwa-assets.config.ts`
- `README.md` — PWA note rewritten; `generate-pwa-assets` added to "Other scripts"

### Verification results

- `npm run build` passed. `dist/` contains `sw.js`, `workbox-2fbc6a65.js`, `manifest.webmanifest`, `favicon.ico`, `apple-touch-icon-180x180.png`, `pwa-64/192/512x*.png`, `maskable-icon-512x512.png`, `index.html`, `assets/`. `dist/index.html` has `<link rel="manifest" href="/manifest.webmanifest">`. The manifest has name "Riftbound Scorer", short_name "Riftbound", standalone, portrait, theme/background `#020618`, start_url/scope `/`, icons 64/192/512 plus maskable 512. `grep -o 'index.html' dist/sw.js` matched. The precache (10 entries) holds `index.html`, `assets/index-*.js`, `assets/index-*.css`, all icons, and `manifest.webmanifest`. A `NavigationRoute` is bound to `index.html`.
- `rm -rf dist && TAURI_ENV_PLATFORM=macos npm run build` passed. `dist/` has no `sw.js`, no workbox file, no `manifest.webmanifest`, and `index.html` has no manifest link. The icons from `public/` are still copied, which is harmless.
- `npm run build`: I rebuilt last, so `dist` is the normal web build.
- `npm run typecheck` passed. `npm test` passed (no test files yet; `--passWithNoTests`).
- I did not run `npm run preview` in a browser to test install or offline behaviour manually.
- `npm install` reports 6 audit findings (2 low, 4 moderate) in transitive deps (`deepmerge`, `glob`, `minimatch`, via workbox-build / the generator). These are build-time only; I did not run `npm audit fix --force` because it would make breaking changes.

### Notes for next tasks

- T02: `import { useRegisterSW } from 'virtual:pwa-register/vue'` is typed through `src/vite-env.d.ts` and resolves to a no-op in Tauri builds. Still guard it with `isTauri()` at runtime as the plan says, because `tauri dev` uses `vite dev`, where the module is also the no-op variant. `registerType: 'prompt'` means `needRefresh` gets set and `updateServiceWorker(true)` reloads.
- The source icon is still the default Tauri placeholder logo. Replace `src-tauri/icons/icon.png` (and regenerate the Tauri icons) when a real logo exists, then run `npm run generate-pwa-assets`.

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - No blocking issues. I re-ran every verification command myself:
    - `npm run build` passed. `dist/` has `sw.js`, `workbox-2fbc6a65.js`, `manifest.webmanifest` and all icons. `dist/index.html` links `/manifest.webmanifest`.
    - The `sw.js` precache has 10 unique entries: `index.html`, `assets/index-*.js`, `assets/index-*.css`, the 6 icons and the manifest. `sw.js` has exactly one `registerRoute`, a `NavigationRoute` bound to `index.html`, and no runtime caching.
    - `TAURI_ENV_PLATFORM=macos npm run build` passed with no `sw.js`, no workbox file, no manifest and no manifest link. I then rebuilt without the variable, so `dist` is the web build again.
    - `npm run typecheck` passed. `npm test` exited 0 (no test files yet).
  - `vite.config.ts:24-41`: the manifest matches SPEC §2.1 (name "Riftbound Scorer", standalone, portrait, `#020618` theme and background, 192/512 plus maskable 512). `registerType: 'prompt'`, `injectRegister: false`, `devOptions.enabled: false` and `disable: isTauriBuild` are as briefed.
  - `node_modules/vite-plugin-pwa/package.json` peerDependencies include `vite ^8.0.0`, so the handoff is right that `--legacy-peer-deps` wasn't needed.
  - `public/`: `sips` confirms the icon sizes (64, 192, 512, maskable 512, apple 180; `favicon.ico` is 48×48). The maskable icon has the logo well inside the safe zone on `#020618`.
  - `package.json:13`: I ran `npm run generate-pwa-assets`. The output was byte-identical to the committed PNGs/ICO, and the temporary `public/pwa-source.png` was removed afterwards.
  - `index.html:7-13`: no external URLs, so no runtime network calls. The iOS/Android meta tags and the icon links are present.
  - Scope is as listed. The `tsconfig.node.json:11` include is a justified one-line extra. `src/main.ts` and `src/App.vue` are untouched.
  - Non-blocking: `npm ls` reports `tslib@2.9.1` and `@emnapi/runtime` as "extraneous". They are optional transitive deps of `sharp` (pulled in by the assets generator), and build, typecheck and tests are unaffected. I recorded this but no action is needed.
