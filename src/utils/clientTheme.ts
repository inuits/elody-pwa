// Client theming: a deployment's colour tokens arrive at boot through the app
// config (customization.theme) and are set on <body>, so only that client's
// colours ever reach the browser. main.css re-declares every derived colour
// alias on body, so overrides set here flow through to them.
// See docs/design-system/foundations/theming.md.

export type ClientTheme = Record<string, string>;

const TOKEN_NAME = /^--color-[a-z0-9-]+$/;
const COLOUR_VALUE =
  /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla)\([0-9a-z.,%\s/]+\)|var\(--color-[a-z0-9-]+\)|transparent)$/i;

export const applyClientTheme = (
  theme: ClientTheme | undefined,
  element: HTMLElement = document.body,
): void => {
  if (!theme) return;
  Object.entries(theme).forEach(([name, value]) => {
    const trimmed = String(value).trim();
    if (!TOKEN_NAME.test(name) || !COLOUR_VALUE.test(trimmed)) {
      console.warn(`Ignoring client theme entry ${name}: ${value}`);
      return;
    }
    element.style.setProperty(name, trimmed);
  });
};
