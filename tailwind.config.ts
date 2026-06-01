// tailwind.config.ts
// ─────────────────────────────────────────────────────────────────────────────
// MERGE these additions into your existing tailwind.config.ts.
// Do NOT replace the whole file — just patch the relevant sections.
// ─────────────────────────────────────────────────────────────────────────────

import type { Config } from "tailwindcss";

const config: Config = {
  // ── Keep your existing content array ──────────────────────────────────────
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // ── New keyframes ──────────────────────────────────────────────────────
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      // ── New animation utilities ────────────────────────────────────────────
      animation: {
        "fade-in-up": "fade-in-up 0.35s ease-out",
        "fade-in":    "fade-in 0.25s ease-out",
        "scale-in":   "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
