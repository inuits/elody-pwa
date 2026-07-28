import { isProxy, toRaw } from "vue";

// Built-ins that structuredClone supports natively and that we must therefore
// leave intact instead of recursing into (recursing would flatten a Date to {}).
const isStructuredCloneableBuiltin = (value: object): boolean =>
  value instanceof Date ||
  value instanceof RegExp ||
  value instanceof Map ||
  value instanceof Set ||
  value instanceof ArrayBuffer ||
  ArrayBuffer.isView(value) ||
  (typeof Blob !== "undefined" && value instanceof Blob) ||
  (typeof File !== "undefined" && value instanceof File);

// Produces a raw, structuredClone-able copy of a (possibly reactive) value.
// Every call site wraps this in structuredClone(), so it must never yield a
// value that structuredClone rejects: reactive proxies are unwrapped, and
// functions and host objects such as DOM nodes or the Window are dropped
// (returned as undefined) rather than kept -- keeping any of these made
// structuredClone throw a DataCloneError.
export const deepToRaw = <T>(obj: T): T => {
  if (isProxy(obj)) {
    obj = toRaw(obj);
  }

  if (typeof obj === "function") {
    return undefined as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepToRaw) as T;
  } else if (obj !== null && typeof obj === "object") {
    if (isStructuredCloneableBuiltin(obj as object)) {
      return obj;
    }

    // Only plain objects can be safely deep-cloned. Drop host/class objects
    // (DOM nodes, Window, component instances, …) that structuredClone can't
    // handle instead of recursing into them.
    const prototype = Object.getPrototypeOf(obj);
    if (prototype !== Object.prototype && prototype !== null) {
      return undefined as T;
    }

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deepToRaw(value)]),
    ) as T;
  }

  return obj;
};
