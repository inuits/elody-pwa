import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));

import {
  canUpdateEntity,
  focusUnlessMoved,
  isInnerControlClick,
  singleFlight,
  useInPlaceScope,
} from "@/composables/useInPlaceScope";
import { useEditScope } from "@/composables/useEditScope";

const host = (scopeId: string, dirty = false) => {
  let api: ReturnType<typeof useInPlaceScope> | undefined;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useInPlaceScope(() => scopeId);
        return () => h("div");
      },
    }),
  );
  const open = () =>
    api!.open({ isDirty: () => dirty, close: () => api!.release() });
  return { wrapper, api: api!, open };
};

describe("useInPlaceScope", () => {
  beforeEach(() => {
    const scope = useEditScope();
    if (scope.activeScope.value) scope.release(scope.activeScope.value.id);
  });

  it("opens the field's own edit scope", async () => {
    const { open } = host("form:title");
    expect(await open()).toBe(true);
    expect(useEditScope().isActive("form:title")).toBe(true);
  });

  it("releases its scope when the field goes away (refetch, paging), even when changed", async () => {
    const { open, wrapper } = host("form:title", true);
    await open();
    wrapper.unmount();
    expect(useEditScope().isActive("form:title")).toBe(false);
    expect(useEditScope().hasUnsavedChanges.value).toBe(false);
  });

  it("leaves another field's open scope alone when it goes away", async () => {
    const first = host("form:title");
    const second = host("form:year");
    await first.open();
    second.wrapper.unmount();
    expect(useEditScope().isActive("form:title")).toBe(true);
  });

  it("names the save messages, with English fallbacks", () => {
    const { api } = host("form:title");
    expect(api.messages.saved()).toBe("Saved");
    expect(api.messages.saveFailed()).toBe("Saving failed, try again");
    expect(api.messages.editField()).toBe("edit");
  });
});

// Leaving an editor and opening the next one both save it; that must be one
// request, not two.
describe("singleFlight", () => {
  it("shares a save that is still running", async () => {
    let finish!: () => void;
    const run = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const save = singleFlight(run);
    const first = save("a");
    const second = save("b");
    finish();
    await Promise.all([first, second]);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith("a");
  });

  it("runs again once the previous save is done, even after a failure", async () => {
    const run = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValue(undefined);
    const save = singleFlight(run);
    await expect(save()).rejects.toThrow("x");
    await save();
    expect(run).toHaveBeenCalledTimes(2);
  });
});

describe("focusUnlessMoved", () => {
  const button = () => {
    const element = document.createElement("button");
    document.body.appendChild(element);
    return element;
  };

  it("focuses the value when focus is nowhere (the editor went away)", async () => {
    const value = button();
    (document.activeElement as HTMLElement | null)?.blur();
    await focusUnlessMoved(() => value);
    expect(document.activeElement).toBe(value);
  });

  it("leaves focus where the user moved it (Tab, another field)", async () => {
    const value = button();
    const next = button();
    next.focus();
    await focusUnlessMoved(() => value);
    expect(document.activeElement).toBe(next);
  });
});

describe("canUpdateEntity", () => {
  it.each([
    ["edit", true],
    ["edit-delete", true],
    ["view", false],
    [undefined, false],
  ])("reads permitted edit mode %s as %s", (mode, expected) => {
    expect(canUpdateEntity({ permittedEditMode: mode })).toBe(expected);
  });

  it("reads a permitted edit mode held in a ref", () => {
    expect(canUpdateEntity({ permittedEditMode: ref("edit") })).toBe(true);
  });
});

describe("isInnerControlClick", () => {
  const setup = (inner: string) => {
    const container = document.createElement("div");
    container.setAttribute("role", "button");
    container.innerHTML = inner;
    document.body.appendChild(container);
    return container;
  };

  it.each([
    ["a link", "<a href='/x'><span id='t'>x</span></a>"],
    ["a button", "<button><span id='t'>x</span></button>"],
    ["a marked control (copy)", "<div data-inline-edit-ignore><i id='t'></i></div>"],
  ])("is true for a click on %s inside the value", (_name, inner) => {
    const container = setup(inner);
    const target = container.querySelector("#t")!;
    expect(isInnerControlClick({ target } as unknown as Event, container)).toBe(true);
  });

  it("is false for a click on plain value text", () => {
    const container = setup("<span id='t'>x</span>");
    const target = container.querySelector("#t")!;
    expect(isInnerControlClick({ target } as unknown as Event, container)).toBe(false);
  });

  it("is false for a click on the value itself, even though it is a button", () => {
    const container = setup("");
    expect(isInnerControlClick({ target: container } as unknown as Event, container)).toBe(false);
  });
});
