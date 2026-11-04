import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Set by `tauri android dev` / `tauri ios dev` so the device can reach the dev server.
const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [vue(), tailwindcss()],
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
