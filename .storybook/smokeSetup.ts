/* eslint-disable @typescript-eslint/no-explicit-any -- test/storybook harness: jsdom polyfills and untyped third-party surfaces */
// jsdom lacks several browser APIs that components rely on incidentally;
// stub the common ones so the smoke test measures component errors, not
// environment gaps.
import { vi } from "vitest";

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as any;
}

const makeStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
};
if (typeof window.localStorage?.setItem !== "function") {
  Object.defineProperty(window, "localStorage", { value: makeStorage() });
}
if (typeof window.sessionStorage?.setItem !== "function") {
  Object.defineProperty(window, "sessionStorage", { value: makeStorage() });
}

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
(window as any).ResizeObserver ??= NoopObserver;
(window as any).IntersectionObserver ??= NoopObserver;
(window as any).MutationObserver ??= MutationObserver;

window.HTMLElement.prototype.scrollIntoView ??= () => {};
(window as any).HTMLDialogElement.prototype.showModal ??= function (
  this: any,
) {
  this.open = true;
};
(window as any).HTMLDialogElement.prototype.close ??= function (this: any) {
  this.open = false;
};
window.HTMLElement.prototype.scrollTo ??= (() => {}) as any;
(window as any).scrollTo ??= () => {};
URL.createObjectURL ??= (() => "blob:mock") as any;
URL.revokeObjectURL ??= (() => {}) as any;

// chart.js and map libs (ol/Heatmap) draw on canvas; jsdom's getContext
// throws "Not implemented" without the canvas npm package. Hand out a fake
// 2d context: known return-value methods get shaped results, everything
// else resolves to a shared no-op function, and property writes
// (fillStyle, globalAlpha, …) are accepted.
const makeFake2dContext = (canvas: HTMLCanvasElement) => {
  const gradient = { addColorStop: () => {} };
  const imageData = (w: number, h: number) => ({
    data: new Uint8ClampedArray(Math.max(1, w * h * 4)),
    width: w,
    height: h,
  });
  const shaped: Record<string, any> = {
    canvas,
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createConicGradient: () => gradient,
    createPattern: () => null,
    getImageData: (_x: number, _y: number, w: number, h: number) =>
      imageData(w || 1, h || 1),
    createImageData: (w: number, h: number) => imageData(w || 1, h || 1),
    measureText: () => ({
      width: 0,
      actualBoundingBoxAscent: 0,
      actualBoundingBoxDescent: 0,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: 0,
      fontBoundingBoxAscent: 0,
      fontBoundingBoxDescent: 0,
    }),
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    isPointInPath: () => false,
    isPointInStroke: () => false,
    getLineDash: () => [],
    getContextAttributes: () => ({ alpha: true }),
  };
  const noop = () => {};
  const store: Record<PropertyKey, any> = {};
  return new Proxy(shaped, {
    get(target, prop) {
      if (prop in target) return target[prop as string];
      if (prop in store) return store[prop];
      if (typeof prop === "string" && /^[a-z]/.test(prop)) return noop;
      return undefined;
    },
    set(_target, prop, value) {
      store[prop] = value;
      return true;
    },
  });
};
const fakeContexts = new WeakMap<HTMLCanvasElement, any>();
const origGetContext = HTMLCanvasElement.prototype.getContext as
  | ((...args: any[]) => any)
  | undefined;
HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  ...args: any[]
) {
  try {
    const real = origGetContext?.apply(this, args as any);
    if (real) return real;
  } catch {
    // fall through to the fake context
  }
  if (args[0] !== "2d") return null; // webgl etc.: report unsupported
  if (!fakeContexts.has(this)) fakeContexts.set(this, makeFake2dContext(this));
  return fakeContexts.get(this);
} as any;
HTMLCanvasElement.prototype.toDataURL ??= (() =>
  "data:image/png;base64,") as any;

vi.stubGlobal(
  "fetch",
  vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => "",
    blob: async () => new Blob(),
  })),
);

// Register the Storybook project annotations (decorators, parameters, and the
// vue3 renderer setup() calls from preview.ts registering app plugins).
import { setProjectAnnotations } from "@storybook/vue3-vite";
import * as preview from "./preview";
import { beforeAll } from "vitest";

const annotations = setProjectAnnotations([preview]);
beforeAll(annotations.beforeAll);