/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Lato", ...defaultTheme.fontFamily.sans],
    },
    colors: {
      transparent: "transparent",
      tag: {
        neutral: "#e0dfdf",
        selected: "#2d242a",
      },
      accent: {
        light: "#DCF4F9",
        normal: "#02C6F2",
      },
      neutral: {
        0: "#FFFFFF",
        10: "#FAFBFC",
        20: "#F4F5F7",
        30: "#EBECF0",
        40: "#DFE1E6",
        50: "#C1C7D0",
        60: "#B3BAC5",
        70: "#A5ADBA",
        80: "#97A0AF",
        90: "#8993A4",
        100: "#7A869A",
        200: "#6B778C",
        300: "#5E6C84",
        400: "#505F79",
        500: "#42526E",
        600: "#344563",
        700: "#253858",
        800: "#172B4D",
        900: "#091E42",
        white: "#FFFFFF",
        lightest: "#F2F7F8",
        light: "#E8EEF0",
      },
      text: {
        light: "#6795A2",
        body: "#052737",
      },
      background: {
        frosted: "rgba(220, 244, 249, 0.25)",
      },
      blue: {
        50: "#DEEBFF",
        75: "#B3D4FF",
        100: "#4C9AFF",
        200: "#2684FF",
        300: "#0065FF",
        400: "#0052CC",
        500: "#0747A6",
      },
      red: {
        default: "#e50000",
        dark: "#9b0000",
      },
      green: {
        default: "#00b200",
      },
      main: {
        light: "#DEEBFF",
        dark: "#0052CC",
      },
    },
    extend: {
      spacing: {
        '76': '305px',
      }
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
      display: ["group-hover"],
    },
  },
  plugins: [require("@tailwindcss/forms")({ useFormClasses: true })],
};
