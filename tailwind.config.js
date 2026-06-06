/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#E8EDF5",
          100: "#C5D0E6",
          200: "#9EB0D4",
          300: "#7790C2",
          400: "#5B78B5",
          500: "#3F60A8",
          600: "#2A4E99",
          700: "#0F3460",
          800: "#0C2A4E",
          900: "#09203C",
        },
        accent: {
          50: "#FDECEE",
          100: "#F9C5CC",
          200: "#F59EAA",
          300: "#F17787",
          400: "#ED5A6E",
          500: "#E94560",
          600: "#D72A47",
          700: "#B7223B",
          800: "#961B30",
          900: "#751525",
        },
        success: "#27AE60",
        warning: "#F39C12",
        danger: "#E74C3C",
        info: "#3498DB",
      },
      fontFamily: {
        sans: ["Noto Sans SC", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
