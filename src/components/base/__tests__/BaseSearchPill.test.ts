import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseSearchPill from "@/components/base/BaseSearchPill.vue";

const getWrapper = (props = {}) =>
  mount(BaseSearchPill, {
    props: { label: "Zoek in resultaten", placeholder: "Zoek…", ...props },
    global: { stubs: { unicon: true } },
  });

describe("BaseSearchPill", () => {
  // entity-picker.md: focus lands in the search pill when the picker opens;
  // the pill renders after the dialog opened, so `autofocus` alone misses
  it("takes focus when it mounts with autofocus", () => {
    const wrapper = mount(BaseSearchPill, {
      props: { label: "Zoek", autofocus: true },
      attachTo: document.body,
      global: { stubs: { unicon: true } },
    });
    expect(document.activeElement).toBe(wrapper.find("input").element);
    wrapper.unmount();
  });

  it("is a pill with a search icon", () => {
    const wrapper = getWrapper();
    expect(wrapper.classes()).toContain("rounded-pill");
    expect(wrapper.find("unicon-stub").attributes("aria-hidden")).toBe("true");
  });

  it("names its input and shows the placeholder", () => {
    const input = getWrapper().find("input");
    expect(input.attributes("aria-label")).toBe("Zoek in resultaten");
    expect(input.attributes("placeholder")).toBe("Zoek…");
  });

  it("carries the focus ring on the pill, not on the bare input", () => {
    const wrapper = getWrapper();
    expect(wrapper.classes()).toContain("has-[input:focus-visible]:outline-solid");
    expect(wrapper.find("input").classes()).toContain("focus-visible:!outline-none");
  });

  it("two-way binds the typed value", async () => {
    const wrapper = getWrapper({ modelValue: "jo" });
    const input = wrapper.find("input");
    expect((input.element as HTMLInputElement).value).toBe("jo");
    await input.setValue("john");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["john"]);
  });
});
