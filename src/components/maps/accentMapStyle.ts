import { Fill, Stroke, Style } from "ol/style";

/**
 * OpenLayers styles are plain JS, so they cannot resolve var() themselves;
 * the tenant accent is read from the themed <body> once per style instead
 * (map-viewer.md: stroke = client accent, fill at ~25% alpha).
 */
const readToken = (token: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  return (
    getComputedStyle(document.body).getPropertyValue(token).trim() || fallback
  );
};

/** Canvas colours cannot use color-mix, so hex values get real rgba. */
export const withAlpha = (color: string, alpha: number): string => {
  const trimmed = color.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimmed)?.[1];
  if (!hex) {
    return `color-mix(in srgb, ${trimmed} ${alpha * 100}%, transparent)`;
  }
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getAccentColor = (): string => readToken("--color-accent", "#3BA6CB");

export const getAccentFeatureStyle = (): Style => {
  const accent = getAccentColor();
  return new Style({
    stroke: new Stroke({ color: accent, width: 2 }),
    fill: new Fill({ color: withAlpha(accent, 0.25) }),
  });
};

/** The overlay geometry stays distinct from the accent: the warning chip. */
export const getOverlayFeatureStyle = (): Style => {
  const warning = readToken("--color-warning-chip", "#F2994A");
  return new Style({
    stroke: new Stroke({ color: warning, width: 2 }),
    fill: new Fill({ color: withAlpha(warning, 0.25) }),
  });
};
