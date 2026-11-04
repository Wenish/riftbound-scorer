# Riftbound Scorer

Offline 1v1 score and match-timer app for Riftbound. Tauri 2 (iOS/Android) + PWA, built with Vue 3, TypeScript and Tailwind CSS.
See [docs/SPEC.md](docs/SPEC.md) for the product spec.

## Prerequisites

- Node.js + npm
- Rust toolchain ([rustup](https://rustup.rs))
- Tauri 2 platform prerequisites: https://v2.tauri.app/start/prerequisites/
- Mobile only: Xcode (iOS, macOS) / Android Studio + SDK/NDK (Android)

## Install

```sh
npm install
```

## Run in dev mode

Tauri desktop app (starts the Vite dev server automatically):

```sh
npm run tauri dev
```

Browser (web build of the app, http://localhost:1420):

```sh
npm run dev
```

Production build served locally (http://localhost:4173):

```sh
npm run build && npm run preview
```

> PWA features (manifest, service worker / offline install) are not set up yet; the browser commands currently serve the plain web build.

Mobile (first time only, generate the native projects: `npx tauri ios init` / `npx tauri android init`):

```sh
npm run tauri ios dev
```

```sh
npm run tauri android dev
```

## Other scripts

```sh
npm test            # Vitest
npm run typecheck   # vue-tsc
```
