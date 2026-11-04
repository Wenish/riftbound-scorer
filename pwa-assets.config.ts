import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Generates the PWA icons in `public/` from the master app icon: `npm run generate-pwa-assets`.
// That script temporarily copies `src-tauri/app-icon.png` to `public/pwa-source.png` (the generator
// writes next to its source image) and removes it afterwards. The generated PNGs/ICO are committed;
// re-run the script after changing the app icon.
const background = '#020618'

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    // No padding: the master is full-bleed and opaque, and its ring + crystal already sit inside the
    // maskable safe zone (circle of radius 40 %), so padding would only add a flat border that shows as a
    // square seam against the master's gradient. iOS masks apple-touch icons itself, so the same applies.
    // `background` is just the canvas fill behind the image; it is never visible while the master is opaque.
    maskable: {
      ...minimal2023Preset.maskable,
      padding: 0,
      resizeOptions: { background },
    },
    apple: {
      ...minimal2023Preset.apple,
      padding: 0,
      resizeOptions: { background },
    },
  },
  images: ['public/pwa-source.png'],
})
