// Client theming: a deployment's colour tokens arrive at boot through the app
// config (customization.theme) and are set in a `body` rule, so only that
// client's colours ever reach the browser. main.css re-declares every derived
// colour alias on body, so overrides set here flow through to them. A rule,
// not inline style: `html.dark body` outranks it, so dark mode wins over a
// client's light colours.
// See docs/design-system/foundations/theming.md.

export type ClientTheme = Record<string, string>;

const TOKEN_NAME = /^--color-[a-z0-9-]+$/;
const COLOUR_VALUE =
  /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla)\([0-9a-z.,%\s/]+\)|var\(--color-[a-z0-9-]+\)|transparent)$/i;

export const applyClientTheme = (theme: ClientTheme | undefined): void => {
  if (!theme) return;
  const declarations = Object.entries(theme).flatMap(([name, value]) => {
    const trimmed = String(value).trim();
    if (!TOKEN_NAME.test(name) || !COLOUR_VALUE.test(trimmed)) {
      console.warn(`Ignoring client theme entry ${name}: ${value}`);
      return [];
    }
    return [`${name}: ${trimmed};`];
  });
  if (!declarations.length) return;
  const style = document.createElement("style");
  style.dataset.clientTheme = "";
  style.textContent = `body { ${declarations.join(" ")} }`;
  document.head.append(style);
};
