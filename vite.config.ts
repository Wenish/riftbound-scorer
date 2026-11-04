import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Set by `tauri android dev` / `tauri ios dev` so the device can reach the dev server.
const host = process.env.TAURI_DEV_HOST
// Set by the Tauri CLI for `tauri dev` / `tauri build`: the native app ships no service worker or manifest.
const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM

const background = '#020618'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      disable: isTauriBuild,
      // Updates are applied only when the user confirms; registration happens in app code.
      registerType: 'prompt',
      injectRegister: false,
      // No service worker in `vite dev`; test PWA behaviour with `npm run build && npm run preview`.
      devOptions: { enabled: false },
      manifest: {
        name: 'Riftbound Scorer',
        short_name: 'Riftbound',
        description: 'Offline 1v1 score and match timer for Riftbound.',
        lang: 'en',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: background,
        background_color: background,
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // The icons are already matched by `workbox.globPatterns`; don't add them to the precache twice.
      includeManifestIcons: false,
      workbox: {
        // Precache every built asset so the app works fully offline after the first load.
        // `manifest.webmanifest` is always added to the precache by the plugin itself.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        navigateFallback: 'index.html',
        // The app makes no network requests, so nothing is cached at runtime.
        runtimeCaching: [],
      },
    }),
  ],
  // Tauri expects a fixed port and its own log output to stay visible.
  clearScreen: false,
  // Expose Tauri's build-time env vars (platform, debug, ...) to the frontend.
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // The Rust side is rebuilt by the Tauri CLI, not Vite.
      ignored: ['**/src-tauri/**'],
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
