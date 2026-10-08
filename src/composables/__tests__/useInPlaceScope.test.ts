import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));

import {
  canUpdateEntity,
  isInnerControlClick,
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

  it("opens the field's own edit scope", () => {
    const { open } = host("form:title");
    expect(open()).toBe(true);
    expect(useEditScope().isActive("form:title")).toBe(true);
  });

  it("releases its scope when the field goes away (refetch, paging), even when changed", () => {
    const { open, wrapper } = host("form:title", true);
    open();
    wrapper.unmount();
    expect(useEditScope().isActive("form:title")).toBe(false);
    expect(useEditScope().hasUnsavedChanges.value).toBe(false);
  });

  it("leaves another field's open scope alone when it goes away", () => {
    const first = host("form:title");
    const second = host("form:year");
    first.open();
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
