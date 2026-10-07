import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";

vi.mock("@/components/base/BaseDatePicker.vue", () => ({
  default: { name: "BaseDatePicker", template: "<div />" },
}));
vi.mock("@/components/base/BaseResizableTextarea.vue", () => ({
  default: { name: "BaseResizableTextarea", template: "<div />" },
}));
vi.mock("@/components/base/AdvancedDropdown.vue", () => ({
  default: {
    name: "AdvancedDropdown",
    props: ["modelValue", "options", "clearable", "multiple"],
    emits: ["update:modelValue"],
    template: "<div data-cy='dropdown' />",
  },
}));
vi.mock("@/components/base/BaseInputCheckbox.vue", () => ({
  default: {
    name: "BaseInputCheckbox",
    props: ["modelValue", "ariaLabel"],
    emits: ["update:modelValue"],
    template: "<input type='checkbox' data-cy='checkbox' />",
  },
}));
vi.mock("@/components/base/BaseButtonNew.vue", () => ({
  default: {
    name: "BaseButtonNew",
    props: ["label", "buttonStyle", "buttonSize", "disabled", "loading"],
    emits: ["click"],
    template:
      "<button :data-cy=\"'button-' + buttonStyle\" :disabled='disabled' @click=\"$emit('click')\">{{ label }}</button>",
  },
}));

import InlineFieldEditor from "@/components/metadata/InlineFieldEditor.vue";

const editor = (props: Record<string, unknown> = {}) =>
  mount(InlineFieldEditor, {
    props: { type: "text", modelValue: "1958", label: "Jaar", ...props },
    attachTo: document.body,
  });

const input = (wrapper: ReturnType<typeof editor>) =>
  wrapper.find('[data-cy="base-input-text"]');

describe("InlineFieldEditor", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("commit model", () => {
    it("starts pristine with Bewaar disabled", () => {
      expect(editor().find('[data-cy="button-commit"]').attributes("disabled")).toBeDefined();
    });

    it("enables Bewaar once the value changes", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      expect(wrapper.find('[data-cy="button-commit"]').attributes("disabled")).toBeUndefined();
    });

    it("saves the draft with Bewaar", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      await wrapper.find('[data-cy="button-commit"]').trigger("click");
      expect(wrapper.emitted("save")?.[0]).toEqual(["1959"]);
    });

    it("cancels with Annuleer", async () => {
      const wrapper = editor();
      await wrapper.find('[data-cy="button-ghost"]').trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("reports the current draft as it changes", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      expect(wrapper.emitted("draft-change")?.at(-1)).toEqual(["1959"]);
    });

    it("reports whether the draft is changed", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      expect(wrapper.emitted("dirty-change")?.at(-1)).toEqual([true]);
    });
  });

  describe("keyboard", () => {
    it("saves with Enter when changed", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      await input(wrapper).trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("save")?.[0]).toEqual(["1959"]);
    });

    it("closes with Enter when nothing changed", async () => {
      const wrapper = editor();
      await input(wrapper).trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("save")).toBeUndefined();
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("cancels with Escape", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      await wrapper.find('[data-cy="inline-field-editor"]').trigger("keydown", {
        key: "Escape",
      });
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("keeps Enter as a new line in a textarea and saves with Ctrl+Enter", async () => {
      const wrapper = editor({ type: "textarea", modelValue: "a" });
      const textarea = wrapper.find('[data-cy="base-input-text-area"]');
      await textarea.setValue("ab");
      await textarea.trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("save")).toBeUndefined();
      await textarea.trigger("keydown", { key: "Enter", ctrlKey: true });
      expect(wrapper.emitted("save")?.[0]).toEqual(["ab"]);
    });

    it("shows the keyboard hint under the editor", () => {
      expect(editor().find('[data-cy="inline-editor-hint"]').text()).toBe(
        "Enter saves · Esc cancels",
      );
    });

    it("hints Ctrl+Enter for a textarea", () => {
      expect(
        editor({ type: "textarea" }).find('[data-cy="inline-editor-hint"]').text(),
      ).toBe("Ctrl+Enter saves · Esc cancels");
    });

    it("focuses the input when it opens", async () => {
      const wrapper = editor();
      await nextTick();
      expect(document.activeElement).toBe(input(wrapper).element);
    });
  });

  describe("inputs per type", () => {
    it("uses the dropdown for select fields, clearable unless required", () => {
      const options = [{ label: "Boek", value: "book" }];
      const dropdown = editor({
        type: "dropdownSingleselectMetadata",
        modelValue: "book",
        options,
      }).findComponent({ name: "AdvancedDropdown" });
      expect(dropdown.props("options")).toEqual(options);
      expect(dropdown.props("clearable")).toBe(true);
      expect(dropdown.props("multiple")).toBe(false);
    });

    it("makes the dropdown multiple for multi-select fields", () => {
      expect(
        editor({ type: "dropdownMultiselectMetadata", modelValue: [] })
          .findComponent({ name: "AdvancedDropdown" })
          .props("multiple"),
      ).toBe(true);
    });

    it("never offers an empty choice for a required select", () => {
      expect(
        editor({ type: "dropdown", modelValue: "book", required: true })
          .findComponent({ name: "AdvancedDropdown" })
          .props("clearable"),
      ).toBe(false);
    });

    it("uses a checkbox for boolean fields", () => {
      expect(
        editor({ type: "checkbox", modelValue: false })
          .findComponent({ name: "BaseInputCheckbox" })
          .exists(),
      ).toBe(true);
    });
  });

  describe("saving and errors", () => {
    it("locks the input and shows the spinner on Bewaar while saving", () => {
      const wrapper = editor({ saving: true });
      expect(input(wrapper).attributes("disabled")).toBeDefined();
      expect(
        wrapper.findComponent({ name: "BaseButtonNew" }).props("loading"),
      ).toBe(true);
    });

    it("shows an error as an alert linked to the input", () => {
      const wrapper = editor({ errorMessage: "Jaar is verplicht" });
      const alert = wrapper.find('[role="alert"]');
      expect(alert.text()).toBe("Jaar is verplicht");
      expect(input(wrapper).attributes("aria-describedby")).toContain(
        alert.attributes("id"),
      );
    });
  });

  describe("click outside", () => {
    it("closes an unchanged editor", async () => {
      const wrapper = editor();
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("keeps a changed editor open", async () => {
      const wrapper = editor();
      await input(wrapper).setValue("1959");
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      expect(wrapper.emitted("cancel")).toBeUndefined();
    });
  });
});
