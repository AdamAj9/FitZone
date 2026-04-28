/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        ink: {
          50: "#b8bcc4",
          100: "#aeb3bc",
          200: "#9aa0aa",
          500: "#64748b",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        surface: {
          DEFAULT: "#d4d7dd",
          hover: "#cacdd4",
        },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at 20% 0%, rgba(168, 85, 247, 0.45), transparent 50%), radial-gradient(circle at 80% 100%, rgba(192, 132, 252, 0.3), transparent 55%), linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%)",
      },
      boxShadow: {
        "brand-glow": "0 10px 40px -10px rgba(168, 85, 247, 0.5)",
      },
    },
  },
  plugins: [],
};
