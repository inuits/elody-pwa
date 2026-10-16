import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import PreviewToggle from "../PreviewToggle.vue";

vi.mock("@/types", () => ({ Unicons: { Eye: { name: "eye" } } }));

const getWrapper = (active = false) =>
  mount(PreviewToggle, {
    props: { active },
    global: {
      stubs: {
        unicon: true,
        BaseTooltip: {
          template: '<div><slot name="activator" :on="{}" /><slot /></div>',
        },
      },
    },
  });

describe("PreviewToggle", () => {
  it("is a button named after what it does", () => {
    const button = getWrapper().find("button");

    expect(button.attributes("type")).toBe("button");
    expect(button.attributes("aria-label")).toBe("preview-component.open");
    expect(button.attributes("aria-pressed")).toBe("false");
  });

  it("names and marks the open state", () => {
    const button = getWrapper(true).find("button");

    expect(button.attributes("aria-label")).toBe("preview-component.close");
    expect(button.attributes("aria-pressed")).toBe("true");
  });

  it("is the specimen's 22px eye with 1px side margins", () => {
    expect(getWrapper().find("button").classes()).toEqual(
      expect.arrayContaining(["size-5.5", "mx-px", "p-0"]),
    );
  });

  it("turns accent and filled while its preview is open", () => {
    expect(getWrapper(true).find("button").classes()).toEqual(
      expect.arrayContaining(["!text-accent-accent", "fill-current"]),
    );
  });

  it("toggles without triggering the row", async () => {
    const wrapper = getWrapper();
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const stop = vi.spyOn(event, "stopPropagation");

    wrapper.find("button").element.dispatchEvent(event);

    expect(wrapper.emitted("toggle")).toHaveLength(1);
    expect(stop).toHaveBeenCalled();
    // The row is a link: the eye must not follow it.
    expect(event.defaultPrevented).toBe(true);
  });

  it("puts its attributes on the button, so the preview can focus it again", () => {
    const wrapper = mount(PreviewToggle, {
      props: { active: false },
      attrs: { "data-preview-for": "row-1" },
      global: {
        stubs: {
          unicon: true,
          BaseTooltip: {
            template: '<div><slot name="activator" :on="{}" /><slot /></div>',
          },
        },
      },
    });

    expect(wrapper.find("button").attributes("data-preview-for")).toBe("row-1");
  });
});
