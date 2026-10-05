// For third-party renderers (OpenLayers canvas, Mirador's MUI theme) that need
// a resolved colour string instead of a CSS class. Reads from <body> so the
// client theme set at boot (src/utils/clientTheme.ts) applies.
export const readCssToken = (
  name: string,
  fallback: string,
  element: Element = document.body,
): string => {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  return value || fallback;
};

export const withAlpha = (color: string, alpha: number): string => {
  const match = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return color;
  const hex =
    match[1].length === 3
      ? [...match[1]].map((digit) => digit + digit).join("")
      : match[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
