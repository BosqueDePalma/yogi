import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// The SVG already fills its square with Glow's page colour and keeps the lotus
// inside the maskable safe zone, so no extra padding is added.
const background = "#f4f7fe";

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background } },
  },
  images: ["public/icon.svg"],
});
