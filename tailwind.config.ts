import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF6F0",
        foreground: "#292524",
        surface: {
          50: "#FFFFFF",
          100: "#FDFBF7",
          200: "#F5EBE0",
          300: "#EFE6DD",
          400: "#E8D8C8",
        },
        rust: {
          400: "#D97706",
          500: "#B85D19",
          600: "#9C4A1A",
          700: "#7C3512",
          800: "#5C260B",
        },
        cream: {
          50: "#FFFFFF",
          100: "#FDFBF7",
          200: "#FAF6F0",
          300: "#F5EBE0",
          400: "#EFE6DD",
          500: "#E8D8C8",
          600: "#D4C5B9",
        },
        brand: {
          rust: "#9C4A1A",
          darkRust: "#7C3512",
          lightRust: "#B85D19",
          terracotta: "#C25E1A",
          cream: "#FAF6F0",
          silk: "#FDFBF7",
        },
        muted: {
          foreground: "#786A5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-serif-display)", "Playfair Display", "Georgia", "serif"],
        display: ["var(--font-serif-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
