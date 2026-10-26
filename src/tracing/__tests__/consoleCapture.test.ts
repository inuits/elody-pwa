import { afterEach, describe, expect, it, vi } from "vitest";
import { reactive } from "vue";
import {
  captureConsole,
  consoleMessage,
  MESSAGE_LIMIT,
} from "@/tracing/consoleCapture";

afterEach(() => vi.restoreAllMocks());

describe("consoleMessage", () => {
  it("joins strings and other primitives with a space", () => {
    expect(
      consoleMessage(["[Vue warn]:", "count", 3, true, null, undefined]),
    ).toBe("[Vue warn]: count 3 true null undefined");
  });

  it("names an error by its type and message", () => {
    expect(consoleMessage(["failed:", new TypeError("boom")])).toBe(
      "failed: TypeError: boom",
    );
  });

  it("names objects, arrays and elements by their kind, never by their contents", () => {
    const stringify = vi.spyOn(JSON, "stringify");
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(
      consoleMessage([
        circular,
        [1, 2, 3],
        document.createElement("div"),
        () => {},
      ]),
    ).toBe("[Object] [Array(3)] [HTMLDivElement] [Function]");
    expect(stringify).not.toHaveBeenCalled();
  });

  it("does not walk into a Vue component's reactive state", () => {
    const touched = vi.fn();
    const state = reactive({
      get deep() {
        touched();
        return { tabs: [] };
      },
    });
    expect(
      consoleMessage([
        '[Vue warn]: injection "TabsProvider" not found.',
        state,
      ]),
    ).toBe('[Vue warn]: injection "TabsProvider" not found. [Object]');
    expect(touched).not.toHaveBeenCalled();
  });

  it("survives an object whose kind cannot be read", () => {
    const hostile = new Proxy(
      {},
      {
        get: () => {
          throw new Error("no");
        },
        getPrototypeOf: () => {
          throw new Error("no");
        },
      },
    );
    expect(consoleMessage(["x", hostile])).toBe("x [Object]");
  });

  it("caps the message length", () => {
    const message = consoleMessage(["a".repeat(MESSAGE_LIMIT * 2)]);
    expect(message).toHaveLength(MESSAGE_LIMIT);
    expect(message.endsWith("…")).toBe(true);
  });
});

describe("captureConsole", () => {
  const fakeConsole = () => ({ warn: vi.fn(), error: vi.fn() });

  it("reports warnings and errors and still prints the original arguments", () => {
    const target = fakeConsole();
    const originals = { ...target };
    const report = vi.fn();
    captureConsole(target, originals, report);
    const props = { tab: "x" };
    target.warn("[Vue warn]: missing", props);
    expect(originals.warn).toHaveBeenCalledWith("[Vue warn]: missing", props);
    expect(report).toHaveBeenCalledWith(
      "warn",
      "[Vue warn]: missing [Object]",
      undefined,
    );
    const error = new Error("boom");
    target.error("save failed", error);
    expect(originals.error).toHaveBeenCalledWith("save failed", error);
    expect(report).toHaveBeenLastCalledWith(
      "error",
      "save failed Error: boom",
      error,
    );
  });

  it("keeps printing when reporting fails", () => {
    const target = fakeConsole();
    const originals = { ...target };
    captureConsole(target, originals, () => {
      throw new Error("exporter down");
    });
    expect(() => target.warn("still shown")).not.toThrow();
    expect(originals.warn).toHaveBeenCalledWith("still shown");
  });

  it("does not report what the reporter itself prints", () => {
    const target = fakeConsole();
    const report = vi.fn(() => target.warn("from the reporter"));
    captureConsole(target, { ...target }, report);
    target.warn("once");
    expect(report).toHaveBeenCalledTimes(1);
  });

  it("restores the console it patched", () => {
    const target = fakeConsole();
    const originals = { ...target };
    const restore = captureConsole(target, originals, vi.fn());
    restore();
    expect(target.warn).toBe(originals.warn);
    expect(target.error).toBe(originals.error);
  });
});
