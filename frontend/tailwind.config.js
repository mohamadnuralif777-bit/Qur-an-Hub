/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F3830",
          50: "#e6f0ee",
          100: "#c0d9d5",
          200: "#96bfb9",
          300: "#6ba59d",
          400: "#4d9189",
          500: "#2e7d75",
          600: "#27706a",
          700: "#1e605c",
          800: "#15514e",
          900: "#0F3830",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E8C87A",
          dark: "#A07830",
        },
      },
      fontFamily: {
        ui: ['"Comic Neue"', "cursive"],
        arabic: ["Amiri", '"Scheherazade New"', "serif"],
      },
    },
  },
  plugins: [],
};
