import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import BaseInputColor from "../BaseInputColor.vue";

vi.mock("@/components/base/BaseDatePicker.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("@/components/base/BaseResizableTextarea.vue", () => ({
  default: { template: "<div />" },
}));

describe("BaseInputColor", () => {
  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(BaseInputColor, {
      props: { modelValue: "#ff0000", ...props },
    });
  const picker = (wrapper: ReturnType<typeof mountComponent>) =>
    wrapper.find('[data-cy="base-input-color"]');
  const hex = (wrapper: ReturnType<typeof mountComponent>) =>
    wrapper.find('[data-cy="base-input-text"]');

  it("renders a color picker and a hex text input with the same value", () => {
    const wrapper = mountComponent();

    expect(picker(wrapper).attributes("type")).toBe("color");
    expect(hex(wrapper).attributes("type")).toBe("text");
    expect((picker(wrapper).element as HTMLInputElement).value).toBe("#ff0000");
    expect((hex(wrapper).element as HTMLInputElement).value).toBe("#ff0000");
  });

  it("emits the picked color", async () => {
    const wrapper = mountComponent();
    await picker(wrapper).setValue("#00ff00");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["#00ff00"]);
  });

  it("emits a hex value typed by hand", async () => {
    const wrapper = mountComponent();
    await hex(wrapper).setValue(" #123abc ");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["#123abc"]);
  });

  it("stops the picker click from reaching parents that prevent default", async () => {
    const parentClick = vi.fn();
    const wrapper = mount({
      components: { BaseInputColor },
      template: `<div @click="parentClick"><BaseInputColor model-value="#ff0000" /></div>`,
      setup: () => ({ parentClick }),
    });
    await wrapper.find('[data-cy="base-input-color"]').trigger("click");

    expect(parentClick).not.toHaveBeenCalled();
  });

  it("disables both inputs when disabled", () => {
    const wrapper = mountComponent({ disabled: true });

    expect(picker(wrapper).attributes("disabled")).toBeDefined();
    expect(hex(wrapper).attributes("disabled")).toBeDefined();
  });
});
