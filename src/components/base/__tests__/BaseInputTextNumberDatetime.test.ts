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

  describe("design-system states", () => {
    const textInput = (props: Record<string, unknown> = {}) =>
      mountComponent({ type: "text", ...props }).find(
        '[data-cy="base-input-text"]',
      );

    it("is at least the shared control height", () => {
      expect(textInput().classes()).toContain("min-h-(--control-height)");
    });

    it("uses the input radius token", () => {
      expect(textInput().classes()).toContain("rounded-input");
    });

    it("renders the value at the input text size", () => {
      expect(textInput().classes()).toContain("text-input");
    });

    it("pads with the input padding token", () => {
      expect(textInput().classes()).toContain("p-(--input-padding)");
    });

    it("draws the default border when bordered", () => {
      expect(textInput().classes()).toContain("border-border-default");
    });

    it("darkens the border one step on hover", () => {
      expect(textInput().classes()).toContain(
        "hover:border-input-border-hover",
      );
    });

    it("marks itself invalid for assistive tech", () => {
      expect(textInput({ invalid: true }).attributes("aria-invalid")).toBe(
        "true",
      );
    });

    it("draws a danger border when invalid", () => {
      expect(textInput({ invalid: true }).classes()).toContain("border-danger");
    });

    it("is not marked invalid by default", () => {
      expect(textInput().attributes("aria-invalid")).toBeUndefined();
    });

    it("links its error message via aria-describedby", () => {
      expect(
        textInput({ describedBy: "isbn-error" }).attributes("aria-describedby"),
      ).toBe("isbn-error");
    });

    it("accepts an accessible name when there is no visible label", () => {
      expect(textInput({ ariaLabel: "Jaar" }).attributes("aria-label")).toBe(
        "Jaar",
      );
    });

    it("uses the muted surface and disabled ink when disabled", () => {
      expect(textInput({ disabled: true }).classes()).toEqual(
        expect.arrayContaining([
          "disabled:bg-surface-muted",
          "disabled:text-text-disabled",
        ]),
      );
    });

    describe("read-only", () => {
      it("is read-only for the browser", () => {
        expect(textInput({ readonly: true }).attributes("readonly")).toBeDefined();
      });

      it("shows a plain value without border or fill", () => {
        expect(textInput({ readonly: true }).classes()).toEqual(
          expect.arrayContaining(["border-transparent", "bg-transparent"]),
        );
      });
    });

    describe("error message", () => {
      const withError = (props: Record<string, unknown> = {}) =>
        mountComponent({ type: "text", errorMessage: "ISBN is ongeldig", ...props });

      it("renders the message below the input as an alert", () => {
        const alert = withError().find('[role="alert"]');
        expect(alert.text()).toBe("ISBN is ongeldig");
      });

      it("links the message to the input", () => {
        const wrapper = withError();
        expect(
          wrapper.find('[data-cy="base-input-text"]').attributes("aria-describedby"),
        ).toBe(wrapper.find('[role="alert"]').attributes("id"));
      });

      it("marks the input invalid with a danger border", () => {
        const input = withError().find('[data-cy="base-input-text"]');
        expect(input.attributes("aria-invalid")).toBe("true");
        expect(input.classes()).toContain("border-danger");
      });

      it("keeps an external describedBy alongside its own message", () => {
        const wrapper = withError({ describedBy: "isbn-hint" });
        const ids = wrapper
          .find('[data-cy="base-input-text"]')
          .attributes("aria-describedby")
          ?.split(" ");
        expect(ids).toEqual([
          "isbn-hint",
          wrapper.find('[role="alert"]').attributes("id"),
        ]);
      });

      it("renders no alert without a message", () => {
        expect(mountComponent({ type: "text" }).find('[role="alert"]').exists()).toBe(false);
      });
    });

    it("keeps the textarea at least three rows high", () => {
      const textarea = mountComponent({ type: "textarea" }).find(
        '[data-cy="base-input-text-area"]',
      );
      expect(textarea.classes()).toContain("min-h-(--textarea-min-height)");
    });

    it("lets the textarea resize vertically only", () => {
      const textarea = mountComponent({ type: "textarea" }).find(
        '[data-cy="base-input-text-area"]',
      );
      expect(textarea.classes()).toContain("resize-y");
    });
  });
});
