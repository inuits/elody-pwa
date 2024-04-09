/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const svgToDataUri = require("mini-svg-data-uri");

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Lato", ...defaultTheme.fontFamily.sans],
    },
    colors: {
      white: "#FFFFFF",
      black: "#000000",
      transparent: "transparent",
      tag: {
        neutral: "#e0dfdf",
        selected: "#2d242a",
      },
      accent: {
        light: "#DCF4F9",
        normal: "#6BC6B3",
        accent: "#0CB2BC",
      },
      text: {
        disabled: "#6795A2",
        light: "#355BA9",
        body: "#003A52",
        subtitle: "#FFFFFF",
        placeholder: "#9CA3AF",
      },
      background: {
        frosted: "rgba(220, 244, 249, 0.25)",
      },
      status: {
        new: "#6BC6B3",
        deleted: "#9b0000",
      },
      gray: {
        50: "#fafafa",
        100: "#f4f4f5",
        200: "#e4e4e7",
        300: "#d4d4d8",
        400: "#a1a1aa",
        500: "#71717a",
        600: "#52525b",
        700: "#3f3f46",
        800: "#27272a",
        900: "#18181b",
      },
      green: {
        50: "#f0fdf4",
        100: "#dcfce7",
        200: "#bbf7d0",
        300: "#86efac",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d",
        light: "#DAF1DC",
        default: "#00b200",
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
        black: "#000",
        white: "#FFFFFF",
        lightest: "#F2F7F8",
        light: "#E8EEF0",
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
      cyan: {
        600: "#22D3EE",
      },
      red: {
        lightest: "#F8F2F2",
        light: "#F9DCDC",
        default: "#D11800",
        dark: "#9b0000",
      },
      main: {
        light: "#DEEBFF",
        dark: "#0052CC",
      },
    },
    extend: {
      spacing: {
        76: "305px",
      },
      backgroundImage: (theme) => ({
        "multiselect-caret": `url("${svgToDataUri(
          `<svg viewBox="0 0 320 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"></path></svg>`
        )}")`,
        "multiselect-spinner": `url("${svgToDataUri(
          `<svg viewBox="0 0 512 512" fill="${theme(
            "colors.green.500"
          )}" xmlns="http://www.w3.org/2000/svg"><path d="M456.433 371.72l-27.79-16.045c-7.192-4.152-10.052-13.136-6.487-20.636 25.82-54.328 23.566-118.602-6.768-171.03-30.265-52.529-84.802-86.621-144.76-91.424C262.35 71.922 256 64.953 256 56.649V24.56c0-9.31 7.916-16.609 17.204-15.96 81.795 5.717 156.412 51.902 197.611 123.408 41.301 71.385 43.99 159.096 8.042 232.792-4.082 8.369-14.361 11.575-22.424 6.92z"></path></svg>`
        )}")`,
        "multiselect-remove": `url("${svgToDataUri(
          `<svg viewBox="0 0 320 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z"></path></svg>`
        )}")`,
      }),
    },
  },
  safelist: ["bg-red-default", "border-gray-300"],
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
      display: ["group-hover"],
    },
  },
  plugins: [require("@tailwindcss/forms")({ useFormClasses: true })],
};
