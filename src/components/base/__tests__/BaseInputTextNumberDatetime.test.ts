import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import BaseInputTextNumberDatetime from "../BaseInputTextNumberDatetime.vue";

vi.mock("@/components/base/BaseDatePicker.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("@/components/base/BaseResizableTextarea.vue", () => ({
  default: { template: "<div />" },
}));

describe("BaseInputTextNumberDatetime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(BaseInputTextNumberDatetime, {
      props: {
        modelValue: undefined,
        inputStyle: "defaultWithBorder",
        type: "number",
        ...props,
      },
    });

  describe("number input - bad input handling", () => {
    it("emits NaN when validity.badInput is true (non-numeric text entered)", async () => {
      const wrapper = mountComponent({ type: "number" });
      const input = wrapper.find('[data-cy="base-input-text"]');

      Object.defineProperty(input.element, "validity", {
        get: () => ({ badInput: true }),
        configurable: true,
      });

      await input.trigger("input");

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(Number.isNaN(emitted![emitted!.length - 1][0])).toBe(true);
    });

    it("does not emit NaN when validity.badInput is false (valid number entered)", async () => {
      const wrapper = mountComponent({ type: "number", modelValue: 42 });
      const input = wrapper.find('[data-cy="base-input-text"]');

      Object.defineProperty(input.element, "validity", {
        get: () => ({ badInput: false }),
        configurable: true,
      });

      await input.trigger("input");

      const emitted = wrapper.emitted("update:modelValue");
      const lastEmit = emitted?.[emitted.length - 1]?.[0];
      expect(Number.isNaN(lastEmit)).toBe(false);
    });

    it("does not emit NaN for non-number input types even with badInput", async () => {
      const wrapper = mountComponent({ type: "text", modelValue: "abc" });
      const input = wrapper.find('[data-cy="base-input-text"]');

      Object.defineProperty(input.element, "validity", {
        get: () => ({ badInput: true }),
        configurable: true,
      });

      await input.trigger("input");

      const emitted = wrapper.emitted("update:modelValue");
      const lastEmit = emitted?.[emitted.length - 1]?.[0];
      expect(Number.isNaN(lastEmit)).toBe(false);
    });
  });
});
