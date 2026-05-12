import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#B3FFC1",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#3BAEA4",
          600: "#2F8F87",
          700: "#1F6B65",
          800: "#134A45",
          900: "#0B2F2C",
        },
        ink: {
          DEFAULT: "#0B2F2C",
          soft: "#1F2937",
          muted: "#6B7280",
        },
        canvas: {
          DEFAULT: "#FBFDFB",
          raised: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-calibre)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11, 47, 44, 0.04), 0 8px 24px rgba(11, 47, 44, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
