/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Anton", "Impact", "system-ui", "sans-serif"],
      },
      colors: {
        /* ===== Legacy tokens, remapped onto the Volt palette =====
         * These names are still used by ~40 files outside the home page.
         * Rather than rewrite every className, the *values* are remapped so
         * the whole app inherits the dark theme. The ramps are inverted
         * where the original role was light-theme: low numbers stayed
         * backgrounds, high numbers stayed text, so the direction flips.
         * Reverting the app to the old look = restoring this block. */
        brand: {
          50: "#131a05",
          100: "#1b2608",
          200: "#24310c",
          300: "#3a5010",
          400: "#8fd900",
          500: "#a3e600",
          600: "#b6ff00",
          700: "#c4ff47",
          800: "#d4ff7a",
          900: "#e6ffad",
          950: "#f3ffd6",
        },
        ink: {
          50: "#080a09",
          100: "#111412",
          200: "#151816",
          300: "#1c1f1c",
          400: "#5c5f5d",
          500: "#9a9d9b",
          700: "#c9cbc7",
          800: "#e4e5e3",
          900: "#f5f5f5",
          950: "#ffffff",
        },
        accent: {
          50: "#06251a",
          100: "#08301f",
          200: "#0b4630",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#34d399",
          700: "#6ee7b7",
          800: "#a7f3d0",
          900: "#d1fae5",
        },
        surface: {
          DEFAULT: "#151816",
          hover: "#1c1f1c",
        },
        /* Raw Tailwind ramps used directly across the app (459 slate classes
         * alone). Inverted so headings/body text read light and the low
         * numbers become dark surfaces and borders. */
        slate: {
          50: "#111412",
          100: "#151816",
          200: "#1c1f1c",
          300: "#2a2d2a",
          400: "#7a7d7b",
          500: "#9a9d9b",
          600: "#b4b7b5",
          700: "#c9cbc7",
          800: "#e4e5e3",
          900: "#f5f5f5",
          950: "#ffffff",
        },
        /* Status colours: dark tinted backgrounds, light readable text.
         * red-600 keeps a true mid-red — it is also a solid button fill
         * (logout) that has to stay legible under white text. */
        red: {
          50: "#2a0e0e",
          100: "#3d1414",
          200: "#5a1c1c",
          300: "#7a2626",
          400: "#ef4444",
          500: "#dc2626",
          600: "#dc2626",
          700: "#f87171",
          800: "#fca5a5",
          900: "#fecaca",
        },
        green: {
          50: "#0c2318",
          100: "#10301f",
          200: "#16452c",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#4ade80",
          700: "#86efac",
          800: "#bbf7d0",
          900: "#dcfce7",
        },
        /* amber-400/500 are left untouched: the home page star ratings use
         * them and that page is signed off. */
        amber: {
          50: "#2b1d05",
          100: "#3a2708",
          200: "#533708",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#fbbf24",
          700: "#fcd34d",
          800: "#fde68a",
          900: "#fef3c7",
        },
        /* ===== "Volt" redesign palette — additive, used by Header/Footer/Home ===== */
        volt: {
          50: "#f3ffd6",
          100: "#e6ffad",
          200: "#d4ff7a",
          300: "#c4ff47",
          400: "#b6ff00",
          500: "#a3e600",
          600: "#8fd900",
          700: "#6fa800",
          800: "#517d00",
          900: "#3a5900",
        },
        ember: {
          50: "#fff2e6",
          100: "#ffdcb8",
          200: "#ffbd7a",
          300: "#ff9d47",
          400: "#ff8a3d",
          500: "#ff6a00",
          600: "#e85d00",
          700: "#c24c00",
          800: "#973c00",
          900: "#6b2a00",
        },
        char: {
          50: "#f5f5f5",
          100: "#e4e5e3",
          200: "#c9cbc7",
          300: "#9a9d9b",
          400: "#7a7d7b",
          500: "#5c5f5d",
          600: "#3f423f",
          700: "#2a2d2a",
          800: "#1c1f1c",
          850: "#151816",
          900: "#111412",
          950: "#080a09",
        },
      },
      backgroundImage: {
        "volt-ember": "linear-gradient(90deg, #B6FF00 0%, #B6FF00 45%, #FF6A00 100%)",
      },
      boxShadow: {
        "volt-glow": "0 10px 40px -10px rgba(182, 255, 0, 0.45)",
        "ember-glow": "0 10px 40px -10px rgba(255, 106, 0, 0.4)",
      },
    },
  },
  plugins: [],
};
