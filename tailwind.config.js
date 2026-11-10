/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07111f",
          900: "#0b1728",
          800: "#13233a",
          700: "#1e3551",
        },
        mint: {
          50: "#effcf9",
          100: "#d7f8f1",
          200: "#aff0e3",
          300: "#78e3d0",
          400: "#3ccdb8",
          500: "#1fb39f",
          600: "#128f81",
          700: "#127268",
          800: "#135b55",
          900: "#144b47",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -18px rgba(15, 23, 42, 0.22)",
        lift: "0 20px 45px -25px rgba(15, 23, 42, 0.35)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      keyframes: {
        "soft-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "soft-in": "soft-in 260ms ease-out both",
        "pulse-ring": "pulse-ring 1.7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
