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
        background: "#0a0a0a",
        surface: {
          50: "#171717",
          100: "#1a1a1a",
          200: "#222222",
          300: "#2a2a2a",
        },
        brand: {
          orange: "#f97316",
          amber: "#ff6b1a",
          glow: "rgba(249, 115, 22, 0.2)",
          darkGlow: "rgba(249, 115, 22, 0.08)",
        },
        muted: {
          foreground: "#9ca3af",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ambient-glow': 'glow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.3', transform: 'scale(0.98)' },
          '100%': { opacity: '0.7', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
