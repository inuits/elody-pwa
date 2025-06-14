import svgToDataUri from "mini-svg-data-uri";

function tailwindSvgPlugin() {
  return {
    name: "tailwind-svg-injector",
    // 'transform' hook runs on individual modules.
    // We want to target our main CSS file to inject variables.
    transform(code, id) {
      // Only target your main CSS file where @theme is defined
      // Adjust the path to match your actual main CSS file
      if (id.includes("src/main.css") || id.includes("src/index.css")) {
        // Define your raw SVG strings here, including the dynamic color variable
        const green500Var = "var(--color-green-500)";

        const svgCaret = svgToDataUri(
          `<svg viewBox="0 0 320 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"></path></svg>`,
        );

        const svgRemove = svgToDataUri(
          `<svg viewBox="0 0 320 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z"></path></svg>`,
        );

        const svgSpinner = svgToDataUri(
          `<svg viewBox="0 0 512 512" fill="${green500Var}" xmlns="http://www.w3.org/2000/svg"><path d="M456.433 371.72l-27.79-16.045c-7.192-4.152-10.052-13.136-6.487-20.636 25.82-54.328 23.566-118.602-6.768-171.03-30.265-52.529-84.802-86.621-144.76-91.424C262.35 71.922 256 64.953 256 56.649V24.56c0-9.31 7.916-16.609 17.204-15.96 81.795 5.717 156.412 51.902 197.611 123.408 41.301 71.385 43.99 159.096 8.042 232.792-4.082 8.369-14.361 11.575-22.424 6.92z"></path></svg>`,
        );

        // Prepend (or inject) these variables into your CSS code
        // We'll put them inside the @theme block for consistency,
        // or just at the top of the file before @theme if that's easier.
        const injectedVariables = `
          @theme {
            --bg-multiselect-caret: url("${svgCaret}");
            --bg-multiselect-remove: url("${svgRemove}");
            --bg-multiselect-spinner: url("${svgSpinner}");
          }
        `;
        // Injecting at the beginning of the file is simplest
        return injectedVariables + code;
      }
      return code;
    },
  };
}

module.exports = tailwindSvgPlugin;
