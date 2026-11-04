import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Generates the PWA icons in `public/` from the app icon: `npm run generate-pwa-assets`.
// That script temporarily copies `src-tauri/icons/icon.png` to `public/pwa-source.png` (the generator
// writes next to its source image) and removes it afterwards. The generated PNGs/ICO are committed;
// re-run the script after changing the app icon.
const background = '#020618'

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    // Padded onto the dark UI colour so the logo stays inside the maskable safe zone.
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { background },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { background },
    },
  },
  images: ['public/pwa-source.png'],
})
